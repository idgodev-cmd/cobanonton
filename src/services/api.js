const BASE_URL = 'https://zeldvorik.ru/apiv2/api.php';

const api = {
    fetchTrending: async (page = 1) => {
        const response = await fetch(`${BASE_URL}?action=trending&page=${page}`);
        return response.json();
    },
    fetchIndonesianMovies: async (page = 1) => {
        const response = await fetch(`${BASE_URL}?action=indonesian-movies&page=${page}`);
        return response.json();
    },
    fetchIndonesianDrama: async (page = 1) => {
        const response = await fetch(`${BASE_URL}?action=indonesian-drama&page=${page}`);
        return response.json();
    },
    fetchKDrama: async (page = 1) => {
        const response = await fetch(`${BASE_URL}?action=kdrama&page=${page}`);
        return response.json();
    },
    fetchShortTV: async (page = 1) => {
        const response = await fetch(`${BASE_URL}?action=short-tv&page=${page}`);
        return response.json();
    },
    fetchAnime: async (page = 1) => {
        const response = await fetch(`${BASE_URL}?action=anime&page=${page}`);
        return response.json();
    },
    search: async (query) => {
        const response = await fetch(`${BASE_URL}?action=search&q=${encodeURIComponent(query)}`);
        return response.json();
    },
    fetchDetail: async (detailPath) => {
        const response = await fetch(`${BASE_URL}?action=detail&detailPath=${detailPath}`);
        return response.json();
    }
};

export default api;
