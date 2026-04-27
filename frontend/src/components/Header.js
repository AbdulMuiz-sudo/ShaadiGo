import React from 'react';
import '../style/Header.css';
import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();
    const loggedInUser = JSON.parse(localStorage.getItem('shaadigo_user') || 'null');

    return (
        <header>
            <span className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                ShaadiGo
            </span>
            <div className="header-nav">
                <span className="nav-link" onClick={() => navigate('/about')}>About Us</span>
                <span className="nav-link" onClick={() => navigate('/venues')}>Venues</span>
                <span className="nav-link" onClick={() => navigate('/contact')}>Contact</span>
                {loggedInUser && (
                    <span className="nav-dashboard" onClick={() => navigate('/dashboard')}>
                        My Bookings
                    </span>
                )}
            </div>
        </header>
    );
}

export default Header;
