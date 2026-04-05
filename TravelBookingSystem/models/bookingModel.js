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

const countBookingsByAgent = async (userId, filterTraveller, filterPackage, filterStatus) => {
  const conditions = ['p.user_id = ?'];
  const params = [userId];

  if (filterTraveller) {
    conditions.push("CONCAT(u.first_name, ' ', u.last_name) LIKE ?");
    params.push(`%${filterTraveller}%`);
  }
  if (filterPackage) {
    conditions.push('p.title LIKE ?');
    params.push(`%${filterPackage}%`);
  }
  if (filterStatus) {
    conditions.push('b.status = ?');
    params.push(filterStatus);
  }

  const [[{ total }]] = await pool.query(`
    SELECT COUNT(*) AS total
    FROM bookings b
    JOIN users u ON b.user_id = u.user_id
    JOIN packages p ON b.package_id = p.package_id
    WHERE ${conditions.join(' AND ')}
  `, params);
  return total;
};

const findBookingsByAgent = async (userId, filterTraveller, filterPackage, filterStatus, limit, offset) => {
  const conditions = ['p.user_id = ?'];
  const params = [userId];

  if (filterTraveller) {
    conditions.push("CONCAT(u.first_name, ' ', u.last_name) LIKE ?");
    params.push(`%${filterTraveller}%`);
  }
  if (filterPackage) {
    conditions.push('p.title LIKE ?');
    params.push(`%${filterPackage}%`);
  }
  if (filterStatus) {
    conditions.push('b.status = ?');
    params.push(filterStatus);
  }

  const [rows] = await pool.query(`
    SELECT
      CONCAT('TRP-', LPAD(b.booking_id, 4, '0')) AS trip_id,
      b.booking_id,
      p.title AS package_name,
      CONCAT(u.first_name, ' ', u.last_name) AS traveller,
      p.start_date,
      p.end_date,
      b.total_price AS cost,
      b.status
    FROM bookings b
    JOIN users u ON b.user_id = u.user_id
    JOIN packages p ON b.package_id = p.package_id
    WHERE ${conditions.join(' AND ')}
    LIMIT ? OFFSET ?
  `, [...params, limit, offset]);
  return rows;
};

const findTravellerSuggestions = async (userId, q) => {
  const [rows] = await pool.query(`
    SELECT DISTINCT CONCAT(u.first_name, ' ', u.last_name) AS name
    FROM bookings b
    JOIN users u ON b.user_id = u.user_id
    JOIN packages p ON b.package_id = p.package_id
    WHERE p.user_id = ?
      AND CONCAT(u.first_name, ' ', u.last_name) LIKE ?
    ORDER BY name
    LIMIT 10
  `, [userId, `%${q}%`]);
  return rows.map(r => r.name);
};

const findPackageSuggestions = async (userId, q) => {
  const [rows] = await pool.query(`
    SELECT DISTINCT p.title AS name
    FROM bookings b
    JOIN packages p ON b.package_id = p.package_id
    WHERE p.user_id = ?
      AND p.title LIKE ?
    ORDER BY name
    LIMIT 10
  `, [userId, `%${q}%`]);
  return rows.map(r => r.name);
};

const updateBookingStatusById = async (bookingId, status) => {
  const [result] = await pool.execute(
    'UPDATE bookings SET status = ? WHERE booking_id = ?',
    [status, bookingId]
  );
  return result.affectedRows;
};

module.exports = {
  createBooking,
  getAllBookingsByUser,
  countBookingsByAgent,
  findBookingsByAgent,
  findTravellerSuggestions,
  findPackageSuggestions,
  updateBookingStatusById,
};