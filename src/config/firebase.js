import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check if valid Firebase configuration is provided
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== "your_api_key_here" &&
    firebaseConfig.apiKey.trim() !== ""
);

// Auth provider settings configured via .env
// Defaults: Google and Guest OFF, Email ON with preset master credentials
export const authSettings = {
  enableGoogle: import.meta.env.VITE_ENABLE_GOOGLE_AUTH === "true",
  enableGuest: import.meta.env.VITE_ENABLE_GUEST_AUTH === "true",
  enableEmail: import.meta.env.VITE_ENABLE_EMAIL_AUTH !== "false",
  adminEmail: import.meta.env.VITE_ADMIN_EMAIL || "anuragbiswas1389@gmail.com",
  adminPassword: import.meta.env.VITE_ADMIN_PASSWORD || "anuraG1389",
  hasAdminCredentials: true,
};

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch {
      db = getFirestore(app);
    }
  } catch (err) {
    console.warn("Failed to initialize Firebase:", err);
  }
}

export { app, auth, db, googleProvider, firebaseConfig };
