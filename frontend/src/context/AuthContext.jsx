import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Eagerly restore mock user on first render to avoid flash
    const stored = localStorage.getItem('invoice_ai_mock_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If a mock/skip user is already in localStorage, resolve immediately
    const storedMock = localStorage.getItem('invoice_ai_mock_user');
    if (storedMock || window.IS_MOCKED_FIREBASE) {
      const mockUser = storedMock ? JSON.parse(storedMock) : null;
      setUser(mockUser);
      setLoading(false);
    }

    // Handler for real-time mock/skip updates
    const handleMockChange = () => {
      const stored = localStorage.getItem('invoice_ai_mock_user');
      setUser(stored ? JSON.parse(stored) : null);
      setLoading(false);
    };
    window.addEventListener('mock_auth_changed', handleMockChange);

    // If real Firebase is configured, also listen for Firebase auth state
    let unsub = null;
    if (!window.IS_MOCKED_FIREBASE && auth) {
      unsub = onAuthStateChanged(auth, (firebaseUser) => {
        // Don't overwrite mock session with Firebase null
        if (!localStorage.getItem('invoice_ai_mock_user')) {
          setUser(firebaseUser);
          setLoading(false);
        }
      });
    }

    return () => {
      window.removeEventListener('mock_auth_changed', handleMockChange);
      if (unsub) unsub();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
