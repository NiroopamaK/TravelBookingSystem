const express = require('express');
const router = express.Router();
const { getPackagesData, getPackageData, viewPackageByID } = require('../controllers/travellerController');

// JSON API for packages
router.get('/explore/data', getPackagesData);
router.get('/booking/:packageId/data', getPackageData);
router.get('/package/:packageId', viewPackageByID);

module.exports = router;