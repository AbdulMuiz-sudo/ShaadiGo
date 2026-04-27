import React, { useState } from 'react';
import '../style/ReviewModal.css';

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="rm-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`rm-star ${i <= (hovered || value) ? 'active' : ''}`}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
        >★</span>
      ))}
      <span className="rm-star-label">
        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hovered || value] || ''}
      </span>
    </div>
  );
}

export default function ReviewModal({ booking, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const loggedInUser = JSON.parse(localStorage.getItem('shaadigo_user') || 'null');

  const handleSubmit = async () => {
    if (!rating) return setError('Please select a star rating.');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5001/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.booking_id,
          userId: loggedInUser.user_id,
          venueId: booking.venue_id,
          rating,
          reviewText: text.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSubmitted();
      } else {
        setError(data.message);
      }
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rm-overlay" onClick={onClose}>
      <div className="rm-modal" onClick={e => e.stopPropagation()}>
        <button className="rm-close" onClick={onClose}>✕</button>

        <div className="rm-header">
          <div className="rm-emoji">{booking.emoji || '🏛️'}</div>
          <div>
            <div className="rm-title">Rate Your Experience</div>
            <div className="rm-venue">{booking.venue_name}</div>
            <div className="rm-event">{booking.event_type} · {new Date(booking.event_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>

        <div className="rm-section-label">Your Rating</div>
        <StarPicker value={rating} onChange={setRating} />

        <div className="rm-section-label" style={{ marginTop: '18px' }}>Your Review <span className="rm-optional">(optional)</span></div>
        <textarea
          className="rm-textarea"
          placeholder="Share your experience with this venue — décor, service, food, staff…"
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={1000}
        />
        <div className="rm-char">{text.length}/1000</div>

        {error && <div className="rm-error">{error}</div>}

        <button className="rm-submit" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting…' : '⭐ Submit Review'}
        </button>
      </div>
    </div>
  );
}
