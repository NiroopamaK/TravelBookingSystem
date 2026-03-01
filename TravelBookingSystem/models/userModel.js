const pool = require('./db');

const createUser = async (user) => {
  const {   email, role, first_name, last_name, passport, address, telephone, password   } = user;
  const [result] = await pool.execute(
    'INSERT INTO users (  email, role, first_name, last_name, passport, address, telephone, password  ) VALUES (?,?, ?, ?, ?, ?, ?, ?)',
    [email, role, first_name, last_name, passport, address, telephone, password]
  );
  return result;
};

const findUserByEmail = async (email) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

module.exports = { createUser, findUserByEmail };