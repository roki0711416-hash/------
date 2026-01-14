import crypto from "node:crypto";

export function sha256Base64Url(input: string): string {
  const hash = crypto.createHash("sha256").update(input).digest("base64url");
  return hash;
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function randomUuid(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return crypto.randomUUID();
}
