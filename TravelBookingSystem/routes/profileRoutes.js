const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.get('/editProfile', profileController.getProfile);
router.post('/profile/update', profileController.updateProfile);

module.exports = router;