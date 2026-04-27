import React, { useState } from 'react';
import '../style/CancelModal.css';

function getRefundPolicy(daysUntil) {
  if (daysUntil > 7)  return { percent: 90, label: 'More than 7 days away' };
  if (daysUntil >= 5) return { percent: 80, label: '5–7 days away' };
  if (daysUntil >= 3) return { percent: 50, label: '3–5 days away' };
  if (daysUntil >= 1) return { percent: 30, label: '1–3 days away' };
  return { percent: 0, label: 'Event is today or past' };
}

export default function CancelModal({ booking, onClose, onConfirmed }) {
  const [cancelling, setCancelling] = useState(false);
  const [error, setError]           = useState('');
  const loggedInUser = JSON.parse(localStorage.getItem('shaadigo_user') || 'null');

  const today    = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDay = new Date(booking.event_date);
  eventDay.setHours(0, 0, 0, 0);
  const daysUntil   = Math.ceil((eventDay - today) / (1000 * 60 * 60 * 24));
  const policy      = getRefundPolicy(daysUntil);
  const refundAmt   = parseFloat(((booking.advance_paid * policy.percent) / 100).toFixed(2));

  const handleCancel = async () => {
    setCancelling(true);
    setError('');
    try {
      const res  = await fetch(`http://localhost:5001/api/booking/${booking.booking_id}/cancel`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId: loggedInUser.user_id }),
      });
      const data = await res.json();
      if (data.success) {
        onConfirmed({
          ...booking,
          status:         'cancelled',
          refund_percent: data.refundPercent,
          refund_amount:  data.refundAmount,
          refund_status:  'pending',
        });
      } else {
        setError(data.message);
      }
    } catch {
      setError('Could not connect to server.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="cm-overlay" onClick={onClose}>
      <div className="cm-modal" onClick={e => e.stopPropagation()}>
        <button className="cm-close" onClick={onClose}>✕</button>

        <div className="cm-header">
          <div className="cm-icon">⚠️</div>
          <div className="cm-title">Cancel Booking</div>
          <div className="cm-venue">{booking.venue_name}</div>
          <div className="cm-date">
            {new Date(booking.event_date).toLocaleDateString('en-PK', { day:'numeric', month:'long', year:'numeric' })}
          </div>
        </div>

        {/* REFUND BREAKDOWN */}
        <div className="cm-refund-box">
          <div className="cm-refund-title">Refund Calculation</div>

          <div className="cm-policy-row">
            <span>Days until event</span>
            <span className="cm-policy-val">{daysUntil} day{daysUntil !== 1 ? 's' : ''}</span>
          </div>
          <div className="cm-policy-row">
            <span>Policy tier</span>
            <span className="cm-policy-val">{policy.label}</span>
          </div>
          <div className="cm-policy-row">
            <span>Advance paid</span>
            <span className="cm-policy-val">PKR {Number(booking.advance_paid).toLocaleString('en-IN')}</span>
          </div>
          <div className="cm-policy-row">
            <span>Refund rate</span>
            <span className="cm-policy-val cm-green">{policy.percent}%</span>
          </div>
          <div className="cm-refund-total">
            <span>Estimated Refund</span>
            <span className="cm-refund-amount">PKR {refundAmt.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* POLICY TABLE */}
        <div className="cm-policy-info">
          <div className="cm-policy-info-title">Cancellation Policy</div>
          {[
            { range: 'More than 7 days',  refund: '90%' },
            { range: '5 – 7 days',        refund: '80%' },
            { range: '3 – 5 days',        refund: '50%' },
            { range: '1 – 3 days',        refund: '30%' },
            { range: 'Same day', refund: '0%'  },
          ].map(p => (
            <div key={p.range} className="cm-policy-tier">
              <span>{p.range}</span>
              <span className="cm-tier-refund">{p.refund} refund</span>
            </div>
          ))}
        </div>

        {error && <div className="cm-error">{error}</div>}

        <div className="cm-actions">
          <button className="cm-btn-keep" onClick={onClose}>Keep Booking</button>
          <button className="cm-btn-cancel" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? 'Cancelling…' : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
}
