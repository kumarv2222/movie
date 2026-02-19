const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// DATABASE CONFIG
const AIVEN_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

if (!AIVEN_URL) {
    console.warn('⚠️ WARNING: DATABASE_URL is not set in environment variables!');
}

const pool = new Pool({
    connectionString: AIVEN_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
});

// Helper to ensure table exists
const ensureTable = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                uid SERIAL PRIMARY KEY,
                uname TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    } finally {
        client.release();
    }
};

const query = async (text, params) => {
    try {
        await ensureTable(); // Ensure the table is ready
        return await pool.query(text, params);
    } catch (err) {
        console.error('❌ Database Query Error:', err.message);
        throw err;
    }
};

app.get('/api/users', async (req, res) => {
    try {
        const result = await query('SELECT uid, uname, email, phone, created_at FROM users ORDER BY created_at DESC', []);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users', detail: err.message });
    }
});

app.post('/api/register', async (req, res) => {
    const { uname, email, phone, password } = req.body;
    if (!uname || !email || !password) {
        return res.status(400).json({ error: 'Name, Email and Password are required' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await query(
            'INSERT INTO users (uname, email, phone, password) VALUES ($1, $2, $3, $4)',
            [uname, email, phone, hashedPassword]
        );
        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        const isDuplicate = err.code === '23505' || err.message?.includes('UNIQUE');
        res.status(400).json({
            error: isDuplicate ? 'This email is already registered.' : 'Registration failed',
            detail: err.message
        });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and Password are required' });
    }
    try {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ uid: user.uid }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { uname: user.uname, email: user.email } });
    } catch (err) {
        console.error('Login Route Error:', err.message);
        res.status(500).json({ error: 'Internal Server Error', detail: err.message });
    }
});

// For Vercel, we export the app
module.exports = app;
