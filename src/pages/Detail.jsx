import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Calendar, Film } from 'lucide-react';
import SEO from '../components/common/SEO';
import api from '../services/api';
import useFetch from '../hooks/useFetch';
import './Detail.css';

const Detail = () => {
    const { detailPath } = useParams();
    // We need to decode it in case it's encoded, but react-router usually decodes. 
    // However, because the API expects the full path, we pass it as is.
    // Note: ensure detailPath matches what the API expects.

    const { data: response, loading, error } = useFetch(
        () => api.fetchDetail(detailPath),
        [],
        [detailPath]
    );

    const [selectedEpisode, setSelectedEpisode] = useState(null);

    if (loading) {
        return (
            <div className="detail-container">
                <div className="container text-center" style={{ paddingTop: '100px' }}>Loading...</div>
            </div>
        );
    }

    if (error || !response || !response.data) {
        return (
            <div className="container text-center" style={{ paddingTop: '100px' }}>
                <h2>Failed to load content</h2>
            </div>
        );
    }

    const item = response.data;

    // If it's a TV series, item might have episodes or seasons
    // The API response structure for details needs to be inspected or handled carefully.
    // Based on request: "seasons/episodes untuk TV"
    // Assuming 'item.episodes' exists for TV types.
    // UPDATE: API returns 'seasons' array which contains 'episodes'.
    // We should flatten or handle seasons if needed. For now, let's look for 'seasons'.

    // Flatten episodes if seasons exist and no episodes at top level
    const episodes = item.episodes || (item.seasons ? item.seasons.flatMap(s => s.episodes) : []);

    const playerUrl = selectedEpisode ? selectedEpisode.playerUrl : item.playerUrl;

    return (
        <div className="detail-page">
            <SEO
                title={item.title}
                description={item.description}
                image={item.poster}
                type="video.movie"
            />
            <div className="backdrop" style={{ backgroundImage: `url(${item.poster})` }}>
                <div className="backdrop-overlay"></div>
            </div>

            <div className="container detail-content">
                {/* Main Player Section */}
                <div className="video-player-wrapper">
                    <iframe
                        src={playerUrl}
                        title={item.title}
                        className="video-player"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
                    ></iframe>
                </div>

                <div className="info-grid">
                    <div className="poster-wrapper">
                        <img src={item.poster} alt={item.title} className="detail-poster" />
                    </div>

                    <div className="info-content">
                        <h1 className="detail-title">{item.title}</h1>

                        <div className="detail-meta">
                            <div className="meta-item">
                                <Star size={18} color="#e5bb00" fill="#e5bb00" />
                                <span>{item.rating}</span>
                            </div>
                            <div className="meta-item">
                                <Calendar size={18} />
                                <span>{item.year}</span>
                            </div>
                            <div className="meta-item">
                                <Film size={18} />
                                <span>{item.genre}</span>
                            </div>
                        </div>

                        <div className="description">
                            <h3>Synopsis</h3>
                            <p>{item.description || "No description available."}</p>
                        </div>

                        {/* Episodes List using standard CSS */}
                        {episodes && episodes.length > 0 && (
                            <div className="episodes-section">
                                <h3>Episodes</h3>
                                <div className="episodes-list">
                                    {episodes.map((ep, index) => (
                                        <button
                                            key={index}
                                            className={`episode-btn ${selectedEpisode === ep ? 'active' : ''}`}
                                            onClick={() => setSelectedEpisode(ep)}
                                        >
                                            {ep.title || `Episode ${index + 1}`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Detail;
