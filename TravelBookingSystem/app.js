const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const emailVerificationRoutes = require('./routes/emailVerificationRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/email', emailVerificationRoutes);

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5555;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));