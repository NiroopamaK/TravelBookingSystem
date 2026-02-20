const express = require("express");
const dotenv = require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const package_routes = require('./routes/package_routes');

app.listen(port, () => {
    console.log(`server running on port ${port}`)
})