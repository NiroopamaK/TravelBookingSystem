const db = require('../config/db');
const bookingModel = require('../models/bookingModel');

// CREATE BOOKING
const createBooking = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { package_id, packsize, additional_notes, total_price } = req.body;

    if (!package_id) {
      return res.status(400).json({ success: false, message: "Package ID is required" });
    }

    const booking = {
      user_id: user.user_id,
      package_id: Number(package_id),
      packsize: Number(packsize) || 1,
      additional_notes: additional_notes || "",
      created_on: new Date().toISOString().slice(0, 10),
      total_price: Number(total_price) || 0,
      status: "PENDING"
    };

    const result = await bookingModel.createBooking(booking);

    res.status(201).json({ success: true, data: result });

  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET BOOKINGS BY USER
// GET /bookings/getBookingsByUser
const getAllBookingsByUser = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const bookings = await bookingModel.getAllBookingsByUser(user.user_id);
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET BOOKINGS BY USER WITH PACKAGE DETAILS
// GET /bookings/getBookingDetails
const getBookingDetails = async (req,res) => {
  try {
    const userId = req.session.user?.user_id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const query = `
      SELECT 
        b.booking_id,
        b.package_id,
        b.packsize,
        b.total_price,
        b.status,
        b.created_on,
        p.title AS package_name,
        p.destination
      FROM bookings b
      JOIN packages p 
        ON b.package_id = p.package_id
      WHERE b.user_id = ?
      ORDER BY b.created_on DESC
    `;

    const [rows] = await db.execute(query, [userId]);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error("Error fetching bookings:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = { createBooking, getAllBookingsByUser, getBookingDetails };