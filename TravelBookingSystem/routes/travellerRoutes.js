const express = require('express');
const {explore, dashboard} = require("../controllers/travellerController")

const router = express.Router();

router.get("/explore", explore)
router.get("/dashboard", dashboard)

module.exports = router;