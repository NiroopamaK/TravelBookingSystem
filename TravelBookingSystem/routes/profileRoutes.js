const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: './public/assets/propics/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    cb(null, allowed.test(file.mimetype));
};

const upload = multer({ storage, fileFilter });

router.get('/editProfile', profileController.getProfile);
router.post('/profile/update', profileController.updateProfile);
router.post('/profile/upload-picture',upload.single('profile_picture'),profileController.uploadProfilePicture);
router.get('/getProfilePicture', profileController.getProfilePicture);
router.get('/getProfile', profileController.getProfile);

module.exports = router;