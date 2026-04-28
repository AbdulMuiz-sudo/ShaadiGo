import React, { useState, useRef, useEffect } from 'react';
import './style/Header.css';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaChartPie } from 'react-icons/fa';

function Header() {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');

    // Check if the current logged-in user is an owner
    const isOwner = loggedInUser?.role === 'owner';

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
        localStorage.removeItem('token');
        setDropdownOpen(false);
        navigate('/login');
    };

    // Smart Logo Click: Owners go to their portal, customers go to the homepage
    const handleBrandClick = () => {
        if (isOwner) {
            navigate('/owner-dashboard');
        } else {
            navigate('/');
        }
    };

    return (
        <header className="header-container">
            <span className="brand" onClick={handleBrandClick} style={{ cursor: 'pointer' }}>
                ShaadiGo
            </span>

            <div className="header-nav">

                {/* CONDITIONAL RENDERING: Hide these links if the user is an owner */}
                {!isOwner && (
                    <>
                        <span className="nav-link" onClick={() => navigate('/about')}>Home</span>
                        <span className="nav-link" onClick={() => navigate('/venues')}>Venues</span>
                        <span className="nav-link" onClick={() => navigate('/contact')}>Contact</span>
                        <span className="nav-link" onClick={() => navigate('/dashboard')}>Bookings</span>
                    </>
                )}

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
                                <div className="dropdown-item" onClick={() => { navigate(isOwner ? '/owner-dashboard' : '/dashboard'); setDropdownOpen(false); }}>
                                    <FaChartPie className="dropdown-icon" />
                                    {isOwner ? 'Portal' : 'Dashboard'}
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