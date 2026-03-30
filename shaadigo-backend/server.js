const express = require('express');
const cors = require('cors');
const sql = require('mssql');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// 1. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 2. MSSQL CONFIGURATION
const dbConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'shaadigo_db',
    server: process.env.DB_SERVER || 'localhost',
    port: Number(process.env.DB_PORT) || 1433,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERT !== 'false'
    }
};

// Connect to MSSQL
const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log(`✅ Connected to MSSQL: ${dbConfig.database}`);
        return pool;
    })
    .catch(err => console.log('❌ Database Connection Failed! Bad Config: ', err));

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "abcd";

// --- API Endpoints ---

// LOGIN
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (email === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        return res.status(200).json({
            message: "Admin login successful",
            user: { fullName: "Admin", email: ADMIN_USERNAME, role: "admin", id: 0 },
            token: "mock-admin-token-123"
        });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, password)
            .query(`
                SELECT user_id, full_name, email, role
                FROM users
                WHERE email = @email AND password_hash = @password
            `);

        const user = result.recordset[0];

        if (user) {
            return res.status(200).json({
                message: "User login successful",
                user: {
                    id: user.user_id,
                    fullName: user.full_name,
                    email: user.email,
                    role: user.role || "customer"
                },
                token: "mock-user-token-456"
            });
        }
        res.status(401).json({ message: "Invalid credentials." });
    } catch (err) {
        res.status(500).json({ error: "Server error during login", details: err.message });
    }
});

// REGISTER
app.post('/api/register', async (req, res) => {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'Full name, email, and password are required.' });
    }

    try {
        const pool = await poolPromise;
        const existingUser = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT user_id FROM users WHERE email = @email');

        if (existingUser.recordset.length > 0) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }

        await pool.request()
            .input('fullName', sql.VarChar, fullName)
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, password)
            .input('phone', sql.VarChar, phone || null)
            .query(`
                INSERT INTO users (full_name, email, password_hash, phone, role)
                VALUES (@fullName, @email, @password, @phone, 'customer')
            `);

        res.status(201).json({ message: "Profile created successfully" });
    } catch (err) {
        res.status(400).json({ error: "Registration failed", details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
