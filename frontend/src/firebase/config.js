import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

let app = null;
let auth = null;
let db = null;
let storage = null;
let analytics = null;
let isMock = false;

if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("your_")) {
  isMock = true;
} else {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    // Analytics only works in browser environments
    isSupported().then((yes) => {
      if (yes) analytics = getAnalytics(app);
    });
  } catch (e) {
    console.warn("Firebase failed to initialize. Using mock client-side storage.");
    isMock = true;
  }
}

if (isMock) {
  window.IS_MOCKED_FIREBASE = true;
}

export { auth, db, storage, analytics };
export default app;
