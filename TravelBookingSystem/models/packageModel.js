const pool = require('../config/db');

async function getPackages(){
    const [packages] = await pool.execute('SELECT * FROM packages;')
    return packages;
}
module.exports = {getPackages}