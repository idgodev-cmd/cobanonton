import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieGrid from '../components/features/MovieGrid';
import Skeleton from '../components/common/Skeleton';
import SEO from '../components/common/SEO';
import api from '../services/api';
import useFetch from '../hooks/useFetch';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');

    // Create a fetcher function that uses the current query
    const fetcher = React.useCallback(() => api.search(query), [query]);

    const { data, loading, error } = useFetch(fetcher, [], [query]);

    return (
        <div className="container" style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
            <SEO title={`Search: ${query}`} description={`Search results for ${query}`} />
            <h2 className="section-title">Search Results for "{query}"</h2>

            {loading && (
                <div className="movie-grid">
                    {[...Array(10)].map((_, i) => (
                        <Skeleton key={i} width="100%" height="300px" />
                    ))}
                </div>
            )}

            {!loading && error && <div className="text-center">Error loading results.</div>}

            {!loading && data?.items && data.items.length === 0 && (
                <div className="text-center">No results found.</div>
            )}

            {data?.items && <MovieGrid items={data.items} />}
        </div>
    );
};

export default Search;
