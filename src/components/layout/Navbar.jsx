import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            setIsOpen(false);
        }
    };

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to="/" className="logo">
                    Coba<span className="text-primary">Nonton</span>
                </Link>

                {/* Desktop Menu */}
                <div className="desktop-menu">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/?cat=drama" className="nav-link">Drama</Link>
                    <Link to="/?cat=anime" className="nav-link">Anime</Link>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-btn">
                        <Search size={20} />
                    </button>
                </form>

                {/* Mobile Menu Toggle */}
                <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="mobile-menu">
                        <Link to="/" className="mobile-link" onClick={() => setIsOpen(false)}>Home</Link>
                        <Link to="/?cat=drama" className="mobile-link" onClick={() => setIsOpen(false)}>Drama</Link>
                        <Link to="/?cat=anime" className="mobile-link" onClick={() => setIsOpen(false)}>Anime</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
