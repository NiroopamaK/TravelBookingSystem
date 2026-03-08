const express = require('express');
const {explore, dashboard, bookingPage} = require("../controllers/travellerController")

const router = express.Router();

router.get("/explore", explore)
router.get("/dashboard", dashboard)

// booking page for selected package
router.get("/booking/:packageId", bookingPage);

module.exports = router;