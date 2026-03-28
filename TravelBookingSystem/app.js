const express = require('express');
const session = require('express-session');
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
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// set up pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/propics', express.static('public/assets/propics'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60
  }
}));

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

//login page
app.get('/', (req, res) => res.render('index'));
//sign up page
app.get('/signup', (req, res) => res.render('signup'));

// Pages
app.get('/', (req, res) => res.render('index'));
app.get('/signup', (req, res) => res.render('signup'));
app.get('/dashboard', (req, res) => res.render('dashboard'));

// admin-pages
app.get('/admin/adminDashboard', (req, res) => res.render('admin/adminDashboard'));
app.get('/admin/packages', (req, res) => res.render('admin/packages'));
app.get('/admin/users', (req, res) => res.render('admin/users'));

// agent - pages
app.get('/agent/packages', (req, res) => res.render('travelAgent/packages'));
app.get('/agent/bookings', (req, res) => res.render('travelAgent/bookings'));
app.get('/agent/agentDashboard', (req, res) => res.render('travelAgent/agentDashboard'));

// traveller-pages
app.get('/traveller/dashboard', (req, res) => res.render('traveller/traveller_dashboard'));
app.get('/traveller/explore', (req, res) => res.render('traveller/traveller_explore'));
app.get('/traveller/booking/:package_id', (req, res) => res.render('traveller/traveller_booking'));

// Routes
app.use('/', profileRoutes);              
app.use('/api/auth', authRoutes);
app.use('/api/email', emailVerificationRoutes);
app.use('/api/agent', agentRoutes);
app.use('/traveller', travellerRoutes);   
app.use('/bookings', bookingRoutes); 
app.use("/api/admin", adminRoutes);     

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5555;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));