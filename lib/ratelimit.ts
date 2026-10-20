const hits = new Map<string, { count: number; resetAt: number }>();

export function cekRateLimit(
  key: string,
  limit: number,
  windowMs = 24 * 60 * 60 * 1000,
): { ok: boolean; sisa: number; resetAt: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, sisa: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { ok: false, sisa: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { ok: true, sisa: limit - entry.count, resetAt: entry.resetAt };
}

export function sisaKuota(key: string, limit: number): number {
  const entry = hits.get(key);
  if (!entry || Date.now() > entry.resetAt) return limit;
  return Math.max(0, limit - entry.count);
}

export function resetRateLimit() {
  hits.clear();
}
