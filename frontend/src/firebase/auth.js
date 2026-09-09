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
  let mappedEmail = email;
  if (email === 'demouser') {
    mappedEmail = 'demouser@demo.com';
  }

  if (window.IS_MOCKED_FIREBASE) {
    if (email === 'demouser' && password === 'demouser@1234') {
      const mockUser = { uid: 'demo-user-id', displayName: 'Demo User', email: 'demouser', isAnonymous: false };
      setMockUser(mockUser);
      return Promise.resolve({ user: mockUser });
    }
    
    // Check local storage for created mock users
    const mockUsers = JSON.parse(localStorage.getItem('invoice_ai_mock_users') || '{}');
    if (mockUsers[mappedEmail] && mockUsers[mappedEmail].password === password) {
      const mockUser = mockUsers[mappedEmail].user;
      setMockUser(mockUser);
      return Promise.resolve({ user: mockUser });
    }

    const error = new Error('Incorrect email or password.');
    error.code = 'auth/wrong-password';
    return Promise.reject(error);
  }

  if (auth) {
    const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistenceType);
  }
  return signInWithEmailAndPassword(auth, mappedEmail, password);
};

export const signUpWithEmail = async (email, password, displayName, rememberMe = false) => {
  let mappedEmail = email;
  if (email === 'demouser') {
    mappedEmail = 'demouser@demo.com';
  }

  if (window.IS_MOCKED_FIREBASE) {
    const mockUsers = JSON.parse(localStorage.getItem('invoice_ai_mock_users') || '{}');
    if (mockUsers[mappedEmail]) {
      const error = new Error('Email already in use');
      error.code = 'auth/email-already-in-use';
      return Promise.reject(error);
    }

    const uid = 'mock-user-' + Date.now();
    const mockUser = { uid, displayName: displayName || 'User', email: mappedEmail, isAnonymous: false };
    
    mockUsers[mappedEmail] = { user: mockUser, password };
    localStorage.setItem('invoice_ai_mock_users', JSON.stringify(mockUsers));
    
    setMockUser(mockUser);
    return Promise.resolve({ user: mockUser });
  }

  if (auth) {
    const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistenceType);
  }
  return createUserWithEmailAndPassword(auth, mappedEmail, password).then(async (cred) => {
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
