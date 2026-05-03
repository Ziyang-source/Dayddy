const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
const PORT = 5001; 
const DB_NAME = 'dayddy_cloud.sqlite';

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    if (req.method === 'POST') console.log('Payload:', req.body);
    next();
});

const db = new sqlite3.Database(DB_NAME, (err) => {
    if (err) console.error(err.message);
    console.log('✅ Cloud Database Ready');
});

db.serialize(() => {
    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user'
    )`);

    // Tasks Table
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        due_time TEXT,
        priority TEXT DEFAULT 'medium',
        tag TEXT DEFAULT 'general',
        reminder INTEGER DEFAULT 1,
        completed INTEGER DEFAULT 0
    )`);

    // Events Table
    db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        event_date TEXT,
        event_time TEXT,
        tag TEXT DEFAULT 'general',
        reminder INTEGER DEFAULT 1,
        notes TEXT
    )`);

    const adminEmail = 'admin@dayddy.com';
    const adminPass = 'admin123';

    db.get(`SELECT * FROM users WHERE email = ?`, [adminEmail], async (err, row) => {
        if (!row) {
            const hashedPassword = await bcrypt.hash(adminPass, 10);
            db.run(
                `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
                ['Dayddy Admin', adminEmail, hashedPassword, 'admin']
            );
            console.log('✨ Default Admin Account Created: admin@dayddy.com');
        }
    });
});

app.get('/api/users', (req, res) => {
    db.all('SELECT id, username, email, role FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

app.post('/api/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!row) return res.status(404).json({ error: 'Oops! This email is not registered with Dayddy.' });
        res.status(200).json({ message: 'User found, reset link simulated.' });
    });
});

app.post('/api/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        db.run(`UPDATE users SET password = ? WHERE email = ?`, [hashedPassword, email], function(err) {
            if (err) return res.status(500).json({ error: "Update failed" });
            res.status(200).json({ message: "Success" });
        });
    } catch (e) { res.status(500).json({ error: "Error" }); }
});

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'username, email and password are required' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
        db.run(sql, [username, email, hashedPassword], function(err) {
            if (err) return res.status(500).json({ error: 'Email already exists' });
            res.status(201).json({ 
                message: 'Registration successful!', 
                id: this.lastID,
                user: { id: this.lastID, username, email, role: 'user' }
            });
        });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], async (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: 'User not found' });
        try {
            const isMatch = await bcrypt.compare(password, row.password);
            if (isMatch) {
                res.status(200).json({ 
                    message: 'Login successful!', 
                    user: { id: row.id, email: row.email, username: row.username, role: row.role } 
                });
            } else {
                res.status(401).json({ error: 'Invalid password' });
            }
        } catch (error) { res.status(500).json({ error: 'Server error' }); }
    });
});

app.get('/api/tasks', (req, res) => {
    const { user_id } = req.query;
    db.all('SELECT * FROM tasks WHERE user_id = ?', [user_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows || []);
    });
});

app.get('/api/events', (req, res) => {
    const { user_id } = req.query;
    db.all('SELECT * FROM events WHERE user_id = ?', [user_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows || []);
    });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Dayddy Backend running on http://0.0.0.0:${PORT}`);
});