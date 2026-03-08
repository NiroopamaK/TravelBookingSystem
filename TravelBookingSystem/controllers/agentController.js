const db = require('../config/db');

// ===== PACKAGES =====

const getAllPackages = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM packages');
        res.json(rows);
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
        const { title, destination, start_date, end_date, description, price, itinerary_items } = req.body;

        const [result] = await db.query(
            'INSERT INTO packages (title, destination, start_date, end_date, description, price) VALUES (?, ?, ?, ?, ?, ?)',
            [title, destination, start_date, end_date, description, price]
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
        const [rows] = await db.query('SELECT * FROM bookings');
        res.json(rows);
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

// ===== CUSTOMERS =====

const getAllCustomers = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT user_id, first_name, last_name, email, passport, address, telephone FROM users WHERE role = ?',
            ['TRAVELLER']
        );
        res.json(rows);
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
    getAllCustomers,
};
