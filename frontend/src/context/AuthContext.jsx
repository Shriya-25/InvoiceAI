import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Only restore mock user if mock mode is actually active
    if (window.IS_MOCKED_FIREBASE) {
      const stored = localStorage.getItem('invoice_ai_mock_user');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clean up stuck mock users if real Firebase is active
    if (!window.IS_MOCKED_FIREBASE) {
      localStorage.removeItem('invoice_ai_mock_user');
    }

    // If mock mode is active, resolve immediately
    if (window.IS_MOCKED_FIREBASE) {
      const storedMock = localStorage.getItem('invoice_ai_mock_user');
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
        setUser(firebaseUser);
        setLoading(false);
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
