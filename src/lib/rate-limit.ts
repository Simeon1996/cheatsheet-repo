/**
 * Simple in-memory sliding-window rate limiter.
 *
 * NOTE: This only works within a single process. In a multi-instance
 * deployment (e.g. multiple Vercel Lambda invocations), you should
 * replace this with a Redis-backed solution (e.g. @upstash/ratelimit).
 */

const hits = new Map<string, number[]>();

/**
 * Returns `true` if the request is allowed, `false` if rate-limited.
 */
export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  let timestamps = hits.get(identifier);
  if (!timestamps) {
    timestamps = [];
    hits.set(identifier, timestamps);
  }

  // Remove expired entries
  const valid = timestamps.filter((t) => t > windowStart);
  hits.set(identifier, valid);

  if (valid.length >= limit) {
    return false;
  }

  valid.push(now);
  return true;
}
