const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../models/userModel');

const register = async (req, res) => {
  console.log('Incoming signup request body:', req.body);
  try {
    const {  email, role, first_name, last_name, passport, address, telephone, password  } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await createUser({  email, role, first_name, last_name, passport, address, telephone, password : hashedPassword });
    res.json({ message: 'User registered', userId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body; // renamed
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
  { user_id: user.user_id, role: user.role, first_name: user.first_name },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login };