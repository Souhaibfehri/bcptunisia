/** Normalize PostgREST embedded relations that may be object or single-element array. */
export function embedOne<T>(v: unknown): T | null {
  if (v == null) return null;
  if (Array.isArray(v)) return (v[0] ?? null) as T | null;
  return v as T;
}
