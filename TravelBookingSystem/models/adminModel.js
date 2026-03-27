const db = require('../config/db');

const getDashboardStats = async () => {
    const [rows] = await db.query(`
        SELECT
            (SELECT COUNT(*) FROM packages) AS packages,
            (SELECT COUNT(*) FROM bookings) AS bookings,
            (SELECT COUNT(*) FROM users WHERE role='TRAVEL_AGENT') AS travel_agents,
            (SELECT COUNT(*) FROM users WHERE role='TRAVELLER') AS travellers
    `);
    return rows[0];
};

const getAllUsers = async () => {
    const [rows] = await db.query(`
        SELECT user_id, email, role, first_name, last_name,
               passport, address, telephone
        FROM users
    `);
    return rows;
};

const getAllBookings = async () => {
    const [rows] = await db.query(`
        SELECT 
            b.booking_id,
            u.first_name,
            u.last_name,
            p.title AS package_title,
            b.packsize,
            b.total_price,
            b.status
        FROM bookings b
        JOIN users u ON b.user_id = u.user_id
        JOIN packages p ON b.package_id = p.package_id
    `);
    return rows;
};

const getAllPackages = async () => {
    const [rows] = await db.query(`
        SELECT 
            p.package_id,
            p.title,
            p.destination,
            p.description,
            p.price,
            u.first_name AS agent_first_name,
            u.last_name AS agent_last_name
        FROM packages p
        JOIN users u ON p.user_id = u.user_id
    `);
    return rows;
};

const getPackageSummary = async (month, year) => {
    const [rows] = await db.query(`
        SELECT DAY(created_on) as day, COUNT(*) as count
        FROM packages
        WHERE MONTH(created_on)=? AND YEAR(created_on)=?
        GROUP BY DAY(created_on)
        ORDER BY day
    `, [month, year]);
    return rows;
};

const getBookingSummary = async (month, year) => {
    const [rows] = await db.query(`
        SELECT DAY(created_on) as day, COUNT(*) as count
        FROM bookings
        WHERE MONTH(created_on)=? AND YEAR(created_on)=?
        GROUP BY DAY(created_on)
        ORDER BY day
    `, [month, year]);
    return rows;
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    getAllBookings,
    getAllPackages,
    getPackageSummary,
    getBookingSummary
};