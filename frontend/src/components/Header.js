import React, { useState, useRef, useEffect } from 'react';
import './style/Header.css';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaCalendarAlt } from 'react-icons/fa'; // Added react-icons

function Header() {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // FIX: Using key "user" to match your Login/Booking logic
    const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // Optional: clear token if exists
        setDropdownOpen(false);
        navigate('/login');
    };

    return (
        <header className="header-container">
            <span className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                ShaadiGo
            </span>

            <div className="header-nav">
                <span className="nav-link" onClick={() => navigate('/about')}>Home</span>
                <span className="nav-link" onClick={() => navigate('/venues')}>Venues</span>
                <span className="nav-link" onClick={() => navigate('/contact')}>Contact</span>

                {loggedInUser ? (
                    <div className="user-profile-wrapper" ref={dropdownRef}>
                        <div
                            className="user-icon-trigger"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            <FaUserCircle size={28} className="user-icon" />
                            <span className="user-name-label">{loggedInUser.full_name?.split(' ')[0] || 'User'}</span>
                        </div>

                        {dropdownOpen && (
                            <div className="user-dropdown-menu">
                                <div className="dropdown-item" onClick={() => { navigate('/dashboard'); setDropdownOpen(false); }}>
                                    <FaCalendarAlt className="dropdown-icon" />
                                    My Dashboard
                                </div>
                                <div className="dropdown-divider"></div>
                                <div className="dropdown-item logout-item" onClick={handleLogout}>
                                    <FaSignOutAlt className="dropdown-icon" />
                                    Logout
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <span className="nav-link login-btn" onClick={() => navigate('/login')}>Login</span>
                )}
            </div>
        </header>
    );
}

export default Header;