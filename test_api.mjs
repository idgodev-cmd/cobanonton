async function test(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        if (!response.ok) return { error: response.status };
        return await response.json();
    } catch (e) {
        return { error: e.message };
    }
}

async function run() {
    console.log("--- PROBING MELOLO ---");
    const melolo = await test('https://api.sansekai.my.id/api/melolo/foryou?page=1');
    console.log("Melolo Status:", melolo.error ? melolo.error : "OK");
    if (melolo?.data?.lists) console.log("Melolo Count:", melolo.data.lists.length);

    console.log("\n--- PROBING FLICKREELS ---");
    const flick = await test('https://api.sansekai.my.id/api/flickreels/foryou?page=1');
    console.log("FlickReels Status:", flick.error ? flick.error : "OK");
    if (flick?.data?.lists) console.log("FlickReels Count:", flick.data.lists.length);
}

run();
