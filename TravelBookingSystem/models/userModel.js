const pool = require('../config/db');

// CREATE USER
const createUser = async (user) => {
  const { email, role, first_name, last_name, passport, address, telephone, password } = user;

  const [result] = await pool.execute(
    `INSERT INTO users 
      (email, role, first_name, last_name, passport, address, telephone, password) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [email, role, first_name, last_name, passport, address, telephone, password]
  );

  return result;
};

// FIND ONE USER (for login)
const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows[0];
};

// FIND USER (for reset password existence check)
const findUserByEmailFull = async (email) => {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows;
};

// UPDATE PASSWORD
const updatePasswordByEmail = async (email, hashedPassword) => {
  const [result] = await pool.execute(
    'UPDATE users SET password = ? WHERE email = ?',
    [hashedPassword, email]
  );
  return result;
};

// ================= PROFILE / SESSION-BASED OPERATIONS =================

// GET USER BY ID
const getUserById = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT email, role, first_name, last_name, passport, address, telephone, profile_picture
     FROM users
     WHERE user_id = ?`,
    [userId]
  );
  return rows[0] || null;
};

// UPDATE USER PROFILE
const updateUserProfile = async (userId, { first_name, last_name, address, telephone }) => {
  const [result] = await pool.execute(
    `UPDATE users
     SET first_name = ?, last_name = ?, address = ?, telephone = ?
     WHERE user_id = ?`,
    [first_name, last_name, address, telephone, userId]
  );
  return result;
};

// UPDATE USER PASSWORD
const updateUserPassword = async (userId, hashedPassword) => {
  const [result] = await pool.execute(
    `UPDATE users
     SET password = ?
     WHERE user_id = ?`,
    [hashedPassword, userId]
  );
  return result;
};

// GET PROFILE PICTURE
const getProfilePicture = async (userId) => {
  const [rows] = await pool.execute(
    'SELECT profile_picture FROM users WHERE user_id = ?',
    [userId]
  );
  return rows[0]?.profile_picture || null;
};

// UPDATE PROFILE PICTURE
const updateProfilePicture = async (userId, imagePath) => {
  const [result] = await pool.execute(
    'UPDATE users SET profile_picture = ? WHERE user_id = ?',
    [imagePath, userId]
  );
  return result;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserByEmailFull,
  updatePasswordByEmail,
  getUserById,
  updateUserProfile,
  updateUserPassword,
  getProfilePicture,
  updateProfilePicture
};