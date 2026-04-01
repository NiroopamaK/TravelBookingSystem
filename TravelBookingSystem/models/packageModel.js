const pool = require('../config/db');

async function getPackages() {
  const [packages] = await pool.execute('SELECT * FROM packages;');
  return packages;
}

async function getPackageById(packageId) {
  const [rows] = await pool.execute('SELECT * FROM packages WHERE package_id = ? LIMIT 1;', [packageId]);
  return rows[0];
}

const getPackageByIdWithItinerary = async (packageId) => {
  // Get package
  const [rows] = await pool.query(
    'SELECT * FROM packages WHERE package_id = ?',
    [packageId]
  );

  if (rows.length === 0) return null;

  // Get itinerary items
  const [items] = await pool.query(
    'SELECT * FROM itinerary_items WHERE package_id = ?',
    [packageId]
  );

  return {
    ...rows[0],
    itinerary_items: items
  };
};

module.exports = { getPackages, getPackageById, getPackageByIdWithItinerary};