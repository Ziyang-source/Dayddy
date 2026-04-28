const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;
const DB_NAME = 'dayddy_cloud.sqlite';

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database(DB_NAME, (err) => {
    if (err) console.error(err.message);
    console.log('Cloud Database Ready');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )`);
});

// GET endpoint to view all registered users
app.get('/api/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});

// POST endpoint for registration
app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
    
    const sql = `INSERT INTO users (email, password) VALUES (?, ?)`;
    db.run(sql, [email, password], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Email already exists' });
        }
        res.status(201).json({ 
            message: 'Registration successful! Data synced to cloud.', 
            id: this.lastID 
        });
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
});