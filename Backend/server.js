require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sql = require("mssql/msnodesqlv8");

const app = express();

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Frontend is running on 3000
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true
}));

// ── DB CONFIG ─────────────────────────────────────────────────────────────────
const config = {
  connectionString: "Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=shaadigo_db;UID=sa;PWD=123456;Encrypt=Yes;TrustServerCertificate=Yes"
};

let pool;
async function connectDB() {
  try {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log("✅ Connected to shaadigo_db database using ODBC Driver");
  } catch (e) {
    console.log("❌ Error Occurred", e);
    process.exit(1);
  }
}
connectDB();

// ── SIGNUP ────────────────────────────────────────────────────────────────────
app.post('/api/signup', async (req, res) => {
  const { fullName, email, password, phone, role } = req.body;
  if (!fullName || !email || !password)
    return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
  if (password.length < 8)
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });

  try {
    const existing = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT user_id FROM users WHERE email = @email');

    if (existing.recordset.length > 0)
      return res.status(409).json({ success: false, message: 'Email already registered.' });

    await pool.request()
      .input('fullName', sql.VarChar, fullName)
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, password)
      .input('phone', sql.VarChar, phone || null)
      .input('role', sql.VarChar, role || 'customer')
      .query(`INSERT INTO users (full_name, email, password_hash, phone, role) 
              VALUES (@fullName, @email, @password, @phone, @role)`);

    res.json({ success: true, message: 'Account created successfully! You can now log in.' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required.' });

  try {
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, password)
      .query('SELECT user_id, full_name, role FROM users WHERE email = @email AND password_hash = @password');

    if (result.recordset.length === 0)
      return res.status(401).json({ success: false, message: 'Incorrect email or password.' });

    res.json({
      success: true,
      message: 'Login successful!',
      user: result.recordset[0]
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── BOOKING ───────────────────────────────────────────────────────────────────
app.post('/api/booking', async (req, res) => {
  const { userId, venueId, eventDate, advancePaid, termsId } = req.body;
  if (!userId || !venueId || !eventDate)
    return res.status(400).json({ success: false, message: 'User ID, Venue ID, and Event Date are required.' });

  try {
    const venueResult = await pool.request()
      .input('venueId', sql.Int, venueId)
      .query('SELECT venue_id, price_per_event FROM venues WHERE venue_id = @venueId');

    if (venueResult.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Venue not found.' });

    const conflict = await pool.request()
      .input('venueId', sql.Int, venueId)
      .input('eventDate', sql.Date, eventDate)
      .query(`SELECT booking_id FROM bookings 
              WHERE venue_id = @venueId AND event_date = @eventDate AND booking_status != 'cancelled'`);

    if (conflict.recordset.length > 0)
      return res.status(409).json({ success: false, message: 'This venue is already booked on that date.' });

    const insert = await pool.request()
      .input('userId', sql.Int, userId)
      .input('venueId', sql.Int, venueId)
      .input('termsId', sql.Int, termsId || null)
      .input('eventDate', sql.Date, eventDate)
      .input('advancePaid', sql.Decimal(10, 2), advancePaid || 0)
      .query(`INSERT INTO bookings (user_id, venue_id, terms_id, event_date, booking_status, advance_paid)
              OUTPUT INSERTED.booking_id
              VALUES (@userId, @venueId, @termsId, @eventDate, 'pending', @advancePaid)`);

    const bookingId = insert.recordset[0].booking_id;
    res.json({
      success: true,
      message: 'Booking confirmed successfully!',
      bookingId
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET VENUES ────────────────────────────────────────────────────────────────
app.get('/api/venues', async (req, res) => {
  try {
    const result = await pool.request()
      .query('SELECT * FROM vw_venue_details ORDER BY avg_rating DESC');
    res.json({ success: true, venues: result.recordset });
  } catch (err) {
    console.error('Venues error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── SEARCH & FILTER VENUES (MUST BE BEFORE /:venueId) ─────────────────────────
app.get('/api/venues/search', async (req, res) => {
  const { search, city, minPrice, maxPrice, minCapacity } = req.query;
  try {
    const request = pool.request();
    let query = `
      SELECT v.*, vw.avg_rating 
      FROM venues v
      LEFT JOIN vw_venue_details vw ON v.venue_id = vw.venue_id
      WHERE 1=1
    `;

    if (search) {
      query += ' AND (v.venue_name LIKE @search OR v.location LIKE @search OR v.description LIKE @search)';
      request.input('search', sql.VarChar, `%${search}%`);
    }
    if (city) {
      query += ' AND v.city = @city';
      request.input('city', sql.VarChar, city);
    }
    if (minPrice) {
      query += ' AND v.price_per_event >= @minPrice';
      request.input('minPrice', sql.Decimal(10, 2), parseFloat(minPrice));
    }
    if (maxPrice) {
      query += ' AND v.price_per_event <= @maxPrice';
      request.input('maxPrice', sql.Decimal(10, 2), parseFloat(maxPrice));
    }
    if (minCapacity) {
      query += ' AND v.capacity >= @minCapacity';
      request.input('minCapacity', sql.Int, parseInt(minCapacity));
    }

    const result = await request.query(query);
    res.json({ success: true, venues: result.recordset });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET VENUE DETAILS (SINGLE) ────────────────────────────────────────────────
app.get('/api/venues/:venueId', async (req, res) => {
  try {
    const venue = await pool.request()
      .input('venueId', sql.Int, req.params.venueId)
      .query('SELECT * FROM venues WHERE venue_id = @venueId');

    const images = await pool.request()
      .input('venueId', sql.Int, req.params.venueId)
      .query('SELECT image_url FROM venue_images WHERE venue_id = @venueId');

    const food = await pool.request()
      .input('venueId', sql.Int, req.params.venueId)
      .query('SELECT * FROM food_packages WHERE venue_id = @venueId');

    const decorations = await pool.request()
      .input('venueId', sql.Int, req.params.venueId)
      .query('SELECT * FROM decorations WHERE venue_id = @venueId');

    if (venue.recordset.length === 0) return res.status(404).json({ success: false, message: 'Venue not found' });

    res.json({
      success: true,
      venue: venue.recordset[0],
      images: images.recordset.map(i => i.image_url),
      foodPackages: food.recordset,
      decorations: decorations.recordset
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET BOOKED DATES FOR A VENUE ──────────────────────────────────────────────
app.get('/api/booking/unavailable/:venueId', async (req, res) => {
  try {
    const result = await pool.request()
      .input('venueId', sql.Int, req.params.venueId)
      .query(`SELECT CONVERT(varchar, event_date, 23) AS unavailable_date
              FROM bookings 
              WHERE venue_id = @venueId AND booking_status IN ('pending', 'confirmed')`);
    res.json({ success: true, dates: result.recordset.map(r => r.unavailable_date) });
  } catch (err) {
    console.error('Unavailable dates error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET USER BOOKINGS ─────────────────────────────────────────────────────────
app.get('/api/bookings/:userId', async (req, res) => {
  try {
    const result = await pool.request()
      .input('userId', sql.Int, req.params.userId)
      .query(`
        SELECT b.booking_id, v.venue_name, b.event_date, b.booking_status, b.advance_paid, b.created_at
        FROM bookings b
        JOIN venues v ON b.venue_id = v.venue_id
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
app.patch('/api/booking/:bookingId/cancel', async (req, res) => {
  const { userId, reason } = req.body;
  try {
    const check = await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .input('userId', sql.Int, userId)
      .query(`SELECT booking_id, advance_paid 
              FROM bookings
              WHERE booking_id = @bookingId AND user_id = @userId AND booking_status != 'cancelled'`);

    if (check.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Booking not found or already cancelled.' });

    await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .query(`UPDATE bookings SET booking_status = 'cancelled' WHERE booking_id = @bookingId`);

    await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .input('userId', sql.Int, userId)
      .input('reason', sql.VarChar, reason || 'User requested cancellation')
      .query(`INSERT INTO cancelled_bookings (booking_id, cancelled_by, cancel_reason) 
              VALUES (@bookingId, @userId, @reason)`);

    res.json({ success: true, message: 'Booking cancelled successfully.' });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── MESSAGING / CHAT ──────────────────────────────────────────────────────────
app.get('/api/messages/:userId/:receiverId', async (req, res) => {
  try {
    const result = await pool.request()
      .input('u1', sql.Int, req.params.userId)
      .input('u2', sql.Int, req.params.receiverId)
      .query(`
        SELECT m.message_id, m.sender_id, m.receiver_id, m.message_text, m.sent_at, u.full_name as sender_name
        FROM messages m
        JOIN users u ON m.sender_id = u.user_id
        WHERE (m.sender_id = @u1 AND m.receiver_id = @u2)
           OR (m.sender_id = @u2 AND m.receiver_id = @u1)
        ORDER BY m.sent_at ASC
      `);
    res.json({ success: true, messages: result.recordset });
  } catch (err) {
    console.error('Messages fetch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  const { senderId, receiverId, messageText } = req.body;
  if (!senderId || !receiverId || !messageText)
    return res.status(400).json({ success: false, message: 'Sender, Receiver, and Message text required.' });

  try {
    const insert = await pool.request()
      .input('senderId', sql.Int, senderId)
      .input('receiverId', sql.Int, receiverId)
      .input('messageText', sql.VarChar, messageText)
      .query(`INSERT INTO messages (sender_id, receiver_id, message_text)
              OUTPUT INSERTED.message_id, INSERTED.sent_at
              VALUES (@senderId, @receiverId, @messageText)`);

    res.json({
      success: true,
      message_id: insert.recordset[0].message_id,
      sent_at: insert.recordset[0].sent_at,
    });
  } catch (err) {
    console.error('Message send error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── SUPPORT TICKETS ───────────────────────────────────────────────────────────
app.post('/api/support', async (req, res) => {
  const { userId, subject, message } = req.body;
  if (!userId || !message)
    return res.status(400).json({ success: false, message: 'User ID and message are required.' });

  try {
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('subject', sql.VarChar, subject || 'General Inquiry')
      .input('message', sql.VarChar, message)
      .query(`INSERT INTO support_tickets (user_id, subject, message)
              VALUES (@userId, @subject, @message)`);

    res.json({ success: true, message: 'Support ticket submitted successfully.' });
  } catch (err) {
    console.error('Support ticket error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── REVIEWS ───────────────────────────────────────────────────────────────────
app.post('/api/review', async (req, res) => {
  const { userId, venueId, rating, comment } = req.body;
  if (!userId || !venueId || !rating)
    return res.status(400).json({ success: false, message: 'Missing required fields.' });

  try {
    const check = await pool.request()
      .input('userId', sql.Int, userId)
      .input('venueId', sql.Int, venueId)
      .query(`SELECT booking_id FROM bookings
              WHERE user_id = @userId AND venue_id = @venueId AND booking_status IN ('confirmed', 'completed')`);

    if (check.recordset.length === 0)
      return res.status(403).json({ success: false, message: 'You must have a confirmed booking to leave a review.' });

    await pool.request()
      .input('userId', sql.Int, userId)
      .input('venueId', sql.Int, venueId)
      .input('rating', sql.Int, rating)
      .input('comment', sql.VarChar, comment || null)
      .query(`INSERT INTO reviews (user_id, venue_id, rating, comment)
              VALUES (@userId, @venueId, @rating, @comment)`);

    res.json({ success: true, message: 'Review submitted successfully!' });
  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/reviews/:venueId', async (req, res) => {
  try {
    const result = await pool.request()
      .input('venueId', sql.Int, req.params.venueId)
      .query(`SELECT r.review_id, r.rating, r.comment, r.created_at, u.full_name
              FROM reviews r
              JOIN users u ON u.user_id = r.user_id
              WHERE r.venue_id = @venueId
              ORDER BY r.created_at DESC`);
    res.json({ success: true, reviews: result.recordset });
  } catch (err) {
    console.error('Reviews fetch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── START SERVER ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log('   POST  /api/signup');
  console.log('   POST  /api/login');
  console.log('   POST  /api/booking');
  console.log('   GET   /api/venues');
  console.log('   GET   /api/venues/search');
  console.log('   GET   /api/venues/:venueId');
  console.log('   GET   /api/booking/unavailable/:venueId');
  console.log('   GET   /api/bookings/:userId');
  console.log('   PATCH /api/booking/:bookingId/cancel');
  console.log('   GET   /api/messages/:userId/:receiverId');
  console.log('   POST  /api/messages');
  console.log('   POST  /api/support');
  console.log('   POST  /api/review');
  console.log('   GET   /api/reviews/:venueId\n');
});