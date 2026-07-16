import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const CACHE_FILE = join(process.cwd(), '.cache.json');
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 分钟

interface CacheEntry<T = unknown> {
  data: T;
  cachedAt: number;      // 首次缓存时间
  lastRefresh: number;   // 最后刷新时间
  refreshing: boolean;   // 是否正在后台刷新中
}

const store = new Map<string, CacheEntry>();

// ---- 磁盘持久化 ----

// 启动时恢复
function loadFromDisk() {
  try {
    if (!existsSync(CACHE_FILE)) return;
    const raw = JSON.parse(readFileSync(CACHE_FILE, 'utf-8'));
    for (const [key, val] of Object.entries(raw)) {
      store.set(key, val as CacheEntry);
    }
  } catch { /* 文件损坏则忽略 */ }
}

function saveToDisk() {
  try {
    const obj: Record<string, CacheEntry> = {};
    for (const [k, v] of store) obj[k] = v;
    writeFileSync(CACHE_FILE, JSON.stringify(obj));
  } catch { /* 写入失败静默忽略 */ }
}

loadFromDisk();

// 进程退出时保存
process.on('SIGTERM', () => { saveToDisk(); process.exit(0); });
process.on('SIGINT', () => { saveToDisk(); process.exit(0); });

// ---- 缓存读写 ----

export function setCache<T>(key: string, data: T): void {
  const now = Date.now();
  store.set(key, { data, cachedAt: now, lastRefresh: now, refreshing: false });
}

export function getCache<T>(key: string): { data: T; stale: boolean } | null {
  const entry = store.get(key);
  if (!entry) return null;

  const stale = Date.now() - entry.lastRefresh > REFRESH_INTERVAL;
  return { data: entry.data as T, stale };
}

// ---- 后台刷新（节流：同一 key 30 分钟内只执行一次） ----

const pendingRefreshes = new Set<string>();

export function shouldRefresh(key: string): boolean {
  if (pendingRefreshes.has(key)) return false;
  const entry = store.get(key);
  if (!entry) return false;
  if (entry.refreshing) return false;
  if (Date.now() - entry.lastRefresh < REFRESH_INTERVAL) return false;
  return true;
}

export function markRefreshing(key: string): void {
  const entry = store.get(key);
  if (entry) entry.refreshing = true;
  pendingRefreshes.add(key);
}

export function refreshDone(key: string, data: unknown): void {
  const now = Date.now();
  const entry = store.get(key);
  if (entry) {
    entry.data = data;
    entry.lastRefresh = now;
    entry.refreshing = false;
  } else {
    store.set(key, { data, cachedAt: now, lastRefresh: now, refreshing: false });
  }
  pendingRefreshes.delete(key);
}