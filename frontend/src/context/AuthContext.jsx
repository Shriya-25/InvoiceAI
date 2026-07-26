import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (window.IS_MOCKED_FIREBASE) {
      const updateMockUser = () => {
        const stored = localStorage.getItem('invoice_ai_mock_user');
        setUser(stored ? JSON.parse(stored) : null);
        setLoading(false);
      };
      
      updateMockUser();
      window.addEventListener('mock_auth_changed', updateMockUser);
      return () => window.removeEventListener('mock_auth_changed', updateMockUser);
    } else {
      const unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
      return unsub;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
