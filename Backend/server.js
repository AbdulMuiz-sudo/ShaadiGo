require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sql = require("mssql/msnodesqlv8");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true
}));

const config = {
  connectionString: "Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=shaadigo_db;UID=sa;PWD=123456;Encrypt=Yes;TrustServerCertificate=Yes"
};

let pool;
async function connectDB() {
  try {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log(" Connected to shaadigo_db database using ODBC Driver");
  } catch (e) {
    console.log(" Error Occurred", e);
    process.exit(1);
  }
}
connectDB();

// ── SIGNUP (Using Stored Procedure) ───────────────────────────────────────────
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
      .input('name', sql.VarChar, fullName)
      .input('email', sql.VarChar, email)
      .input('pass', sql.VarChar, password)
      .input('phone', sql.VarChar, phone || null)
      .input('role', sql.VarChar, role || 'customer')
      .execute('sp_register_user');

    res.json({ success: true, message: 'Account created successfully! You can now log in.' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── LOGIN (Using Stored Procedure) ────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required.' });

  try {
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .input('pass', sql.VarChar, password)
      .execute('sp_login_user');

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

// ── BOOKING (Using Stored Procedure) ──────────────────────────────────────────
app.post('/api/booking', async (req, res) => {
  const { userId, venueId, eventDate, advancePaid, termsId } = req.body;
  if (!userId || !venueId || !eventDate)
    return res.status(400).json({ success: false, message: 'User ID, Venue ID, and Event Date are required.' });

  try {
    const venueResult = await pool.request()
      .input('venueId', sql.Int, venueId)
      .query('SELECT venue_id FROM venues WHERE venue_id = @venueId');

    if (venueResult.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Venue not found.' });

    const insert = await pool.request()
      .input('uid', sql.Int, userId)
      .input('vid', sql.Int, venueId)
      .input('terms', sql.Int, termsId || null)
      .input('date', sql.Date, eventDate)
      .input('advance', sql.Decimal(10, 2), advancePaid || 0)
      .execute('sp_create_booking');

    const bookingId = insert.recordset[0].booking_id;
    res.json({
      success: true,
      message: 'Booking confirmed successfully!',
      bookingId
    });
  } catch (err) {
    console.error('Booking error:', err);
    if (err.number === 50001) {
      return res.status(409).json({ success: false, message: err.message });
    }
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

// ── SEARCH & FILTER VENUES ────────────────────────────────────────────────────
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
      .query('SELECT * FROM vw_venue_details WHERE venue_id = @venueId');

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

// ── CANCEL BOOKING (Using Stored Procedure) ───────────────────────────────────
app.patch('/api/booking/:bookingId/cancel', async (req, res) => {
  const { userId, reason } = req.body;
  try {
    const check = await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .input('userId', sql.Int, userId)
      .query(`SELECT booking_id FROM bookings
              WHERE booking_id = @bookingId AND user_id = @userId AND booking_status != 'cancelled'`);

    if (check.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Booking not found or already cancelled.' });

    await pool.request()
      .input('bid', sql.Int, req.params.bookingId)
      .input('uid', sql.Int, userId)
      .input('reason', sql.VarChar, reason || 'User requested cancellation')
      .execute('sp_cancel_booking');

    res.json({ success: true, message: 'Booking cancelled successfully. (Trigger will log this audit!)' });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── MESSAGING / CHAT ──────────────────────────────────────────────────────────
app.get('/api/chat/:bookingId', async (req, res) => {
  try {
    const result = await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .query(`
        SELECT m.*, u.full_name as sender_name 
        FROM messages m
        JOIN users u ON m.sender_id = u.user_id
        WHERE m.booking_id = @bookingId
        ORDER BY m.sent_at ASC
      `);

    res.json({ success: true, messages: result.recordset });
  } catch (err) {
    console.error("Chat GET Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/chat/:bookingId', async (req, res) => {
  const { userId, receiverId, message, messageType, imageData } = req.body;
  const bookingId = req.params.bookingId;

  const finalText = messageType === 'image' ? `[IMAGE]${imageData}` : message;

  try {
    const insert = await pool.request()
      .input('bookingId', sql.Int, bookingId)
      .input('senderId', sql.Int, userId)
      .input('receiverId', sql.Int, receiverId)
      .input('msgText', sql.VarChar(sql.MAX), finalText)
      .query(`
        INSERT INTO messages (booking_id, sender_id, receiver_id, message_text)
        OUTPUT INSERTED.message_id, INSERTED.sent_at
        VALUES (@bookingId, @senderId, @receiverId, @msgText)
      `);

    res.json({
      success: true,
      message_id: insert.recordset[0].message_id,
      sent_at: insert.recordset[0].sent_at
    });
  } catch (err) {
    console.error("Chat POST Error:", err);
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

// ── OWNER DASHBOARD: GET OWNER'S BOOKINGS ──────────────────────────────────────
app.get('/api/owner/bookings/:ownerId', async (req, res) => {
  try {
    const result = await pool.request()
      .input('ownerId', sql.Int, req.params.ownerId)
      .query(`
        SELECT b.*, v.venue_name, v.location, u.full_name as customer_name, u.phone as customer_phone
        FROM bookings b 
        JOIN venues v ON b.venue_id = v.venue_id 
        JOIN users u ON b.user_id = u.user_id
        WHERE v.owner_id = @ownerId
        ORDER BY b.created_at DESC
      `);
    res.json({ success: true, bookings: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── OWNER DASHBOARD: CONFIRM BOOKING & PAYMENT (Using Trigger) ────────────────
app.post('/api/owner/bookings/:bookingId/confirm', async (req, res) => {
  const { amount } = req.body; // Expect owner to submit the amount paid
  try {
    // The trg_auto_confirm_booking Trigger in SQL will automatically update the booking to 'confirmed'
    await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .input('amount', sql.Decimal(10, 2), amount || 0)
      .query(`INSERT INTO payments (booking_id, amount, payment_method, payment_status)
              VALUES (@bookingId, @amount, 'Manual Verification', 'paid')`);

    res.json({ success: true, message: 'Payment verified and booking auto-confirmed via Database Trigger!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── OWNER DASHBOARD: GET OWNER'S VENUES ──────────────────────────────────────
app.get('/api/owner/my-venues/:ownerId', async (req, res) => {
  try {
    const result = await pool.request()
      .input('ownerId', sql.Int, req.params.ownerId)
      .query(`
        SELECT v.*, 
          (SELECT COUNT(*) FROM bookings b WHERE b.venue_id = v.venue_id) as total_bookings
        FROM venues v
        WHERE v.owner_id = @ownerId
        ORDER BY v.venue_id DESC
      `);
    res.json({ success: true, venues: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── START SERVER ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`\n Server running on http://localhost:${PORT}`);
});