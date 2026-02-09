const axios = require("axios");
const mongoose = require("mongoose");
const WeatherCache = require("../models/WeatherCache");
const SearchHistory = require("../models/SearchHistory");

mongoose.set("bufferCommands", false);

const CACHE_TTL_MINUTES = Number(process.env.CACHE_TTL_MINUTES || 30);

function isFresh(date, ttlMins) {
  return Date.now() - new Date(date).getTime() < ttlMins * 60 * 1000;
}

  
exports.getWeather = async (req, res) => {
  try {
    let { latitude, longitude, city, userId, userName } =
      req.query.latitude || req.query.longitude
        ? req.query
        : req.body;


    if ((!latitude || !longitude) && city) {
      try {
        const geo = await axios.get(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`
        );
        if (geo.data.results && geo.data.results.length > 0) {
          latitude = geo.data.results[0].latitude;
          longitude = geo.data.results[0].longitude;
        } else {
          return res.status(404).json({ error: "City not found" });
        }
      } catch (err) {
        console.warn("Geocoding API failed:", err.message);
        return res.status(500).json({ error: "Failed to fetch coordinates" });
      }
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: "Invalid latitude/longitude" });
    }

    let cached = null;
    try {
      cached = await WeatherCache.findOne({ latitude: lat, longitude: lon })
        .sort({ createdAt: -1 })
        .lean();
    } catch (err) {
      console.warn("MongoDB unavailable, skipping cache:", err.message);
    }

    const userToken =
      (req.headers.authorization || "").replace(/^Bearer\s*/i, "") || null;

    try {
      SearchHistory.create({
        latitude: lat,
        longitude: lon,
        cityName: city || null,
        userToken, 
        userId: userId || null,
        userName: userName || null,
        ip: req.ip,
      }).catch((e) =>
        console.warn("SearchHistory save failed:", e.message)
      );
    } catch (err) {
      console.warn("SearchHistory DB error:", err.message);
    }

    if (cached && isFresh(cached.createdAt, CACHE_TTL_MINUTES)) {
      return res.json({ source: "cache", ...cached.data });
    }

    let data;
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relativehumidity_2m&current_weather=true&timezone=auto`;
      const response = await axios.get(url);
      data = response.data;
    } catch (err) {
      console.error("Open-Meteo API failed:", err.message);
      return res.status(500).json({ error: "Failed to fetch weather data from API" });
    }

    try {
      await WeatherCache.create({
        latitude: lat,
        longitude: lon,
        data,
      });
    } catch (err) {
      console.warn("WeatherCache save failed:", err.message);
    }

    res.json({ source: "open-meteo", ...data });
  } catch (error) {
    console.error("Weather API error:", error.message);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
};
