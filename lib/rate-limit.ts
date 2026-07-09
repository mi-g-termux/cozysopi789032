// Simple in-memory sliding-window rate limiter.
// For production across multiple instances, back this with Redis/Upstash.
import { Errors } from "@/lib/api";

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000
): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000)
    };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, retryAfter: 0 };
}

/** Best-effort client IP from request headers. */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Shared limiter guard for API route handlers. Keys the bucket by
 * `<name>:<ip>` and returns a ready-to-send 429 response (with a Retry-After
 * header) when the caller is over the limit, or null when the request may
 * proceed. Use this on every sensitive endpoint for consistent protection:
 *
 *   const limited = enforceRateLimit(req, "checkout", 10, 60_000);
 *   if (limited) return limited;
 */
export function enforceRateLimit(
  req: Request,
  name: string,
  limit = 10,
  windowMs = 60_000,
) {
  const result = rateLimit(`${name}:${getClientIp(req)}`, limit, windowMs);
  if (result.allowed) return null;
  const res = Errors.RATE_LIMIT();
  res.headers.set("Retry-After", String(result.retryAfter));
  return res;
}
