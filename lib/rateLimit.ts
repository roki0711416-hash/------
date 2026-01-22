type RateLimitOptions = {
  windowMs: number;
  max: number;
};

type Bucket = {
  resetAt: number;
  count: number;
};

const buckets = new Map<string, Bucket>();

function now() {
  return Date.now();
}

function cleanupExpired() {
  const t = now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= t) buckets.delete(key);
  }
}

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}

export function rateLimit(req: Request, opts: RateLimitOptions) {
  cleanupExpired();

  const key = `ip:${getClientIp(req)}`;
  const t = now();

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= t) {
    buckets.set(key, { resetAt: t + opts.windowMs, count: 1 });
    return { ok: true as const, remaining: opts.max - 1, resetAt: t + opts.windowMs };
  }

  if (existing.count >= opts.max) {
    return { ok: false as const, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    ok: true as const,
    remaining: Math.max(0, opts.max - existing.count),
    resetAt: existing.resetAt,
  };
}
