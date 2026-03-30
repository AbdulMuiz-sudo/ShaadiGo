import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaBell } from 'react-icons/fa';
import './Header.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <header className="header">
            <div className="header-main">
                <div className="container">
                    <nav className="nav">
                        {/* Logo */}
                        <Link to="/" className="logo">
                            <span className="logo-shaadi">SHAADI</span>
                            <span className="logo-go">GO</span>
                        </Link>

                        {/* Nav Links */}
                        <div className={`nav-links ${isMenuOpen ? 'nav-links-active' : ''}`}>
                            <Link to="/venues" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                                Explore Venues
                            </Link>
                            <Link to="/how-it-works" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                                How It Works
                            </Link>
                            
                            {isLoggedIn ? (
                                <div className="user-menu-container" ref={menuRef}>
                                    <div className="header-icons">
                                        <FaBell className="header-icon" />
                                        <div className="icon-wrapper" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                            <FaUserCircle className="user-profile-icon" />
                                        </div>
                                    </div>
                                    {isMenuOpen && (
                                        <div className="dropdown-menu">
                                            <Link to="/dashboard" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                                                Dashboard
                                            </Link>
                                            <Link to="/my-bookings" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                                                My Bookings
                                            </Link>
                                            <div className="menu-item logout" onClick={handleLogout}>
                                                Logout
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                                    Login/Signup
                                </Link>
                            )}
                            
                            <Link to="/list-venue" className="btn-list-venue" onClick={() => setIsMenuOpen(false)}>
                                List Your Venue
                            </Link>
                        </div>

                        {/* Mobile Toggle */}
                        <div className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;