# 🌐 WebHome — Modern, Secure & Encrypted Personal Startpage & Bookmark Manager

**WebHome** is a privacy-first, lightning-fast personal startpage, bookmark dashboard, and search hub with **Zero-Knowledge AES-256-GCM client-side encryption**, multi-layer caching, Firebase Cloud Sync, and a companion Chrome/Edge auto-sync extension.

---

## ✨ Features at a Glance

- **⚡ Instant 0ms Cold Startup**: Multi-layer caching architecture loads your dashboard instantly from local memory before background network sync begins.
- **🔒 Zero-Knowledge AES-256-GCM Encryption**: All bookmarks, URLs, titles, and folder structures are encrypted directly in your browser using the native Web Cryptography API (`crypto.subtle`) before upload. Cloud servers never see your plaintext data.
- **☁️ Real-time Firebase Cloud Sync**: Real-time multi-device synchronization via Cloud Firestore with offline IndexedDB queue persistence.
- **🧩 Browser Auto-Sync Extension**: Companion Chrome/Edge Manifest V3 extension captures native browser bookmark actions (`Ctrl+D`, edits, removals) and pushes encrypted changes live.
- **🔐 Configurable Authentication**:
  - Full toggle support for Google Sign-In, Guest/Anonymous mode, or strict Email & Password credentials.
  - Preset personal master credentials in `.env` for 1-click login.
