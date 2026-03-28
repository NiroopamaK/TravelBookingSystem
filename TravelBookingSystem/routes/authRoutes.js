const express = require('express');
const router = express.Router();
const { register, login, resetPassword, getCurrentUser, logout } = require('../controllers/authController');

router.get("/me", getCurrentUser);
router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);

module.exports = router;