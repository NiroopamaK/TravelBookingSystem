const db = require('../config/db');

// ================= PACKAGES =================
const getAllPackages = async (req, res) => {
    try {
        const userId = req.session.user?.user_id;
        console.log('getAllPackages | session userId:', userId);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const page  = Math.max(1, parseInt(req.query.page)  || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const offset = (page - 1) * limit;

        console.log(`getAllPackages | page: ${page}, limit: ${limit}, offset: ${offset}`);

        const [[{ total }]] = await db.query(
            'SELECT COUNT(*) AS total FROM packages WHERE user_id = ?',
            [userId]
        );
        console.log('getAllPackages | total packages:', total);

        const [rows] = await db.query(
            'SELECT * FROM packages WHERE user_id = ? LIMIT ? OFFSET ?',
            [userId, limit, offset]
        );
        console.log('getAllPackages | rows fetched:', rows.length);

        res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('getAllPackages error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getPackageById = async (req, res) => {
    try {
        console.log('getPackageById | package_id:', req.params.id);
        const [rows] = await db.query('SELECT * FROM packages WHERE package_id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Package not found' });

        const [items] = await db.query('SELECT * FROM itinerary_items WHERE package_id = ?', [req.params.id]);
        console.log('getPackageById | itinerary items:', items.length);

        res.json({ ...rows[0], itinerary_items: items });
    } catch (error) {
        console.error('getPackageById error:', error);
        res.status(500).json({ message: error.message });
    }
};

const createPackage = async (req, res) => {
    try {
        const userId = req.session.user?.user_id;
        console.log('createPackage | session userId:', userId);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { title, destination, start_date, end_date, description, created_on, price, itinerary_items } = req.body;
        console.log('createPackage | payload:', req.body);

        const [result] = await db.query(
            'INSERT INTO packages (user_id, title, destination, start_date, end_date, description, created_on, price) VALUES (?,?,?,?,?,?,?,?)',
            [userId, title, destination, start_date, end_date, description, created_on, price]
        );
        console.log('createPackage | insert result:', result);

        const package_id = result.insertId;
        if (itinerary_items && itinerary_items.length > 0) {
            for (const item of itinerary_items) {
                await db.query(
                    'INSERT INTO itinerary_items (title, description, package_id) VALUES (?, ?, ?)',
                    [item.title, item.description, package_id]
                );
            }
            console.log('createPackage | inserted itinerary items count:', itinerary_items.length);
        }

        res.status(201).json({ message: 'Package created successfully', package_id });
    } catch (error) {
        console.error('createPackage error:', error);
        res.status(500).json({ message: error.message });
    }
};

const updatePackage = async (req, res) => {
    try {
        console.log('updatePackage | package_id:', req.params.id, 'payload:', req.body);
        const { title, destination, start_date, end_date, description, price, itinerary_items } = req.body;

        await db.query(
            'UPDATE packages SET title=?, destination=?, start_date=?, end_date=?, description=?, price=? WHERE package_id=?',
            [title, destination, start_date, end_date, description, price, req.params.id]
        );

        await db.query('DELETE FROM itinerary_items WHERE package_id = ?', [req.params.id]);
        if (itinerary_items && itinerary_items.length > 0) {
            for (const item of itinerary_items) {
                await db.query(
                    'INSERT INTO itinerary_items (title, description, package_id) VALUES (?, ?, ?)',
                    [item.title, item.description, req.params.id]
                );
            }
        }

        console.log('updatePackage | updated successfully');
        res.json({ message: 'Package updated successfully' });
    } catch (error) {
        console.error('updatePackage error:', error);
        res.status(500).json({ message: error.message });
    }
};

const deletePackage = async (req, res) => {
    try {
        console.log('deletePackage | package_id:', req.params.id);
        await db.query('DELETE FROM packages WHERE package_id = ?', [req.params.id]);
        console.log('deletePackage | deleted successfully');
        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        console.error('deletePackage error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ================= BOOKINGS =================
const getAllBookings = async (req, res) => {
    try {
        const userId = req.session.user?.user_id;
        console.log('getAllBookings | session userId:', userId);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const page  = Math.max(1, parseInt(req.query.page)  || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const offset = (page - 1) * limit;
        console.log(`getAllBookings | page: ${page}, limit: ${limit}, offset: ${offset}`);

        const [[{ total }]] = await db.query(`
            SELECT COUNT(*) AS total
            FROM bookings b
            JOIN packages p ON b.package_id = p.package_id
            WHERE p.user_id = ?
        `, [userId]);
        console.log('getAllBookings | total bookings:', total);

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
            WHERE p.user_id = ?
            LIMIT ? OFFSET ?
        `, [userId, limit, offset]);
        console.log('getAllBookings | rows fetched:', rows.length);

        res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('getAllBookings error:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        console.log('updateBookingStatus | booking_id:', req.params.id, 'payload:', req.body);
        const { status } = req.body;
        const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const [result] = await db.query(
            'UPDATE bookings SET status = ? WHERE booking_id = ?',
            [status, req.params.id]
        );
        console.log('updateBookingStatus | affectedRows:', result.affectedRows);

        if (result.affectedRows === 0) return res.status(404).json({ message: 'Booking not found' });

        res.json({ message: 'Booking status updated successfully' });
    } catch (error) {
        console.error('updateBookingStatus error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ================= TRIPS =================
const getTrips = async (req, res) => {
    try {
        const userId = req.session.user?.user_id;
        console.log('getTrips | session userId:', userId);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const page  = Math.max(1, parseInt(req.query.page)  || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const offset = (page - 1) * limit;
        console.log(`getTrips | page: ${page}, limit: ${limit}, offset: ${offset}`);

        const [[{ total }]] = await db.query(`
            SELECT COUNT(*) AS total
            FROM bookings b
            JOIN packages p ON b.package_id = p.package_id
            WHERE p.user_id = ?
        `, [userId]);
        console.log('getTrips | total trips:', total);

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
        console.log('getTrips | rows fetched:', rows.length);

        res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('getTrips error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ================= DASHBOARD =================
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.session.user?.user_id;
        console.log('getDashboardStats | session userId:', userId);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const [[{ totalPackages }]] = await db.query(
            'SELECT COUNT(*) AS totalPackages FROM packages WHERE user_id = ?',
            [userId]
        );
        const [[{ totalTrips }]] = await db.query(`
            SELECT COUNT(*) AS totalTrips
            FROM bookings b
            JOIN packages p ON b.package_id = p.package_id
            WHERE p.user_id = ?
        `, [userId]);
        const [[{ confirmedBookings }]] = await db.query(`
            SELECT COUNT(*) AS confirmedBookings
            FROM bookings b
            JOIN packages p ON b.package_id = p.package_id
            WHERE p.user_id = ? AND b.status = 'CONFIRMED'
        `, [userId]);

        console.log('getDashboardStats | totalPackages:', totalPackages, 'totalTrips:', totalTrips, 'confirmedBookings:', confirmedBookings);
        res.json({ totalPackages, totalTrips, confirmedBookings });
    } catch (error) {
        console.error('getDashboardStats error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllPackages,
    getPackageById,
    createPackage,
    updatePackage,
    deletePackage,
    getAllBookings,
    updateBookingStatus,
    getTrips,
    getDashboardStats,
};