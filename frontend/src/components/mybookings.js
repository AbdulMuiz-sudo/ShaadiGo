import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import CancelModal from './CancelModal';
import { FiCalendar, FiMapPin, FiClock, FiCheckCircle, FiXCircle, FiLoader, FiMessageCircle, FiX } from 'react-icons/fi';
import './style/mybookings.css';

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancelData, setCancelData] = useState(null);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchBookings = async () => {
            try {
                const response = await axios.get(`http://localhost:5001/api/bookings/${user.user_id}`);
                if (response.data.success) {
                    setBookings(response.data.bookings);
                }
            } catch (err) {
                setError("Failed to load your bookings. Please try again later.");
                console.error("Booking fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user?.user_id, navigate]);

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'status-confirmed';
            case 'pending': return 'status-pending';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    if (loading) {
        return (
            <div className="bookings-loading">
                <FiLoader className="spinner" />
                <p>Retrieving your bookings...</p>
            </div>
        );
    }

    return (
        <div className="bookings-page">
            <Header />

            {cancelData && (
                <CancelModal
                    booking={cancelData}
                    onClose={() => setCancelData(null)}
                    onConfirmed={(updated) => {
                        setBookings(prev => prev.map(b => b.booking_id === updated.booking_id ? { ...b, booking_status: 'cancelled' } : b));
                        setCancelData(null);
                    }}
                />
            )}

            <main className="bookings-container">
                <div className="bookings-header">
                    <h1>My <em>Bookings</em></h1>
                    <p>View and manage your upcoming and past wedding venue reservations.</p>
                </div>

                {error && <div className="error-banner">{error}</div>}

                {bookings.length === 0 && !error ? (
                    <div className="no-bookings">
                        <FiCalendar size={48} />
                        <h3>No Bookings Found</h3>
                        <p>You haven't reserved any venues yet. Start exploring now!</p>
                        <button onClick={() => navigate('/venues')} className="explore-btn">
                            Explore Venues
                        </button>
                    </div>
                ) : (
                    <div className="bookings-grid">
                        {bookings.map((bk) => (
                            <div key={bk.booking_id} className="booking-card">
                                <div className="booking-card-header">
                                    <span className={`status-badge ${getStatusClass(bk.booking_status)}`}>
                                        {bk.booking_status === 'confirmed' ? <FiCheckCircle /> : bk.booking_status === 'cancelled' ? <FiXCircle /> : <FiClock />}
                                        {bk.booking_status}
                                    </span>
                                    <span className="booking-id">ID: #SG-{bk.booking_id}</span>
                                </div>

                                <div className="booking-body">
                                    <h3>{bk.venue_name}</h3>

                                    <div className="booking-info">
                                        <div className="info-item">
                                            <FiCalendar className="icon" />
                                            <span>{new Date(bk.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        </div>
                                        <div className="info-item">
                                            <FiMapPin className="icon" />
                                            <span>{bk.location || 'Lahore'}</span>
                                        </div>
                                    </div>

                                    <div className="payment-summary">
                                        <div className="payment-row">
                                            <span>Advance Paid:</span>
                                            <span className="price">PKR {Number(bk.advance_paid).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="booking-actions">
                                    <button
                                        className="btn-chat"
                                        onClick={() => navigate('/chat', { state: { booking: bk } })}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                    >
                                        <FiMessageCircle />
                                        {bk.booking_status === 'cancelled' ? 'View Chat History' : 'Chat'}
                                    </button>

                                    {bk.booking_status !== 'cancelled' && (
                                        <button
                                            className="btn-cancel"
                                            onClick={() => setCancelData(bk)}
                                            style={{ background: '#fce8e8', color: '#c53030', padding: '10px', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background 0.2s' }}
                                        >
                                            <FiX /> Cancel
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

export default MyBookings;