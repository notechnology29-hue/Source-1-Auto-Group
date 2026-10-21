import "server-only";
import { createCipheriv, randomBytes } from "node:crypto";

/** AES-256-GCM. CREDIT_APP_ENCRYPTION_KEY must be 32 bytes, base64 (`openssl rand -base64 32`). */
export function getEncryptionKey(): Buffer | null {
  const raw = process.env.CREDIT_APP_ENCRYPTION_KEY;
  if (!raw) return null;
  const key = Buffer.from(raw, "base64");
  return key.length === 32 ? key : null;
}

export function encryptJson(value: unknown, key: Buffer): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64")).join(".");
}
