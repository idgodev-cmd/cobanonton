// Test all DramaBox API endpoints with browser-like headers
const BASE_URL = 'https://api.sansekai.my.id/api';
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Referer': 'https://api.sansekai.my.id/'
};

async function probe(endpoint, desc) {
    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, { headers: HEADERS });
        if (!res.ok) {
            console.log(`❌ ${endpoint} (${desc}): HTTP ${res.status}`);
            return null;
        }
        const data = await res.json();
        const isArray = Array.isArray(data);
        const count = isArray ? data.length : (typeof data === 'object' ? Object.keys(data).length : 0);
        console.log(`✅ ${endpoint} (${desc}): ${isArray ? `${count} items` : typeof data}`);

        // Show first item structure
        if (isArray && data.length > 0) {
            const first = data[0];
            console.log(`   Keys: ${Object.keys(first).join(', ')}`);
            if (first.bookName) console.log(`   First: "${first.bookName}" (bookId: ${first.bookId})`);
            if (first.chapterName) console.log(`   First: "${first.chapterName}"`);
        } else if (typeof data === 'object') {
            console.log(`   Keys: ${Object.keys(data).join(', ')}`);
        }
        return data;
    } catch (e) {
        console.log(`❌ ${endpoint} (${desc}): ${e.message}`);
        return null;
    }
}

async function testEpisodePlayback(bookId, bookName) {
    console.log(`\n--- Episode test: "${bookName}" (${bookId}) ---`);
    try {
        const eps = await fetch(`${BASE_URL}/dramabox/allepisode?bookId=${bookId}`, { headers: HEADERS }).then(r => r.json());

        if (!Array.isArray(eps) || eps.length === 0) {
            console.log('   ❌ No episodes array returned');
            return;
        }

        console.log(`   Total episodes: ${eps.length}`);

        let noUrl = 0;
        let hasUrl = 0;
        let noCdn = 0;

        for (let i = 0; i < eps.length; i++) {
            const ep = eps[i];
            const cdnList = ep.cdnList || [];

            if (cdnList.length === 0) {
                noCdn++;
                if (i < 3) console.log(`   EP${i + 1}: ❌ No cdnList at all`);
                continue;
            }

            const defaultCdn = cdnList.find(c => c.isDefault === 1) || cdnList[0];
            const pathList = defaultCdn?.videoPathList || [];

            if (pathList.length === 0) {
                noCdn++;
                if (i < 3) console.log(`   EP${i + 1}: ❌ cdnList exists (${cdnList.length}) but no videoPathList`);
                continue;
            }

            const defaultPath = pathList.find(v => v.isDefault === 1) || pathList[0];
            const url = defaultPath?.videoPath;

            if (!url) {
                noUrl++;
                if (i < 3) console.log(`   EP${i + 1}: ❌ videoPathList exists but no videoPath`);
            } else {
                hasUrl++;
                if (i < 3) {
                    const isMP4 = url.match(/\.(mp4|m3u8)(\?.*)?$/i);
                    console.log(`   EP${i + 1}: ✅ URL found | mp4/m3u8=${!!isMP4} | ${url.substring(0, 80)}...`);
                }
            }
        }

        console.log(`   SUMMARY: ${hasUrl}/${eps.length} have URLs, ${noUrl} missing URL, ${noCdn} missing CDN`);
        return { hasUrl, noUrl, noCdn };
    } catch (e) {
        console.log(`   ❌ Error: ${e.message}`);
    }
}

async function main() {
    console.log('🔍 Complete DramaBox API Endpoint Probe\n');

    // Probe all endpoints
    const latest = await probe('/dramabox/latest', 'Drama Terbaru');
    const trending = await probe('/dramabox/trending?page=1', 'Trending');
    const foryou = await probe('/dramabox/foryou?page=1', 'For You');
    const vip = await probe('/dramabox/vip', 'VIP');
    const dubindo = await probe('/dramabox/dubindo', 'Dub Indo');
    const randomdrama = await probe('/dramabox/randomdrama', 'Random Drama');
    const populersearch = await probe('/dramabox/populersearch', 'Popular Search');
    const search = await probe('/dramabox/search?query=cinta', 'Search "cinta"');

    // Test playback on items from different sources
    console.log('\n\n🎬 PLAYBACK TESTING FROM DIFFERENT SOURCES');

    // From trending
    if (trending && trending.length > 0) {
        await testEpisodePlayback(trending[0].bookId, trending[0].bookName);
    }

    // From latest
    if (latest && latest.length > 0) {
        await testEpisodePlayback(latest[0].bookId, latest[0].bookName);
    }

    // From dubindo
    if (dubindo && Array.isArray(dubindo) && dubindo.length > 0) {
        await testEpisodePlayback(dubindo[0].bookId, dubindo[0].bookName);
    }

    // From search
    if (search && search.length > 0) {
        await testEpisodePlayback(search[0].bookId, search[0].bookName);
    }

    // From vip
    if (vip && Array.isArray(vip) && vip.length > 0 && vip[0].bookId) {
        await testEpisodePlayback(vip[0].bookId, vip[0].bookName);
    }

    // Test randomdrama structure (probably different - single video)
    if (randomdrama) {
        console.log('\n--- Random Drama structure ---');
        console.log(JSON.stringify(randomdrama, null, 2).substring(0, 500));
    }

    // Test populersearch structure
    if (populersearch) {
        console.log('\n--- Popular Search structure ---');
        console.log(JSON.stringify(populersearch, null, 2).substring(0, 500));
    }
}

main().catch(console.error);
