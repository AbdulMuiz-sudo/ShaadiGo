import { useState, useEffect, useRef } from 'react';
import { Link as ScrollLink } from 'react-scroll'; // For home page sections
import { Link } from 'react-router-dom';          // For the separate page
import { FaTwitter, FaInstagram, FaLinkedin, FaGithub, FaUserCircle } from 'react-icons/fa';
import './Header.css';
import logo from './logo.png';
import { useNavigate } from 'react-router-dom';
const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear(); // Clears userId, token, etc.
        navigate('/login');
    };
    const menuRef = useRef(null);
    useEffect(() => {
        // Function to detect click outside
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        // Bind the event listener
        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Clean up the listener when component unmounts or menu closes
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <header className="header">
            <div className="header-main">
                <div className="container">
                    <nav className="nav">
                        {/* Logo linked to Home Route */}
                        <div className="branding-sectionheader">
                            <img src={logo} alt="ShaadiGo Logo" className="header-logo-img" />
                            {/* The logo text is part of the image, we don't need separate text here */}
                        </div>

                        <div className={`nav-links ${isMenuOpen ? 'nav-links-active' : ''}`}>
                            <Link to="/login" smooth={true} duration={500} onClick={() => setIsMenuOpen(false)}>
                                Login
                            </Link>
                            <Link to="/" smooth={true} duration={500} onClick={() => setIsMenuOpen(false)}>
                                Home
                            </Link>

                            <div className="user-menu-container" ref={menuRef}>
                                {/* The Icon acts as the toggle button */}
                                <div className="icon-wrapper" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                    <FaUserCircle className="user-profile-icon" />
                                </div>

                                {/* The actual menu - only shows if menuOpen is true */}
                                {isMenuOpen && (
                                    <div className="dropdown-menu">
                                        <div className="menu-item logout" onClick={handleLogout}>
                                            Logout
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

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