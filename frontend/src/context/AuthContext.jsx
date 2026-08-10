import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handler for mock/skip mode — reads user from localStorage
    const updateMockUser = () => {
      const stored = localStorage.getItem('invoice_ai_mock_user');
      if (stored) {
        setUser(JSON.parse(stored));
        setLoading(false);
        return true;
      }
      return false;
    };

    // Always listen for mock_auth_changed so "Skip for now" works
    // even when a real Firebase project is configured
    window.addEventListener('mock_auth_changed', updateMockUser);

    if (window.IS_MOCKED_FIREBASE) {
      // Pure mock mode (no Firebase keys set)
      updateMockUser();
    } else if (auth) {
      // Real Firebase — but also handle mock override via skip
      const unsub = onAuthStateChanged(auth, (u) => {
        if (!localStorage.getItem('invoice_ai_mock_user')) {
          setUser(u);
          setLoading(false);
        }
      });
      return () => {
        window.removeEventListener('mock_auth_changed', updateMockUser);
        unsub();
      };
    } else {
      setLoading(false);
    }

    return () => window.removeEventListener('mock_auth_changed', updateMockUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
