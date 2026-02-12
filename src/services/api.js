// In dev: requests go through Vite proxy (/api → api.sansekai.my.id/api)
// In prod: requests go directly to the API
const BASE_URL = import.meta.env.DEV ? '/api' : 'https://api.sansekai.my.id/api';

// --- Debug Logger ---
const debugLog = [];
const MAX_LOG = 100;

const dbg = (type, message, data = null) => {
    const entry = {
        time: new Date().toLocaleTimeString(),
        type,
        message,
        data: data ? JSON.stringify(data).substring(0, 200) : null
    };
    debugLog.push(entry);
    if (debugLog.length > MAX_LOG) debugLog.shift();
    if (type === 'error') console.error(`[API] ${message}`, data || '');
    else console.log(`[API] ${message}`, data || '');
};

// Export debug log for UI
export const getDebugLog = () => [...debugLog];
export const clearDebugLog = () => { debugLog.length = 0; };

/**
 * Safe fetch wrapper - handles 403 (IP blacklist), 429 (rate limit), network errors
 * Falls back to CORS proxies if direct request fails with 403
 */
const CORS_PROXIES = [
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

const safeFetch = async (url, label = '') => {
    // Build full URL for proxy fallback
    const fullUrl = url.startsWith('http') ? url : `https://api.sansekai.my.id${url}`;

    // Attempt 1: Direct fetch (or via Vite proxy in dev)
    try {
        dbg('fetch', `→ ${label}`);
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            const count = Array.isArray(data) ? data.length : (typeof data === 'object' ? Object.keys(data).length : 0);
            dbg('ok', `← ${label} OK (${count} items)`);
            return data;
        }
        dbg('warn', `← ${label} HTTP ${res.status}, trying CORS proxy...`);
    } catch (err) {
        dbg('warn', `← ${label} direct FAIL: ${err.message}, trying CORS proxy...`);
    }

    // Attempt 2+: Try CORS proxies
    for (let i = 0; i < CORS_PROXIES.length; i++) {
        const proxyUrl = CORS_PROXIES[i](fullUrl);
        try {
            dbg('fetch', `→ ${label} [proxy ${i + 1}]`);
            const res = await fetch(proxyUrl);
            if (res.ok) {
                const data = await res.json();
                const count = Array.isArray(data) ? data.length : (typeof data === 'object' ? Object.keys(data).length : 0);
                dbg('ok', `← ${label} [proxy ${i + 1}] OK (${count} items)`);
                return data;
            }
            dbg('error', `← ${label} [proxy ${i + 1}] HTTP ${res.status}`);
        } catch (err) {
            dbg('error', `← ${label} [proxy ${i + 1}] FAIL: ${err.message}`);
        }
    }

    dbg('error', `← ${label} ALL attempts failed`);
    return null;
};

const normalizeItem = (item) => {
    if (!item) return null;
    const bookId = item.bookId || item.id;
    if (!bookId) return null;

    return {
        id: `dramabox:${bookId}`,
        title: item.bookName || item.name || item.title || 'Untitled',
        poster: item.coverWap || item.cover || item.poster || '',
        rating: item.rankVo?.hotCode || "New",
        rankSort: item.rankVo?.sort ?? item.sort ?? 999,
        genre: item.tags?.[0] || item.tagNames?.[0] || "Drama",
        allGenres: item.tagNames || item.tags || [],
        description: item.introduction || item.desc || '',
        detailPath: bookId,
        protagonist: item.protagonist || ''
    };
};

/**
 * Extract video URL from episode data with multiple fallback strategies
 */
const extractVideoUrl = (chapter) => {
    if (!chapter) return null;

    const cdnList = chapter.cdnList || [];

    // Strategy 1: Find default CDN with default video path
    for (const cdn of cdnList) {
        const pathList = cdn.videoPathList || [];
        const defaultPath = pathList.find(v => v.isDefault === 1);
        if (defaultPath?.videoPath) return defaultPath.videoPath;
    }

    // Strategy 2: Default CDN, first available path
    const defaultCdn = cdnList.find(c => c.isDefault === 1);
    if (defaultCdn?.videoPathList?.length > 0) {
        const path = defaultCdn.videoPathList[0]?.videoPath;
        if (path) return path;
    }

    // Strategy 3: Any CDN, any path
    for (const cdn of cdnList) {
        if (cdn.videoPathList) {
            for (const vp of cdn.videoPathList) {
                if (vp.videoPath) return vp.videoPath;
            }
        }
    }

    // Strategy 4: Direct fields
    return chapter.videoUrl || chapter.url || chapter.videoPath || null;
};

