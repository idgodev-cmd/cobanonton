import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import './MovieCard.css';

const MovieCard = ({ item }) => {
    const { title, poster, rating, year, type, detailPath } = item;

    return (
        <Link to={`/detail/${detailPath}`} className="movie-card">
            <div className="card-image-wrapper">
                <img src={poster} alt={title} className="card-image" loading="lazy" />
                <div className="card-overlay">
                    <div className="play-button">▶</div>
                </div>
                <div className="card-type">{type === 'tv' ? 'TV Series' : 'Movie'}</div>
            </div>
            <div className="card-content">
                <h3 className="card-title" title={title}>{title}</h3>
                <div className="card-meta">
                    <span className="card-year">{year}</span>
                    <span className="card-rating">
                        <Star size={12} fill="#e5bb00" stroke="none" />
                        {rating}
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default MovieCard;
