// Remove require, use native fetch
const BASE_URL = 'https://api.sansekai.my.id/api';

const normalizeItem = (item, brand) => {
    if (!item) return null;
    try {
        switch (brand) {
            case 'dramabox':
                return {
                    id: `dramabox:${item.bookId}`,
                    title: item.bookName,
                    poster: item.coverWap || item.cover,
                    rating: item.rankVo?.hotCode || "New",
                    genre: item.tags?.[0] || "Drama",
                };
            case 'netshort':
                return {
                    id: `netshort:${item.shortPlayId}`,
                    title: item.title || item.shortPlayName,
                    poster: item.coverUrl || item.shortPlayCover,
                    rating: item.heatScoreShow || "New",
                    genre: "Short TV",
                };
            case 'reelshort':
                return {
                    id: `reelshort:${item.book_id}`,
                    title: item.book_title,
                    poster: item.book_pic,
                    rating: item.collect_count ? `${(item.collect_count / 1000).toFixed(1)}K` : "New",
                    genre: item.theme?.[0] || "Short TV"
                };
            case 'flickreels':
                return {
                    id: `flickreels:${item.book_id}`,
                    title: item.book_title,
                    poster: item.book_pic,
                    rating: item.score || "New",
                    genre: "Short TV"
                };
            default:
                return item;
        }
    } catch (e) {
        console.error("Normalize error:", e);
        return null;
    }
};

async function testFetchTrending() {
    console.log("Testing fetchTrending...");
    try {
        const p1 = fetch(`${BASE_URL}/dramabox/trending?page=1`).then(r => r.json()).catch(e => ({ error: e.message }));
        const p2 = fetch(`${BASE_URL}/dramabox/foryou?page=1`).then(r => r.json()).catch(e => ({ error: e.message }));
        const p3 = fetch(`${BASE_URL}/dramabox/search?query=drama`).then(r => r.json()).catch(e => ({ error: e.message }));

        const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

        const d1 = Array.isArray(r1) ? r1 : [];
        const d2 = Array.isArray(r2) ? r2 : [];
        const d3 = Array.isArray(r3) ? r3 : [];

        const combined = [...d1, ...d2, ...d3];
        console.log("Combined length:", combined.length);

        if (combined.length > 0) {
            const sample = combined[0];
            const mapped = normalizeItem(sample, 'dramabox');
            console.log("Mapped sample:", JSON.stringify(mapped, null, 2));

            // Check for potential React rendering issues
            if (typeof mapped.rating === 'object') console.error("RATING IS OBJECT!");
            if (typeof mapped.title === 'object') console.error("TITLE IS OBJECT!");
        } else {
            console.log("No items found to test mapping.");
        }

    } catch (e) {
        console.error("Trending Error:", e);
    }
}

async function testFetchNetShort() {
    console.log("Testing fetchNetShort...");
    try {
        const p1 = fetch(`${BASE_URL}/netshort/foryou?page=1`).then(r => r.json()).catch(e => ({ error: e.message }));
        const d1 = await p1;
        const items = d1?.contentInfos || [];
        console.log("NetShort Items:", items.length);
        if (items.length > 0) {
            const mapped = normalizeItem(items[0], 'netshort');
            console.log("NetShort Mapped:", JSON.stringify(mapped, null, 2));
        }
    } catch (e) {
        console.error("NetShort Error:", e);
    }
}

async function run() {
    await testFetchTrending();
    await testFetchNetShort();
}

run();
