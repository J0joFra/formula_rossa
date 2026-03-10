// lib/cache.js
// Cache in-memory per le fetch di JSON pubblici
// TTL default: 5 minuti 

const CACHE_TTL = 5 * 60 * 1000; // 5 minuti
const cache = new Map();

export async function fetchWithCache(url) {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Fetch failed: ${url} (${response.status})`);
  const data = await response.json();
  cache.set(url, { data, timestamp: Date.now() });
  return data;
}

export function clearCache(url) {
  if (url) cache.delete(url);
  else cache.clear();
}