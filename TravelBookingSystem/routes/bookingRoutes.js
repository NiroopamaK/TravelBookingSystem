const express = require('express');
const router = express.Router();
const { createBooking, getAllBookingsByUser } = require('../controllers/bookingController');

router.post('/createBooking', createBooking);
router.get('/getBookingsByUser/:user_id', getAllBookingsByUser);

module.exports = router;