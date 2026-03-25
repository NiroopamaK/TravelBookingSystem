const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");


// DASHBOARD STATS
router.get("/stats", adminController.getDashboardStats);


// VIEW USERS
router.get("/users", adminController.getAllUsers);


// VIEW BOOKINGS
router.get("/bookings", adminController.getAllBookings);


// VIEW PACKAGES
router.get("/packages", adminController.getAllPackages);

// PACKAGE SUMMARY
router.get("/package-summary", adminController.getPackageSummary);

// BOOKING SUMMARY
router.get("/booking-summary", adminController.getBookingSummary);


module.exports = router;