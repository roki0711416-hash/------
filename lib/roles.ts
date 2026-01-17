export type UserRole = "admin" | "dev" | null;

export function isAdminRole(role: string | null | undefined) {
  return role === "admin";
}

function parseCsv(value: string | undefined) {
  if (!value) return [];

  const raw = value.trim();
  if (!raw) return [];

  // Allow JSON array input (e.g. ["u_...","u_..."]). This is easy to paste in Vercel.
  if (raw.startsWith("[")) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .map((v) => String(v).trim())
          .map((s) => s.replace(/^['\"]|['\"]$/g, ""))
          .filter(Boolean);
      }
    } catch {
      // fall through
    }
  }

  // Default: split by comma and/or whitespace (newlines, spaces, tabs).
  return raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .map((s) => s.replace(/^['\"]|['\"]$/g, ""))
    .filter(Boolean);
}

export function shouldBeAdminFromEnv(params: { userId: string; email: string }) {
  // Vercel preview は NODE_ENV=production になるため、
  // 本番判定は VERCEL_ENV=production のみに寄せる。
  const isProd = process.env.VERCEL_ENV === "production";

  const adminEmails = isProd
    ? []
    : parseCsv(process.env.SLOKASU_ADMIN_EMAILS).map((e) => e.toLowerCase());
  const adminUserIds = parseCsv(process.env.SLOKASU_ADMIN_USER_IDS);
  return adminEmails.includes(params.email.toLowerCase()) || adminUserIds.includes(params.userId);
}
