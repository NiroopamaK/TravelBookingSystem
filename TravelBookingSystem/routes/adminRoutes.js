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


module.exports = router;