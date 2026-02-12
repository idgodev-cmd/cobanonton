const BASE_URL = 'https://api.sansekai.my.id/api';

async function run() {
    try {
        const p1 = await fetch(`${BASE_URL}/dramabox/trending?page=1`).then(r => r.json());
        const p2 = await fetch(`${BASE_URL}/dramabox/foryou?page=1`).then(r => r.json());
        const p3 = await fetch(`${BASE_URL}/dramabox/search?query=drama`).then(r => r.json());

        console.log("Trending Item Keys:", p1 && p1[0] ? Object.keys(p1[0]) : 'None');
        console.log("ForYou Item Keys:", p2 && p2[0] ? Object.keys(p2[0]) : 'None');
        console.log("Search Item Keys:", p3 && p3[0] ? Object.keys(p3[0]) : 'None');

    } catch (e) {
        console.error("Error:", e);
    }
}

run();
