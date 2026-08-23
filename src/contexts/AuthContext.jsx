import { useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured, authSettings } from "../config/firebase";
import { AuthContext } from "./authContextDef";

const CACHED_USER_KEY = "webhome_cached_auth_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof localStorage !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHED_USER_KEY);
        return cached ? JSON.parse(cached) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(() => Boolean(isFirebaseConfigured && auth));
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (currentUser) {
          const userData = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName:
              currentUser.displayName ||
              (currentUser.isAnonymous ? "Guest User" : currentUser.email?.split("@")[0] || "User"),
            photoURL: currentUser.photoURL,
            isAnonymous: currentUser.isAnonymous,
          };
          setUser(userData);
          try {
            localStorage.setItem(CACHED_USER_KEY, JSON.stringify(userData));
          } catch (e) {
            console.warn("Failed to cache auth user:", e);
          }

          // Broadcast session to WebHome Chrome Extension bridge
          currentUser.getIdToken().then((token) => {
            window.postMessage(
              {
                type: "WEBHOME_AUTH_SYNC",
                userUid: currentUser.uid,
                userEmail: currentUser.email,
                firebaseApiKey: import.meta.env.VITE_FIREBASE_API_KEY,
                firebaseProjectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
                idToken: token,
              },
              "*"
            );
          }).catch(() => {});
        } else {
          setUser(null);
          try {
            localStorage.removeItem(CACHED_USER_KEY);
          } catch (e) {
            console.warn("Failed to clear cached auth user:", e);
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error("Auth state change error:", error);
        setAuthError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      setAuthError("Firebase is not configured. Please add your credentials in .env file.");
      return;
    }

    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.warn("Popup sign-in failed, trying redirect:", err);
      if (err.code === "auth/popup-blocked" || err.code === "auth/popup-closed-by-user") {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr) {
          setAuthError(redirectErr.message);
        }
      } else {
        setAuthError(err.message);
      }
    }
  }, []);

  const signInAnonymouslyUser = useCallback(async () => {
    if (!isFirebaseConfigured || !auth) {
      setAuthError("Firebase is not configured. Please add your credentials in .env file.");
      return;
    }

    setAuthError(null);
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.error("Anonymous sign-in failed:", err);
      setAuthError(err.message);
    }
  }, []);

  const signInWithEmail = useCallback(async (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      setAuthError("Firebase is not configured. Please add your credentials in .env file.");
      return;
    }

    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error("Email sign-in failed:", err);
      setAuthError(err.message);
      throw err;
    }
  }, []);

  const signUpWithEmail = useCallback(async (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      setAuthError("Firebase is not configured. Please add your credentials in .env file.");
      return;
    }

    setAuthError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error("Email sign-up failed:", err);
      setAuthError(err.message);
      throw err;
    }
  }, []);

  const signInWithAdminCredentials = useCallback(async () => {
    if (!authSettings.hasAdminCredentials) {
      setAuthError("No admin credentials configured in .env file.");
      return;
    }

    setAuthError(null);
    try {
      await signInWithEmailAndPassword(
        auth,
        authSettings.adminEmail,
        authSettings.adminPassword
      );
    } catch (err) {
      console.error("Admin auto sign-in failed:", err);
      setAuthError(err.message);
      throw err;
    }
  }, []);

  const signOutUser = useCallback(async () => {
    if (!isFirebaseConfigured || !auth) {
      setUser(null);
      localStorage.removeItem(CACHED_USER_KEY);
      return;
    }

    setAuthError(null);
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem(CACHED_USER_KEY);
    } catch (err) {
      console.error("Sign out error:", err);
      setAuthError(err.message);
    }
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = {
    user,
    loading,
    authError,
    authSettings,
    isFirebaseConfigured,
    signInWithGoogle,
    signInAnonymouslyUser,
    signInWithEmail,
    signUpWithEmail,
    signInWithAdminCredentials,
    signOutUser,
    clearAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
