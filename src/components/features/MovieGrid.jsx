import React from 'react';
import MovieCard from '../common/MovieCard';
import './MovieGrid.css';

const MovieGrid = ({ items, title }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="movie-section">
            {title && <h2 className="section-title">{title}</h2>}
            <div className="movie-grid">
                {items.map((item) => (
                    <MovieCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
};

export default MovieGrid;
