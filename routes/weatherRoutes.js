const express = require("express");
const router = express.Router();
const { getWeather } = require("../controllers/weatherController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getWeather);
router.post("/", authMiddleware, getWeather);

module.exports = router;