- **📱 Responsive & Touch Optimized**: Fluid mobile UI with adaptive grid layouts, bottom sheets, full touch support, and default-expanded folder views.
- **📂 Categorized Folders & QuickLinks**: High-density icon grid, customizable search engine switcher, import/export HTML support, and custom wallpapers.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [Vite](https://vite.dev/) | High-speed frontend bundling and React Fast Refresh |
| **Routing** | [TanStack Router](https://tanstack.com/router) | Type-safe, file-based client-side routing |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + CSS Variables | Glassmorphism, dark mode, responsive layouts |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, lightweight icon suite |
| **Cloud Database** | [Firebase Cloud Firestore](https://firebase.google.com/) | Real-time encrypted document storage & multi-tab persistence |
| **Authentication** | [Firebase Auth](https://firebase.google.com/docs/auth) | Google OAuth, Email/Password, and Guest sessions |
| **Encryption** | [Web Cryptography API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) (`crypto.subtle`) | Native browser AES-256-GCM encryption & SHA-256 key derivation |
| **Extension** | Chrome Manifest V3 | Browser bookmarks bar live listener & session bridge |

---

## ⚡ Multi-Layer Caching Mechanism

To deliver a snappy user experience without network lag, WebHome uses a 3-layer storage hierarchy:

```
┌────────────────────────────────────────────────────────┐
│ Layer 1: LocalStorage (0ms Startup Cache)              │
│ ➔ Instant render on page load without network requests │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Layer 2: IndexedDB Multi-Tab Persistence               │
│ ➔ Queues offline mutations & coordinates open tabs     │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Layer 3: Cloud Firestore Live Snapshot Listener        │
│ ➔ Synchronizes changes across mobile & desktop devices │
└────────────────────────────────────────────────────────┘
```

1. **Optimistic Local Updates**: When a user adds, edits, or deletes a bookmark, React state and `localStorage` update immediately (0ms latency).
2. **Debounced Sync**: Network writes are batched and debounced by 800ms to prevent duplicate requests during rapid editing.
3. **Loopback Protection**: An internal ref (`isApplyingRemoteUpdate`) prevents remote snapshot updates from re-triggering outgoing cloud writes.

---

## 🔐 Zero-Knowledge Client-Side Encryption (E2EE)

WebHome ensures that neither Firebase, Google, nor any intermediary network can read your bookmark URLs or folder names.

```
[ User Browser ]                                    [ Firebase Firestore ]
       │
       ├── 1. Bookmark Data: `{ url: "...", title: "..." }`
       │
       ├── 2. Derive 256-bit Key: `SHA-256(user.uid + APP_PEPPER)`
       │
       ├── 3. Generate Random 12-Byte IV: `crypto.getRandomValues()`
       │
       ├── 4. Encrypt via AES-256-GCM: `crypto.subtle.encrypt()`
       │
       └── 5. Send Base64 Ciphertext ──────────────► Stores Only Encrypted Blob:
                                                       {
                                                         cipherText: "a8K3mQx9...",
                                                         iv: "7vB1xL2...",
                                                         isEncrypted: true,
                                                         algorithm: "AES-256-GCM"
                                                       }
```

### Key Functions (`src/utils/cryptoUtils.js`):
- **`deriveKey(seed)`**: Generates a non-extractable `CryptoKey` from the user's `uid` and application pepper using SHA-256.
- **`encryptPayload(data, userSeed)`**: Serializes JSON, generates a random 12-byte initialization vector (IV), encrypts using AES-256-GCM, and returns Base64 strings.
- **`decryptPayload(payload, userSeed)`**: Decodes Base64 buffers, decrypts via AES-256-GCM using the user's derived key, and parses the JSON arrays.

---

## ⚙️ Firebase Setup Guide

### 1. Create Firebase Project
1. Visit the [Firebase Console](https://console.firebase.google.com/) and click **Add Project**.
2. Name your project (e.g. `WebHome`).

### 2. Enable Authentication
1. Navigate to **Build ➔ Authentication ➔ Get Started**.
2. In the **Sign-in method** tab, enable **Email/Password** (and optionally **Google**).

### 3. Setup Cloud Firestore & Security Rules
1. Go to **Build ➔ Firestore Database ➔ Create Database**.
2. Choose your preferred region and start in **Production mode**.
3. Under the **Rules** tab, set the following security rule to ensure users can only access their own encrypted data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Create Web App and Add Keys to `.env`
1. In **Project Settings (⚙️) ➔ General ➔ Your Apps**, click the **Web (`</>`)** icon.
2. Copy the config values into your `.env` file:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789...
VITE_FIREBASE_APP_ID=1:123456789:web:...
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Auth Provider Toggles
VITE_ENABLE_GOOGLE_AUTH=false
VITE_ENABLE_GUEST_AUTH=false
VITE_ENABLE_EMAIL_AUTH=true

# Master Credentials (Pre-filled for 1-click Sign In)
VITE_ADMIN_EMAIL=anuragbiswas1389@gmail.com
VITE_ADMIN_PASSWORD=anuraG1389
```

---

## 🧩 Chrome / Edge Auto-Sync Extension

The companion extension located in the [`extension/`](./extension) directory automatically captures bookmarks added or edited in your browser's native bookmark bar (`Ctrl + D`) and syncs them directly to WebHome.

### How Extension Authentication Works (Zero-Login Web Bridge):
1. **Shared Session**: When WebHome is open in any tab, `content.js` automatically passes the active authenticated Firebase session to `background.js`.
2. **Deterministic Encryption**: The extension derives the identical AES-256 encryption key from `user.uid`, encrypts the bookmark list, and writes directly to Firestore via REST API.
3. **Live Sync**: Any bookmark added, deleted, renamed, or moved in Chrome is instantly synced.

### 🛠️ Installing the Extension:
1. Open `chrome://extensions` (or `edge://extensions` in Microsoft Edge).
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked** (top-left button) and select the `extension/` folder inside this repository.
4. Open your WebHome tab once to connect the session!

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm`

### Installation
```bash
# Clone repository
git clone https://github.com/anuragbiswas01/WebHome.git
cd WebHome

# Install dependencies
npm install

# Start local development server
npm run dev
```

The app will start at `http://localhost:5173/`.

### Available Scripts
- `npm run dev`: Starts the Vite development server with Hot Module Replacement.
- `npm run build`: Type-checks and compiles the production bundle in `dist/`.
- `npm run lint`: Runs ESLint across the codebase.
- `npm run preview`: Locally previews the production build.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
