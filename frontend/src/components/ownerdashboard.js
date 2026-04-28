import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { FiCheckCircle, FiClock, FiMessageCircle, FiUser } from 'react-icons/fi';
import './style/Dashboard.css';

function OwnerDashboard() {
    const navigate = useNavigate();
    const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!loggedInUser || loggedInUser.role !== 'owner') {
            navigate('/login');
            return;
        }
        fetchOwnerBookings();
    }, []);

    const fetchOwnerBookings = async () => {
        try {
            const res = await fetch(`http://localhost:5001/api/owner/bookings/${loggedInUser.user_id}`);
            const data = await res.json();
            if (data.success) {
                setBookings(data.bookings);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const verifyPayment = async (bookingId) => {
        if (!window.confirm("Are you sure you have received the payment and want to confirm this booking?")) return;

        try {
            const res = await fetch(`http://localhost:5001/api/owner/bookings/${bookingId}/confirm`, {
                method: 'PATCH'
            });
            const data = await res.json();
            if (data.success) {
                setBookings(prev => prev.map(b => b.booking_id === bookingId ? { ...b, booking_status: 'confirmed' } : b));
                alert("Booking Confirmed Successfully!");
            }
        } catch (err) {
            alert("Error confirming booking.");
        }
    };

    if (!loggedInUser) return null;

    const pendingCount = bookings.filter(b => b.booking_status === 'pending').length;
    const confirmedCount = bookings.filter(b => b.booking_status === 'confirmed').length;

    return (
        <div className="db-page">
            <Header />
            <main className="db-main">

                <div className="db-heading">
                    <div>
                        <h1>Owner Portal</h1>
                        <p>Welcome back, <strong>{loggedInUser.full_name}</strong>. Manage your venue bookings here.</p>
                    </div>
                    <button className="db-btn-new" onClick={() => navigate('/add-venue')}>
                        + Add New Venue
                    </button>
                </div>
                <div className="db-gold-divider"></div>

                <div className="db-summary-grid">
                    <div className="db-summary-card">
                        <div className="db-summary-icon"><FiClock size={24} color="#b8942e" /></div>
                        <div className="db-summary-val">{pendingCount}</div>
                        <div className="db-summary-label">Pending Verifications</div>
                    </div>
                    <div className="db-summary-card">
                        <div className="db-summary-icon"><FiCheckCircle size={24} color="#1a7f4b" /></div>
                        <div className="db-summary-val">{confirmedCount}</div>
                        <div className="db-summary-label">Confirmed Bookings</div>
                    </div>
                </div>

                <h2 style={{ marginTop: '40px', color: 'var(--maroon)' }}>Booking Requests</h2>

                {loading ? <div className="db-status">Loading requests...</div> : (
                    <div className="db-cards-list">
                        {bookings.length === 0 && <p>No bookings found for your venues yet.</p>}

                        {bookings.map(b => (
                            <div key={b.booking_id} className={`db-card ${b.booking_status}`}>
                                <div className="db-card-header">
                                    <div className="db-card-info">
                                        <div className="db-card-venue">{b.venue_name}</div>
                                        <div className="db-card-location" style={{ fontSize: '0.85rem', opacity: 0.8, display: 'flex', gap: '6px', alignItems: 'center' }}>
                                            <FiUser /> Customer: {b.customer_name} ({b.customer_phone})
                                        </div>
                                    </div>
                                    <div className="db-card-right">
                                        <span className="db-status-badge" style={{
                                            background: b.booking_status === 'confirmed' ? 'rgba(26,127,75,0.1)' : 'rgba(212,175,55,0.15)',
                                            color: b.booking_status === 'confirmed' ? '#1a7f4b' : '#b8942e'
                                        }}>
                                            {b.booking_status.toUpperCase()}
                                        </span>
                                        <div className="db-card-date">
                                            {new Date(b.event_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="db-card-stats" style={{ marginTop: '15px' }}>
                                    <div className="db-stat">
                                        <span className="db-stat-label">Advance Expected</span>
                                        <span className="db-stat-val" style={{ color: '#1a7f4b' }}>PKR {Number(b.advance_paid).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <div className="db-card-actions" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                    <button className="db-btn db-btn-chat" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                        onClick={() => navigate('/chat', { state: { booking: b } })}>
                                        <FiMessageCircle /> View Receipt in Chat
                                    </button>

                                    {b.booking_status === 'pending' && (
                                        <button
                                            className="db-btn db-btn-review"
                                            onClick={() => verifyPayment(b.booking_id)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1a7f4b', color: 'white' }}
                                        >
                                            <FiCheckCircle /> Verify Payment & Confirm
                                        </button>
                                    )}
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

export default OwnerDashboard;