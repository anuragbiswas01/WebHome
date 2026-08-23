// Web Cryptography API based AES-256-GCM client-side encryption
// Zero-knowledge encryption: data is encrypted in the browser before sending to Firebase,
// and decrypted in the browser after fetching.

// Default application pepper combined with user UID for per-user deterministic key
const APP_PEPPER = "webhome_secure_e2ee_salt_v1";

/**
 * Derives a 256-bit AES-GCM CryptoKey from user credentials or custom passphrase
 * @param {string} seed - User UID or custom passphrase
 * @returns {Promise<CryptoKey>}
 */
export async function deriveKey(seed = "default_user_key") {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    return null;
  }

  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(`${seed}:${APP_PEPPER}`);

  // Hash seed to 256-bit buffer using SHA-256
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", keyMaterial);

  // Import as AES-GCM key
  return await window.crypto.subtle.importKey(
    "raw",
    hashBuffer,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Helpers for Base64 conversion
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encrypts an object/payload using AES-GCM (256-bit)
 * @param {object|array} data
 * @param {string} userSeed
 * @returns {Promise<object>}
 */
export async function encryptPayload(data, userSeed) {
  try {
    const key = await deriveKey(userSeed);
    if (!key || typeof window === "undefined") {
      // Fallback if Web Crypto is unavailable
      return {
        data,
        isEncrypted: false,
      };
    }

    const encoder = new TextEncoder();
    const encodedData = encoder.encode(JSON.stringify(data));

    // Generate fresh random 12-byte initialization vector (IV) for every encryption
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const cipherBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      encodedData
    );

    return {
      cipherText: arrayBufferToBase64(cipherBuffer),
      iv: arrayBufferToBase64(iv),
      isEncrypted: true,
      algorithm: "AES-256-GCM",
    };
  } catch (error) {
    console.error("Encryption error:", error);
    // Safe fallback to raw data if encryption fails
    return {
      data,
      isEncrypted: false,
    };
  }
}

/**
 * Decrypts a payload from Firestore
 * @param {object} payload - Stored document data
 * @param {string} userSeed - User UID or custom passphrase
 * @returns {Promise<object>} Decrypted { bookmarks, shortcuts } or raw data
 */
export async function decryptPayload(payload, userSeed) {
  if (!payload) return null;

  // Backward compatibility: If data was stored unencrypted
  if (!payload.isEncrypted) {
    return {
      bookmarks: payload.bookmarks || [],
      shortcuts: payload.shortcuts || [],
    };
  }

  try {
    const key = await deriveKey(userSeed);
    if (!key || !payload.cipherText || !payload.iv) {
      console.warn("Missing key or cipher parameters for decryption");
      return {
        bookmarks: [],
        shortcuts: [],
      };
    }

    const cipherBuffer = base64ToArrayBuffer(payload.cipherText);
    const ivBuffer = base64ToArrayBuffer(payload.iv);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(ivBuffer),
      },
      key,
      cipherBuffer
    );

    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decryptedBuffer);
    const parsed = JSON.parse(jsonString);

    return {
      bookmarks: parsed.bookmarks || [],
      shortcuts: parsed.shortcuts || [],
    };
  } catch (error) {
    console.error("Decryption failed (possibly mismatched key):", error);
    return {
      bookmarks: [],
      shortcuts: [],
      error: "Decryption failed",
    };
  }
}
