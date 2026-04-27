import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { FaLandmark, FaTree, FaGem, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { FiMapPin, FiUsers, FiSearch, FiFilter, FiX } from 'react-icons/fi';
import './style/Venueselection.css';

const cityFilters = ['All', 'Lahore', 'Karachi', 'Islamabad'];

// Decorative icon banners per venue (replaced emojis with react-icons)
const venueBanners = {
  1: { bg: 'linear-gradient(135deg,#f5e6c8 0%,#ede0b0 100%)', Icon: FaLandmark, label: 'Grand Hall' },
  2: { bg: 'linear-gradient(135deg,#e8f5e9 0%,#c8e6c9 100%)', Icon: FaTree, label: 'Garden Estate' },
  3: { bg: 'linear-gradient(135deg,#fce4ec 0%,#f8bbd0 100%)', Icon: FaGem, label: 'Majestic Hall' },
  4: { bg: 'linear-gradient(135deg,#fff8e1 0%,#ffecb3 100%)', Icon: FaLandmark, label: 'Marquee' },
  5: { bg: 'linear-gradient(135deg,#e8eaf6 0%,#c5cae9 100%)', Icon: FaLandmark, label: 'Grand Hall' },
  6: { bg: 'linear-gradient(135deg,#e0f7fa 0%,#b2ebf2 100%)', Icon: FaTree, label: 'Garden Venue' },
};

function VenueBanner({ venue }) {
  const id = venue.venue_id;
  const banner = venueBanners[id] || { bg: 'linear-gradient(135deg,#f5e6c8,#ede0b0)', Icon: FaLandmark, label: 'Venue' };
  const BannerIcon = banner.Icon;

  return (
    <div className="vs-banner" style={{ background: banner.bg }}>
      {/* Decorative circles */}
      <div className="vs-banner-circle vs-banner-circle--1" />
      <div className="vs-banner-circle vs-banner-circle--2" />

      {/* Bunting flags */}
      <div className="vs-bunting">
        {['#D4AF37', '#4D0D0D', '#D4AF37', '#4D0D0D', '#D4AF37', '#4D0D0D', '#D4AF37'].map((c, i) => (
          <div key={i} className="vs-flag" style={{ background: c }} />
        ))}
      </div>

      {/* Main Icon instead of emoji */}
      <div className="vs-banner-emoji" style={{ color: '#4D0D0D', opacity: 0.8 }}>
        <BannerIcon size={42} />
      </div>

      {/* Label ribbon */}
      <div className="vs-banner-label">{banner.label}</div>
    </div>
  );
}

// React-icons based Star Rating
function StarRating({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} color="#D4AF37" />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} color="#D4AF37" />);
    } else {
      stars.push(<FaRegStar key={i} color="rgba(212,175,55,0.3)" />);
    }
  }
  return <div className="vs-stars-icons" style={{ display: 'flex', gap: '2px', fontSize: '0.9rem' }}>{stars}</div>;
}

function formatPrice(num) {
  return Number(num).toLocaleString('en-IN');
}

