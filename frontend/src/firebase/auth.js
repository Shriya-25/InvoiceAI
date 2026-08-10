import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { auth } from './config';

// Simulates user state for mock mode
const getMockUser = () => {
  const stored = localStorage.getItem('invoice_ai_mock_user');
  return stored ? JSON.parse(stored) : null;
};

const setMockUser = (user) => {
  if (user) {
    localStorage.setItem('invoice_ai_mock_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('invoice_ai_mock_user');
  }
  // Dispatch custom event to trigger session updates
  window.dispatchEvent(new Event('mock_auth_changed'));
};

export const signInWithEmail = async (email, password, rememberMe = false) => {
  if (window.IS_MOCKED_FIREBASE) {
    const mockUser = { uid: 'mock-email-user', displayName: 'John Developer', email: email || 'john@gmail.com', isAnonymous: false };
    setMockUser(mockUser);
    return Promise.resolve({ user: mockUser });
  }
  if (auth) {
    const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistenceType);
  }
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email, password, displayName, rememberMe = false) => {
  if (window.IS_MOCKED_FIREBASE) {
    const mockUser = { uid: 'mock-email-user', displayName: displayName || 'Developer User', email: email || 'user@gmail.com', isAnonymous: false };
    setMockUser(mockUser);
    return Promise.resolve({ user: mockUser });
  }
  if (auth) {
    const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistenceType);
  }
  return createUserWithEmailAndPassword(auth, email, password).then(async (cred) => {
    if (displayName) await updateProfile(cred.user, { displayName });
    return cred;
  });
};

export const logout = () => {
  if (window.IS_MOCKED_FIREBASE) {
    setMockUser(null);
    return Promise.resolve();
  }
  return signOut(auth);
};

export const resetPassword = (email) => {
  if (window.IS_MOCKED_FIREBASE) {
    // Simulate a password reset email in mock mode
    return Promise.resolve();
  }
  return sendPasswordResetEmail(auth, email);
};
