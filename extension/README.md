# 🚀 WebHome Chrome / Edge Bookmark Auto-Sync Extension

A lightweight, zero-configuration browser extension that automatically captures your native browser bookmarks bar (as you create, edit, or delete them) and syncs them to your WebHome dashboard in real-time with **AES-256-GCM client-side encryption**.

---

## 🛠️ How to Install in Chrome / Edge / Brave

1. Open your browser and navigate to the Extensions page:
   - **Chrome / Brave**: `chrome://extensions`
   - **Edge**: `edge://extensions`
2. Enable **"Developer mode"** (toggle located in the top-right corner).
3. Click the **"Load unpacked"** button in the top-left.
4. Select the `extension` folder inside this project directory:
   ```
   c:\Workspace\2. anuragbiswas01\WebHome\extension
   ```
5. The **WebHome Bookmark Auto-Sync** extension will now appear in your browser toolbar! 📌

---

## 🔐 How Authentication Works (Zero-Effort Web Bridge)

1. Simply open your **WebHome Dashboard** in a browser tab (`http://localhost:5173` or your hosted domain).
2. Sign in to WebHome (or use the pre-filled master credentials).
3. The extension's content script detects your active session and **automatically links your user account and encryption keys** with the extension background worker!
4. Any bookmarks you create (via `Ctrl + D` or bookmark manager) will instantly be encrypted and synced to your cloud database automatically.

---

## 🔄 Features
- **Real-Time Live Listener**: Captures `onCreated`, `onChanged`, `onRemoved`, and `onMoved` events.
- **Folder Preservation**: Maintains your browser bookmark folder structure.
- **Zero-Knowledge Encryption**: Uses native `crypto.subtle` AES-256-GCM before uploading to Firebase.
- **Manual 1-Click Sync**: Click the extension icon in the toolbar and hit *"Sync Browser Bookmarks Now"*.
