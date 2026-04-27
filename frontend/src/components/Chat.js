import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import {
  FiArrowLeft, FiPaperclip, FiSend, FiImage, FiCreditCard,
  FiMessageCircle, FiCheck, FiX, FiAlertCircle
} from 'react-icons/fi';
import { FaLandmark } from 'react-icons/fa';
import './style/Chat.css';

function Chat() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const [bookingStatus, setBookingStatus] = useState(booking?.booking_status || 'pending');

  const ownerId = booking?.owner_id || 1;

  useEffect(() => {
    if (!booking || !loggedInUser) {
      navigate('/dashboard');
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
      const res = await fetch(`http://localhost:5001/api/messages/${loggedInUser.user_id}/${ownerId}`);
      const data = await res.json();

      if (data.success) {
        const formattedMessages = data.messages.map(m => {
          const isImage = m.message_text.startsWith('[IMAGE]');
          return {
            message_id: m.message_id,
            sender: m.sender_id === loggedInUser.user_id ? 'customer' : 'owner',
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
      sender: 'customer',
      message: input.trim(),
      message_type: 'text',
      sent_at: new Date().toISOString(),
      username: loggedInUser.full_name,
      pending: true,
    };

    setMessages(prev => [...prev, tempMsg]);
    setInput('');

    try {
      const res = await fetch(`http://localhost:5001/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: loggedInUser.user_id,
          receiverId: ownerId,
          messageText: tempMsg.message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev =>
          prev.map(m => m.message_id === tempMsg.message_id
            ? { ...m, message_id: data.message_id, sent_at: data.sent_at, pending: false }
            : m
          )
        );
      } else {
        setMessages(prev => prev.filter(m => m.message_id !== tempMsg.message_id));
        setError(data.message);
      }
    } catch {
      setMessages(prev => prev.filter(m => m.message_id !== tempMsg.message_id));
      setError('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e) => {
    if (bookingStatus === 'cancelled') return;

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
        const res = await fetch(`http://localhost:5001/api/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: loggedInUser.user_id,
            receiverId: ownerId,
            messageText: `[IMAGE]${base64}`,
          }),
        });
        const data = await res.json();

        if (data.success) {
          setMessages(prev =>
            prev.map(m => m.message_id === tempMsg.message_id
              ? { ...m, message_id: data.message_id, sent_at: data.sent_at, pending: false }
              : m
            )
          );
        } else {
          setMessages(prev => prev.filter(m => m.message_id !== tempMsg.message_id));
          setError(data.message);
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const formatTime = (str) => {
    const d = new Date(str);
    return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) +
      ' · ' + d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
  };

  if (!booking || !loggedInUser) return null;

  const ref = `SG-${new Date(booking.created_at || Date.now()).getFullYear()}-${String(booking.booking_id).padStart(5, '0')}`;

  return (
    <div className="ch-page">
      <Header />
      <main className="ch-main">

        <button className="ch-back" onClick={() => navigate('/dashboard')}>
          <FiArrowLeft style={{ marginRight: '6px' }} />
          Back to Dashboard
        </button>

        <div className="ch-layout">

          {/* SIDEBAR */}
          <div className="ch-info-card">
            <div className="ch-info-emoji"><FaLandmark size={32} color="#D4AF37" /></div>
            <div className="ch-info-venue">{booking.venue_name}</div>
            <div className="ch-info-location">{booking.location || 'Lahore'}</div>
            <div className="ch-info-divider"></div>
            <div className="ch-info-row"><span>Reference</span><strong>{ref}</strong></div>
            <div className="ch-info-row">
              <span>Date</span>
              <strong>{new Date(booking.event_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            </div>
            <div className="ch-info-row">
              <span>Status</span>
              <strong className={`ch-status ch-status--${bookingStatus}`}>
                {bookingStatus === 'pending' ? 'In Progress' : bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1)}
              </strong>
            </div>
            <div className="ch-info-divider"></div>

            {/* PAYMENT SECTION - HIDE IF CANCELLED */}
            {bookingStatus !== 'cancelled' ? (
              <div className="ch-payment-section">
                <div className="ch-payment-title">
                  <FiCreditCard size={18} style={{ marginRight: '6px' }} />
                  Send Payment
                </div>
                <div className="ch-payment-desc">
                  Transfer your advance payment and send the screenshot here for venue owner confirmation.
                </div>
                <div className="ch-payment-amount">
                  PKR {Number(booking.advance_paid || 0).toLocaleString('en-IN')}
                  {/* FIX: Smart label updates based on status */}
                  <span>{bookingStatus === 'pending' ? 'advance due' : 'advance paid'}</span>
                </div>
                <button
                  className="ch-payment-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending}
                >
                  <FiImage size={16} style={{ marginRight: '6px' }} /> Upload Receipt
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            ) : (
              <div className="ch-payment-section" style={{ background: '#fff5f5', border: '1px solid #fbcaca' }}>
                <div className="ch-payment-title" style={{ color: '#d93025' }}>
                  <FiAlertCircle size={18} style={{ marginRight: '6px' }} />
                  Booking Cancelled
                </div>
                <div className="ch-payment-desc" style={{ color: '#d93025', opacity: 0.8 }}>
                  Payments and file uploads are disabled for cancelled bookings.
                </div>
              </div>
            )}

            <div className="ch-info-divider"></div>
            <div className="ch-info-note">
              <FiMessageCircle size={14} style={{ marginRight: '6px' }} />
              Messages are securely saved and private between you and the venue owner.
            </div>
          </div>

          {/* CHAT WINDOW */}
          <div className="ch-window">
            <div className="ch-window-header">
              <div className="ch-owner-avatar"><FaLandmark color="#D4AF37" /></div>
              <div>
                <div className="ch-owner-name">{booking.venue_name} — Owner</div>
                <div className="ch-owner-sub">Venue Manager</div>
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
                      Start the conversation with the venue owner!
                    </div>
                  )}
                </div>
              )}

              {messages.map(msg => {
                const isMe = msg.sender === 'customer';
                return (
                  <div key={msg.message_id} className={`ch-msg-row ${isMe ? 'ch-msg-row--me' : 'ch-msg-row--owner'}`}>
                    {!isMe && <div className="ch-avatar ch-avatar--owner"><FaLandmark color="#D4AF37" /></div>}

                    <div className={`ch-bubble ${isMe ? 'ch-bubble--me' : 'ch-bubble--owner'} ${msg.pending ? 'ch-bubble--pending' : ''}`}>
                      {msg.message_type === 'image' && msg.image_data ? (
                        <div className="ch-bubble-image-wrap">
                          <div className="ch-bubble-image-label">
                            <FiImage size={14} style={{ marginRight: '4px' }} /> Payment Screenshot
                          </div>
                          <img
                            src={msg.image_data}
                            alt="Payment receipt"
                            className="ch-bubble-image"
                            onClick={() => setPreviewImg(msg.image_data)}
                          />
                        </div>
                      ) : (
                        <div className="ch-bubble-text">{msg.message}</div>
                      )}
                      <div className="ch-bubble-time">
                        {msg.pending ? 'Sending...' : formatTime(msg.sent_at)}
                        {isMe && !msg.pending && <FiCheck style={{ marginLeft: '4px' }} />}
                      </div>
                    </div>

                    {isMe && (
                      <div className="ch-avatar ch-avatar--me">
                        {loggedInUser.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef}></div>
            </div>

            {/* INPUT BAR - HIDE IF CANCELLED */}
            {bookingStatus !== 'cancelled' ? (
              <div className="ch-input-bar">
                <button
                  className="ch-attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending}
                  title="Send payment screenshot"
                >
                  <FiPaperclip size={20} />
                </button>
                <textarea
                  className="ch-input"
                  placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button
                  className="ch-send-btn"
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                >
                  <FiSend size={18} />
                </button>
              </div>
            ) : (
              <div className="ch-input-bar" style={{ justifyContent: 'center', background: '#f5f5f5', color: '#888', fontWeight: '500', padding: '20px' }}>
                Chat has been disabled because this booking is cancelled.
              </div>
            )}

          </div>
        </div>
      </main>

      {/* IMAGE PREVIEW LIGHTBOX */}
      {previewImg && (
        <div className="ch-preview-overlay" onClick={() => setPreviewImg(null)}>
          <div className="ch-preview-wrap" onClick={e => e.stopPropagation()}>
            <button className="ch-preview-close" onClick={() => setPreviewImg(null)}>
              <FiX size={24} />
            </button>
            <img src={previewImg} alt="Receipt preview" className="ch-preview-img" />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Chat;