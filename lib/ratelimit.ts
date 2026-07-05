import { headers } from "next/headers";

/**
 * Small in-memory sliding-window rate limiter for the auth endpoints.
 * Per-process only — on serverless each instance gets its own window, so
 * treat this as a first line of defense; put a WAF/edge rule in front for
 * anything serious.
 */

const g = globalThis as unknown as {
  __rlBuckets?: Map<string, number[]>;
};
const buckets = (g.__rlBuckets ??= new Map<string, number[]>());

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    "local"
  );
}

/** Returns true if the call is allowed, false if the limit is exhausted. */
export function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);

  // keep the map from growing unboundedly
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return true;
}
