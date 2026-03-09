const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

// Packages
router.get('/packages', agentController.getAllPackages);
router.get('/packages/:id', agentController.getPackageById);
router.post('/packages', agentController.createPackage);
router.put('/packages/:id', agentController.updatePackage);
router.delete('/packages/:id', agentController.deletePackage);

// Bookings
router.get('/bookings', agentController.getAllBookings);
router.put('/bookings/:id/status', agentController.updateBookingStatus);

// Customers
router.get('/customers', agentController.getAllCustomers);

// Dashboard stats & trips
router.get('/dashboard-stats', agentController.getDashboardStats);
router.get('/trips', agentController.getTrips);

module.exports = router;
