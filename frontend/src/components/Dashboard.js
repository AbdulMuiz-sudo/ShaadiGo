import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ReviewModal from './ReviewModal';
import CancelModal from './CancelModal';
const statusConfig = {
  confirmed: { label: 'Confirmed', color: '#1a7f4b', bg: 'rgba(26,127,75,0.1)', dot: '#1a7f4b' },
  pending: { label: 'Pending', color: '#b8942e', bg: 'rgba(212,175,55,0.15)', dot: '#D4AF37' },
  cancelled: { label: 'Cancelled', color: '#9b2335', bg: 'rgba(155,35,53,0.1)', dot: '#c0392b' },
  inprogress: { label: 'In Progress', color: '#7b3fa0', bg: 'rgba(123,63,160,0.1)', dot: '#9b59b6' },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.pending;
  return (
    <span className="db-status-badge" style={{ color: cfg.color, background: cfg.bg }}>
      <span className="db-status-dot" style={{ background: cfg.dot }}></span>
      {cfg.label}
    </span>
  );
}

function BookingCard({ booking, onCancel }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [localBooking, setLocalBooking] = useState(booking);

  const eventDate = new Date(localBooking.event_date);
  const createdAt = new Date(localBooking.created_at);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDay = new Date(eventDate);
  eventDay.setHours(0, 0, 0, 0);

  const isToday = eventDay.getTime() === today.getTime();
  const isPast = eventDay < today;
  const canCancel = localBooking.status === 'confirmed' && !isPast && !isToday;
  const canReview = localBooking.status === 'confirmed' && isPast;

  const displayStatus = (localBooking.status === 'confirmed' && isToday)
    ? 'inprogress'
    : localBooking.status;

  const remaining = (Number(localBooking.total_price) - Number(localBooking.advance_paid)).toLocaleString('en-IN');
  const ref = `SG-${createdAt.getFullYear()}-${String(localBooking.booking_id).padStart(5, '0')}`;

  useEffect(() => {
    if (!canReview) return;
    fetch(`http://localhost:5001/api/review/check/${localBooking.booking_id}`)
      .then(r => r.json())
      .then(d => { if (d.reviewed) setReviewed(true); })
      .catch(() => { });
  }, [localBooking.booking_id, canReview]);

  return (
    <>
      {showReview && (
        <ReviewModal
          booking={localBooking}
          onClose={() => setShowReview(false)}
          onSubmitted={() => { setShowReview(false); setReviewed(true); setReviewDone(true); }}
        />
      )}
      {showCancel && (
        <CancelModal
          booking={localBooking}
          onClose={() => setShowCancel(false)}
          onConfirmed={(updated) => {
            setLocalBooking(updated);
            setShowCancel(false);
            onCancel(updated.booking_id, updated);
          }}
        />
      )}

      <div className={`db-card ${displayStatus}`}>

        {isToday && (
          <div className="db-inprogress-banner">
            <span className="db-inprogress-pulse"></span>
            🎉 Your event is happening today! We wish you a wonderful celebration.
          </div>
        )}

        {/* REFUND BANNER — shown after cancellation */}
        {localBooking.status === 'cancelled' && localBooking.refund_amount > 0 && (
          <div className="db-refund-banner">
            <span>💰</span>
            Refund of <strong>PKR {Number(localBooking.refund_amount).toLocaleString('en-IN')}</strong> ({localBooking.refund_percent}%) is pending processing.
          </div>
        )}

        <div className="db-card-header">
          <div className="db-card-emoji">{localBooking.emoji || '🏛️'}</div>
          <div className="db-card-info">
            <div className="db-card-venue">{localBooking.venue_name}</div>
            <div className="db-card-location">
              <svg viewBox="0 0 16 16" fill="none" width="11" height="11">
                <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5Z" stroke="#4D0D0D" strokeWidth="1.3" />
                <circle cx="8" cy="6" r="1.5" stroke="#4D0D0D" strokeWidth="1.3" />
              </svg>
              {localBooking.location}
            </div>
            <div className="db-card-ref">{ref}</div>
          </div>
          <div className="db-card-right">
            <StatusBadge status={displayStatus} />
            <div className="db-card-date">
              {eventDate.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <div className="db-card-event-type">{localBooking.event_type}</div>
          </div>
        </div>

        <div className="db-card-stats">
          <div className="db-stat">
            <span className="db-stat-label">Total</span>
            <span className="db-stat-val">PKR {Number(localBooking.total_price).toLocaleString('en-IN')}</span>
          </div>
          <div className="db-stat-divider"></div>
          <div className="db-stat">
            <span className="db-stat-label">Advance Paid</span>
            <span className="db-stat-val" style={{ color: '#1a7f4b' }}>PKR {Number(localBooking.advance_paid).toLocaleString('en-IN')}</span>
          </div>
          <div className="db-stat-divider"></div>
          <div className="db-stat">
            <span className="db-stat-label">Remaining</span>
            <span className="db-stat-val" style={{ color: '#b8942e' }}>PKR {remaining}</span>
          </div>
          <div className="db-stat-divider"></div>
          <div className="db-stat">
            <span className="db-stat-label">Guests</span>
            <span className="db-stat-val">{localBooking.guest_count ? localBooking.guest_count.toLocaleString() : '—'}</span>
          </div>
        </div>

        {expanded && (
          <div className="db-card-details">
            <div className="db-detail-row">
              <span className="db-detail-label">Hall Price</span>
              <span className="db-detail-val">PKR {Number(localBooking.hall_price).toLocaleString('en-IN')}</span>
            </div>
            <div className="db-detail-row">
              <span className="db-detail-label">Service Fee</span>
              <span className="db-detail-val">PKR {Number(localBooking.service_fee).toLocaleString('en-IN')}</span>
            </div>
            <div className="db-detail-row">
              <span className="db-detail-label">Booked On</span>
              <span className="db-detail-val">
                {createdAt.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            {localBooking.status === 'cancelled' && localBooking.refund_amount > 0 && (
              <>
                <div className="db-detail-row">
                  <span className="db-detail-label">Refund Amount</span>
                  <span className="db-detail-val" style={{ color: '#1a7f4b' }}>
                    PKR {Number(localBooking.refund_amount).toLocaleString('en-IN')} ({localBooking.refund_percent}%)
                  </span>
                </div>
                <div className="db-detail-row">
                  <span className="db-detail-label">Refund Status</span>
                  <span className="db-detail-val" style={{ color: '#b8942e', textTransform: 'capitalize' }}>
                    {localBooking.refund_status}
                  </span>
                </div>
              </>
            )}
            {localBooking.special_requests && (
              <div className="db-detail-row">
                <span className="db-detail-label">Special Requests</span>
                <span className="db-detail-val">{localBooking.special_requests}</span>
              </div>
            )}
          </div>
        )}

        <div className="db-card-actions">
          <button className="db-btn db-btn-ghost" onClick={() => setExpanded(e => !e)}>
            {expanded ? '▲ Less Details' : '▼ More Details'}
          </button>

          {(localBooking.status === 'confirmed' || localBooking.status === 'pending') && (
            <button className="db-btn db-btn-chat"
              onClick={() => navigate('/chat', { state: { booking: localBooking } })}>
              💬 Chat with Owner
            </button>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            {canCancel && (
              <button className="db-btn db-btn-cancel" onClick={() => setShowCancel(true)}>
                Cancel Booking
              </button>
            )}
            {canReview && (
              reviewed || reviewDone ? (
                <span className="db-btn-reviewed">✅ Reviewed</span>
              ) : (
                <button className="db-btn db-btn-review" onClick={() => setShowReview(true)}>
                  ⭐ Leave a Review
                </button>
              )
            )}
          </div>
        </div>

      </div>
    </>
  );
}
function Dashboard() {
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem('shaadigo_user') || 'null');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!loggedInUser) { navigate('/'); return; }
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5001/api/bookings/${loggedInUser.user_id}`);
      const data = await res.json();
      if (data.success) setBookings(data.bookings);
      else setError(data.message);
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };


  const handleCancel = (bookingId, updatedBooking) => {
    setBookings(prev =>
      prev.map(b => b.booking_id === bookingId ? { ...updatedBooking } : b)
    );
  };

  if (!loggedInUser) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDisplayStatus = (b) => {
    if (b.status !== 'confirmed') return b.status;
    const eventDay = new Date(b.event_date);
    eventDay.setHours(0, 0, 0, 0);
    return eventDay.getTime() === today.getTime() ? 'inprogress' : b.status;
  };

  const total = bookings.length;
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const inprogress = bookings.filter(b => getDisplayStatus(b) === 'inprogress').length;
  const cancelled = bookings.filter(b => b.status === 'cancelled').length;
  const totalSpent = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + Number(b.advance_paid), 0);

  const filtered = filterStatus === 'all'
    ? bookings
    : filterStatus === 'inprogress'
      ? bookings.filter(b => getDisplayStatus(b) === 'inprogress')
      : bookings.filter(b => b.status === filterStatus);

  return (
    <div className="db-page">
      <Header />
      <main className="db-main">

        <div className="db-heading">
          <div>
            <h1>My Dashboard</h1>
            <p>Welcome back, <strong>{loggedInUser.username}</strong> — manage all your bookings here.</p>
          </div>
          <button className="db-btn-new" onClick={() => navigate('/venues')}>
            + New Booking
          </button>
        </div>
        <div className="db-gold-divider"></div>

        {/* SUMMARY CARDS */}
        <div className="db-summary-grid">
          <div className="db-summary-card">
            <div className="db-summary-icon">📋</div>
            <div className="db-summary-val">{total}</div>
            <div className="db-summary-label">Total Bookings</div>
          </div>
          <div className="db-summary-card">
            <div className="db-summary-icon">✅</div>
            <div className="db-summary-val">{confirmed}</div>
            <div className="db-summary-label">Confirmed</div>
          </div>
          <div className="db-summary-card">
            <div className="db-summary-icon" style={{ color: '#9b59b6' }}>🎯</div>
            <div className="db-summary-val" style={{ color: '#7b3fa0' }}>{inprogress}</div>
            <div className="db-summary-label">In Progress</div>
          </div>
          <div className="db-summary-card">
            <div className="db-summary-icon">✕</div>
            <div className="db-summary-val">{cancelled}</div>
            <div className="db-summary-label">Cancelled</div>
          </div>
          <div className="db-summary-card">
            <div className="db-summary-icon">💰</div>
            <div className="db-summary-val" style={{ fontSize: '1rem' }}>PKR {totalSpent.toLocaleString('en-IN')}</div>
            <div className="db-summary-label">Total Advance Paid</div>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="db-filter-tabs">
          {['all', 'confirmed', 'inprogress', 'cancelled'].map(s => (
            <button
              key={s}
              className={`db-tab${filterStatus === s ? ' active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'inprogress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="db-tab-count">
                {s === 'all'
                  ? total
                  : s === 'inprogress'
                    ? inprogress
                    : bookings.filter(b => b.status === s).length}
              </span>
            </button>
          ))}
        </div>

        {loading && <div className="db-status">Loading your bookings…</div>}
        {error && <div className="db-status db-error">{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="db-empty">
            <div className="db-empty-icon">🏛️</div>
            <div className="db-empty-title">No bookings yet</div>
            <div className="db-empty-sub">Find your perfect venue and make your first booking!</div>
            <button className="db-btn-new" onClick={() => navigate('/venues')}>Browse Venues</button>
          </div>
        )}

        {!loading && !error && (
          <div className="db-cards-list">
            {filtered.map(b => (
              <BookingCard key={b.booking_id} booking={b} onCancel={handleCancel} />
            ))}
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}

export default Dashboard;
