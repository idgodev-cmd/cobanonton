// API fetch utilities with caching and optimization

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function fetchWithCache(url, options = {}) {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    
    // Return cached data if available even if expired
    if (cached) {
      console.warn(`Using stale cache for ${url}`);
      return cached.data;
    }
    
    throw error;
  }
}

// Prefetch function for critical resources
export function prefetchAPI(url, options = {}) {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

// Batch API calls
export async function batchFetch(requests) {
  const results = await Promise.allSettled(
    requests.map(({ url, options }) => fetchWithCache(url, options))
  );

  return results.map((result, index) => ({
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null,
    url: requests[index].url,
  }));
}

// Clear cache
export function clearCache() {
  cache.clear();
}

// Clear specific cache entry
export function clearCacheEntry(url) {
  for (const [key] of cache) {
    if (key.startsWith(url)) {
      cache.delete(key);
    }
  }
}

// Search drama using micro API
export async function searchDrama(query, limit = 20) {
  if (!query) return [];
  
  try {
    const url = `https://dramabos.asia/api/micro/api/v1/search?q=${encodeURIComponent(query)}&lang=id&limit=${limit}`;
    const json = await fetchWithCache(url, {
      headers: { accept: "application/json" },
    });

    const data = Array.isArray(json?.dassi?.lspee) ? json.dassi.lspee : [];
    const seen = new Set();
    const normalized = [];

    for (const item of data) {
      const id = item.dope;
      if (!id || seen.has(id)) continue;
      seen.add(id);

      normalized.push({
        id: id,
        slug: `drama/${id}`,
        title: item.ngrand || "Drama",
        img: item.pcoa,
        description: item.dfill,
        episodes: item.eext,
        tags: item.sheat || [],
        status: item.eext ? `${item.eext} Episode` : undefined,
        type: "Drama",
      });
    }

    return normalized;
  } catch (error) {
    console.error('Search drama error:', error);
    return [];
  }
}
