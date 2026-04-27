import React, { useState } from 'react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import '../style/Contact.css';

const INQUIRY_TYPES = [
  { key: 'inquiry',  icon: '💬', name: 'General Inquiry',   desc: 'Questions about venues, availability, pricing, or how ShaadiGo works.' },
  { key: 'issue',    icon: '🚨', name: 'Report an Issue',   desc: 'Booking disputes, payment problems, venue inaccuracies, or platform errors.' },
  { key: 'feedback', icon: '⭐', name: 'Platform Feedback', desc: 'Share suggestions, improvements, or your overall experience with ShaadiGo.' },
];



export default function Contact() {
  const [selectedType, setSelectedType] = useState('inquiry');
  const [priority, setPriority]         = useState('med');
  const [toast, setToast]               = useState(false);
  const [errors, setErrors]             = useState({});

  const [form, setForm] = useState({
    fname: '', lname: '', email: '', phone: '',
    subject: '', bookingRef: '', message: '',
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.fname)   newErrors.fname   = true;
    if (!form.email)   newErrors.email   = true;
    if (!form.message) newErrors.message = true;

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setTimeout(() => setErrors({}), 2500);
      return;
    }

    try {
      await axios.post('http://localhost:5001/api/contact', {
        fname:       form.fname,
        lname:       form.lname,
        email:       form.email,
        phone:       form.phone,
        inquiryType: selectedType,
        subject:     form.subject,
        bookingRef:  form.bookingRef,
        priority:    priority,
        message:     form.message,
      });

      setToast(true);
      setTimeout(() => setToast(false), 4000);

      setTimeout(() => {
        setForm({ fname: '', lname: '', email: '', phone: '', subject: '', bookingRef: '', message: '' });
        setSelectedType('inquiry');
        setPriority('med');
      }, 500);

    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="contact-page">
      {/* Toast */}
      <div className={`contact-toast ${toast ? 'show' : ''}`}>
        <span>✅</span> Your message has been sent! We'll respond within 24 hours.
      </div>

      <Header />

      <main className="contact-main">

        {/* PAGE TITLE */}
        <div className="contact-page-title">
          <h1>Contact & <em>Support</em></h1>
          <p>Submit a general inquiry, report an issue, or share your feedback. Our team reviews every message and responds promptly.</p>
        </div>
        <div className="contact-gold-divider" />

        {/* INQUIRY TYPE CARDS */}
        <div className="inquiry-types">
          {INQUIRY_TYPES.map(t => (
            <div
              key={t.key}
              className={`type-card ${selectedType === t.key ? 'selected' : ''}`}
              onClick={() => setSelectedType(t.key)}
            >
              <div className="type-badge">{selectedType === t.key ? '✓' : ''}</div>
              <div className="type-icon">{t.icon}</div>
              <div className="type-name">{t.name}</div>
              <div className="type-desc">{t.desc}</div>
            </div>
          ))}
        </div>

        {/* FORM + SIDEBAR */}
        <div className="contact-layout">

          {/* FORM */}
          <div className="contact-form-card">

            <div className="contact-section-label">Your Details</div>

            <div className="contact-field-row">
              <div className="contact-field">
                <label className="contact-label">First Name</label>
                <div className="input-wrap">
                  <svg className="input-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="#4D0D0D" strokeWidth="1.4"/><path d="M2.5 13c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="#4D0D0D" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  <input className={`contact-input ${errors.fname ? 'error' : ''}`} type="text" placeholder="Ali" value={form.fname} onChange={set('fname')} />
                </div>
              </div>
              <div className="contact-field">
                <label className="contact-label">Last Name</label>
                <div className="input-wrap">
                  <svg className="input-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="#4D0D0D" strokeWidth="1.4"/><path d="M2.5 13c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="#4D0D0D" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  <input className="contact-input" type="text" placeholder="Hassan" value={form.lname} onChange={set('lname')} />
                </div>
              </div>
            </div>

            <div className="contact-field-row">
              <div className="contact-field">
                <label className="contact-label">Email Address</label>
                <div className="input-wrap">
                  <svg className="input-icon" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="9" rx="1.5" stroke="#4D0D0D" strokeWidth="1.4"/><path d="M2 5.5l6 4 6-4" stroke="#4D0D0D" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  <input className={`contact-input ${errors.email ? 'error' : ''}`} type="email" placeholder="ali@example.com" value={form.email} onChange={set('email')} />
                </div>
              </div>
              <div className="contact-field">
                <label className="contact-label">Phone Number</label>
                <div className="input-wrap">
                  <svg className="input-icon" viewBox="0 0 16 16" fill="none"><path d="M3 2h3l1.5 3.5-1.5 1a9 9 0 0 0 3.5 3.5l1-1.5L14 10v3a1 1 0 0 1-1 1C5 14 2 7 2 3a1 1 0 0 1 1-1Z" stroke="#4D0D0D" strokeWidth="1.3"/></svg>
                  <input className="contact-input" type="tel" placeholder="+92 300 1234567" value={form.phone} onChange={set('phone')} />
                </div>
              </div>
            </div>

            <div className="contact-form-divider" />
            <div className="contact-section-label">Message Details</div>

            <div className="contact-field-row">
              <div className="contact-field">
                <label className="contact-label">Subject</label>
                <div className="input-wrap select-wrap">
                  <svg className="input-icon" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h5" stroke="#4D0D0D" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  <select className="contact-select" value={form.subject} onChange={set('subject')}>
                    <option value="">Select a subject</option>
                    <optgroup label="General Inquiry">
                      <option>Venue availability &amp; pricing</option>
                      <option>How bookings work</option>
                      <option>Account &amp; login help</option>
                      <option>Partnership enquiry</option>
                    </optgroup>
                    <optgroup label="Report an Issue">
                      <option>Booking dispute</option>
                      <option>Payment problem</option>
                      <option>Venue inaccuracy</option>
                      <option>Platform bug or error</option>
                    </optgroup>
                    <optgroup label="Platform Feedback">
                      <option>Feature suggestion</option>
                      <option>Overall experience</option>
                      <option>Venue review appeal</option>
                    </optgroup>
                  </select>
                </div>
              </div>
              <div className="contact-field">
                <label className="contact-label">Booking Reference <span style={{opacity:0.45, fontWeight:400, textTransform:'none', letterSpacing:0}}>(if applicable)</span></label>
                <div className="input-wrap">
                  <svg className="input-icon" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="1.5" stroke="#4D0D0D" strokeWidth="1.3"/><path d="M5 6h6M5 9h4" stroke="#4D0D0D" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  <input className="contact-input" type="text" placeholder="e.g. SG-2026-04821" value={form.bookingRef} onChange={set('bookingRef')} />
                </div>
              </div>
            </div>

            {/* PRIORITY */}
            <div className="contact-field">
              <label className="contact-label">Priority Level</label>
              <div className="priority-row">
                {[['low','🟢 Low'],['med','🟡 Medium'],['high','🔴 High / Urgent']].map(([p, label]) => (
                  <button
                    key={p}
                    className={`priority-btn p-${p} ${priority === p ? 'active' : ''}`}
                    onClick={() => setPriority(p)}
                  >{label}</button>
                ))}
              </div>
            </div>

            {/* MESSAGE */}
            <div className="contact-field">
              <label className="contact-label">Your Message</label>
              <textarea
                className={`contact-textarea ${errors.message ? 'error' : ''}`}
                placeholder="Please describe your inquiry, issue, or feedback in as much detail as possible."
                value={form.message}
                onChange={set('message')}
              />
            </div>

            <button className="contact-submit-btn" onClick={handleSubmit}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M8 3l7 5-7 5" stroke="#FFE0D1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Send Message
            </button>

            <div className="contact-form-note">🔒 Your information is private and never shared with third parties.</div>

          </div>

          {/* SIDEBAR */}
          <div className="contact-sidebar">

            <div className="sidebar-card">
              <h3>📞 Other Ways to Reach Us</h3>
              {[
                { icon: '📱', label: 'Phone',     value: '+92 21 3456 7890',      href: 'tel:+922134567890' },
                { icon: '✉️', label: 'Email',     value: 'support@shaadigo.pk',   href: 'mailto:support@shaadigo.pk' },
                { icon: '💬', label: 'Live Chat', value: 'Available 9 AM – 9 PM', href: '#' },
                { icon: '📍', label: 'Office',    value: '12 MM Alam Rd, Lahore', href: '#' },
              ].map(c => (
                <a key={c.label} className="contact-channel" href={c.href}>
                  <div className="ch-icon">{c.icon}</div>
                  <div>
                    <div className="ch-label">{c.label}</div>
                    <div className="ch-value">{c.value}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="sidebar-card">
              <h3>⏱️ Response Times</h3>
              {[
                { label: 'General Inquiry',        time: 'Within 24 hrs', type: 'med'  },
                { label: 'Reported Issue',         time: 'Within 4 hrs',  type: 'fast' },
                { label: 'Platform Feedback',      time: '2 – 3 days',    type: 'slow' },
                { label: 'High Priority / Urgent', time: 'Within 1 hr',   type: 'fast' },
              ].map(r => (
                <div key={r.label} className="resp-item">
                  <span className="resp-label">{r.label}</span>
                  <span className={`resp-time ${r.type}`}>{r.time}</span>
                </div>
              ))}
            </div>

            

          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
