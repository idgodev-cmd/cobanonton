const BASE_URL = 'https://api.sansekai.my.id/api';

async function run() {
    console.log("Simulating api.js fetchTrending...");
    try {
        // Exact logic from api.js
        const [p1, p2, p3] = await Promise.all([
            fetch(`${BASE_URL}/dramabox/trending?page=1`).then(r => r.json()),
            fetch(`${BASE_URL}/dramabox/foryou?page=1`).then(r => r.json()),
            fetch(`${BASE_URL}/dramabox/search?query=drama`).then(r => r.json())
        ]);
        console.log("Promise.all succeeded!");
        console.log("P1 length:", p1 ? p1.length : 'null');
        console.log("P2 length:", p2 ? p2.length : 'null');
        console.log("P3 length:", p3 ? p3.length : 'null');

    } catch (e) {
        console.error("Promise.all FAILED:", e);
    }

    console.log("\nSimulating api.js fetchFlickReels...");
    try {
        const response = await fetch(`${BASE_URL}/flickreels/foryou?page=1`);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = await response.json();
        console.log("FlickReels data keys:", Object.keys(data));
        if (data.error) console.error("FlickReels API Error:", data.error);
    } catch (e) {
        console.error("FlickReels FAILED:", e);
    }
}

run();
