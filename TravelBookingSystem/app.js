// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const db = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// -----------------------
// Routes
// -----------------------

// Test route
app.get('/test', (req, res) => {
  res.send('Server working');
});

// DB test route
app.get('/db_test/printdata', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    console.log(rows);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database query failed', error: err.message });
  }
});

// Auth routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));