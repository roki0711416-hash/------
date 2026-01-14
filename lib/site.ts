export function getSiteUrl(): string {
  const v = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (v && /^https?:\/\//.test(v)) return v.replace(/\/$/, "");
  return "http://localhost:3000";
}
