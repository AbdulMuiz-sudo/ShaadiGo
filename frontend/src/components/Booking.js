import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import './style/Booking.css';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const venue = location.state?.venue;

  // FIX 1: Changed key to 'user' to match what Login.jsx sets
  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]); // "YYYY-MM-DD" strings
  const [calLoading, setCalLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [form, setForm] = useState({
    fname: '', lname: '', phone: '',
    eventType: '', guests: '', special: ''
  });

  // Resolve venue id — handles both hardcoded (id) and DB (venue_id)
  const venueId = venue?.venue_id ?? venue?.id;
  // FIX 2: Safely map new DB column names
  const safeVenueName = venue?.venue_name || venue?.name || 'Selected Venue';

  useEffect(() => {
    if (!venue) navigate('/venues');
    if (!loggedInUser) { alert('Please log in first.'); navigate('/'); }
  }, [venue, loggedInUser, navigate]);

  // ── Fetch unavailable dates whenever venueId changes ──────────────────────
  useEffect(() => {
    if (!venueId) return;
    setCalLoading(true);
    fetch(`http://localhost:5001/api/booking/unavailable/${venueId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setUnavailableDates(data.dates); // ["2025-08-05", ...]
      })
      .catch(() => { }) // silently fail — calendar still works, just no blocked dates
      .finally(() => setCalLoading(false));
  }, [venueId]);

  if (!venue || !loggedInUser) return null;

  // Use price_per_event (DB) or priceNum (hardcoded) — whichever exists
  const hallPrice = Number(venue.price_per_event ?? venue.priceNum ?? 0);
  const serviceFee = Math.round(hallPrice * 0.05);
  const total = hallPrice + serviceFee;

  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toDateStr = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const isPast = (d) =>
    new Date(viewYear, viewMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const isUnavailable = (d) =>
    unavailableDates.includes(toDateStr(viewYear, viewMonth, d));

  const isToday = (d) =>
    d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const isSelected = (d) =>
    selectedDate !== null &&
    selectedDate.d === d &&
    selectedDate.m === viewMonth &&
    selectedDate.y === viewYear;

  const handleDayClick = (d) => {
    if (isPast(d) || isUnavailable(d)) return;
    setSelectedDate({ d, m: viewMonth, y: viewYear });
  };

  const prevMonth = () => {
    setSelectedDate(null);
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    setSelectedDate(null);
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectedDateStr = selectedDate
    ? `${selectedDate.d} ${monthNames[selectedDate.m]} ${selectedDate.y}`
    : 'Not selected';

  const eventDateISO = selectedDate
    ? toDateStr(selectedDate.y, selectedDate.m, selectedDate.d)
    : null;

  // ── Calendar grid ─────────────────────────────────────────────────────────
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const calDays = [];
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!eventDateISO)
      return setMessage({ text: 'Please select a date.', type: 'error' });
    if (!form.fname || !form.lname || !form.phone || !form.eventType)
      return setMessage({ text: 'Please fill in all required fields.', type: 'error' });

    const payload = {
      userId: loggedInUser.user_id,
      fname: form.fname,
      lname: form.lname,
      phone: form.phone,
      eventType: form.eventType,
      guests: form.guests,
      special: form.special,
      venueId,
      eventDate: eventDateISO,
      advancePaid: serviceFee,
    };

    try {
      const response = await axios.post('http://localhost:5001/api/booking', payload);
      if (response.data.success) {
        // Block this date locally so calendar updates instantly
        setUnavailableDates(prev => [...prev, eventDateISO]);
        setSelectedDate(null);
        setMessage({ text: '🎉 Booking confirmed! Redirecting…', type: 'success' });
        setTimeout(() => navigate('/venues'), 2500);
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Something went wrong.', type: 'error' });
    }
  };

  return (
    <div className="bk-page">
      <Header />
      <main className="bk-main">

        <button className="bk-back" onClick={() => navigate('/venues')}>
          <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
            <path d="M9 2L4 7l5 5" stroke="#4D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Venues
        </button>

        <div className="bk-page-title">
          <h1>Confirm Your Booking</h1>
          <p>Fill in your details and choose your event date to reserve the venue.</p>
        </div>
        <div className="bk-gold-divider"></div>

        <div className="bk-steps">
          <div className="bk-step done">
            <div className="bk-step-circle">✓</div>
            <span className="bk-step-label">Choose Venue</span>
          </div>
          <div className="bk-step-line"></div>
          <div className="bk-step active">
            <div className="bk-step-circle">2</div>
            <span className="bk-step-label">Booking Details</span>
          </div>
          <div className="bk-step-line"></div>
          <div className="bk-step">
            <div className="bk-step-circle">3</div>
            <span className="bk-step-label">Confirmation</span>
          </div>
        </div>

        {message.text && (
          <div className={`bk-message ${message.type}`}>{message.text}</div>
        )}

        <div className="bk-layout">
          {/* ── FORM ── */}
          <div className="bk-form-card">
            <div style={{
              background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '8px', padding: '10px 14px', marginBottom: '20px',
              fontSize: '0.82rem', color: 'var(--maroon)'
            }}>
              {/* FIX 3: Display full_name mapped from DB */}
              Booking as: <strong>{loggedInUser.full_name || loggedInUser.username}</strong>
            </div>

            <div className="bk-section-title">Personal Details</div>
            <div className="bk-field-row">
              <div className="bk-field">
                <label htmlFor="fname">First Name</label>
                <div className="bk-input-wrap">
                  <svg className="bk-input-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="#4D0D0D" strokeWidth="1.4" /><path d="M2.5 13c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="#4D0D0D" strokeWidth="1.4" strokeLinecap="round" /></svg>
                  <input type="text" id="fname" placeholder="Ali" value={form.fname} onChange={handleChange} />
                </div>
              </div>
              <div className="bk-field">
                <label htmlFor="lname">Last Name</label>
                <div className="bk-input-wrap">
                  <svg className="bk-input-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="#4D0D0D" strokeWidth="1.4" /><path d="M2.5 13c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="#4D0D0D" strokeWidth="1.4" strokeLinecap="round" /></svg>
                  <input type="text" id="lname" placeholder="Hassan" value={form.lname} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="bk-field">
              <label htmlFor="phone">Phone Number</label>
              <div className="bk-input-wrap">
                <svg className="bk-input-icon" viewBox="0 0 16 16" fill="none"><path d="M3 2h3l1.5 3.5-1.5 1a9 9 0 0 0 3.5 3.5l1-1.5L14 10v3a1 1 0 0 1-1 1C5 14 2 7 2 3a1 1 0 0 1 1-1Z" stroke="#4D0D0D" strokeWidth="1.3" /></svg>
                <input type="tel" id="phone" placeholder="+92 300 1234567" value={form.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="bk-form-divider"></div>
            <div className="bk-section-title">Event Details</div>

            <div className="bk-field-row">
              <div className="bk-field">
                <label htmlFor="eventType">Event Type</label>
                <div className="bk-input-wrap bk-select-wrap">
                  <svg className="bk-input-icon" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5Z" stroke="#4D0D0D" strokeWidth="1.3" /><circle cx="8" cy="6" r="1.5" stroke="#4D0D0D" strokeWidth="1.3" /></svg>
                  <select id="eventType" value={form.eventType} onChange={handleChange}>
                    <option value="">Select event type</option>
                    <option>Barat</option>
                    <option>Walima</option>
                    <option>Mehndi / Dholki</option>
                    <option>Engagement</option>
                    <option>Corporate Event</option>
                  </select>
                </div>
              </div>
              <div className="bk-field">
                <label htmlFor="guests">Expected Guests</label>
                <div className="bk-input-wrap">
                  <svg className="bk-input-icon" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2" stroke="#4D0D0D" strokeWidth="1.3" /><path d="M1 13c0-2 2-3.5 5-3.5" stroke="#4D0D0D" strokeWidth="1.3" strokeLinecap="round" /><circle cx="11" cy="6" r="1.8" stroke="#4D0D0D" strokeWidth="1.3" /><path d="M8.5 13c0-2 1.5-3 2.5-3s2.5 1 2.5 3" stroke="#4D0D0D" strokeWidth="1.3" strokeLinecap="round" /></svg>
                  <input type="number" id="guests" placeholder="e.g. 500" min="1" value={form.guests} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="bk-field">
              <label htmlFor="special">Special Requests</label>
              <div className="bk-input-wrap">
                <textarea id="special" placeholder="Any specific requirements, décor preferences, catering notes…" value={form.special} onChange={handleChange}></textarea>
              </div>
            </div>

            <div className="bk-form-divider"></div>
            <div className="bk-section-title">Venue Info</div>

            <div className="bk-field-row">
              <div className="bk-field">
                <label>Venue Name</label>
                <div className="bk-input-wrap">
                  <svg className="bk-input-icon" viewBox="0 0 16 16" fill="none"><rect x="2" y="7" width="12" height="8" rx="1" stroke="#4D0D0D" strokeWidth="1.3" /><path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="#4D0D0D" strokeWidth="1.3" strokeLinecap="round" /></svg>
                  {/* FIX 4: Use mapped venue name */}
                  <input type="text" value={safeVenueName} readOnly style={{ opacity: 0.6, cursor: 'default' }} />
                </div>
              </div>
              <div className="bk-field">
                <label>Location</label>
                <div className="bk-input-wrap">
                  <svg className="bk-input-icon" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5Z" stroke="#4D0D0D" strokeWidth="1.3" /><circle cx="8" cy="6" r="1.5" stroke="#4D0D0D" strokeWidth="1.3" /></svg>
                  <input type="text" value={venue.location || ''} readOnly style={{ opacity: 0.6, cursor: 'default' }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── SIDEBAR ── */}
          <div className="bk-sidebar">

            {/* AVAILABILITY CALENDAR */}
            <div className="bk-sidebar-card">
              <h3>
                <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
                  <path d="M2 5h12M2 8h8M5 2v2M11 2v2" stroke="#4D0D0D" strokeWidth="1.3" strokeLinecap="round" />
                  <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#4D0D0D" strokeWidth="1.3" />
                </svg>
                Availability Calendar
              </h3>

              {calLoading && (
                <div style={{ textAlign: 'center', fontSize: '0.78rem', opacity: 0.5, padding: '8px 0 4px' }}>
                  Loading availability…
                </div>
              )}

              <div className="bk-cal-header">
                <button className="bk-cal-nav" onClick={prevMonth}>←</button>
                <span className="bk-cal-month">{monthNames[viewMonth]} {viewYear}</span>
                <button className="bk-cal-nav" onClick={nextMonth}>→</button>
              </div>

              <div className="bk-cal-grid">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="bk-cal-day-name">{d}</div>
                ))}
                {calDays.map((d, i) => {
                  if (!d) return <div key={`e-${i}`} className="bk-cal-day empty"></div>;

                  const past = isPast(d);
                  const booked = isUnavailable(d);
                  const sel = isSelected(d);
                  const tod = isToday(d);

                  let cls = 'bk-cal-day';
                  if (sel) cls += ' selected';
                  else if (past) cls += ' past';
                  else if (booked) cls += ' booked';
                  else if (tod) cls += ' today';

                  return (
                    <div
                      key={d}
                      className={cls}
                      onClick={() => handleDayClick(d)}
                      title={booked ? 'Already booked' : past ? 'Past date' : ''}
                    >
                      {d}
                    </div>
                  );
                })}
              </div>

              <div className="bk-cal-legend">
                <div className="bk-legend-item">
                  <div className="bk-legend-dot" style={{ background: '#4D0D0D' }}></div>Selected
                </div>
                <div className="bk-legend-item">
                  <div className="bk-legend-dot" style={{ background: 'rgba(77,13,13,0.2)' }}></div>Booked
                </div>
                <div className="bk-legend-item">
                  <div className="bk-legend-dot" style={{ border: '1px solid #D4AF37', background: 'transparent' }}></div>Today
                </div>
                <div className="bk-legend-item">
                  <div className="bk-legend-dot" style={{ background: 'rgba(77,13,13,0.08)' }}></div>Past
                </div>
              </div>

              {selectedDate && (
                <div style={{
                  marginTop: '12px', padding: '8px 12px',
                  background: 'rgba(212,175,55,0.12)', borderRadius: '7px',
                  fontSize: '0.8rem', color: 'var(--maroon)', textAlign: 'center', fontWeight: 600
                }}>
                  📅 {selectedDateStr}
                </div>
              )}
            </div>

            {/* BOOKING SUMMARY */}
            <div className="bk-sidebar-card">
              <h3>
                <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
                  <path d="M4 2h8a1 1 0 0 1 1 1v11l-4-2-4 2V3a1 1 0 0 1 1-1Z" stroke="#4D0D0D" strokeWidth="1.3" />
                </svg>
                Booking Summary
              </h3>
              {/* FIX 5: Use mapped venue name */}
              <div className="bk-summary-row"><span className="bk-lbl">Venue</span><span className="bk-val">{safeVenueName}</span></div>
              <div className="bk-summary-row"><span className="bk-lbl">Location</span><span className="bk-val">{venue.location}</span></div>
              <div className="bk-summary-row">
                <span className="bk-lbl">Capacity</span>
                <span className="bk-val">Up to {Number(venue.capacity).toLocaleString()} guests</span>
              </div>
              <div className="bk-summary-row">
                <span className="bk-lbl">Date</span>
                <span className="bk-val bk-hi">{selectedDateStr}</span>
              </div>
              <div className="bk-summary-row">
                <span className="bk-lbl">Event Type</span>
                <span className="bk-val">{form.eventType || '—'}</span>
              </div>
              <div className="bk-summary-divider"></div>
              <div className="bk-summary-row">
                <span className="bk-lbl">Hall Price</span>
                <span className="bk-val">PKR {hallPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="bk-summary-row">
                <span className="bk-lbl">Service Fee (5%)</span>
                <span className="bk-val">PKR {serviceFee.toLocaleString()}</span>
              </div>
              <div className="bk-summary-divider"></div>
              <div className="bk-summary-total">
                <span className="bk-t-label">Total</span>
                <span className="bk-t-price">PKR {total.toLocaleString()}</span>
              </div>
              <button className="bk-btn-confirm" onClick={handleConfirm}>Confirm Booking</button>
              <div className="bk-secure-note">
                <svg viewBox="0 0 16 16" fill="none" width="11" height="11">
                  <path d="M8 1.5L3 4v4c0 3 2.5 5.5 5 6 2.5-.5 5-3 5-6V4L8 1.5Z" stroke="#4D0D0D" strokeWidth="1.3" />
                </svg>
                Secure & encrypted booking
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Booking;