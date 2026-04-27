require('dotenv').config();
console.log('ENV CHECK:');
console.log('DB_SERVER:', process.env.DB_SERVER);
console.log('DB_DATABASE:', process.env.DB_DATABASE);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);

const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// ── DB CONFIG ─────────────────────────────────────────────────────────────────
const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    instanceName: 'SQLEXPRESS',
    trustServerCertificate: true
  }
};
const pool = new sql.ConnectionPool(dbConfig);
const poolConnect = pool.connect();
pool.on('error', err => console.error('SQL Pool Error:', err));

// ── SIGNUP ────────────────────────────────────────────────────────────────────
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  if (password.length < 8)
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
  try {
    await poolConnect;
    const existing = await pool.request()
      .input('username', sql.VarChar, username)
      .query('SELECT user_id FROM users WHERE username = @username');
    if (existing.recordset.length > 0)
      return res.status(409).json({ success: false, message: 'Username already taken. Please choose another.' });
    await pool.request()
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, password)
      .query('INSERT INTO users (username, password_hash) VALUES (@username, @password)');
    res.json({ success: true, message: 'Account created successfully! You can now log in.' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  try {
    await poolConnect;
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, password)
      .query('SELECT user_id FROM users WHERE username = @username AND password_hash = @password');
    if (result.recordset.length === 0)
      return res.status(401).json({ success: false, message: 'Incorrect username or password.' });
    res.json({
      success: true,
      message: 'Login successful!',
      user: { user_id: result.recordset[0].user_id, username }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── BOOKING ───────────────────────────────────────────────────────────────────
app.post('/api/booking', async (req, res) => {
  const { userId, fname, lname, phone, eventType, guests, venueId, eventDate, advancePaid } = req.body;
  if (!userId || !fname || !lname || !phone || !eventType || !venueId || !eventDate)
    return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
  try {
    await poolConnect;
    const venueResult = await pool.request()
      .input('venueId', sql.Int, venueId)
      .query('SELECT venue_id, price_per_event FROM venues WHERE venue_id = @venueId');
    if (venueResult.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Venue not found.' });
    const hallPrice = parseFloat(venueResult.recordset[0].price_per_event);
    const serviceFee = Math.round(hallPrice * 0.05);
    const totalPrice = hallPrice + serviceFee;
    const conflict = await pool.request()
      .input('venueId', sql.Int, venueId)
      .input('eventDate', sql.Date, eventDate)
      .query(`SELECT booking_id FROM bookings
              WHERE venue_id = @venueId AND event_date = @eventDate AND status != 'cancelled'`);
    if (conflict.recordset.length > 0)
      return res.status(409).json({ success: false, message: 'This venue is already booked on that date.' });
    const insert = await pool.request()
      .input('userId', sql.Int, userId)
      .input('venueId', sql.Int, venueId)
      .input('fname', sql.VarChar, fname)
      .input('lname', sql.VarChar, lname)
      .input('phone', sql.VarChar, phone)
      .input('eventType', sql.VarChar, eventType)
      .input('guestCount', sql.Int, guests || null)
      .input('specialRequests', sql.NVarChar(sql.MAX), req.body.special || null)
      .input('eventDate', sql.Date, eventDate)
      .input('hallPrice', sql.Decimal(12, 2), hallPrice)
      .input('serviceFee', sql.Decimal(12, 2), serviceFee)
      .input('totalPrice', sql.Decimal(12, 2), totalPrice)
      .input('advancePaid', sql.Decimal(12, 2), advancePaid || 0)
      .query(`INSERT INTO bookings
          (user_id, venue_id, fname, lname, phone, event_type, guest_count,
           special_requests, event_date, hall_price, service_fee, total_price, advance_paid, status)
        OUTPUT INSERTED.booking_id
        VALUES
          (@userId, @venueId, @fname, @lname, @phone, @eventType, @guestCount,
           @specialRequests, @eventDate, @hallPrice, @serviceFee, @totalPrice, @advancePaid, 'pending')`);
    await pool.request()
      .input('venueId', sql.Int, venueId)
      .input('eventDate', sql.Date, eventDate)
      .query(`IF NOT EXISTS (SELECT 1 FROM venue_unavailable_dates WHERE venue_id = @venueId AND unavailable_date = @eventDate)
              INSERT INTO venue_unavailable_dates (venue_id, unavailable_date) VALUES (@venueId, @eventDate)`);
    const bookingId = insert.recordset[0].booking_id;
    res.json({
      success: true, message: 'Booking confirmed successfully!', bookingId,
      reference: `SG-${new Date().getFullYear()}-${String(bookingId).padStart(5, '0')}`
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── CONTACT ───────────────────────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { fname, lname, email, phone, inquiryType, subject, bookingRef, priority, message } = req.body;
  if (!fname || !email || !message)
    return res.status(400).json({ success: false, message: 'First name, email and message are required.' });
  try {
    await poolConnect;
    await pool.request()
      .input('fname', sql.VarChar, fname)
      .input('lname', sql.VarChar, lname || null)
      .input('email', sql.VarChar, email)
      .input('phone', sql.VarChar, phone || null)
      .input('inquiryType', sql.VarChar, inquiryType || 'inquiry')
      .input('subject', sql.VarChar, subject || null)
      .input('bookingRef', sql.VarChar, bookingRef || null)
      .input('priority', sql.VarChar, priority || 'med')
      .input('message', sql.NVarChar(sql.MAX), message)
      .query(`INSERT INTO contact_messages
          (fname, lname, email, phone, inquiry_type, subject, booking_ref, priority, message)
        VALUES
          (@fname, @lname, @email, @phone, @inquiryType, @subject, @bookingRef, @priority, @message)`);
    res.json({ success: true, message: 'Message received! We will respond shortly.' });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET VENUES ────────────────────────────────────────────────────────────────
app.get('/api/venues', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .query('SELECT * FROM venues ORDER BY venue_id');
    res.json({ success: true, venues: result.recordset });
  } catch (err) {
    console.error('Venues error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── SEARCH & FILTER VENUES ────────────────────────────────────────────────────
app.get('/api/venues/search', async (req, res) => {
  const { search, city, minPrice, maxPrice, minCapacity } = req.query;
  try {
    await poolConnect;
    const request = pool.request();
    let query = 'SELECT * FROM venues WHERE 1=1';
    if (search) {
      query += ' AND (name LIKE @search OR location LIKE @search OR description LIKE @search)';
      request.input('search', sql.VarChar, `%${search}%`);
    }
    if (city) {
      query += ' AND city = @city';
      request.input('city', sql.VarChar, city);
    }
    if (minPrice) {
      query += ' AND price_per_event >= @minPrice';
      request.input('minPrice', sql.Decimal(12, 2), parseFloat(minPrice));
    }
    if (maxPrice) {
      query += ' AND price_per_event <= @maxPrice';
      request.input('maxPrice', sql.Decimal(12, 2), parseFloat(maxPrice));
    }
    if (minCapacity) {
      query += ' AND capacity >= @minCapacity';
      request.input('minCapacity', sql.Int, parseInt(minCapacity));
    }
    query += ' ORDER BY rating DESC';
    const result = await request.query(query);
    res.json({ success: true, venues: result.recordset });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET BOOKED DATES FOR A VENUE ──────────────────────────────────────────────
app.get('/api/booking/unavailable/:venueId', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('venueId', sql.Int, req.params.venueId)
      .query(`SELECT CONVERT(varchar, unavailable_date, 23) AS unavailable_date
              FROM venue_unavailable_dates WHERE venue_id = @venueId`);
    res.json({ success: true, dates: result.recordset.map(r => r.unavailable_date) });
  } catch (err) {
    console.error('Unavailable dates error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET USER BOOKINGS ─────────────────────────────────────────────────────────
app.get('/api/bookings/:userId', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('userId', sql.Int, req.params.userId)
      .query(`
        SELECT b.booking_id, b.venue_id, b.event_type, b.event_date, b.status,
               b.hall_price, b.service_fee, b.total_price, b.advance_paid,
               b.guest_count, b.special_requests, b.created_at,
               b.refund_percent, b.refund_amount, b.refund_status, b.cancelled_at,
               v.name AS venue_name, v.location, v.city, v.emoji
        FROM bookings b
        JOIN venues v ON v.venue_id = b.venue_id
        WHERE b.user_id = @userId
        ORDER BY b.created_at DESC
      `);
    res.json({ success: true, bookings: result.recordset });
  } catch (err) {
    console.error('Bookings fetch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── CANCEL BOOKING ────────────────────────────────────────────────────────────
// ── CANCEL BOOKING ────────────────────────────────────────────────────────────
app.patch('/api/booking/:bookingId/cancel', async (req, res) => {
  const { userId } = req.body;
  try {
    await poolConnect;
    const check = await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .input('userId', sql.Int, userId)
      .query(`SELECT booking_id, venue_id, event_date, advance_paid
              FROM bookings
              WHERE booking_id = @bookingId AND user_id = @userId AND status != 'cancelled'`);
    if (check.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Booking not found or already cancelled.' });

    const { venue_id, event_date, advance_paid } = check.recordset[0];

    // Calculate days until event
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDay = new Date(event_date);
    eventDay.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((eventDay - today) / (1000 * 60 * 60 * 24));

    // Refund policy
    let refundPercent = 0;
    if (daysUntil > 7) refundPercent = 90;
    else if (daysUntil >= 5) refundPercent = 80;
    else if (daysUntil >= 3) refundPercent = 50;
    else if (daysUntil >= 1) refundPercent = 30;
    else refundPercent = 0;

    const refundAmount = parseFloat(((advance_paid * refundPercent) / 100).toFixed(2));

    await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .input('refundPercent', sql.Int, refundPercent)
      .input('refundAmount', sql.Decimal(12, 2), refundAmount)
      .query(`UPDATE bookings SET
                status         = 'cancelled',
                refund_percent = @refundPercent,
                refund_amount  = @refundAmount,
                refund_status  = 'pending',
                cancelled_at   = GETDATE()
              WHERE booking_id = @bookingId`);

    await pool.request()
      .input('venueId', sql.Int, venue_id)
      .input('eventDate', sql.Date, event_date)
      .query(`DELETE FROM venue_unavailable_dates
              WHERE venue_id = @venueId AND unavailable_date = @eventDate`);

    res.json({
      success: true,
      message: 'Booking cancelled successfully.',
      refundPercent,
      refundAmount,
      daysUntil,
    });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET CHAT MESSAGES ─────────────────────────────────────────────────────────
app.get('/api/chat/:bookingId', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .query(`
        SELECT m.message_id, m.sender, m.message, m.sent_at,
               m.message_type, m.image_data, u.username
        FROM chat_messages m
        JOIN users u ON u.user_id = m.user_id
        WHERE m.booking_id = @bookingId
        ORDER BY m.sent_at ASC
      `);
    res.json({ success: true, messages: result.recordset });
  } catch (err) {
    console.error('Chat fetch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── SEND CHAT MESSAGE ─────────────────────────────────────────────────────────
app.post('/api/chat/:bookingId', async (req, res) => {
  const { userId, message, messageType, imageData } = req.body;
  if (messageType === 'image' && !imageData)
    return res.status(400).json({ success: false, message: 'Image data is required.' });
  if (messageType !== 'image' && !message?.trim())
    return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
  try {
    await poolConnect;
    const check = await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .query(`SELECT booking_id FROM bookings WHERE booking_id = @bookingId`);
    if (check.recordset.length === 0)
      return res.status(403).json({ success: false, message: 'Booking not found.' });
    const insert = await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .input('userId', sql.Int, userId)
      .input('sender', sql.VarChar, 'customer')
      .input('message', sql.NVarChar(sql.MAX), messageType === 'image' ? '📷 Payment Screenshot' : message.trim())
      .input('messageType', sql.VarChar, messageType || 'text')
      .input('imageData', sql.NVarChar(sql.MAX), imageData || null)
      .query(`INSERT INTO chat_messages (booking_id, user_id, sender, message, message_type, image_data)
              OUTPUT INSERTED.message_id, INSERTED.sent_at
              VALUES (@bookingId, @userId, @sender, @message, @messageType, @imageData)`);

    // If image sent, confirm the booking
    if (messageType === 'image') {
      await pool.request()
        .input('bookingId', sql.Int, req.params.bookingId)
        .query(`UPDATE bookings SET status = 'confirmed' WHERE booking_id = @bookingId`);
    }
    res.json({
      success: true,
      message_id: insert.recordset[0].message_id,
      sent_at: insert.recordset[0].sent_at,
    });
  } catch (err) {
    console.error('Chat send error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── SUBMIT REVIEW ─────────────────────────────────────────────────────────────
app.post('/api/review', async (req, res) => {
  const { bookingId, userId, venueId, rating, reviewText } = req.body;
  if (!bookingId || !userId || !venueId || !rating)
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  try {
    await poolConnect;
    const check = await pool.request()
      .input('bookingId', sql.Int, bookingId)
      .input('userId', sql.Int, userId)
      .input('venueId', sql.Int, venueId)
      .query(`SELECT booking_id FROM bookings
              WHERE booking_id = @bookingId AND user_id = @userId
              AND venue_id = @venueId AND status = 'confirmed'
              AND event_date < CAST(GETDATE() AS DATE)`);
    if (check.recordset.length === 0)
      return res.status(403).json({ success: false, message: 'Not eligible to review this booking.' });
    await pool.request()
      .input('bookingId', sql.Int, bookingId)
      .input('userId', sql.Int, userId)
      .input('venueId', sql.Int, venueId)
      .input('rating', sql.Decimal(2, 1), rating)
      .input('reviewText', sql.NVarChar(sql.MAX), reviewText || null)
      .query(`INSERT INTO reviews (booking_id, user_id, venue_id, rating, review_text)
              VALUES (@bookingId, @userId, @venueId, @rating, @reviewText)`);
    await pool.request()
      .input('venueId', sql.Int, venueId)
      .query(`UPDATE venues SET
                rating       = (SELECT ROUND(AVG(CAST(rating AS FLOAT)), 1) FROM reviews WHERE venue_id = @venueId),
                review_count = (SELECT COUNT(*) FROM reviews WHERE venue_id = @venueId)
              WHERE venue_id = @venueId`);
    res.json({ success: true, message: 'Review submitted successfully!' });
  } catch (err) {
    if (err.message?.includes('uq_one_review_per_booking'))
      return res.status(409).json({ success: false, message: 'You have already reviewed this booking.' });
    console.error('Review error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET REVIEWS FOR A VENUE ───────────────────────────────────────────────────
app.get('/api/reviews/:venueId', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('venueId', sql.Int, req.params.venueId)
      .query(`SELECT r.review_id, r.rating, r.review_text, r.created_at,
                     u.username, b.event_type
              FROM reviews r
              JOIN users u    ON u.user_id    = r.user_id
              JOIN bookings b ON b.booking_id = r.booking_id
              WHERE r.venue_id = @venueId
              ORDER BY r.created_at DESC`);
    res.json({ success: true, reviews: result.recordset });
  } catch (err) {
    console.error('Reviews fetch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── CHECK IF BOOKING ALREADY REVIEWED ────────────────────────────────────────
app.get('/api/review/check/:bookingId', async (req, res) => {
  try {
    await poolConnect;
    const already = await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .query(`SELECT review_id FROM reviews WHERE booking_id = @bookingId`);
    res.json({ success: true, reviewed: already.recordset.length > 0 });
  } catch (err) {
    console.error('Review check error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── START SERVER ──────────────────────────────────────────────────────────────
async function startServer() {
  try {
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log('   POST /api/signup');
      console.log('   POST /api/login');
      console.log('   POST /api/booking');
      console.log('   POST /api/contact');
      console.log('   GET  /api/venues');
      console.log('   GET  /api/venues/search');
      console.log('   GET  /api/booking/unavailable/:venueId');
      console.log('   GET  /api/bookings/:userId');
      console.log('   PATCH /api/booking/:bookingId/cancel');
      console.log('   GET  /api/chat/:bookingId');
      console.log('   POST /api/chat/:bookingId');
      console.log('   POST /api/review');
      console.log('   GET  /api/reviews/:venueId');
      console.log('   GET  /api/review/check/:bookingId\n');
    });
    server.on('error', err => {
      if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${PORT} is busy. Run: taskkill /F /IM node.exe`);
        process.exit(1);
      }
    });
    await poolConnect;
    console.log('✅ Connected to MSSQL database');
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
