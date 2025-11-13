/**
 * Note: I could have used a package like `jose`, but I wanted to implement it myself 🤷‍♂️
 * Adapted from Remix.run
 * Source: https://github.com/remix-run/remix/blob/1bd7f943c3f90c9e7e9ca5742324f1bb2622958c/packages/remix-cloudflare/crypto.ts
 */

const encoder = new TextEncoder();

/**
 * Sign a value using HMAC with the provided secret \
 * Note that the value is still stored in plaintext, along with the signature \
 * When decoding the value, the signature is verified before returning the value
 * @returns the signed value as a string
 */
export async function sign(value: string, secret: string): Promise<string> {
  if (typeof value !== "string" || typeof secret !== "string") {
    throw new Error("value and secret must be strings");
  }

  const data = encoder.encode(value);
  const key = await createKey(secret, ["sign"]);

  const signature = await crypto.subtle.sign("HMAC", key, data);
  const hash = Buffer.from(signature).toString("base64").replace(/=+$/, "");

  return `${value}.${hash}`;
}

/**
 * Verify a signed value using HMAC with the provided secret
 * @returns the original value if the signature is valid, otherwise null
 */
export async function unsign(signed: string, secret: string): Promise<string | null> {
  if (typeof signed !== "string" || typeof secret !== "string") {
    throw new Error("signed and secret must be strings");
  }

  const separatorIndex = signed.lastIndexOf(".");
  if (separatorIndex === -1) return null;

  const hash = signed.slice(separatorIndex + 1);
  const value = signed.slice(0, separatorIndex);

  const data = encoder.encode(value);
  const key = await createKey(secret, ["verify"]);
  const signature = Uint8Array.from(Buffer.from(hash, "base64"));

  const valid = await crypto.subtle.verify("HMAC", key, signature, data);

  return valid ? value : null;
}

async function createKey(secret: string, usages: CryptoKey["usages"]): Promise<CryptoKey> {
  const keyData = encoder.encode(secret);
  return await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, usages);
}
