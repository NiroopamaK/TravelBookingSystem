const db = require('../config/db');

// ================= PACKAGES =================
const getAllPackages = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const page   = Math.max(1, parseInt(req.query.page)  || 1);
        const limit  = Math.max(1, parseInt(req.query.limit) || 10);
        const offset = (page - 1) * limit;

        const [[{ total }]] = await db.query(
            'SELECT COUNT(*) AS total FROM packages WHERE user_id = ?',
            [userId]
        );

        const [rows] = await db.query(
            'SELECT * FROM packages WHERE user_id = ? LIMIT ? OFFSET ?',
            [userId, limit, offset]
        );

        res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('getAllPackages error:', error);
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
        console.error('getPackageById error:', error);
        res.status(500).json({ message: error.message });
    }
};

const createPackage = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { title, destination, start_date, end_date, description, created_on, price, itinerary_items } = req.body;

        const [result] = await db.query(
            'INSERT INTO packages (user_id, title, destination, start_date, end_date, description, created_on, price) VALUES (?,?,?,?,?,?,?,?)',
            [userId, title, destination, start_date, end_date, description, created_on, price]
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
        console.error('createPackage error:', error);
        res.status(500).json({ message: error.message });
    }
};

const updatePackage = async (req, res) => {
    try {
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

        res.json({ message: 'Package updated successfully' });
    } catch (error) {
        console.error('updatePackage error:', error);
        res.status(500).json({ message: error.message });
    }
};

const deletePackage = async (req, res) => {
    try {
        await db.query('DELETE FROM packages WHERE package_id = ?', [req.params.id]);
        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        console.error('deletePackage error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ================= BOOKINGS =================
const getAllBookings = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const page   = Math.max(1, parseInt(req.query.page)  || 1);
        const limit  = Math.max(1, parseInt(req.query.limit) || 10);
        const offset = (page - 1) * limit;

        const filterTraveller = req.query.traveller || '';
        const filterPackage   = req.query.package   || '';
        const filterStatus    = req.query.status    || '';

        const filterConditions = ['p.user_id = ?'];
        const filterParams     = [userId];

        if (filterTraveller) {
            filterConditions.push("CONCAT(u.first_name, ' ', u.last_name) LIKE ?");
            filterParams.push(`%${filterTraveller}%`);
        }
        if (filterPackage) {
            filterConditions.push('p.title LIKE ?');
            filterParams.push(`%${filterPackage}%`);
        }
        if (filterStatus) {
            filterConditions.push('b.status = ?');
            filterParams.push(filterStatus);
        }

        const whereClause = filterConditions.join(' AND ');

        const [[{ total }]] = await db.query(`
            SELECT COUNT(*) AS total
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            JOIN packages p ON b.package_id = p.package_id
            WHERE ${whereClause}
        `, filterParams);

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
            WHERE ${whereClause}
            LIMIT ? OFFSET ?
        `, [...filterParams, limit, offset]);

        res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('getAllBookings error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getTravellerSuggestions = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const q = req.query.q || '';

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

        res.json(rows.map(r => r.name));
    } catch (error) {
        console.error('getTravellerSuggestions error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getPackageSuggestions = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const q = req.query.q || '';

        const [rows] = await db.query(`
            SELECT DISTINCT p.title AS name
            FROM bookings b
            JOIN packages p ON b.package_id = p.package_id
            WHERE p.user_id = ?
              AND p.title LIKE ?
            ORDER BY name
            LIMIT 10
        `, [userId, `%${q}%`]);

        res.json(rows.map(r => r.name));
    } catch (error) {
        console.error('getPackageSuggestions error:', error);
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
        console.error('updateBookingStatus error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ================= DASHBOARD SUMMARY =================
const getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [pkgRows] = await db.query(`
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
        const mostUsedPackage = pkgRows[0] || null;

        let itinerary_items = [];
        if (mostUsedPackage) {
            const [items] = await db.query(
                'SELECT * FROM itinerary_items WHERE package_id = ?',
                [mostUsedPackage.package_id]
            );
            itinerary_items = items;
        }

        const [[{ total_revenue }]] = await db.query(`
            SELECT COALESCE(SUM(b.total_price), 0) AS total_revenue
            FROM bookings b
            JOIN packages p ON b.package_id = p.package_id
            WHERE p.user_id = ? AND b.status = 'COMPLETED'
        `, [userId]);

        const [travRows] = await db.query(`
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
        const topTraveller = travRows[0] || null;

        res.json({
            mostUsedPackage: mostUsedPackage ? { ...mostUsedPackage, itinerary_items } : null,
            totalRevenue: total_revenue,
            topTraveller
        });
    } catch (error) {
        console.error('getDashboardSummary error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ================= TRIPS =================
const getTrips = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const page   = Math.max(1, parseInt(req.query.page)  || 1);
        const limit  = Math.max(1, parseInt(req.query.limit) || 10);
        const offset = (page - 1) * limit;

        const [[{ total }]] = await db.query(`
            SELECT COUNT(*) AS total
            FROM bookings b
            JOIN packages p ON b.package_id = p.package_id
            WHERE p.user_id = ?
        `, [userId]);

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

        res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('getTrips error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ================= DASHBOARD STATS =================
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.user_id;

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
    getTravellerSuggestions,
    getPackageSuggestions,
    updateBookingStatus,
    getTrips,
    getDashboardStats,
    getDashboardSummary,
};