function VenueSelection() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCity, setActiveCity] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const navigate = useNavigate();

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchText) params.append('search', searchText);
      if (activeCity !== 'All') params.append('city', activeCity);
      else if (filterCity) params.append('city', filterCity);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const res = await fetch(`http://localhost:5001/api/venues/search?${params}`);
      const data = await res.json();
      if (data.success) {
        setVenues(data.venues);
      } else {
        setError(data.message);
      }
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  }, [searchText, activeCity, filterCity, minPrice, maxPrice]);

  useEffect(() => { fetchVenues(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchVenues(), 400);
    return () => clearTimeout(t);
  }, [searchText]);

  useEffect(() => { fetchVenues(); }, [activeCity, filterCity, minPrice, maxPrice]);

  const clearFilters = () => {
    setSearchText('');
    setActiveCity('All');
    setMinPrice('');
    setMaxPrice('');
    setFilterCity('');
  };

  const hasActiveFilters = searchText || activeCity !== 'All' || minPrice || maxPrice || filterCity;

  return (
    <div className="vs-page">
      <Header />

      <main className="vs-main">
        <div className="vs-heading">
          <h1>Find Your Perfect Venue</h1>
          <p>Handpicked wedding halls across Pakistan — elegant, royal, unforgettable.</p>
        </div>
        <div className="vs-gold-divider"></div>

        {/* SEARCH ROW */}
        <div className="vs-search-row">
          <div className="vs-search-box">
            <FiSearch size={18} color="#4D0D0D" style={{ marginLeft: '14px', opacity: 0.6 }} />
            <input
              className="vs-search-input"
              type="text"
              placeholder="Search by name or location…"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ paddingLeft: '10px' }}
            />
            {searchText && (
              <button className="vs-search-clear" onClick={() => setSearchText('')}>
                <FiX size={16} />
              </button>
            )}
          </div>
          <button
            className={`vs-filter-toggle${showFilters ? ' active' : ''}`}
            onClick={() => setShowFilters(p => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FiFilter size={16} />
            Filters {hasActiveFilters && <span className="vs-filter-dot" />}
          </button>
        </div>

        {/* FILTER PANEL */}
        {showFilters && (
          <div className="vs-filter-panel">
            <div className="vs-filter-group">
              <label>City</label>
              <select value={filterCity} onChange={e => { setFilterCity(e.target.value); setActiveCity('All'); }}>
                <option value="">All Cities</option>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
              </select>
            </div>
            <div className="vs-filter-group">
              <label>Min Price (PKR)</label>
              <input type="number" placeholder="e.g. 300000" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
            </div>
            <div className="vs-filter-group">
              <label>Max Price (PKR)</label>
              <input type="number" placeholder="e.g. 600000" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
            </div>
            {hasActiveFilters && (
              <button className="vs-clear-btn" onClick={clearFilters}>Clear All</button>
            )}
          </div>
        )}

        {/* CITY PILLS */}
        <div className="vs-filter-bar">
          {cityFilters.map(f => (
            <button
              key={f}
              className={`vs-filter-btn${activeCity === f ? ' active' : ''}`}
              onClick={() => { setActiveCity(f); setFilterCity(''); }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* RESULTS COUNT */}
        {!loading && !error && (
          <p className="vs-results-count">
            {venues.length === 0
              ? 'No venues found — try adjusting your filters.'
              : `${venues.length} venue${venues.length > 1 ? 's' : ''} found`}
          </p>
        )}

        {loading && <div className="vs-status">Loading venues…</div>}
        {error && <div className="vs-status vs-error">{error}</div>}

        {/* VENUE CARDS */}
        {!loading && !error && (
          <div className="vs-grid">
            {venues.map((venue, i) => {
              // Safety variables to map the correct DB Columns
              const safeName = venue.venue_name || venue.name;
              const safeRating = Number(venue.avg_rating || venue.rating || 0);
              const safeReviews = venue.review_count || 0;

              return (
                <div className="vs-card" key={venue.venue_id} style={{ animationDelay: `${i * 0.08}s` }}>

                  <VenueBanner venue={venue} />

                  <div className="vs-body">
                    <div className="vs-top">
                      <div className="vs-name">{safeName}</div>
                      <div className="vs-badge">{venue.city}</div>
                    </div>
                    <div className="vs-stars">
                      <StarRating rating={safeRating} />
                      <span className="vs-rating-val">{safeRating > 0 ? safeRating.toFixed(1) : 'New'}</span>
                      <span className="vs-rating-count">({safeReviews} reviews)</span>
                    </div>
                    <p className="vs-desc">{venue.description}</p>

                    <div className="vs-meta">
                      <div className="vs-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiMapPin size={14} color="#4D0D0D" />
                        {venue.location}
                      </div>
                      <div className="vs-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiUsers size={14} color="#4D0D0D" />
                        Up to {venue.capacity.toLocaleString()} guests
                      </div>
                    </div>

                    <div className="vs-footer">
                      <div className="vs-price">
                        PKR {formatPrice(venue.price_per_event)} <span>/ event</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="vs-btn-detail" onClick={() => navigate('/venue-detail', { state: { venue } })}>View Detail</button>
                        <button className="vs-btn-book" onClick={() => navigate('/booking', { state: { venue } })}>Book Now</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default VenueSelection;