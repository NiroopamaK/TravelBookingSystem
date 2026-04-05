const db = require('../config/db');

// ================= DASHBOARD =================

const findMostUsedPackage = async (userId) => {
    const [rows] = await db.query(`
        SELECT p.package_id, p.title, p.destination, p.start_date, p.end_date,
               p.price, p.description, p.created_on,
               COUNT(b.booking_id) AS completed_count
        FROM bookings b
        JOIN packages p ON b.package_id = p.package_id
        WHERE p.user_id = ? AND b.status = 'COMPLETED'
        GROUP BY p.package_id
        ORDER BY completed_count DESC
        LIMIT 1
    `, [userId]);
    return rows[0] || null;
};

const getTotalRevenue = async (userId) => {
    const [[{ total_revenue }]] = await db.query(`
        SELECT COALESCE(SUM(b.total_price), 0) AS total_revenue
        FROM bookings b
        JOIN packages p ON b.package_id = p.package_id
        WHERE p.user_id = ? AND b.status = 'COMPLETED'
    `, [userId]);
    return total_revenue;
};

const findTopTraveller = async (userId) => {
    const [rows] = await db.query(`
        SELECT CONCAT(u.first_name, ' ', u.last_name) AS traveller_name,
               COUNT(b.booking_id) AS trip_count
        FROM bookings b
        JOIN users u ON b.user_id = u.user_id
        JOIN packages p ON b.package_id = p.package_id
        WHERE p.user_id = ? AND b.status = 'COMPLETED'
        GROUP BY u.user_id
        ORDER BY trip_count DESC
        LIMIT 1
    `, [userId]);
    return rows[0] || null;
};

const countTotalPackages = async (userId) => {
    const [[{ totalPackages }]] = await db.query(
        'SELECT COUNT(*) AS totalPackages FROM packages WHERE user_id = ?',
        [userId]
    );
    return totalPackages;
};

const countTotalTrips = async (userId) => {
    const [[{ totalTrips }]] = await db.query(`
        SELECT COUNT(*) AS totalTrips
        FROM bookings b
        JOIN packages p ON b.package_id = p.package_id
        WHERE p.user_id = ?
    `, [userId]);
    return totalTrips;
};

const countConfirmedBookings = async (userId) => {
    const [[{ confirmedBookings }]] = await db.query(`
        SELECT COUNT(*) AS confirmedBookings
        FROM bookings b
        JOIN packages p ON b.package_id = p.package_id
        WHERE p.user_id = ? AND b.status = 'CONFIRMED'
    `, [userId]);
    return confirmedBookings;
};

// ================= TRIPS =================

const countTripsByAgent = async (userId) => {
    const [[{ total }]] = await db.query(`
        SELECT COUNT(*) AS total
        FROM bookings b
        JOIN packages p ON b.package_id = p.package_id
        WHERE p.user_id = ?
    `, [userId]);
    return total;
};

const findTripsByAgent = async (userId, limit, offset) => {
    const [rows] = await db.query(`
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
        JOIN packages p ON b.package_id = p.package_id
        JOIN users u ON b.user_id = u.user_id
        WHERE p.user_id = ?
        LIMIT ? OFFSET ?
    `, [userId, limit, offset]);
    return rows;
};

module.exports = {
    findMostUsedPackage,
    getTotalRevenue,
    findTopTraveller,
    countTotalPackages,
    countTotalTrips,
    countConfirmedBookings,
    countTripsByAgent,
    findTripsByAgent,
};
