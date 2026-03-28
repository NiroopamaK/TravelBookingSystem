const bcrypt = require('bcryptjs');

const {
  createUser,
  findUserByEmail,
  findUserByEmailFull,
  updatePasswordByEmail
} = require('../models/userModel');

// REGISTER LOGIC
const registerUser = async (userData) => {
  const {
    email, role, first_name, last_name,
    passport, address, telephone, password
  } = userData;

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await createUser({
    email,
    role,
    first_name,
    last_name,
    passport,
    address,
    telephone,
    password: hashedPassword
  });

  return result;
};

// LOGIN LOGIC
const loginUser = async (email, password) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  return {
    user: {
      user_id: user.user_id,
      role: user.role,
      first_name: user.first_name
    }
  };
};

// RESET PASSWORD LOGIC
const resetUserPassword = async (email, password) => {
  const users = await findUserByEmailFull(email);

  if (users.length === 0) {
    throw new Error('User not found');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await updatePasswordByEmail(email, hashedPassword);

  return true;
};

// ================= MIDDLEWARE =================

// SESSION AUTH (NEW)
const authenticateSession = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  req.user = req.session.user;
  next();
};

// ROLE AUTH (works for both)
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.user?.role;

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};

module.exports = {
  registerUser,
  loginUser,
  resetUserPassword,
  authenticateSession,
  authorizeRoles
};