// Web Cryptography API AES-256-GCM encryption for Chrome Extension
const APP_PEPPER = "webhome_secure_e2ee_salt_v1";

export async function deriveKey(seed) {
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(`${seed}:${APP_PEPPER}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", keyMaterial);
  return await crypto.subtle.importKey(
    "raw",
    hashBuffer,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptPayload(data, userSeed) {
  try {
    const key = await deriveKey(userSeed);
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(JSON.stringify(data));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const cipherBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
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
    console.error("Extension encryption error:", error);
    return { data, isEncrypted: false };
  }
}

export async function decryptPayload(payload, userSeed) {
  if (!payload || !payload.isEncrypted) return payload;
  try {
    const key = await deriveKey(userSeed);
    const cipherBuffer = base64ToArrayBuffer(payload.cipherText);
    const ivBuffer = base64ToArrayBuffer(payload.iv);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(ivBuffer) },
      key,
      cipherBuffer
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decryptedBuffer));
  } catch (error) {
    console.error("Extension decryption failed:", error);
    return null;
  }
}
