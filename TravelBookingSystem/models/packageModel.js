const pool = require('../config/db');

async function getPackages() {
  const [packages] = await pool.execute('SELECT * FROM packages;');
  return packages;
}

async function getPackageById(packageId) {
  const [rows] = await pool.execute('SELECT * FROM packages WHERE package_id = ? LIMIT 1;', [packageId]);
  return rows[0];
}

module.exports = { getPackages, getPackageById };