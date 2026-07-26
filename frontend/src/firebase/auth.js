import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

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

export const signInWithGoogle = () => {
  if (window.IS_MOCKED_FIREBASE) {
    const mockUser = { uid: 'mock-google-user', displayName: 'Jane Doe', email: 'jane.doe@gmail.com', isAnonymous: false };
    setMockUser(mockUser);
    return Promise.resolve({ user: mockUser });
  }
  return signInWithPopup(auth, googleProvider);
};

export const signInWithEmail = (email, password) => {
  if (window.IS_MOCKED_FIREBASE) {
    const mockUser = { uid: 'mock-email-user', displayName: 'John Developer', email: email || 'john@gmail.com', isAnonymous: false };
    setMockUser(mockUser);
    return Promise.resolve({ user: mockUser });
  }
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = (email, password, displayName) => {
  if (window.IS_MOCKED_FIREBASE) {
    const mockUser = { uid: 'mock-email-user', displayName: displayName || 'Developer User', email: email || 'user@gmail.com', isAnonymous: false };
    setMockUser(mockUser);
    return Promise.resolve({ user: mockUser });
  }
  return createUserWithEmailAndPassword(auth, email, password).then(async (cred) => {
    if (displayName) await updateProfile(cred.user, { displayName });
    return cred;
  });
};

export const signInAsGuest = () => {
  if (window.IS_MOCKED_FIREBASE) {
    const mockUser = { uid: 'mock-guest-user', displayName: 'Guest User', email: '', isAnonymous: true };
    setMockUser(mockUser);
    return Promise.resolve({ user: mockUser });
  }
  return signInAnonymously(auth);
};

export const logout = () => {
  if (window.IS_MOCKED_FIREBASE) {
    setMockUser(null);
    return Promise.resolve();
  }
  return signOut(auth);
};
