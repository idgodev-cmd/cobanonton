export const BADGES = [
    { id: 'newbie', name: 'Pendatang Baru', icon: '🌱', desc: 'Nonton episode pertama kamu' },
    { id: 'marathon', name: 'Marathon', icon: '🏃', desc: 'Selesaikan 5 episode' },
    { id: 'nightowl', name: 'Begadang', icon: '🦉', desc: 'Nonton lewat jam 12 malam' },
    { id: 'collector', name: 'Kolektor', icon: '📚', desc: 'Simpan 3 drama ke daftar' }
];

export const checkBadges = (stats, currentBadges) => {
    const newBadges = [...currentBadges];
    let updated = false;

    const totalWatched = stats.watchedCount || 0;
    const watchlistCount = stats.watchlistCount || 0;
    const isNight = new Date().getHours() >= 0 && new Date().getHours() < 4;

    if (totalWatched >= 1 && !newBadges.includes('newbie')) {
        newBadges.push('newbie');
        updated = true;
    }
    if (totalWatched >= 5 && !newBadges.includes('marathon')) {
        newBadges.push('marathon');
        updated = true;
    }
    if (watchlistCount >= 3 && !newBadges.includes('collector')) {
        newBadges.push('collector');
        updated = true;
    }
    if (isNight && totalWatched > 0 && !newBadges.includes('nightowl')) {
        newBadges.push('nightowl');
        updated = true;
    }

    return updated ? newBadges : null;
};
