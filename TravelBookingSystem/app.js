const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const emailVerificationRoutes = require('./routes/emailVerificationRoutes');
const agentRoutes = require('./routes/agentRoutes');
const travellerRoutes = require('./routes/travellerRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// set up pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

//login page
app.get('/', (req, res) => {
  res.render('index');
});

//sign up page
app.get('/signup', (req, res) => {
  res.render('signup');
});

//dashboard
app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

//Admin - analytics
app.get('/analytics', (req, res) => {
  res.render('admin/analytics');
});

//Admin - packages
app.get('/packages', (req, res) => {
  res.render('admin/packages');
});

//Admin - users
app.get('/users', (req, res) => {
  res.render('admin/users');
});

//Agent - packages
app.get('/agent/packages', (req, res) => {
  res.render('travelAgent/packages');
});

//Agent - bookings
app.get('/agent/bookings', (req, res) => {
  res.render('travelAgent/bookings');
});

//Agent - customers
app.get('/agent/customers', (req, res) => {
  res.render('travelAgent/customers');
});
// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Pages
app.get('/', (req, res) => res.render('index'));
app.get('/signup', (req, res) => res.render('signup'));
app.get('/dashboard', (req, res) => res.render('dashboard'));
//admin-pages
// admin-pages
app.get('/admin/adminDashboard', (req, res) => res.render('admin/adminDashboard'));
app.get('/admin/packages', (req, res) => res.render('admin/packages'));
app.get('/admin/users', (req, res) => res.render('admin/users'));

// traveller-pages
app.get('/traveller/dashboard', (req, res) => res.render('traveller/trav_dashboard'));
app.get('/traveller/dashboard', (req, res) => res.render('traveller/traveller_dashboard'));
app.get('/traveller/explore', (req, res) => res.render('traveller/traveller_explore'));
app.get('/traveller/booking', (req, res) => res.render('traveller/traveller_booking'));

// travel-agent-pages
app.get('/agent/agentDashboard', (req, res) => res.render('travelAgent/agentDashboard'));

// Routes
app.use('/', profileRoutes);              
app.use('/api/auth', authRoutes);
app.use('/api/email', emailVerificationRoutes);
app.use('/api/agent', agentRoutes);
app.use('/traveller', travellerRoutes);   
app.use('/bookings', bookingRoutes);      

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