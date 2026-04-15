/**
 * Soft per-process mutation burst limiter (best-effort on multi-instance deploys).
 * Used to reduce accidental double-submit storms and light abuse.
 */
const g = globalThis as typeof globalThis & { __bcpMutationBurst?: Map<string, { windowStart: number; count: number }> };

function map(): Map<string, { windowStart: number; count: number }> {
  if (!g.__bcpMutationBurst) g.__bcpMutationBurst = new Map();
  return g.__bcpMutationBurst;
}

/** Returns false when the key has exceeded max actions within windowMs. */
export function consumeMutationBurst(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const m = map();
  const cur = m.get(key);
  if (!cur || now - cur.windowStart > windowMs) {
    m.set(key, { windowStart: now, count: 1 });
    return true;
  }
  if (cur.count >= max) return false;
  cur.count += 1;
  return true;
}
