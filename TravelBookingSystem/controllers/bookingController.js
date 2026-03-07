const bookingModel = require('../models/bookingModel');

// POST /bookings/createBooking
async function createBooking(req, res) {
  try {
    const booking = req.body;
    const result = await bookingModel.createBooking(booking);

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: result
    });
  } catch (error) {
    console.error('Create Booking Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
}

// GET /bookings/getBookingsByUser/:user_id
async function getAllBookingsByUser(req, res) {
  try {
    const { user_id } = req.params;
    const bookings = await bookingModel.getAllBookingsByUser(user_id);

    return res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Get Bookings Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
}

module.exports = { createBooking, getAllBookingsByUser };