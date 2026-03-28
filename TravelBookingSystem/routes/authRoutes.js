const express = require('express');
const router = express.Router();
const { register, login, resetPassword, getCurrentUser } = require('../controllers/authController');

router.get("/me", getCurrentUser);
router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPassword);

module.exports = router;