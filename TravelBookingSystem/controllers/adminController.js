// controllers/adminController.js
const adminModel = require('../models/adminModel');

// DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
    try {
        const stats = await adminModel.getDashboardStats();
        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
    try {
        const users = await adminModel.getAllUsers();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};

// GET ALL BOOKINGS
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await adminModel.getAllBookings();
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};

// GET ALL PACKAGES
exports.getAllPackages = async (req, res) => {
    try {
        const packages = await adminModel.getAllPackages();
        res.json(packages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};

// PACKAGE SUMMARY BY DAY
exports.getPackageSummary = async (req, res) => {
    const { month, year } = req.query;
    try {
        const summary = await adminModel.getPackageSummary(month, year);
        res.json(summary);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};

// BOOKING SUMMARY BY DAY
exports.getBookingSummary = async (req, res) => {
    const { month, year } = req.query;
    try {
        const summary = await adminModel.getBookingSummary(month, year);
        res.json(summary);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};