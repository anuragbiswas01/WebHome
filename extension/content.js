// Content script running on WebHome tab to bridge authentication & sync

// Listen for authentication events posted from the WebHome web page
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data && event.data.type === "WEBHOME_AUTH_SYNC") {
    console.log("[WebHome Extension Bridge] Received auth sync from WebHome tab");
    chrome.runtime.sendMessage({
      type: "SYNC_WEBHOME_SESSION",
      userUid: event.data.userUid,
      userEmail: event.data.userEmail,
      firebaseApiKey: event.data.firebaseApiKey,
      firebaseProjectId: event.data.firebaseProjectId,
      idToken: event.data.idToken,
    });
  }
});

// Listen for messages from extension background worker and forward to page
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "WEBHOME_BOOKMARKS_SYNCED") {
    window.postMessage(
      {
        type: "WEBHOME_EXTENSION_SYNCED",
        count: message.count,
        timestamp: message.timestamp,
      },
      "*"
    );
  }
});

// Ping WebHome page to announce extension is active
window.postMessage({ type: "WEBHOME_EXTENSION_ACTIVE", version: "1.0.0" }, "*");
