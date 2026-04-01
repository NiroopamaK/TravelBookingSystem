const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { authenticateSession, authorizeRoles } = require('../services/authService');

router.use(authenticateSession, authorizeRoles('TRAVEL_AGENT'));

// Packages
router.get('/packages', agentController.getAllPackages);
router.get('/packages/:id', agentController.getPackageById);
router.post('/packages', agentController.createPackage);
router.put('/packages/:id', agentController.updatePackage);
router.delete('/packages/:id', agentController.deletePackage);

// Bookings
router.get('/bookings', agentController.getAllBookings);
router.get('/bookings/suggestions/travellers', agentController.getTravellerSuggestions);
router.get('/bookings/suggestions/packages',   agentController.getPackageSuggestions);
router.put('/bookings/:id/status', agentController.updateBookingStatus);

// Dashboard stats & trips
router.get('/dashboard-stats', agentController.getDashboardStats);
router.get('/dashboard-summary', agentController.getDashboardSummary);
router.get('/trips', agentController.getTrips);

module.exports = router;
