const store = new Map<string, { data: unknown; expiry: number }>();

export function getCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache(key: string, data: unknown, ttlMs: number): void {
  store.set(key, { data, expiry: Date.now() + ttlMs });
}

export function clearCache(): void {
  store.clear();
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.expiry) store.delete(key);
  }
}, 60_000);