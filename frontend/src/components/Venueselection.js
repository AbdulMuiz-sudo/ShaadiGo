import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../style/Venueselection.css';

const cityFilters = ['All', 'Lahore', 'Karachi', 'Islamabad'];

// Decorative clipart banners per venue
const venueBanners = {
  1: { bg: 'linear-gradient(135deg,#f5e6c8 0%,#ede0b0 100%)', art: '🏛️', label: 'Grand Hall' },
  2: { bg: 'linear-gradient(135deg,#e8f5e9 0%,#c8e6c9 100%)', art: '✨', label: 'Garden Estate' },
  3: { bg: 'linear-gradient(135deg,#fce4ec 0%,#f8bbd0 100%)', art: '🌸', label: 'Majestic Hall' },
  4: { bg: 'linear-gradient(135deg,#fff8e1 0%,#ffecb3 100%)', art: '🌹', label: 'Marquee' },
  5: { bg: 'linear-gradient(135deg,#e8eaf6 0%,#c5cae9 100%)', art: '🕌', label: 'Grand Hall' },
  6: { bg: 'linear-gradient(135deg,#e0f7fa 0%,#b2ebf2 100%)', art: '🏰', label: 'Garden Venue' },
};

function VenueBanner({ venue }) {
  const id = venue.venue_id;
  const banner = venueBanners[id] || { bg: 'linear-gradient(135deg,#f5e6c8,#ede0b0)', art: '🏛️', label: 'Venue' };

  return (
    <div className="vs-banner" style={{ background: banner.bg }}>
      {/* Decorative circles */}
      <div className="vs-banner-circle vs-banner-circle--1" />
      <div className="vs-banner-circle vs-banner-circle--2" />
      {/* Bunting flags */}
      <div className="vs-bunting">
        {['#D4AF37','#4D0D0D','#D4AF37','#4D0D0D','#D4AF37','#4D0D0D','#D4AF37'].map((c, i) => (
          <div key={i} className="vs-flag" style={{ background: c }} />
        ))}
      </div>
      {/* Main emoji */}
      <div className="vs-banner-emoji">{banner.art}</div>
      {/* Small decorative flowers */}
      <span className="vs-deco vs-deco--tl">🌿</span>
      <span className="vs-deco vs-deco--tr">🌿</span>
      <span className="vs-deco vs-deco--bl">✦</span>
      <span className="vs-deco vs-deco--br">✦</span>
      {/* Label ribbon */}
      <div className="vs-banner-label">{banner.label}</div>
    </div>
  );
}

function StarRating({ rating }) {
  return (
    <div className="vs-stars-icons">
      {[1, 2, 3, 4, 5].map(i => {
        const fill = rating >= i ? 1 : rating >= i - 0.5 ? 0.5 : 0;
        return <StarIcon key={i} fill={fill} />;
      })}
    </div>
  );
}

function StarIcon({ fill }) {
  const color = fill === 1 ? '#D4AF37' : fill === 0.5 ? 'url(#halfGold)' : 'rgba(212,175,55,0.25)';
  return (
    <svg viewBox="0 0 16 16" style={{ fill: color, width: 14, height: 14 }}>
      <polygon points="8,1 10,6 15,6 11,9.5 12.5,15 8,12 3.5,15 5,9.5 1,6 6,6" />
    </svg>
  );
}

function formatPrice(num) {
  return Number(num).toLocaleString('en-IN');
}

function VenueSelection() {
  const [venues, setVenues]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [activeCity, setActiveCity]   = useState('All');
  const [searchText, setSearchText]   = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice]       = useState('');
  const [maxPrice, setMaxPrice]       = useState('');
  const [filterCity, setFilterCity]   = useState('');
  const navigate = useNavigate();

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchText)               params.append('search',   searchText);
      if (activeCity !== 'All')     params.append('city',     activeCity);
      else if (filterCity)          params.append('city',     filterCity);
      if (minPrice)                 params.append('minPrice', minPrice);
      if (maxPrice)                 params.append('maxPrice', maxPrice);

      const res  = await fetch(`http://localhost:5001/api/venues/search?${params}`);
      const data = await res.json();
      if (data.success) setVenues(data.venues);
      else setError(data.message);
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
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="halfGold" x1="0" x2="1" y1="0" y2="0">
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="rgba(212,175,55,0.25)" />
          </linearGradient>
        </defs>
      </svg>

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
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
              <circle cx="9" cy="9" r="6" stroke="#4D0D0D" strokeWidth="1.6" />
              <path d="M13.5 13.5L17 17" stroke="#4D0D0D" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              className="vs-search-input"
              type="text"
              placeholder="Search by name or location…"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
            {searchText && (
              <button className="vs-search-clear" onClick={() => setSearchText('')}>✕</button>
            )}
          </div>
          <button
            className={`vs-filter-toggle${showFilters ? ' active' : ''}`}
            onClick={() => setShowFilters(p => !p)}
          >
            <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
              <path d="M3 5h14M6 10h8M9 15h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
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
        {error   && <div className="vs-status vs-error">{error}</div>}

        {/* VENUE CARDS */}
        {!loading && !error && (
          <div className="vs-grid">
            {venues.map((venue, i) => (
              <div className="vs-card" key={venue.venue_id} style={{ animationDelay: `${i * 0.08}s` }}>

                <VenueBanner venue={venue} />

                <div className="vs-body">
                  <div className="vs-top">
                    <div className="vs-name">{venue.name}</div>
                    <div className="vs-badge">{venue.city}</div>
                  </div>
                  <div className="vs-stars">
                    <StarRating rating={venue.rating} />
                    <span className="vs-rating-val">{venue.rating}</span>
                    <span className="vs-rating-count">({venue.review_count} reviews)</span>
                  </div>
                  <p className="vs-desc">{venue.description}</p>
                  <div className="vs-meta">
                    <div className="vs-meta-item">
                      <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                        <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5Z" stroke="#4D0D0D" strokeWidth="1.3" />
                        <circle cx="8" cy="6" r="1.5" stroke="#4D0D0D" strokeWidth="1.3" />
                      </svg>
                      {venue.location}
                    </div>
                    <div className="vs-meta-item">
                      <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                        <path d="M2 5h12M2 8h8M5 2v2M11 2v2" stroke="#4D0D0D" strokeWidth="1.3" strokeLinecap="round" />
                        <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#4D0D0D" strokeWidth="1.3" />
                      </svg>
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
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default VenueSelection;
