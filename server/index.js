const express = require('express');
const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// ─── DATABASE CONFIG ──────────────────────────────────────────

// DATABASE CONFIG
const AIVEN_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

let dbMode = 'AIVEN';
const pool = new Pool({
    connectionString: AIVEN_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
});

// Local SQLite Fallback
const localDb = new sqlite3.Database('./database.sqlite');

const initDb = async () => {
    console.log('[DB] Checking Aiven Connection...');
    try {
        const client = await pool.connect();
        console.log('✅ DATABASE: AIVEN CLOUD ACTIVE');
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
        client.release();
    } catch (err) {
        console.error('⚠️ Aiven Connection Failed (Timeout/Firewall). Switching to LOCAL DB.');
        dbMode = 'LOCAL';
        localDb.serialize(() => {
            localDb.run(`
                CREATE TABLE IF NOT EXISTS users (
                    uid INTEGER PRIMARY KEY AUTOINCREMENT,
                    uname TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    phone TEXT,
                    password TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
        });
        console.log('✅ DATABASE: LOCAL SQLITE ACTIVE (Self-Healing Mode)');
    }
};
initDb();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Get All Users (For Admin View)
app.get('/api/users', async (req, res) => {
    try {
        const result = await query('SELECT uid, uname, email, phone, created_at FROM users ORDER BY created_at DESC', []);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// ─── HELPER FUNCTIONS ──────────────────────────────────────────

const query = async (text, params) => {
    try {
        if (dbMode === 'AIVEN') {
            try {
                return await pool.query(text, params);
            } catch (err) {
                const connErrors = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', '57P01'];
                if (connErrors.some(code => err.code?.includes(code) || err.message?.includes(code))) {
                    console.error('⚠️ Aiven Connection Issue. Falling back to local.');
                } else {
                    // It's a data error (like duplicate email), don't fall back, just throw
                    throw err;
                }
            }
        }

        return new Promise((resolve, reject) => {
            const sqliteText = text.replace(/\$/g, '?');
            const method = text.startsWith('SELECT') ? 'all' : 'run';
            localDb[method](sqliteText, params, function (err, rows) {
                if (err) {
                    console.error('❌ Local DB Error:', err.message);
                    reject(err);
                } else {
                    resolve({ rows: rows || [], lastID: this.lastID });
                }
            });
        });
    } catch (criticalErr) {
        throw criticalErr;
    }
};

// ─── ROUTES ──────────────────────────────────────────────────

app.post('/api/register', async (req, res) => {
    const { uname, email, phone, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await query(
            'INSERT INTO users (uname, email, phone, password) VALUES ($1, $2, $3, $4)',
            [uname, email, phone, hashedPassword]
        );
        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        console.error('Registration Route Error:', err);
        const isDuplicate = err.code === '23505' || err.message?.includes('UNIQUE');
        res.status(400).json({
            error: isDuplicate ? 'This email is already registered.' : 'Registration failed. Please check your data.'
        });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ uid: user.uid || user.lastID }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { uname: user.uname, email: user.email } });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} [${dbMode} MODE]`));
