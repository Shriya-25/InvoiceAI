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

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const signInWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const signUpWithEmail = (email, password, displayName) =>
  createUserWithEmailAndPassword(auth, email, password).then(async (cred) => {
    if (displayName) await updateProfile(cred.user, { displayName });
    return cred;
  });

export const signInAsGuest = () => signInAnonymously(auth);

export const logout = () => signOut(auth);
