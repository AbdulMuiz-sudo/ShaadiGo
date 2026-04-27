import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { FiArrowLeft, FiX, FiChevronLeft, FiChevronRight, FiImage } from 'react-icons/fi';
import { FaMapMarkerAlt, FaUsers, FaStar, FaPlayCircle, FaCameraRetro } from 'react-icons/fa';
import { MdOutlineFastfood, MdCelebration, MdInfoOutline } from 'react-icons/md';
import './style/Venuedetail.css';

function VenueDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const venue = location.state?.venue;

  // State for fetched DB data
  const [images, setImages] = useState([]);
  const [foodPackages, setFoodPackages] = useState([]);
  const [decorations, setDecorations] = useState([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // Lightbox state
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIdx, setLbIdx] = useState(0);

  // 1. If no venue is passed, boot them back to the search page
  useEffect(() => {
    if (!venue) navigate('/venues');
  }, [venue, navigate]);

  // 2. Fetch the nested venue data (images, food, decor) from our backend
  useEffect(() => {
    if (!venue?.venue_id) return;

    const fetchVenueData = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/venues/${venue.venue_id}`);
        const data = await response.json();

        if (data.success) {
          setImages(data.images || []);
          setFoodPackages(data.foodPackages || []);
          setDecorations(data.decorations || []);
        }
      } catch (err) {
        console.error("Failed to fetch venue details:", err);
      } finally {
        setLoadingDb(false);
      }
    };

    fetchVenueData();
  }, [venue]);

  // 3. Lightbox keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (!lbOpen || images.length === 0) return;
      if (e.key === 'Escape') setLbOpen(false);
      if (e.key === 'ArrowLeft') setLbIdx(i => (i - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') setLbIdx(i => (i + 1) % images.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lbOpen, images.length]);

  if (!venue) return null;

  // --- SAFETY NET FOR DB SCHEMA ---
  const safeName = venue.venue_name || venue.name || "Venue Details";
  const safeCapacity = venue.capacity || 0;
  const safeRating = venue.avg_rating || venue.rating || 0;
  const safePrice = venue.price_per_event || venue.price || 0;
  const safeReviews = venue.review_count || venue.reviews || 0;
  const safeCity = venue.city || "City";
  const safeLocation = venue.location || "Location";

  const openLb = (idx) => { setLbIdx(idx); setLbOpen(true); };
  const currentImg = images[lbIdx] || '';

  return (
    <div className="vd-page">
      {/* LIGHTBOX */}
      {lbOpen && images.length > 0 && (
        <div className="vd-lb" onClick={() => setLbOpen(false)}>
          <div className="vd-lb-wrap" onClick={e => e.stopPropagation()}>
            <img src={currentImg} alt="Enlarged venue view" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            <button className="vd-lb-close" onClick={() => setLbOpen(false)}><FiX size={24} /></button>
          </div>
          <div className="vd-lb-bottom">
            <button className="vd-lb-arrow" onClick={(e) => { e.stopPropagation(); setLbIdx(i => (i - 1 + images.length) % images.length); }}><FiChevronLeft size={24} /></button>
            <div className="vd-lb-info">
              <div className="vd-lb-counter">{lbIdx + 1} / {images.length}</div>
            </div>
            <button className="vd-lb-arrow" onClick={(e) => { e.stopPropagation(); setLbIdx(i => (i + 1) % images.length); }}><FiChevronRight size={24} /></button>
          </div>
        </div>
      )}

      <Header />

      {/* HERO */}
      <div className="vd-hero">
        <button className="vd-back" onClick={() => navigate('/venues')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiArrowLeft /> Back to Venues
        </button>

        <div className="vd-meta-strip">
          <div className="vd-meta-left">
            <h1>{safeName.split(' ').slice(0, -1).join(' ')} <em>{safeName.split(' ').slice(-1)}</em></h1>
            <div className="vd-pills">
              <span className="vd-badge">{safeCity}</span>
              <span className="vd-pill-sep"></span>
              <span className="vd-pill" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaMapMarkerAlt /> {safeLocation}</span>
              <span className="vd-pill-sep"></span>
              <span className="vd-pill" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaUsers /> Up to {safeCapacity.toLocaleString()} guests</span>
              <span className="vd-pill-sep"></span>
              <span className="vd-pill" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaStar color="#D4AF37" /> {safeRating} ({safeReviews} reviews)</span>
            </div>
          </div>
          <div className="vd-meta-right">
            <div className="vd-price">PKR {safePrice.toLocaleString()} <span>/ event</span></div>
            <button className="vd-btn-book" onClick={() => navigate('/booking', { state: { venue } })}>
              Book This Venue
            </button>
          </div>
        </div>

        <div className="vd-hero-grid">
          <div className="vd-hero-main" onClick={() => images.length > 0 && openLb(0)} style={{ position: 'relative', overflow: 'hidden', cursor: images.length > 0 ? 'pointer' : 'default' }}>
            {images.length > 0 ? (
              <img src={images[0]} alt="Main Hall" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', color: '#ccc' }}><FiImage size={48} /></div>
            )}
            <div className="vd-photo-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaCameraRetro /> {images.length} Photos</div>
          </div>

          <div className="vd-hero-right">
            <div className="vd-hero-thumb" onClick={() => images.length > 1 && openLb(1)} style={{ position: 'relative', overflow: 'hidden', cursor: images.length > 1 ? 'pointer' : 'default' }}>
              {images.length > 1 ? (
                <img src={images[1]} alt="Gallery 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#eee' }}></div>
              )}
            </div>
            <div className="vd-hero-thumb" onClick={() => images.length > 2 && openLb(2)} style={{ position: 'relative', overflow: 'hidden', cursor: images.length > 2 ? 'pointer' : 'default' }}>
              {images.length > 2 ? (
                <img src={images[2]} alt="Gallery 3" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#eaeaea' }}></div>
              )}
              {images.length > 0 && (
                <button className="vd-show-all" onClick={e => { e.stopPropagation(); openLb(0); }}>
                  ⊞ Show all photos
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TOUR BANNER */}
      <div className="vd-tour-banner">
        <div className="vd-tour-left">
          <h2>Take a <em>Virtual Tour</em></h2>
          <p>Experience {safeName} from the comfort of your home. Explore every corner in stunning 360° detail before you visit.</p>
          <div className="vd-tour-features">
            {['360° panoramic view', 'HD high-resolution photos', 'All spaces covered', 'Day & evening shots'].map(f => (
              <div key={f} className="vd-tour-feat"><div className="vd-feat-dot"></div>{f}</div>
            ))}
          </div>
        </div>
        <button className="vd-btn-tour" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaPlayCircle size={18} /> Start Virtual Tour</button>
      </div>

      {/* GALLERY */}
      <div className="vd-gallery">
        <div className="vd-section-row">
          <div className="vd-section-heading">Media <em>Gallery</em></div>
        </div>

        {loadingDb ? (
          <p>Loading images...</p>
        ) : images.length === 0 ? (
          <p style={{ opacity: 0.6, fontStyle: 'italic' }}>No images uploaded for this venue yet.</p>
        ) : (
          <div className="vd-masonry" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
            {images.map((url, i) => (
              <div key={i} className="vd-gal-item" onClick={() => openLb(i)} style={{ height: '200px', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                <img src={url} alt={`Gallery item ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div className="vd-gal-overlay"><div className="vd-gal-caption">View Image</div></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DB-DRIVEN SERVICES: FOOD & DECOR */}
      <div className="vd-amenities">
        <div className="vd-section-row" style={{ marginBottom: '18px' }}>
          <div className="vd-section-heading">Venue <em>Packages & Services</em></div>
        </div>

        {loadingDb ? (
          <p>Loading services...</p>
        ) : (
          <div className="vd-amenities-grid">

            {/* Map Food Packages */}
            {foodPackages.map(fp => (
              <div key={fp.food_id} className="vd-amenity-card">
                <div className="vd-amenity-icon"><MdOutlineFastfood size={28} color="#D4AF37" /></div>
                <div className="vd-amenity-name">{fp.package_name}</div>
                <div className="vd-amenity-desc" style={{ marginBottom: '8px' }}>{fp.description}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#5B1B1B' }}>PKR {fp.price_per_person.toLocaleString()} / person</div>
              </div>
            ))}

            {/* Map Decorations */}
            {decorations.map(dec => (
              <div key={dec.decoration_id} className="vd-amenity-card">
                <div className="vd-amenity-icon"><MdCelebration size={28} color="#D4AF37" /></div>
                <div className="vd-amenity-name">{dec.decoration_name}</div>
                <div className="vd-amenity-desc" style={{ marginBottom: '8px' }}>{dec.description}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#5B1B1B' }}>PKR {dec.price.toLocaleString()} flat rate</div>
              </div>
            ))}

            {foodPackages.length === 0 && decorations.length === 0 && (
              <div className="vd-amenity-card" style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.6 }}>
                <MdInfoOutline size={32} style={{ margin: '0 auto 10px', display: 'block' }} />
                Contact the venue owner for specific catering and decoration packages.
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default VenueDetail;