const express = require('express');
const router = express.Router();
const { createBooking, getAllBookingsByUser, getBookingDetails } = require('../controllers/bookingController');

router.post('/createBooking', createBooking);
router.get('/getBookingsByUser', getAllBookingsByUser);
router.get('/getBookingDetails', getBookingDetails);

module.exports = router;