import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../config/firebase";
import { useAuth } from "../hooks/useAuth";
import { mergeBookmarkLists } from "../utils/bookmarkUtils";
import { encryptPayload, decryptPayload } from "../utils/cryptoUtils";
import { BookmarksContext } from "./bookmarksContextDef";

const STORAGE_KEYS = {
  BOOKMARKS: "bookmarks",
  SHORTCUTS: "shortcuts",
  LAST_SYNCED: "webhome_bookmarks_last_synced",
  AUTO_SYNC: "webhome_auto_sync_enabled",
};

export function BookmarksProvider({ children }) {
  const { user } = useAuth();

  // 1. Initial State from Local Storage (Instant Layer 1 Cache)
  const [bookmarks, setBookmarks] = useState(() => {
    if (typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [shortcuts, setShortcuts] = useState(() => {
    if (typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.SHORTCUTS);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [syncStatus, setSyncStatus] = useState(() => {
    if (!isFirebaseConfigured || !user) return "local-only";
    return navigator.onLine ? "synced" : "offline";
  });

  const [lastSyncedAt, setLastSyncedAt] = useState(() => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.LAST_SYNCED);
      return saved ? Number(saved) : null;
    }
    return null;
  });

  const [autoSyncEnabled, setAutoSyncEnabled] = useState(() => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTO_SYNC);
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  const [syncError, setSyncError] = useState(null);

  // Ref flags to prevent echo loop writes and hold latest values in effects/listeners
  const isApplyingRemoteUpdate = useRef(false);
  const syncTimeoutRef = useRef(null);
  const bookmarksRef = useRef(bookmarks);
  const shortcutsRef = useRef(shortcuts);

  // 2. Persist to Local Storage & update refs in effects
  useEffect(() => {
    bookmarksRef.current = bookmarks;
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (e) {
      console.warn("Failed to save bookmarks to localStorage:", e);
    }
  }, [bookmarks]);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
    try {
      localStorage.setItem(STORAGE_KEYS.SHORTCUTS, JSON.stringify(shortcuts));
    } catch (e) {
      console.warn("Failed to save shortcuts to localStorage:", e);
    }
  }, [shortcuts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTO_SYNC, JSON.stringify(autoSyncEnabled));
    } catch (e) {
      console.warn("Failed to save autoSync to localStorage:", e);
    }
  }, [autoSyncEnabled]);

  // Helper to encrypt and save directly to Firestore
  const writeToCloud = useCallback(
    async (currentBookmarks, currentShortcuts) => {
      if (!isFirebaseConfigured || !db || !user || !autoSyncEnabled) {
        if (!user) setSyncStatus("local-only");
        return;
      }

      setSyncStatus("syncing");
      setSyncError(null);

      try {
        const userDocRef = doc(db, "users", user.uid, "userData", "bookmarks");

        // Client-side AES-256-GCM encryption
        const encrypted = await encryptPayload(
          {
            bookmarks: currentBookmarks,
            shortcuts: currentShortcuts,
          },
          user.uid
        );

        const payload = {
          ...encrypted,
          updatedAt: Date.now(),
          clientTimestamp: serverTimestamp(),
          itemCount: (currentBookmarks?.length || 0) + (currentShortcuts?.length || 0),
        };

        await setDoc(userDocRef, payload, { merge: true });

        const now = Date.now();
        setLastSyncedAt(now);
        setSyncStatus(navigator.onLine ? "synced" : "offline");
        try {
          localStorage.setItem(STORAGE_KEYS.LAST_SYNCED, String(now));
        } catch (e) {
          console.warn("Failed to save last synced timestamp:", e);
        }
      } catch (err) {
        console.error("Firestore encrypted sync error:", err);
        setSyncError(err.message);
        setSyncStatus("error");
      }
    },
    [user, autoSyncEnabled]
  );

  // Debounced auto-save function
  const triggerAutoSync = useCallback(
    (newBookmarks, newShortcuts) => {
      if (isApplyingRemoteUpdate.current) return;
      if (!isFirebaseConfigured || !user || !autoSyncEnabled) return;

      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      setSyncStatus("syncing");
      syncTimeoutRef.current = setTimeout(() => {
        writeToCloud(newBookmarks, newShortcuts);
      }, 800);
    },
    [user, autoSyncEnabled, writeToCloud]
  );

  // Manual Sync Action with Decryption & Smart Merge
  const syncNow = useCallback(async () => {
    if (!isFirebaseConfigured || !db || !user) return;
    setSyncStatus("syncing");
    setSyncError(null);

    try {
      const userDocRef = doc(db, "users", user.uid, "userData", "bookmarks");
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const decrypted = await decryptPayload(data, user.uid);

        const remoteBookmarks = decrypted.bookmarks || [];
        const remoteShortcuts = decrypted.shortcuts || [];

        const mergedBookmarks = mergeBookmarkLists(bookmarksRef.current, remoteBookmarks);
        const mergedShortcuts = mergeBookmarkLists(shortcutsRef.current, remoteShortcuts);

        isApplyingRemoteUpdate.current = true;
        setBookmarks(mergedBookmarks);
        setShortcuts(mergedShortcuts);
        setTimeout(() => {
          isApplyingRemoteUpdate.current = false;
        }, 300);

        await writeToCloud(mergedBookmarks, mergedShortcuts);
      } else {
        await writeToCloud(bookmarksRef.current, shortcutsRef.current);
      }
    } catch (err) {
      console.error("Manual sync error:", err);
      setSyncError(err.message);
      setSyncStatus("error");
    }
  }, [user, writeToCloud]);

  // 3. Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      if (user && isFirebaseConfigured) {
        setSyncStatus("syncing");
        syncNow();
      } else {
        setSyncStatus("local-only");
      }
    };

    const handleOffline = () => {
      setSyncStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [user, syncNow]);

  // 4. Real-time Firestore Sync Listener (with Client Decryption)
  useEffect(() => {
    if (!isFirebaseConfigured || !db || !user) {
      return;
    }

    const userDocRef = doc(db, "users", user.uid, "userData", "bookmarks");

    const unsubscribe = onSnapshot(
      userDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const decrypted = await decryptPayload(data, user.uid);

          const remoteBookmarks = decrypted.bookmarks || [];
          const remoteShortcuts = decrypted.shortcuts || [];

          const currentB = bookmarksRef.current;
          const currentS = shortcutsRef.current;

          const localJson = JSON.stringify(currentB);
          const remoteJson = JSON.stringify(remoteBookmarks);
          const localShortcutsJson = JSON.stringify(currentS);
          const remoteShortcutsJson = JSON.stringify(remoteShortcuts);

          if (localJson !== remoteJson || localShortcutsJson !== remoteShortcutsJson) {
            isApplyingRemoteUpdate.current = true;
            setBookmarks(remoteBookmarks);
            setShortcuts(remoteShortcuts);
            setTimeout(() => {
              isApplyingRemoteUpdate.current = false;
            }, 300);
          }

          if (data.updatedAt) {
            setLastSyncedAt(data.updatedAt);
            try {
              localStorage.setItem(STORAGE_KEYS.LAST_SYNCED, String(data.updatedAt));
            } catch (e) {
              console.warn("Storage error:", e);
            }
          }
          setSyncStatus(navigator.onLine ? "synced" : "offline");
          setSyncError(null);
        } else {
          // New cloud user: Upload existing local bookmarks encrypted
          if (bookmarksRef.current.length > 0 || shortcutsRef.current.length > 0) {
            writeToCloud(bookmarksRef.current, shortcutsRef.current);
          } else {
            setSyncStatus("synced");
          }
        }
      },
      (error) => {
        console.error("Firestore snapshot listener error:", error);
        setSyncError(error.message);
        setSyncStatus("error");
      }
    );

    return () => {
      unsubscribe();
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [user, writeToCloud]);

  // 5. Bookmark CRUD Operations
  const addBookmark = useCallback(
    (bookmark) => {
      const newItem = {
        id: Date.now(),
        ...bookmark,
        addDate: Date.now(),
      };
      setBookmarks((prev) => {
        const next = [...prev, newItem];
        triggerAutoSync(next, shortcutsRef.current);
        return next;
      });
    },
    [triggerAutoSync]
  );

  const addShortcut = useCallback(
    (shortcut) => {
      const newItem = {
        id: Date.now(),
        ...shortcut,
        addDate: Date.now(),
      };
      setShortcuts((prev) => {
        const next = [...prev, newItem];
        triggerAutoSync(bookmarksRef.current, next);
        return next;
      });
    },
    [triggerAutoSync]
  );

  const updateBookmark = useCallback(
    (id, updatedData) => {
      setBookmarks((prev) => {
        const next = prev.map((b) => (b.id === id ? { ...b, ...updatedData } : b));
        triggerAutoSync(next, shortcutsRef.current);
        return next;
      });
    },
    [triggerAutoSync]
  );

  const toggleStarBookmark = useCallback(
    (id) => {
      setBookmarks((prev) => {
        const next = prev.map((b) => (b.id === id ? { ...b, starred: !b.starred } : b));
        triggerAutoSync(next, shortcutsRef.current);
        return next;
      });
    },
    [triggerAutoSync]
  );

  const updateShortcut = useCallback(
    (id, updatedData) => {
      setShortcuts((prev) => {
        const next = prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s));
        triggerAutoSync(bookmarksRef.current, next);
        return next;
      });
    },
    [triggerAutoSync]
  );

  const deleteBookmark = useCallback(
    (id) => {
      setBookmarks((prev) => {
        const next = prev.filter((b) => b.id !== id);
        triggerAutoSync(next, shortcutsRef.current);
        return next;
      });
    },
    [triggerAutoSync]
  );

  const deleteShortcut = useCallback(
    (id) => {
      setShortcuts((prev) => {
        const next = prev.filter((s) => s.id !== id);
        triggerAutoSync(bookmarksRef.current, next);
        return next;
      });
    },
    [triggerAutoSync]
  );

  const importBookmarks = useCallback(
    (newBookmarks) => {
      const incomingShortcuts = newBookmarks.filter(
        (b) => b.folder === "Shortcuts" || b.folder === "Quick Links"
      );
      const incomingRegular = newBookmarks.filter(
        (b) =>
          b.folder !== "Shortcuts" &&
          b.folder !== "Quick Links" &&
          b.folder !== "Search Engines"
      );

      const nextBookmarks = [...bookmarksRef.current, ...incomingRegular];
      const nextShortcuts =
        incomingShortcuts.length > 0
          ? [...shortcutsRef.current, ...incomingShortcuts]
          : shortcutsRef.current;

      setBookmarks(nextBookmarks);
      if (incomingShortcuts.length > 0) {
        setShortcuts(nextShortcuts);
      }

      triggerAutoSync(nextBookmarks, nextShortcuts);
    },
    [triggerAutoSync]
  );

  const deduplicateBookmarks = useCallback(() => {
    const seen = new Set();
    let removedCount = 0;
    const cleanBookmarks = [];

    bookmarksRef.current.forEach((b) => {
      if (!b || !b.url) return;
      const norm = b.url.trim().toLowerCase().replace(/\/$/, '');
      if (seen.has(norm)) {
        removedCount++;
      } else {
        seen.add(norm);
        cleanBookmarks.push(b);
      }
    });

    setBookmarks(cleanBookmarks);
    triggerAutoSync(cleanBookmarks, shortcutsRef.current);
    return removedCount;
  }, [triggerAutoSync]);

  const resetBookmarks = useCallback(() => {
    setBookmarks([]);
    setShortcuts([]);
    if (user && isFirebaseConfigured) {
      writeToCloud([], []);
    }
  }, [user, writeToCloud]);

  const pushLocalToCloud = useCallback(async () => {
    if (!isFirebaseConfigured || !user) return;
    await writeToCloud(bookmarksRef.current, shortcutsRef.current);
  }, [user, writeToCloud]);

  const pullCloudToLocal = useCallback(async () => {
    if (!isFirebaseConfigured || !db || !user) return;
    setSyncStatus("syncing");
    try {
      const userDocRef = doc(db, "users", user.uid, "userData", "bookmarks");
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const decrypted = await decryptPayload(data, user.uid);
        isApplyingRemoteUpdate.current = true;
        setBookmarks(decrypted.bookmarks || []);
        setShortcuts(decrypted.shortcuts || []);
        setTimeout(() => {
          isApplyingRemoteUpdate.current = false;
        }, 300);
        setSyncStatus("synced");
      }
    } catch (err) {
      console.error("Pull from cloud error:", err);
      setSyncError(err.message);
      setSyncStatus("error");
    }
  }, [user]);

  const mergeLocalAndCloud = useCallback(async () => {
    if (!isFirebaseConfigured || !db || !user) return;
    await syncNow();
  }, [user, syncNow]);

  const value = {
    bookmarks,
    shortcuts,
    syncStatus,
    lastSyncedAt,
    syncError,
    autoSyncEnabled,
    setAutoSyncEnabled,
    isFirebaseConfigured,
    addBookmark,
    addShortcut,
    updateBookmark,
    toggleStarBookmark,
    updateShortcut,
    deleteBookmark,
    deleteShortcut,
    importBookmarks,
    deduplicateBookmarks,
    resetBookmarks,
    syncNow,
    pushLocalToCloud,
    pullCloudToLocal,
    mergeLocalAndCloud,
  };

  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  );
}
