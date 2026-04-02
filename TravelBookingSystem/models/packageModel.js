const pool = require('../config/db');

async function getPackages() {
  const [packages] = await pool.execute('SELECT * FROM packages;');
  return packages;
}

async function getPackageById(packageId) {
  const [rows] = await pool.execute('SELECT * FROM packages WHERE package_id = ? LIMIT 1;', [packageId]);
  return rows[0];
}

const countPackagesByAgent = async (userId) => {
  const [[{ total }]] = await pool.execute(
    'SELECT COUNT(*) AS total FROM packages WHERE user_id = ?',
    [userId]
  );
  return total;
};

const findPackagesByAgent = async (userId, limit, offset) => {
  const [rows] = await pool.query(
    'SELECT * FROM packages WHERE user_id = ? LIMIT ? OFFSET ?',
    [userId, limit, offset]
  );
  return rows;
};

const findPackageById = async (packageId) => {
  const [rows] = await pool.execute(
    'SELECT * FROM packages WHERE package_id = ?',
    [packageId]
  );
  return rows[0] || null;
};

const findItineraryByPackageId = async (packageId) => {
  const [items] = await pool.execute(
    'SELECT * FROM itinerary_items WHERE package_id = ?',
    [packageId]
  );
  return items;
};

const insertPackage = async (userId, title, destination, start_date, end_date, description, created_on, price) => {
  const [result] = await pool.execute(
    'INSERT INTO packages (user_id, title, destination, start_date, end_date, description, created_on, price) VALUES (?,?,?,?,?,?,?,?)',
    [userId, title, destination, start_date, end_date, description, created_on, price]
  );
  return result.insertId;
};

const insertItineraryItem = async (title, description, packageId) => {
  await pool.execute(
    'INSERT INTO itinerary_items (title, description, package_id) VALUES (?, ?, ?)',
    [title, description, packageId]
  );
};

const updatePackageById = async (packageId, title, destination, start_date, end_date, description, price) => {
  await pool.execute(
    'UPDATE packages SET title=?, destination=?, start_date=?, end_date=?, description=?, price=? WHERE package_id=?',
    [title, destination, start_date, end_date, description, price, packageId]
  );
};

const deleteItineraryByPackageId = async (packageId) => {
  await pool.execute('DELETE FROM itinerary_items WHERE package_id = ?', [packageId]);
};

const deletePackageById = async (packageId) => {
  await pool.execute('DELETE FROM packages WHERE package_id = ?', [packageId]);
};

module.exports = {
  getPackages,
  getPackageById,
  countPackagesByAgent,
  findPackagesByAgent,
  findPackageById,
  findItineraryByPackageId,
  insertPackage,
  insertItineraryItem,
  updatePackageById,
  deleteItineraryByPackageId,
  deletePackageById,
};