const api = {
    fetchTrending: async (page = 1) => {
        const [p1, p2, p3] = await Promise.all([
            safeFetch(`${BASE_URL}/dramabox/trending?page=${page}`, 'trending'),
            safeFetch(`${BASE_URL}/dramabox/foryou?page=${page}`, 'foryou'),
            safeFetch(`${BASE_URL}/dramabox/search?query=drama`, 'search-drama')
        ]);
        // safeFetch returns null on error, so default to empty arrays
        const combined = [...(Array.isArray(p1) ? p1 : []), ...(Array.isArray(p2) ? p2 : []), ...(Array.isArray(p3) ? p3 : [])];
        const unique = combined
            .filter(i => i && (i.bookId || i.id))
            .filter((v, i, a) => a.findIndex(t => (t.bookId || t.id) === (v.bookId || v.id)) === i);

        dbg('info', `fetchTrending: ${combined.length} raw → ${unique.length} unique`);
        return {
            items: unique.map(item => normalizeItem(item)).filter(Boolean),
            hasMore: unique.length > 0
        };
    },

    fetchForYou: async (page = 1) => {
        const data = await safeFetch(`${BASE_URL}/dramabox/foryou?page=${page}`, 'foryou');
        const items = (Array.isArray(data) ? data : []).filter(i => i && (i.bookId || i.id));
        return {
            items: items.map(item => normalizeItem(item)).filter(Boolean),
            hasMore: items.length > 0
        };
    },

    fetchLatest: async () => {
        const data = await safeFetch(`${BASE_URL}/dramabox/latest`, 'latest');
        const items = (Array.isArray(data) ? data : []).filter(i => i && (i.bookId || i.id));
        return {
            items: items.map(item => normalizeItem(item)).filter(Boolean),
            hasMore: items.length > 0
        };
    },

    fetchVip: async () => {
        const data = await safeFetch(`${BASE_URL}/dramabox/vip`, 'vip');
        const items = (Array.isArray(data) ? data : []).filter(i => i && (i.bookId || i.id));
        return {
            items: items.map(item => normalizeItem(item)).filter(Boolean),
            hasMore: items.length > 0
        };
    },

    fetchDubIndo: async () => {
        const data = await safeFetch(`${BASE_URL}/dramabox/dubindo`, 'dubindo');
        const items = (Array.isArray(data) ? data : []).filter(i => i && (i.bookId || i.id));
        return {
            items: items.map(item => normalizeItem(item)).filter(Boolean),
            hasMore: items.length > 0
        };
    },

    fetchRandomDrama: async () => {
        const data = await safeFetch(`${BASE_URL}/dramabox/randomdrama`, 'randomdrama');
        return data;
    },

    fetchPopularSearch: async () => {
        const data = await safeFetch(`${BASE_URL}/dramabox/populersearch`, 'populersearch');
        return Array.isArray(data) ? data : [];
    },

    fetchDramaBox: async (page = 1) => {
        return api.fetchTrending(page);
    },

    search: async (query) => {
        const data = await safeFetch(`${BASE_URL}/dramabox/search?query=${encodeURIComponent(query)}`, `search:${query}`);
        return {
            items: (Array.isArray(data) ? data : []).map(item => normalizeItem(item)).filter(Boolean),
            hasMore: false
        };
    },

    fetchDetail: async (compositeId) => {
        const parts = compositeId.split(':');
        const brand = parts[0];
        const id = parts.slice(1).join(':');

        if (brand !== 'dramabox') {
            dbg('error', `Unknown brand: ${brand}`);
            return {};
        }

        const [detailRes, episodesRes] = await Promise.all([
            safeFetch(`${BASE_URL}/dramabox/detail?bookId=${id}`, `detail:${id}`),
            safeFetch(`${BASE_URL}/dramabox/allepisode?bookId=${id}`, `episodes:${id}`)
        ]);

        const episodes = Array.isArray(episodesRes) ? episodesRes : [];
        const mappedEpisodes = episodes.map(c => {
            const videoUrl = extractVideoUrl(c);
            return {
                id: c.chapterId || c.id,
                title: c.chapterName || c.title || `Episode`,
                url: videoUrl,
                cdnList: c.cdnList
            };
        });

        const noUrlCount = mappedEpisodes.filter(e => !e.url).length;
        if (noUrlCount > 0) {
            dbg('warn', `${noUrlCount}/${mappedEpisodes.length} episodes have no video URL`, { bookId: id });
        }

        return {
            ...normalizeItem(detailRes || { bookId: id }),
            episodes: mappedEpisodes
        };
    }
};

export default api;
