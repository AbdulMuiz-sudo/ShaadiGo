import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaCalendarAlt, FaUsers, FaMoneyBillWave, FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import './Hero.css';

// Mock featured venues data
const featuredVenues = [
    {
        id: 1,
        name: 'Royal Banquet Hall',
        location: 'Gulberg, Lahore',
        capacity: 400,
        price_per_person: 1200,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400',
        has_3d_tour: true,
    },
    {
        id: 2,
        name: 'Pearl Continental',
        location: 'Mall Road, Lahore',
        capacity: 500,
        price_per_person: 1500,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400',
        has_3d_tour: true,
    },
    {
        id: 3,
        name: 'Falettis Ballroom',
        location: 'Egerton Road, Lahore',
        capacity: 350,
        price_per_person: 1100,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400',
        has_3d_tour: false,
    },
    {
        id: 4,
        name: 'Nishat Marquee',
        location: 'DHA, Lahore',
        capacity: 600,
        price_per_person: 900,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400',
        has_3d_tour: true,
    },
    {
        id: 5,
        name: 'Serena Banquet',
        location: 'F-7, Islamabad',
        capacity: 450,
        price_per_person: 1800,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400',
        has_3d_tour: true,
    },
];

const cities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan'];
const priceBrackets = ['Under PKR 1000', 'PKR 1000-1500', 'PKR 1500-2000', 'PKR 2000+'];

const Hero = () => {
    const navigate = useNavigate();
    const [searchFilters, setSearchFilters] = useState({
        city: '',
        capacity: '',
        date: '',
        priceBracket: '',
    });

    const handleFilterChange = (field, value) => {
        setSearchFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleSearch = () => {
        const queryParams = new URLSearchParams();
        Object.entries(searchFilters).forEach(([key, value]) => {
            if (value) queryParams.set(key, value);
        });
        navigate(`/venues?${queryParams.toString()}`);
    };

    return (
        <>
            {/* Hero Section */}
            <section className="hero" id="hero">
                <div className="hero-pattern"></div>
                <div className="hero-overlay"></div>
                
                <div className="hero-container">
                    <div className="hero-content">
                        <div className="hero-badge">— SHAADI GO —</div>
                        <h1 className="hero-title">
                            MODERNIZING PAKISTANI<br />WEDDINGS
                        </h1>
                        <p className="hero-subtitle">
                            Discover and book the perfect venue for your special day
                        </p>
                    </div>

                    {/* Search Section */}
                    <div className="search-section">
                        <h2 className="search-title">FIND YOUR PERFECT VENUE</h2>
                        <div className="search-bar">
                            <div className="search-field">
                                <label><FaMapMarkerAlt /> CITY</label>
                                <select 
                                    value={searchFilters.city}
                                    onChange={(e) => handleFilterChange('city', e.target.value)}
                                >
                                    <option value="">Select City</option>
                                    {cities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="search-field">
                                <label><FaUsers /> GUEST QUANTITY</label>
                                <select
                                    value={searchFilters.capacity}
                                    onChange={(e) => handleFilterChange('capacity', e.target.value)}
                                >
                                    <option value="">Select</option>
                                    <option value="100">Up to 100</option>
                                    <option value="200">100-200</option>
                                    <option value="300">200-300</option>
                                    <option value="500">300-500</option>
                                    <option value="1000">500+</option>
                                </select>
                            </div>

                            <div className="search-field">
                                <label><FaCalendarAlt /> DATE</label>
                                <input 
                                    type="date"
                                    value={searchFilters.date}
                                    onChange={(e) => handleFilterChange('date', e.target.value)}
                                />
                            </div>

                            <div className="search-field">
                                <label><FaMoneyBillWave /> PRICE BRACKET</label>
                                <select
                                    value={searchFilters.priceBracket}
                                    onChange={(e) => handleFilterChange('priceBracket', e.target.value)}
                                >
                                    <option value="">Select</option>
                                    {priceBrackets.map(bracket => (
                                        <option key={bracket} value={bracket}>{bracket}</option>
                                    ))}
                                </select>
                            </div>

                            <button className="search-btn" onClick={handleSearch}>
                                <FaSearch /> SEARCH
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Venues Section */}
            <section className="featured-section">
                <div className="featured-container">
                    <h2 className="section-title">FEATURED VENUES</h2>
                    
                    <div className="venues-grid">
                        {featuredVenues.map(venue => (
                            <div key={venue.id} className="venue-card" onClick={() => navigate(`/venues/${venue.id}`)}>
                                <div className="venue-image-wrapper">
                                    <img src={venue.image} alt={venue.name} className="venue-image" />
                                </div>
                                <div className="venue-info">
                                    <h3 className="venue-name">{venue.name}</h3>
                                    <p className="venue-location">{venue.location}</p>
                                    <div className="venue-details">
                                        <span className="venue-capacity">
                                            <FaUsers /> Capacity: {venue.capacity}
                                        </span>
                                        <span className="venue-price">
                                            Price: PKR {venue.price_per_person.toLocaleString()}/person
                                        </span>
                                    </div>
                                    <div className="venue-rating">
                                        <span className="rating-badge">
                                            <FaStar /> {venue.rating}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Hero;