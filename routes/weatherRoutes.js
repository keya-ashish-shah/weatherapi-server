const express = require("express");
const router = express.Router();
const { getWeather } = require("../controllers/weatherController");

router.get("/", getWeather);
router.post("/", getWeather);

module.exports = router;