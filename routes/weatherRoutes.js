const express = require("express");
const router = express.Router();
const weatherController = require("../controllers/weatherController");
const { validateWeather } = require("../middleware/validationMiddleware");

router.get("/", validateWeather, weatherController.getWeather);

router.post("/", validateWeather, weatherController.getWeather);

module.exports = router;