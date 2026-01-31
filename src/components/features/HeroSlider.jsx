import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';
import './HeroSlider.css';

const HeroSlider = () => {
    // We fetch trending content for the slider
    const { data, loading, error } = useFetch(api.fetchTrending);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (data?.items && data.items.length > 0) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % Math.min(5, data.items.length));
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [data]);

    const handleNext = () => {
        if (data?.items) {
            setCurrentIndex((prev) => (prev + 1) % Math.min(5, data.items.length));
        }
    };

    const handlePrev = () => {
        if (data?.items) {
            setCurrentIndex((prev) =>
                prev === 0 ? Math.min(5, data.items.length) - 1 : prev - 1
            );
        }
    };

    if (loading) return <div className="hero-skeleton"></div>;
    if (error || !data || !data.items) return null;

    const items = data.items.slice(0, 5); // Take top 5 for slider
    const currentItem = items[currentIndex];

    if (!currentItem) return null;

    return (
        <div className="hero-slider">
            {/* Background Image with Gradient Overlay */}
            <div
                className="hero-backdrop"
                style={{ backgroundImage: `url(${currentItem.poster})` }}
            >
                <div className="hero-overlay"></div>
            </div>

            <div className="container hero-content-wrapper">
                <div className="hero-text">
                    <h2 className="hero-title">{currentItem.title}</h2>
                    <div className="hero-meta">
                        <span className="match-score">{currentItem.rating} Rating</span>
                        <span className="year">{currentItem.year}</span>
                        <span className="hd-badge">HD</span>
                    </div>
                    <p className="hero-description">{currentItem.genre} • {currentItem.type}</p>

                    <div className="hero-buttons">
                        <Link to={`/detail/${currentItem.detailPath}`} className="btn btn-primary">
                            <Play fill="currentColor" size={20} /> Play Now
                        </Link>
                        <Link to={`/detail/${currentItem.detailPath}`} className="btn btn-secondary">
                            <Info size={20} /> More Info
                        </Link>
                    </div>
                </div>
            </div>

            <button className="slider-arrow left" onClick={handlePrev}>
                <ChevronLeft size={32} />
            </button>
            <button className="slider-arrow right" onClick={handleNext}>
                <ChevronRight size={32} />
            </button>

            <div className="slider-indicators">
                {items.map((_, index) => (
                    <button
                        key={index}
                        className={`indicator ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;
