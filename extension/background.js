import { encryptPayload } from "./crypto.js";

// Helper: Traverse and flatten Chrome's nested bookmark tree into WebHome flat bookmark list
function flattenBookmarkTree(nodes, currentFolder = "General") {
  let bookmarks = [];

  for (const node of nodes) {
    if (node.url) {
      // It's a bookmark
      // Avoid browser-internal URLs
      if (!node.url.startsWith("chrome://") && !node.url.startsWith("edge://")) {
        bookmarks.push({
          id: Number(node.id) || Date.now() + Math.floor(Math.random() * 10000),
          title: node.title || "Untitled Bookmark",
          url: node.url,
          folder: currentFolder || "General",
          addDate: node.dateAdded || Date.now(),
        });
      }
    } else if (node.children) {
      // It's a folder
      const folderName =
        node.title && node.title !== "Bookmarks bar" && node.title !== "Other bookmarks"
          ? node.title
          : currentFolder;
      bookmarks = bookmarks.concat(flattenBookmarkTree(node.children, folderName));
    }
  }

  return bookmarks;
}

// Fetch all bookmarks from Chrome API
async function getAllBrowserBookmarks() {
  return new Promise((resolve) => {
    chrome.bookmarks.getTree((tree) => {
      const flat = flattenBookmarkTree(tree);
      resolve(flat);
    });
  });
}

// Push encrypted bookmarks to Firebase Firestore REST API
async function pushToFirebase(bookmarks) {
  const config = await chrome.storage.local.get([
    "firebaseApiKey",
    "firebaseProjectId",
    "userUid",
    "idToken",
    "autoSyncEnabled",
  ]);

  if (!config.userUid || !config.firebaseProjectId || config.autoSyncEnabled === false) {
    console.log("[WebHome Extension] Auto-sync skipped: Not signed in or auto-sync disabled.");
    return;
  }

  try {
    console.log("[WebHome Extension] Encrypting and syncing bookmarks...");
    const encrypted = await encryptPayload(
      { bookmarks, shortcuts: [] },
      config.userUid
    );

    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${config.firebaseProjectId}/databases/(default)/documents/users/${config.userUid}/userData/bookmarks`;

    // Construct Firestore Document JSON format for REST API
    const fields = {
      cipherText: { stringValue: encrypted.cipherText },
      iv: { stringValue: encrypted.iv },
      isEncrypted: { booleanValue: encrypted.isEncrypted },
      algorithm: { stringValue: encrypted.algorithm },
      updatedAt: { integerValue: String(Date.now()) },
      itemCount: { integerValue: String(bookmarks.length) },
    };

    const response = await fetch(firestoreUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(config.idToken ? { Authorization: `Bearer ${config.idToken}` } : {}),
      },
      body: JSON.stringify({ fields }),
    });

    if (response.ok) {
      console.log("[WebHome Extension] Successfully synced", bookmarks.length, "bookmarks to Firestore!");
      await chrome.storage.local.set({
        lastSyncedAt: Date.now(),
        lastSyncStatus: "success",
        lastBookmarkCount: bookmarks.length,
      });

      // Notify any active WebHome tabs
      broadcastToWebHomeTabs({
        type: "WEBHOME_BOOKMARKS_SYNCED",
        count: bookmarks.length,
        timestamp: Date.now(),
      });
    } else {
      const errText = await response.text();
      console.error("[WebHome Extension] Firestore sync error:", errText);
      await chrome.storage.local.set({
        lastSyncStatus: "error",
        lastSyncError: errText,
      });
    }
  } catch (err) {
    console.error("[WebHome Extension] Sync failed:", err);
  }
}

// Broadcast message to any open WebHome browser tabs
async function broadcastToWebHomeTabs(message) {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.id && tab.url && (tab.url.includes("localhost") || tab.url.includes("127.0.0.1") || tab.url.includes("webhome"))) {
      try {
        chrome.tabs.sendMessage(tab.id, message);
      } catch {
        // Tab might not have content script loaded
      }
    }
  }
}

// Debounce timer for batching rapid bookmark operations
let syncDebounceTimer = null;
function handleBookmarkChange() {
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(async () => {
    const bookmarks = await getAllBrowserBookmarks();
    await pushToFirebase(bookmarks);
  }, 1500);
}

// Listen to Chrome native bookmark events
chrome.bookmarks.onCreated.addListener(handleBookmarkChange);
chrome.bookmarks.onRemoved.addListener(handleBookmarkChange);
chrome.bookmarks.onChanged.addListener(handleBookmarkChange);
chrome.bookmarks.onMoved.addListener(handleBookmarkChange);

// Listen to messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "TRIGGER_MANUAL_SYNC") {
    getAllBrowserBookmarks().then((bookmarks) => {
      pushToFirebase(bookmarks).then(() => {
        sendResponse({ success: true, count: bookmarks.length });
      });
    });
    return true; // async sendResponse
  }

  if (request.type === "GET_BOOKMARKS_COUNT") {
    getAllBrowserBookmarks().then((bookmarks) => {
      sendResponse({ count: bookmarks.length });
    });
    return true;
  }

  if (request.type === "SYNC_WEBHOME_SESSION") {
    // Session shared from active WebHome tab
    chrome.storage.local.set(
      {
        userUid: request.userUid,
        userEmail: request.userEmail,
        firebaseApiKey: request.firebaseApiKey,
        firebaseProjectId: request.firebaseProjectId,
        idToken: request.idToken,
      },
      () => {
        sendResponse({ success: true });
        handleBookmarkChange();
      }
    );
    return true;
  }
});
