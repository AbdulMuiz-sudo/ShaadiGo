import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { FiMapPin, FiUsers, FiDollarSign, FiArrowLeft, FiPlus, FiClipboard } from 'react-icons/fi';
import { FaLandmark } from 'react-icons/fa';
import './style/Dashboard.css';

function OwnerVenues() {
    const navigate = useNavigate();
    const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');

    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!loggedInUser || loggedInUser.role !== 'owner') {
            navigate('/login');
            return;
        }
        fetchMyVenues();
    }, []);

    const fetchMyVenues = async () => {
        try {
            const res = await fetch(`http://localhost:5001/api/owner/my-venues/${loggedInUser.user_id}`);
            const data = await res.json();
            if (data.success) {
                setVenues(data.venues);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Could not connect to server.');
        } finally {
            setLoading(false);
        }
    };

    if (!loggedInUser) return null;

    return (
        <div className="db-page">
            <Header />
            <main className="db-main">

                <button className="ch-back" onClick={() => navigate('/owner-dashboard')} style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#4D0D0D', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiArrowLeft /> Back to Portal
                </button>

                <div className="db-heading">
                    <div>
                        <h1>My Listed Venues</h1>
                        <p>Manage the venues you currently have active on ShaadiGo.</p>
                    </div>
                    <button className="db-btn-new" onClick={() => navigate('/add-venue')}>
                        <FiPlus style={{ marginRight: '6px' }} /> Add New Venue
                    </button>
                </div>
                <div className="db-gold-divider"></div>

                {loading && <div className="db-status">Loading your venues…</div>}
                {error && <div className="db-status db-error">{error}</div>}

                {!loading && !error && venues.length === 0 && (
                    <div className="db-empty">
                        <div className="db-empty-icon"><FaLandmark size={48} color="#ccc" /></div>
                        <div className="db-empty-title">No venues listed yet</div>
                        <div className="db-empty-sub">Add your first venue to start receiving bookings.</div>
                        <button className="db-btn-new" onClick={() => navigate('/add-venue')} style={{ marginTop: '15px' }}>
                            Add a Venue
                        </button>
                    </div>
                )}

                {!loading && !error && venues.length > 0 && (
                    <div className="db-cards-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                        {venues.map(v => (
                            <div key={v.venue_id} style={{ background: 'white', borderRadius: '12px', border: '1px solid rgba(77,13,13,0.1)', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>

                                <div style={{ padding: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                        <div style={{ background: 'linear-gradient(135deg, #f5e6c8, #ede0b0)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FaLandmark color="#4D0D0D" opacity={0.8} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, color: '#4D0D0D', fontSize: '1.1rem' }}>{v.venue_name}</h3>
                                            <div style={{ color: '#888', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FiMapPin /> {v.city}
                                            </div>
                                        </div>
                                    </div>
                                    <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', color: '#666', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {v.description}
                                    </p>
                                </div>

                                <div style={{ background: '#fafafa', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Capacity</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4D0D0D', fontWeight: 500 }}><FiUsers /> {v.capacity.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Event Price</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1a7f4b', fontWeight: 600 }}><FiDollarSign /> {Number(v.price_per_event).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#4D0D0D', fontWeight: 500 }}>
                                        <FiClipboard color="#b8942e" /> {v.total_bookings} Total Bookings
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

export default OwnerVenues;