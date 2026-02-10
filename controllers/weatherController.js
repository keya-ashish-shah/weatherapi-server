const axios = require("axios");
const WeatherCache = require("../models/WeatherCache");
const SearchHistory = require("../models/SearchHistory");

const CACHE_TTL_MINUTES = Number(process.env.CACHE_TTL_MINUTES || 30);

function isFresh(date, ttlMins) {
  return Date.now() - new Date(date).getTime() < ttlMins * 60 * 1000;
}

exports.getWeather = async (req, res) => {
  try {
    const { city } = req.body;
    let latitude, longitude;

    if (!city) return res.status(400).json({ error: "City required" });

    const geo = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`
    );
    if (!geo.data.results?.length)
      return res.status(404).json({ error: "City not found" });

    latitude = geo.data.results[0].latitude;
    longitude = geo.data.results[0].longitude;

    const cached = await WeatherCache.findOne({ latitude, longitude })
      .sort({ createdAt: -1 })
      .lean();

    if (cached && isFresh(cached.createdAt, CACHE_TTL_MINUTES))
      return res.json({ source: "cache", ...cached.data });

    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`
    );
    const data = response.data;

    await WeatherCache.create({ latitude, longitude, data });
    await SearchHistory.create({
      userId: req.user.id,
      userName: req.user.email,
      cityName: city,
      latitude,
      longitude,
    });

    res.json({ source: "live", ...data });
  } catch (err) {
    console.error("Weather error:", err);
    res.status(500).json({ error: "Failed to fetch weather" });
  }
};
