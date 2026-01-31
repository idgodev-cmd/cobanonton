import React from 'react';
import { useSearchParams } from 'react-router-dom';
import HeroSlider from '../components/features/HeroSlider';
import MovieGrid from '../components/features/MovieGrid';
import Skeleton from '../components/common/Skeleton';
import SEO from '../components/common/SEO';
import api from '../services/api';
import useFetch from '../hooks/useFetch';

const Section = ({ title, fetcher, visible = true }) => {
    const [page, setPage] = React.useState(1);
    const [items, setItems] = React.useState([]);
    const [hasMore, setHasMore] = React.useState(true);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        setItems([]);
        setPage(1);
        setHasMore(true);
    }, [fetcher]);

    React.useEffect(() => {
        if (!visible) return;

        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await fetcher(page);
                if (isMounted) {
                    if (data && data.items) {
                        setItems(prev => page === 1 ? data.items : [...prev, ...data.items]);
                        setHasMore(data.hasMore);
                    }
                }
            } catch (err) {
                if (isMounted) setError(err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [page, fetcher, visible]);

    if (!visible) return null;

    if (loading && page === 1) {
        return (
            <div className="container movie-section">
                <h2 className="section-title">{title}</h2>
                <div className="movie-grid">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} width="100%" height="300px" />
                    ))}
                </div>
            </div>
        );
    }

    if (error && page === 1) return null;

    return (
        <div className="container">
            <MovieGrid title={title} items={items} />
            {hasMore && items.length > 0 && (
                <div className="text-center" style={{ marginBottom: '3rem' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setPage(p => p + 1)}
                        disabled={loading}
                        style={{ minWidth: '120px' }}
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
};

const Home = () => {
    const [searchParams] = useSearchParams();
    const category = searchParams.get('cat');

    // Logic to determine which sections to show based on category
    const showAll = !category;
    const showDrama = category === 'drama';
    const showAnime = category === 'anime';

    return (
        <div className="home-page">
            <SEO title="Home" description="Watch the latest movies, drama, and anime for free." />
            {/* Only show Hero on main home or if desired */}
            <HeroSlider />

            <Section
                title="Trending Now"
                fetcher={api.fetchTrending}
                visible={showAll}
            />

            <Section
                title="Indonesian Movies"
                fetcher={api.fetchIndonesianMovies}
                visible={showAll}
            />

            {(showAll || showDrama) && (
                <>
                    <Section
                        title="Indonesian Drama"
                        fetcher={api.fetchIndonesianDrama}
                        visible={true}
                    />
                    <Section
                        title="K-Drama"
                        fetcher={api.fetchKDrama}
                        visible={true}
                    />
                    <Section
                        title="Short TV"
                        fetcher={api.fetchShortTV}
                        visible={true}
                    />
                </>
            )}

            {(showAll || showAnime) && (
                <Section
                    title="Anime"
                    fetcher={api.fetchAnime}
                    visible={true}
                />
            )}
        </div>
    );
};

export default Home;
