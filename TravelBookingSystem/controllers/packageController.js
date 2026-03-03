const db = require('../config/db');

const getAllPackages = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM package');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPackageById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM package WHERE package_id = ?', [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Package not found' });
        }

        const [events] = await db.query('SELECT activity_name FROM package_events WHERE package_id = ?', [req.params.id]);

        res.json({ ...rows[0], events });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createPackage = async (req, res) => {
    try {
        const { package_id, title, base_price, duration, description, destination, party_size, events } = req.body;

        await db.query(
            'INSERT INTO package (package_id, title, base_price, duration, description, destination, party_size) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [package_id, title, base_price, duration, description, destination, party_size]
        );

        if (events && events.length > 0) {
            for (const event of events) {
                await db.query(
                    'INSERT INTO package_events (package_id, activity_name) VALUES (?, ?)',
                    [package_id, event]
                );
            }
        }

        res.status(201).json({ message: 'Package created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePackage = async (req, res) => {
    try {
        const { title, base_price, duration, description, destination, party_size, events } = req.body;

        await db.query(
            'UPDATE package SET title = ?, base_price = ?, duration = ?, description = ?, destination = ?, party_size = ? WHERE package_id = ?',
            [title, base_price, duration, description, destination, party_size, req.params.id]
        );

        await db.query('DELETE FROM package_events WHERE package_id = ?', [req.params.id]);

        if (events && events.length > 0) {
            for (const event of events) {
                await db.query(
                    'INSERT INTO package_events (package_id, activity_name) VALUES (?, ?)',
                    [req.params.id, event]
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
        await db.query('DELETE FROM package_events WHERE package_id = ?', [req.params.id]);
        await db.query('DELETE FROM package WHERE package_id = ?', [req.params.id]);

        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllPackages, getPackageById, createPackage, updatePackage, deletePackage };
