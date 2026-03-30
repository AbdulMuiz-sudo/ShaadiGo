import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaSnowflake, FaCar, FaBolt, FaCalendarAlt } from 'react-icons/fa';
import VenueCard from '../../components/VenueCard/VenueCard';
import './Venues.css';

// Mock venues data
const allVenues = [
    {
        id: 1,
        name: 'Royal Banquet Hall',
        location: 'Gulberg, Lahore',
        city: 'Lahore',
        capacity: 400,
        price_per_person: 1200,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400',
        amenities: ['AC', 'Generator', 'Parking', 'Stage'],
        has_3d_tour: true,
    },
    {
        id: 2,
        name: 'Pearl Continental Hall',
        location: 'Mall Road, Lahore',
        city: 'Lahore',
        capacity: 500,
        price_per_person: 1500,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400',
        amenities: ['AC', 'Generator', 'Parking', 'Valet'],
        has_3d_tour: true,
    },
    {
        id: 3,
        name: 'Falettis Grand Ballroom',
        location: 'Egerton Road, Lahore',
        city: 'Lahore',
        capacity: 350,
        price_per_person: 1100,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400',
        amenities: ['AC', 'Parking', 'Catering'],
        has_3d_tour: false,
    },
    {
        id: 4,
        name: 'Nishat Grand Marquee',
        location: 'DHA, Lahore',
        city: 'Lahore',
        capacity: 600,
        price_per_person: 900,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400',
        amenities: ['AC', 'Generator', 'Parking'],
        has_3d_tour: true,
    },
    {
        id: 5,
        name: 'Serena Banquet',
        location: 'F-7, Islamabad',
        city: 'Islamabad',
        capacity: 450,
        price_per_person: 1800,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400',
        amenities: ['AC', 'Generator', 'Parking', 'Valet', 'Spa'],
        has_3d_tour: true,
    },
    {
        id: 6,
        name: 'Marriott Grand Hall',
        location: 'Blue Area, Islamabad',
        city: 'Islamabad',
        capacity: 550,
        price_per_person: 2000,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
        amenities: ['AC', 'Generator', 'Parking', 'Valet'],
        has_3d_tour: true,
    },
];

const cities = ['All Cities', 'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad'];
const amenitiesList = ['AC', 'Generator', 'Parking', 'Valet', 'Catering', 'Stage'];

const Venues = () => {
    const [searchParams] = useSearchParams();
    const [venues, setVenues] = useState(allVenues);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        city: searchParams.get('city') || 'All Cities',
        minCapacity: 50,
        maxCapacity: 600,
        minPrice: 500,
        maxPrice: 2000,
        amenities: [],
        date: searchParams.get('date') || '',
    });

    const filterVenues = useCallback(() => {
        let filtered = allVenues;

        // City filter
        if (filters.city && filters.city !== 'All Cities') {
            filtered = filtered.filter(v => v.city === filters.city);
        }

        // Capacity filter
        filtered = filtered.filter(v => 
            v.capacity >= filters.minCapacity && v.capacity <= filters.maxCapacity
        );

        // Price filter
        filtered = filtered.filter(v => 
            v.price_per_person >= filters.minPrice && v.price_per_person <= filters.maxPrice
        );

        // Amenities filter
        if (filters.amenities.length > 0) {
            filtered = filtered.filter(v => 
                filters.amenities.every(a => v.amenities.includes(a))
            );
        }

        // Search query
        if (searchQuery) {
            filtered = filtered.filter(v => 
                v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.location.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setVenues(filtered);
    }, [filters, searchQuery]);

    useEffect(() => {
        filterVenues();
    }, [filterVenues]);

    const handleAmenityToggle = (amenity) => {
        setFilters(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleSearch = () => {
        filterVenues();
    };

    return (
        <div className="venues-page">
            {/* Sidebar Filters */}
            <aside className="filters-sidebar">
                <h2 className="filters-title">FILTERS</h2>

                {/* City Filter */}
                <div className="filter-group">
                    <label><FaMapMarkerAlt /> CITY/AREA</label>
                    <select 
                        value={filters.city}
                        onChange={(e) => setFilters({...filters, city: e.target.value})}
                    >
                        {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

                {/* Capacity Range */}
                <div className="filter-group">
                    <label>CAPACITY RANGE</label>
                    <div className="range-display">
                        <span>{filters.minCapacity}</span>
                        <span>{filters.maxCapacity}</span>
                    </div>
                    <input 
                        type="range" 
                        min="50" 
                        max="600" 
                        value={filters.maxCapacity}
                        onChange={(e) => setFilters({...filters, maxCapacity: parseInt(e.target.value)})}
                        className="range-slider"
                    />
                </div>

                {/* Price Range */}
                <div className="filter-group">
                    <label>PRICE BRACKET (PKR)</label>
                    <div className="range-display">
                        <span>{filters.minPrice}</span>
                        <span>{filters.maxPrice}</span>
                    </div>
                    <input 
                        type="range" 
                        min="500" 
                        max="3000" 
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value)})}
                        className="range-slider"
                    />
                </div>

                {/* Amenities */}
                <div className="filter-group">
                    <label>AMENITIES</label>
                    <div className="amenities-list">
                        {amenitiesList.map(amenity => (
                            <label key={amenity} className="amenity-checkbox">
                                <input 
                                    type="checkbox"
                                    checked={filters.amenities.includes(amenity)}
                                    onChange={() => handleAmenityToggle(amenity)}
                                />
                                <span className="amenity-icon">
                                    {amenity === 'AC' && <FaSnowflake />}
                                    {amenity === 'Generator' && <FaBolt />}
                                    {amenity === 'Parking' && <FaCar />}
                                </span>
                                {amenity}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Date Filter */}
                <div className="filter-group">
                    <label><FaCalendarAlt /> DATE</label>
                    <input 
                        type="date"
                        value={filters.date}
                        onChange={(e) => setFilters({...filters, date: e.target.value})}
                    />
                </div>

                <button className="filter-search-btn" onClick={handleSearch}>
                    <FaSearch /> SEARCH
                </button>
            </aside>

            {/* Main Content */}
            <main className="venues-content">
                {/* Search Bar */}
                <div className="venues-header">
                    <div className="search-input-wrapper">
                        <FaSearch className="search-icon" />
                        <input 
                            type="text"
                            placeholder="Search results..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="venues-search-input"
                        />
                    </div>
                    <div className="results-count">
                        {venues.length} venues found
                    </div>
                </div>

                {/* Venues Grid */}
                <div className="venues-grid">
                    {venues.map(venue => (
                        <VenueCard key={venue.id} venue={venue} />
                    ))}
                </div>

                {venues.length === 0 && (
                    <div className="no-results">
                        <p>No venues match your criteria. Try adjusting your filters.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Venues;
