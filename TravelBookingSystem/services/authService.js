const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // DELETE LATER (JWT)

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

  // DELETE LATER (JWT START)
  const token = jwt.sign(
    {
      user_id: user.user_id,
      role: user.role,
      first_name: user.first_name
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  // DELETE LATER (JWT END)

  return {
    user: {
      user_id: user.user_id,
      role: user.role,
      first_name: user.first_name
    },
    token // DELETE LATER (JWT)
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

// AUTH TOKEN (JWT)
const authenticateToken = (req, res, next) => {
  // DELETE LATER (JWT START)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    req.user = user;
    next();
  });
  // DELETE LATER (JWT END)
};

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
  authenticateToken, // DELETE LATER (JWT)
  authenticateSession,
  authorizeRoles
};