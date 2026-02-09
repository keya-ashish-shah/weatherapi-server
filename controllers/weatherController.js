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
    // ✅ FIX: read from both query and body
    let {
      latitude,
      longitude,
      city,
      userId,
      userName,
    } = { ...req.query, ...req.body };

    // If lat/lon not provided but city is present → geocode
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
        return res.status(500).json({ error: "Failed to fetch coordinates" });
      }
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: "Invalid latitude/longitude" });
    }

    // Check cache
    let cached = null;
    try {
      cached = await WeatherCache.findOne({ latitude: lat, longitude: lon })
        .sort({ createdAt: -1 })
        .lean();
    } catch (err) {
      console.warn("Cache skipped:", err.message);
    }

    const userToken =
      (req.headers.authorization || "").replace(/^Bearer\s*/i, "") || null;

    // Save search history (non-blocking)
    SearchHistory.create({
      latitude: lat,
      longitude: lon,
      cityName: city || null,
      userToken,
      userId: userId || null,
      userName: userName || null,
      ip: req.ip,
    }).catch(() => {});

    if (cached && isFresh(cached.createdAt, CACHE_TTL_MINUTES)) {
      return res.json({ source: "cache", ...cached.data });
    }

    // Fetch from Open-Meteo
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
    const response = await axios.get(url);

    const data = response.data;

    // Save cache
    WeatherCache.create({
      latitude: lat,
      longitude: lon,
      data,
    }).catch(() => {});

    res.json({ source: "open-meteo", ...data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
};
