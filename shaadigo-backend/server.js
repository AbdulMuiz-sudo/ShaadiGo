const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const PORT = 5000;

// 1. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 2. MSSQL CONFIGURATION
const dbConfig = {
    user: 'sa',
    password: '123456',
    database: 'shaadigodb',
    server: 'localhost',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, // Use true for Azure
        trustServerCertificate: true // Change to false for production
    }
};

// Connect to MSSQL
const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('✅ Connected to MSSQL: shaadigo');
        return pool;
    })
    .catch(err => console.log('❌ Database Connection Failed! Bad Config: ', err));

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "abcd";

// --- API Endpoints ---

// LOGIN
app.post('/api/login', async (req, res) => {
    const { forename, password } = req.body;

    if (forename === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        return res.status(200).json({
            message: "Admin login successful",
            user: { forename: "Admin", role: "admin" },
            token: "mock-admin-token-123"
        });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('forename', sql.VarChar, forename)
            .input('password', sql.VarChar, password)
            .query('SELECT id, forename, surname FROM Users WHERE forename = @forename AND password = @password');

        const user = result.recordset[0];

        if (user) {
            return res.status(200).json({
                message: "User login successful",
                user: { forename: user.forename, surname: user.surname, role: "user", id: user.id },
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
    const { forename, surname, password } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('forename', sql.VarChar, forename)
            .input('surname', sql.VarChar, surname)
            .input('password', sql.VarChar, password)
            .query('INSERT INTO Users (forename, surname, password, role) VALUES (@forename, @surname, @password, \'user\')');

        res.status(201).json({ message: "Profile created successfully" });
    } catch (err) {
        res.status(400).json({ error: "Registration failed", details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});