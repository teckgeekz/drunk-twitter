import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, browserLocalPersistence, setPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app;
let auth: any;
let provider: any;

// Initialize Firebase only if we have an API key or if we're not in the Next.js build phase
// The dummy fallback allows the build to pass if args are still somehow missing
if (firebaseConfig.apiKey || typeof window !== 'undefined') {
  if (!firebaseConfig.apiKey) {
    firebaseConfig.apiKey = "dummy-key-for-build";
  }
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  // Persist auth state in IndexedDB so anonymous sessions survive browser restarts
  if (typeof window !== 'undefined') {
    setPersistence(auth, browserLocalPersistence).catch(() => {});
  }
  provider = new GoogleAuthProvider();
}

export { app, auth, provider, signInWithPopup, signOut, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile };
