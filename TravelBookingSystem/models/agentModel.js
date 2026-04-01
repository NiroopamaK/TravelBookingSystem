const db = require('../config/db');

// ================= PACKAGES =================

const countPackagesByAgent = async (userId) => {
    const [[{ total }]] = await db.query(
        'SELECT COUNT(*) AS total FROM packages WHERE user_id = ?',
        [userId]
    );
    return total;
};

const findPackagesByAgent = async (userId, limit, offset) => {
    const [rows] = await db.query(
        'SELECT * FROM packages WHERE user_id = ? LIMIT ? OFFSET ?',
        [userId, limit, offset]
    );
    return rows;
};

const findPackageById = async (packageId) => {
    const [rows] = await db.query(
        'SELECT * FROM packages WHERE package_id = ?',
        [packageId]
    );
    return rows[0] || null;
};

const findItineraryByPackageId = async (packageId) => {
    const [items] = await db.query(
        'SELECT * FROM itinerary_items WHERE package_id = ?',
        [packageId]
    );
    return items;
};

const insertPackage = async (userId, title, destination, start_date, end_date, description, created_on, price) => {
    const [result] = await db.query(
        'INSERT INTO packages (user_id, title, destination, start_date, end_date, description, created_on, price) VALUES (?,?,?,?,?,?,?,?)',
        [userId, title, destination, start_date, end_date, description, created_on, price]
    );
    return result.insertId;
};

const insertItineraryItem = async (title, description, packageId) => {
    await db.query(
        'INSERT INTO itinerary_items (title, description, package_id) VALUES (?, ?, ?)',
        [title, description, packageId]
    );
};

const updatePackageById = async (packageId, title, destination, start_date, end_date, description, price) => {
    await db.query(
        'UPDATE packages SET title=?, destination=?, start_date=?, end_date=?, description=?, price=? WHERE package_id=?',
        [title, destination, start_date, end_date, description, price, packageId]
    );
};

const deleteItineraryByPackageId = async (packageId) => {
    await db.query('DELETE FROM itinerary_items WHERE package_id = ?', [packageId]);
};

const deletePackageById = async (packageId) => {
    await db.query('DELETE FROM packages WHERE package_id = ?', [packageId]);
};

// ================= BOOKINGS =================

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

    const [[{ total }]] = await db.query(`
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
        JOIN users u ON b.user_id = u.user_id
        JOIN packages p ON b.package_id = p.package_id
        WHERE ${conditions.join(' AND ')}
        LIMIT ? OFFSET ?
    `, [...params, limit, offset]);
    return rows;
};

const findTravellerSuggestions = async (userId, q) => {
    const [rows] = await db.query(`
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
    const [rows] = await db.query(`
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
    const [result] = await db.query(
        'UPDATE bookings SET status = ? WHERE booking_id = ?',
        [status, bookingId]
    );
    return result.affectedRows;
};

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
    countPackagesByAgent,
    findPackagesByAgent,
    findPackageById,
    findItineraryByPackageId,
    insertPackage,
    insertItineraryItem,
    updatePackageById,
    deleteItineraryByPackageId,
    deletePackageById,
    countBookingsByAgent,
    findBookingsByAgent,
    findTravellerSuggestions,
    findPackageSuggestions,
    updateBookingStatusById,
    findMostUsedPackage,
    getTotalRevenue,
    findTopTraveller,
    countTotalPackages,
    countTotalTrips,
    countConfirmedBookings,
    countTripsByAgent,
    findTripsByAgent,
};
