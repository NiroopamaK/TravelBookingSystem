const pool = require('../config/db');

const createBooking = async (booking) => {
  const { user_id, package_id, packsize, additional_notes, created_on,total_price, status } = booking;

  const [result] = await pool.execute(
    'INSERT INTO bookings (user_id, package_id, packsize, additional_notes,created_on, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [user_id, package_id, packsize, additional_notes,created_on, total_price, status]
  );

  return result;
};

const getAllBookingsByUser = async (user_id) => {
  const [rows] = await pool.execute('SELECT * FROM bookings WHERE user_id = ?', [user_id]);
  return rows;
};

module.exports = { createBooking, getAllBookingsByUser };