const db = require('../config/db');

// ===== AGENT PROFILE =====

const jwt = require('jsonwebtoken');


// ===== PACKAGES =====

const getAllPackages = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const page  = Math.max(1, parseInt(req.query.page)  || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const offset = (page - 1) * limit;

        const [[{ total }]] = await db.query(
            'SELECT COUNT(*) AS total FROM packages WHERE user_id = ?',
            [decoded.user_id]
        );
        const [rows] = await db.query(
            'SELECT * FROM packages WHERE user_id = ? LIMIT ? OFFSET ?',
            [decoded.user_id, limit, offset]
        );

        res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPackageById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM packages WHERE package_id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Package not found' });

        const [items] = await db.query('SELECT * FROM itinerary_items WHERE package_id = ?', [req.params.id]);
        res.json({ ...rows[0], itinerary_items: items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createPackage = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { title, destination, start_date, end_date, description, created_on, price, itinerary_items } = req.body;

        const [result] = await db.query(
            'INSERT INTO packages (user_id, title, destination, start_date, end_date, description,created_on, price) VALUES (?,?, ?, ?, ?, ?, ?, ?)',
            [decoded.user_id, title, destination, start_date, end_date, description, created_on,price]
        );

        const package_id = result.insertId;

        if (itinerary_items && itinerary_items.length > 0) {
            for (const item of itinerary_items) {
                await db.query(
                    'INSERT INTO itinerary_items (title, description, package_id) VALUES (?, ?, ?)',
                    [item.title, item.description, package_id]
                );
            }
        }

        res.status(201).json({ message: 'Package created successfully', package_id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePackage = async (req, res) => {
    try {
        const { title, destination, start_date, end_date, description, price, itinerary_items } = req.body;

        await db.query(
            'UPDATE packages SET title = ?, destination = ?, start_date = ?, end_date = ?, description = ?, price = ? WHERE package_id = ?',
            [title, destination, start_date, end_date, description, price, req.params.id]
        );

        // Replace itinerary items
        await db.query('DELETE FROM itinerary_items WHERE package_id = ?', [req.params.id]);

        if (itinerary_items && itinerary_items.length > 0) {
            for (const item of itinerary_items) {
                await db.query(
                    'INSERT INTO itinerary_items (title, description, package_id) VALUES (?, ?, ?)',
                    [item.title, item.description, req.params.id]
                );
            }
        }

        res.json({ message: 'Package updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deletePackage = async (req, res) => {
    try {
        // itinerary_items cascade deletes via FK, but explicit for clarity
        await db.query('DELETE FROM packages WHERE package_id = ?', [req.params.id]);
        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===== BOOKINGS =====

const getAllBookings = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const page  = Math.max(1, parseInt(req.query.page)  || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const offset = (page - 1) * limit;

        const [[{ total }]] = await db.query(`
            SELECT COUNT(*) AS total
            FROM bookings b
            JOIN packages p ON b.package_id = p.package_id
            WHERE p.user_id = ?
        `, [decoded.user_id]);

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
        `, [decoded.user_id, limit, offset]);

        res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const [result] = await db.query(
            'UPDATE bookings SET status = ? WHERE booking_id = ?',
            [status, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ message: 'Booking not found' });

        res.json({ message: 'Booking status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===== TRIPS (bookings joined with packages + users) =====

const getTrips = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const page  = Math.max(1, parseInt(req.query.page)  || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const offset = (page - 1) * limit;

        const [[{ total }]] = await db.query(`
            SELECT COUNT(*) AS total
            FROM bookings b
            JOIN packages p ON b.package_id = p.package_id
            WHERE p.user_id = ?
        `, [decoded.user_id]);

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
        `, [decoded.user_id, limit, offset]);

        res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const [[{ totalPackages }]] = await db.query(
            'SELECT COUNT(*) AS totalPackages FROM packages WHERE user_id = ?',
            [decoded.user_id]
        );
        const [[{ totalTrips }]] = await db.query(`
            SELECT COUNT(*) AS totalTrips
            FROM bookings b
            JOIN packages p ON b.package_id = p.package_id
            WHERE p.user_id = ?
        `, [decoded.user_id]);
        const [[{ confirmedBookings }]] = await db.query(`
            SELECT COUNT(*) AS confirmedBookings
            FROM bookings b
            JOIN packages p ON b.package_id = p.package_id
            WHERE p.user_id = ? AND b.status = 'CONFIRMED'
        `, [decoded.user_id]);

        res.json({ totalPackages, totalTrips, confirmedBookings });
    } catch (error) {
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
