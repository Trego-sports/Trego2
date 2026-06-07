import { env } from "cloudflare:workers";

const encoder = new TextEncoder();
const CALENDAR_TOKEN_SALT = "trego-calendar-token-v1";

async function deriveKey(secret: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(secret), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode(CALENDAR_TOKEN_SALT),
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypt a refresh token for storage at rest (AES-GCM).
 * Returns base64(iv + ciphertext).
 */
export async function encryptToken(plaintext: string, secret: string): Promise<string> {
  const key = await deriveKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(plaintext));
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return Buffer.from(combined).toString("base64");
}

/**
 * Decrypt a token previously encrypted with encryptToken.
 */
export async function decryptToken(encrypted: string, secret: string): Promise<string | null> {
  try {
    const combined = Buffer.from(encrypted, "base64");
    const iv = combined.subarray(0, 12);
    const ciphertext = combined.subarray(12);
    const key = await deriveKey(secret);
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return new TextDecoder().decode(plaintext);
  } catch {
    return null;
  }
}

export function getCalendarTokenSecret(): string {
  const calendarSecret = (env as { CALENDAR_TOKEN_SECRET?: string }).CALENDAR_TOKEN_SECRET;
  return calendarSecret ?? env.SESSION_SECRET;
}
