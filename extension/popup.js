document.addEventListener("DOMContentLoaded", async () => {
  const statusBadge = document.getElementById("statusBadge");
  const statusText = document.getElementById("statusText");
  const bookmarkCount = document.getElementById("bookmarkCount");
  const accountEmail = document.getElementById("accountEmail");
  const lastSynced = document.getElementById("lastSynced");
  const autoSyncCheckbox = document.getElementById("autoSyncCheckbox");
  const syncNowBtn = document.getElementById("syncNowBtn");
  const openWebHomeBtn = document.getElementById("openWebHomeBtn");

  // Load storage state
  async function refreshUI() {
    const data = await chrome.storage.local.get([
      "userUid",
      "userEmail",
      "lastSyncedAt",
      "lastBookmarkCount",
      "lastSyncStatus",
      "autoSyncEnabled",
    ]);

    // Update bookmark count from live Chrome API
    chrome.runtime.sendMessage({ type: "GET_BOOKMARKS_COUNT" }, (res) => {
      if (res && typeof res.count === "number") {
        bookmarkCount.textContent = `${res.count} items`;
      } else {
        bookmarkCount.textContent = `${data.lastBookmarkCount || 0} items`;
      }
    });

    if (data.userUid) {
      statusBadge.className = "status-badge status-connected";
      statusText.textContent = "Connected";
      accountEmail.textContent = data.userEmail || "Signed In";
    } else {
      statusBadge.className = "status-badge status-disconnected";
      statusText.textContent = "Offline / Waiting";
      accountEmail.textContent = "Open WebHome Tab";
    }

    if (data.lastSyncedAt) {
      const diffSec = Math.floor((Date.now() - data.lastSyncedAt) / 1000);
      if (diffSec < 10) lastSynced.textContent = "Just now";
      else if (diffSec < 60) lastSynced.textContent = `${diffSec}s ago`;
      else lastSynced.textContent = new Date(data.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      lastSynced.textContent = "Never";
    }

    autoSyncCheckbox.checked = data.autoSyncEnabled !== false;
  }

  await refreshUI();

  // Auto-sync toggle
  autoSyncCheckbox.addEventListener("change", (e) => {
    chrome.storage.local.set({ autoSyncEnabled: e.target.checked });
  });

  // Sync now button
  syncNowBtn.addEventListener("click", () => {
    syncNowBtn.disabled = true;
    syncNowBtn.textContent = "⏳ Syncing...";
    statusBadge.className = "status-badge status-syncing";
    statusText.textContent = "Syncing";

    chrome.runtime.sendMessage({ type: "TRIGGER_MANUAL_SYNC" }, () => {
      setTimeout(() => {
        syncNowBtn.disabled = false;
        syncNowBtn.textContent = "🔄 Sync Browser Bookmarks Now";
        refreshUI();
      }, 600);
    });
  });

  // Open WebHome
  openWebHomeBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:5173" });
  });
});
