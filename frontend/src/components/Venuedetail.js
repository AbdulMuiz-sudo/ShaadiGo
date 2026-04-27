import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../style/Venuedetail.css';

const CATEGORIES = ['all', 'hall', 'outdoor', 'decor', 'food', 'suite'];
const CAT_LABELS = { all:'All', hall:'Hall', outdoor:'Outdoor', decor:'Décor', food:'Catering', suite:'Suites' };
const catCounts = { all:18, hall:5, outdoor:4, decor:4, food:3, suite:2 };

const galleryData = [
  { idx:0,  emoji:'🏛️', caption:'Grand Banquet Hall — Main Floor',      cat:'hall',    h:'xl' },
  { idx:1,  emoji:'🌿', caption:'Lush Garden Lawn — Ceremony Area',     cat:'outdoor', h:'md' },
  { idx:2,  emoji:'🌸', caption:'Bridal Stage Floral Arrangement',      cat:'decor',   h:'lg' },
  { idx:3,  emoji:'💎', caption:'Bridal Suite — Premium Dressing Room', cat:'suite',   h:'sm' },
  { idx:4,  emoji:'✨', caption:'Crystal Chandelier — Imported Italian', cat:'hall',   h:'md' },
  { idx:5,  emoji:'🍽️', caption:'Catering Spread — 120 Dish Buffet',  cat:'food',    h:'lg' },
  { idx:6,  emoji:'🌙', caption:'Evening Facade — Illuminated Entry',   cat:'outdoor', h:'xl' },
  { idx:7,  emoji:'🕯️', caption:'Candlelit Table Settings',            cat:'decor',   h:'sm' },
  { idx:8,  emoji:'🎭', caption:'Stage and Dance Floor Area',           cat:'hall',    h:'md' },
  { idx:9,  emoji:'🌺', caption:'Rooftop Terrace Lounge',              cat:'outdoor', h:'lg' },
  { idx:10, emoji:'🧁', caption:'Custom Wedding Cake Display',          cat:'food',    h:'sm' },
  { idx:11, emoji:'🪞', caption:"Groom's Preparation Room",             cat:'suite',   h:'md' },
  { idx:12, emoji:'🌹', caption:'Rose Petal Aisle Walkway',             cat:'decor',   h:'lg' },
  { idx:13, emoji:'🏺', caption:'VIP Lounge — Entrance Foyer',         cat:'hall',    h:'sm' },
  { idx:14, emoji:'⛲', caption:'Fountain & Water Feature',             cat:'outdoor', h:'md' },
  { idx:15, emoji:'☕', caption:'High Tea & Chai Station',              cat:'food',    h:'lg' },
  { idx:16, emoji:'🎆', caption:'Evening Lighting — Full Setup',        cat:'hall',    h:'xl' },
  { idx:17, emoji:'🦋', caption:'Butterfly & Fairy Light Ceiling',      cat:'decor',   h:'md' },
];

const amenities = [
  { icon:'🅿️', name:'Ample Parking',       desc:'Covered & open parking for 300+ vehicles with dedicated valet service.' },
  { icon:'❄️', name:'Central AC & Heating', desc:'Climate-controlled throughout all indoor spaces for year-round comfort.' },
  { icon:'🎵', name:'Sound & AV System',    desc:'Professional surround sound, LED screens, and live performance stage setup.' },
  { icon:'🍽️', name:'In-house Catering',   desc:'120-dish menu options with dedicated chefs. Halal certified kitchen.' },
  { icon:'💐', name:'Décor Services',       desc:'Full floral, lighting, and stage decoration by our in-house design team.' },
  { icon:'📸', name:'Photography Spaces',   desc:'Designated backdrops, gardens, and studio-lit areas for photography.' },
  { icon:'🛗', name:'Accessibility',        desc:'Elevator access, ramps, and dedicated accessible restrooms on all floors.' },
  { icon:'🔒', name:'Security & CCTV',      desc:'24/7 on-site security team, CCTV coverage, and private event management.' },
];

function VenueDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const venue = location.state?.venue;

  // ALL hooks must be declared before any early return
  const [activeCat, setActiveCat] = useState('all');
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIdx, setLbIdx] = useState(0);

  useEffect(() => {
    if (!venue) navigate('/venues');
  }, [venue, navigate]);

  const visible = galleryData.filter(g => activeCat === 'all' || g.cat === activeCat);

  useEffect(() => {
    const handler = (e) => {
      if (!lbOpen) return;
      if (e.key === 'Escape') setLbOpen(false);
      if (e.key === 'ArrowLeft') setLbIdx(i => (i - 1 + visible.length) % visible.length);
      if (e.key === 'ArrowRight') setLbIdx(i => (i + 1) % visible.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lbOpen, visible.length]);

  // Early return AFTER all hooks
  if (!venue) return null;

  const openLb = (idx) => { setLbIdx(idx); setLbOpen(true); };
  const current = visible[lbIdx] || visible[0];

  return (
    <div className="vd-page">

      {/* LIGHTBOX */}
      {lbOpen && (
        <div className="vd-lb" onClick={() => setLbOpen(false)}>
          <div className="vd-lb-wrap" onClick={e => e.stopPropagation()}>
            <div className={`vd-lb-img vd-bg-${current?.cat}`}>{current?.emoji}</div>
            <button className="vd-lb-close" onClick={() => setLbOpen(false)}>✕</button>
          </div>
          <div className="vd-lb-bottom">
            <button className="vd-lb-arrow" onClick={() => setLbIdx(i => (i - 1 + visible.length) % visible.length)}>←</button>
            <div className="vd-lb-info">
              <div className="vd-lb-caption">{current?.caption}</div>
              <div className="vd-lb-counter">{lbIdx + 1} / {visible.length}</div>
            </div>
            <button className="vd-lb-arrow" onClick={() => setLbIdx(i => (i + 1) % visible.length)}>→</button>
          </div>
          <div className="vd-lb-thumbs">
            {visible.map((g, i) => (
              <div key={g.idx} className={`vd-lb-thumb vd-bg-${g.cat}${i === lbIdx ? ' active' : ''}`}
                onClick={e => { e.stopPropagation(); setLbIdx(i); }}>
                {g.emoji}
              </div>
            ))}
          </div>
        </div>
      )}

      <Header />

      {/* HERO */}
      <div className="vd-hero">
        <button className="vd-back" onClick={() => navigate('/venues')}>
          <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
            <path d="M9 2L4 7l5 5" stroke="#4D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Venues
        </button>

        <div className="vd-meta-strip">
          <div className="vd-meta-left">
            <h1>{venue.name.split(' ').slice(0,-1).join(' ')} <em>{venue.name.split(' ').slice(-1)}</em></h1>
            <div className="vd-pills">
              <span className="vd-badge">{venue.city}</span>
              <span className="vd-pill-sep"></span>
              <span className="vd-pill">📍 {venue.location}</span>
              <span className="vd-pill-sep"></span>
              <span className="vd-pill">👥 Up to {venue.capacity.toLocaleString()} guests</span>
              <span className="vd-pill-sep"></span>
              <span className="vd-pill">⭐ {venue.rating} ({venue.reviews} reviews)</span>
            </div>
          </div>
          <div className="vd-meta-right">
            <div className="vd-price">PKR {venue.price} <span>/ event</span></div>
            <button className="vd-btn-book" onClick={() => navigate('/booking', { state: { venue } })}>
              Book This Venue
            </button>
          </div>
        </div>

        <div className="vd-hero-grid">
          <div className="vd-hero-main vd-bg-hall" onClick={() => { setActiveCat('all'); openLb(0); }}>
            <div className="vd-hero-emoji">🏛️</div>
            <div className="vd-photo-badge">📷 18 Photos</div>
            <div className="vd-hover-overlay"><div className="vd-view-icon">👁 View</div></div>
          </div>
          <div className="vd-hero-right">
            <div className="vd-hero-thumb vd-bg-decor" onClick={() => { setActiveCat('all'); openLb(2); }}>
              <div className="vd-hero-emoji-sm">🌸</div>
              <div className="vd-hover-overlay"><div className="vd-view-icon">👁</div></div>
            </div>
            <div className="vd-hero-thumb vd-bg-outdoor" onClick={() => { setActiveCat('all'); openLb(6); }}>
              <div className="vd-hero-emoji-sm">🌿</div>
              <div className="vd-hover-overlay"><div className="vd-view-icon">👁</div></div>
              <button className="vd-show-all" onClick={e => { e.stopPropagation(); setActiveCat('all'); openLb(0); }}>
                ⊞ Show all photos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TOUR BANNER */}
      <div className="vd-tour-banner">
        <div className="vd-tour-left">
          <h2>Take a <em>Virtual Tour</em></h2>
          <p>Experience {venue.name} from the comfort of your home. Explore every corner in stunning 360° detail before you visit.</p>
          <div className="vd-tour-features">
            {['360° panoramic view','HD high-resolution photos','All spaces covered','Day & evening shots'].map(f => (
              <div key={f} className="vd-tour-feat"><div className="vd-feat-dot"></div>{f}</div>
            ))}
          </div>
        </div>
        <button className="vd-btn-tour">▶ Start Virtual Tour</button>
      </div>

      {/* GALLERY */}
      <div className="vd-gallery">
        <div className="vd-section-row">
          <div className="vd-section-heading">Media <em>Gallery</em></div>
          <div className="vd-cat-tabs">
            {CATEGORIES.map(cat => (
              <button key={cat} className={`vd-cat-tab${activeCat === cat ? ' active' : ''}`}
                onClick={() => { setActiveCat(cat); setLbIdx(0); }}>
                {CAT_LABELS[cat]} <span className="vd-tab-count">{catCounts[cat]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="vd-masonry">
          {visible.map((g, i) => (
            <div key={g.idx} className="vd-gal-item" onClick={() => openLb(i)}>
              <div className={`vd-gal-ph vd-h-${g.h} vd-bg-${g.cat}`}>{g.emoji}</div>
              <span className="vd-gal-tag">{CAT_LABELS[g.cat]}</span>
              <div className="vd-gal-overlay"><div className="vd-gal-caption">{g.caption}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* AMENITIES */}
      <div className="vd-amenities">
        <div className="vd-section-row" style={{marginBottom:'18px'}}>
          <div className="vd-section-heading">Venue <em>Amenities</em></div>
        </div>
        <div className="vd-amenities-grid">
          {amenities.map(a => (
            <div key={a.name} className="vd-amenity-card">
              <div className="vd-amenity-icon">{a.icon}</div>
              <div className="vd-amenity-name">{a.name}</div>
              <div className="vd-amenity-desc">{a.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default VenueDetail;