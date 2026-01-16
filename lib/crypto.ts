import crypto from "node:crypto";

export function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function randomToken(bytes = 32) {
  // URL-safe
  return crypto.randomBytes(bytes).toString("base64url");
}

export function randomId(prefix = "") {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return prefix ? `${prefix}${uuid}` : uuid;
  return prefix
    ? `${prefix}${Date.now()}-${Math.random().toString(16).slice(2)}`
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
