import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { FiArrowLeft, FiPaperclip, FiSend, FiImage, FiCreditCard, FiMessageCircle, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { FaLandmark } from 'react-icons/fa';
import './style/Chat.css';

function Chat() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');

  // BI-DIRECTIONAL LOGIC
  const isOwner = loggedInUser?.role === 'owner';
  const chatPartnerId = isOwner ? booking?.user_id : (booking?.owner_id || 1);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const [bookingStatus, setBookingStatus] = useState(booking?.booking_status || booking?.status || 'pending');

  useEffect(() => {
    if (!booking || !loggedInUser) {
      navigate(isOwner ? '/owner-dashboard' : '/dashboard');
      return;
    }
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/chat/${booking.booking_id}`);
      const data = await res.json();

      if (data.success) {
        const formattedMessages = data.messages.map(m => {
          const isImage = m.message_text.startsWith('[IMAGE]');

          // FIX: Enforce Number() to prevent Javascript "String === Number" mismatches
          const senderRole = Number(m.sender_id) === Number(loggedInUser.user_id)
            ? (isOwner ? 'owner' : 'customer')
            : (isOwner ? 'customer' : 'owner');

          return {
            message_id: m.message_id,
            sender: senderRole,
            message_type: isImage ? 'image' : 'text',
            message: isImage ? 'Payment Receipt' : m.message_text,
            image_data: isImage ? m.message_text.replace('[IMAGE]', '') : null,
            sent_at: m.sent_at,
            username: m.sender_name
          };
        });
        setMessages(formattedMessages);
      }
    } catch {
      setError('Could not load messages.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending || bookingStatus === 'cancelled') return;
    setSending(true);

    const tempMsg = {
      message_id: Date.now(),
      sender: isOwner ? 'owner' : 'customer',
      message: input.trim(),
      message_type: 'text',
      sent_at: new Date().toISOString(),
      username: loggedInUser.full_name,
      pending: true,
    };

    setMessages(prev => [...prev, tempMsg]);
    setInput('');

    try {
      const res = await fetch(`http://localhost:5001/api/chat/${booking.booking_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: loggedInUser.user_id,
          receiverId: chatPartnerId,
          message: tempMsg.message,
          messageType: 'text'
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => prev.map(m => m.message_id === tempMsg.message_id ? { ...m, message_id: data.message_id, sent_at: data.sent_at, pending: false } : m));
      } else {
        setMessages(prev => prev.filter(m => m.message_id !== tempMsg.message_id));
        setError(data.message || 'Failed to send');
      }
    } catch {
      setMessages(prev => prev.filter(m => m.message_id !== tempMsg.message_id));
      setError('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e) => {
    if (bookingStatus === 'cancelled' || isOwner) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      const tempMsg = {
        message_id: Date.now(),
        sender: 'customer',
        message: 'Payment Receipt',
        message_type: 'image',
        image_data: base64,
        sent_at: new Date().toISOString(),
        username: loggedInUser.full_name,
        pending: true,
      };

      setMessages(prev => [...prev, tempMsg]);
      setSending(true);

      try {
        const res = await fetch(`http://localhost:5001/api/chat/${booking.booking_id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: loggedInUser.user_id,
            receiverId: chatPartnerId,
            messageType: 'image',
            imageData: base64
          }),
        });
        const data = await res.json();
        if (data.success) {
          setMessages(prev => prev.map(m => m.message_id === tempMsg.message_id ? { ...m, message_id: data.message_id, sent_at: data.sent_at, pending: false } : m));
        } else {
          setMessages(prev => prev.filter(m => m.message_id !== tempMsg.message_id));
          setError(data.message || 'Failed to send image');
        }
      } catch {
        setMessages(prev => prev.filter(m => m.message_id !== tempMsg.message_id));
        setError('Failed to send image.');
      } finally {
        setSending(false);
        fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const formatTime = (str) => {
    const d = new Date(str);
    return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
  };

  if (!booking || !loggedInUser) return null;
  const ref = `SG-${new Date(booking.created_at || Date.now()).getFullYear()}-${String(booking.booking_id).padStart(5, '0')}`;

  const chatHeaderTitle = isOwner ? `Chat with ${booking.customer_name || 'Customer'}` : `${booking.venue_name} — Owner`;
  const chatHeaderSubtitle = isOwner ? `Booking Reference: ${ref}` : `Venue Manager`;

  return (
    <div className="ch-page">
      <Header />
      <main className="ch-main">
        <button className="ch-back" onClick={() => navigate(isOwner ? '/owner-dashboard' : '/dashboard')}>
          <FiArrowLeft style={{ marginRight: '6px' }} />
          Back to {isOwner ? 'Portal' : 'Dashboard'}
        </button>

        <div className="ch-layout">
          <div className="ch-info-card">
            <div className="ch-info-emoji"><FaLandmark size={32} color="#D4AF37" /></div>
            <div className="ch-info-venue">{booking.venue_name}</div>
            <div className="ch-info-location">{booking.location || 'Lahore'}</div>
            <div className="ch-info-divider"></div>
            <div className="ch-info-row"><span>Reference</span><strong>{ref}</strong></div>
            <div className="ch-info-row">
              <span>Status</span>
              <strong className={`ch-status ch-status--${bookingStatus}`}>
                {bookingStatus === 'pending' ? 'In Progress' : bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1)}
              </strong>
            </div>
            <div className="ch-info-divider"></div>

            {!isOwner && bookingStatus !== 'cancelled' ? (
              <div className="ch-payment-section">
                <div className="ch-payment-title"><FiCreditCard size={18} style={{ marginRight: '6px' }} /> Send Payment</div>
                <div className="ch-payment-desc">Transfer your advance payment and send the screenshot.</div>
                <div className="ch-payment-amount">
                  PKR {Number(booking.advance_paid || 0).toLocaleString('en-IN')}
                  <span>{bookingStatus === 'pending' ? 'advance due' : 'advance paid'}</span>
                </div>
                <button className="ch-payment-btn" onClick={() => fileInputRef.current?.click()} disabled={sending}>
                  <FiImage size={16} style={{ marginRight: '6px' }} /> Upload Receipt
                </button>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
              </div>
            ) : isOwner ? (
              <div className="ch-payment-section" style={{ background: '#f5f5f5', border: '1px solid #ddd' }}>
                <div className="ch-payment-desc" style={{ color: '#444' }}>
                  When the customer uploads a receipt, verify it and click <strong>Confirm Booking</strong> in your Portal.
                </div>
              </div>
            ) : null}
          </div>

          <div className="ch-window">
            <div className="ch-window-header">
              <div className="ch-owner-avatar"><FaLandmark color="#D4AF37" /></div>
              <div>
                <div className="ch-owner-name">{chatHeaderTitle}</div>
                <div className="ch-owner-sub">{chatHeaderSubtitle}</div>
              </div>
            </div>

            <div className="ch-messages">
              {loading && <div className="ch-center-msg">Loading messages…</div>}
              {error && <div className="ch-center-msg ch-error">{error}</div>}

              {!loading && messages.length === 0 && (
                <div className="ch-center-msg">
                  <div className="ch-empty-icon"><FiMessageCircle size={32} opacity={0.5} /></div>
                  <div style={{ marginTop: '10px' }}>No messages yet.</div>
                  {bookingStatus !== 'cancelled' && (
                    <div style={{ fontSize: '0.78rem', opacity: 0.5, marginTop: 4 }}>
                      Start the conversation!
                    </div>
                  )}
                </div>
              )}

              {messages.map(msg => {
                const isMe = msg.sender === (isOwner ? 'owner' : 'customer');

                // Determine exactly what label to show above the text
                const senderLabel = msg.sender === 'owner'
                  ? (isOwner ? 'You (Owner)' : 'Venue Owner')
                  : (isOwner ? 'Customer' : 'You (Customer)');

                return (
                  <div key={msg.message_id} className={`ch-msg-row ${isMe ? 'ch-msg-row--me' : 'ch-msg-row--owner'}`}>
                    <div className={`ch-bubble ${isMe ? 'ch-bubble--me' : 'ch-bubble--owner'} ${msg.pending ? 'ch-bubble--pending' : ''}`}>

                      {/* SENDER LABEL */}
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.6, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {senderLabel}
                      </div>

                      {msg.message_type === 'image' && msg.image_data ? (
                        <div className="ch-bubble-image-wrap">
                          <img src={msg.image_data} alt="Receipt" className="ch-bubble-image" onClick={() => setPreviewImg(msg.image_data)} />
                        </div>
                      ) : (
                        <div className="ch-bubble-text">{msg.message}</div>
                      )}
                      <div className="ch-bubble-time">{msg.pending ? 'Sending...' : formatTime(msg.sent_at)}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef}></div>
            </div>

            {bookingStatus !== 'cancelled' && (
              <div className="ch-input-bar">
                {!isOwner && (
                  <button className="ch-attach-btn" onClick={() => fileInputRef.current?.click()} disabled={sending}><FiPaperclip size={20} /></button>
                )}
                <textarea className="ch-input" placeholder="Type your message…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} rows={1} />
                <button className="ch-send-btn" onClick={handleSend} disabled={!input.trim() || sending}><FiSend size={18} /></button>
              </div>
            )}
          </div>
        </div>
      </main>

      {previewImg && (
        <div className="ch-preview-overlay" onClick={() => setPreviewImg(null)}>
          <div className="ch-preview-wrap" onClick={e => e.stopPropagation()}>
            <button className="ch-preview-close" onClick={() => setPreviewImg(null)}><FiX size={24} /></button>
            <img src={previewImg} alt="Receipt preview" className="ch-preview-img" />
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
export default Chat;