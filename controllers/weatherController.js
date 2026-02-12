const axios = require("axios");
const WeatherCache = require("../models/WeatherCache");
const SearchHistory = require("../models/SearchHistory");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const CACHE_TTL_MINUTES = Number(process.env.CACHE_TTL_MINUTES || 30);
const COORD_PRECISION = Number(process.env.COORD_PRECISION || 3);

const COORD_EPSILON = Number(process.env.COORD_EPSILON) || 0.5 * Math.pow(10, -COORD_PRECISION);
const USE_COMPASS = (process.env.USE_COMPASS || "false").toLowerCase() === "true";
const COMPASS_API_URL = process.env.COMPASS_API_URL || "";

function isFresh(date, ttlMins) {
  return Date.now() - new Date(date).getTime() < ttlMins * 60 * 1000;
}

function roundCoord(v) {
  return Number(Number(v).toFixed(COORD_PRECISION));
}

async function getCoordinates(city) {
  const geo = await axios.get(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`
  );

  if (!geo.data.results?.length) {
    throw new Error("City not found");
  }

  return {
    latitude: geo.data.results[0].latitude,
    longitude: geo.data.results[0].longitude,
  };
}

async function getCachedWeather(latitude, longitude) {

  const lat = roundCoord(latitude);
  const lon = roundCoord(longitude);

  const ttlMs = CACHE_TTL_MINUTES * 60 * 1000;
  const cutoff = new Date(Date.now() - ttlMs);

  let cached = await WeatherCache.findOne({ latitude: lat, longitude: lon, createdAt: { $gte: cutoff } })
    .sort({ createdAt: -1 })
    .lean();

  if (cached) {
    return { source: "cache", data: cached.data };
  }

  // fall back to range query to match older entries stored with slightly different coords
  cached = await WeatherCache.findOne({
    latitude: { $gte: lat - COORD_EPSILON, $lte: lat + COORD_EPSILON },
    longitude: { $gte: lon - COORD_EPSILON, $lte: lon + COORD_EPSILON },
    createdAt: { $gte: cutoff },
  })
    .sort({ createdAt: -1 })
    .lean();

  if (cached) {
    return { source: "cache", data: cached.data };
  }

  return null;
}

async function getLiveWeather(latitude, longitude) {
  const tryCompass = USE_COMPASS && COMPASS_API_URL;
  let responseData = null;
  if (tryCompass) {
    try {
      const compassRes = await axios.get(
        `${COMPASS_API_URL}?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`
      );
      if (compassRes && compassRes.data) {
        responseData = compassRes.data;
        console.log("Fetched weather from Compass API.");
      }
    } catch (err) {
      console.warn("Compass API fetch failed, falling back to Open-Meteo:", err.message);
    }
  }

  if (!responseData) {
    const openMeteoRes = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`
    );
    responseData = openMeteoRes.data;
    console.log("Fetched weather from Open-Meteo.");
  }

  const lat = roundCoord(latitude);
  const lon = roundCoord(longitude);
  await WeatherCache.create({ latitude: lat, longitude: lon, data: responseData });

  const source = tryCompass && responseData ? "compass" : "open-meteo";
  return { source, data: responseData };
}

exports.getWeather = async (req, res) => {
  try {
    console.log("Incoming request:", req.method, "body:", req.body, "query:", req.query);

    let latitude, longitude, city;
    if (req.method === "GET") {
      if (req.query.latitude && req.query.longitude) {
        latitude = parseFloat(req.query.latitude);
        longitude = parseFloat(req.query.longitude);
        if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
          return res.status(400).json({ error: "Invalid latitude or longitude" });
        }
      } else if (req.query.city) {
        city = req.query.city;
      } else {
        return res.status(400).json({ error: "Provide latitude&longitude or city query param" });
      }
    } else {
      // POST req
      city = req.body.city;
      if (!city) return res.status(400).json({ error: "City name is required" });
    }

    if (city) {
      const coords = await getCoordinates(city);
      latitude = coords.latitude;
      longitude = coords.longitude;
    }

    // latitude & longitude must now be present
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({ error: "Latitude and longitude required" });
    }

    let result = await getCachedWeather(latitude, longitude);
    if (!result) {
      result = await getLiveWeather(latitude, longitude);
    }

    try {
      // Only record authenticated user info if the Authorization header contains a valid JWT.
      let userId;
      let userName;
      let userToken;
      const authHeader = req.headers && (req.headers.authorization || req.headers.Authorization);
      if (authHeader && typeof authHeader === "string") {
        const parts = authHeader.split(" ");
        const token = parts.length === 2 && parts[0].toLowerCase() === "bearer" ? parts[1] : null;
        if (token) {
          try {
            const decoded = jwt.verify(token, JWT_SECRET);
            userId = decoded.id || decoded._id || undefined;
            userName = decoded.email || decoded.username || undefined;
            userToken = token; // only store if token verifies
          } catch (err) {
            // invalid token: do not record user info or token
            userId = undefined;
            userName = undefined;
            userToken = undefined;
          }
        }
      }

      const historyDoc = {
        cityName: city,
        latitude,
        longitude,
      };
      if (userId) historyDoc.userId = userId;
      if (userName) historyDoc.userName = userName;
      if (userToken) historyDoc.userToken = userToken;

      await SearchHistory.create(historyDoc);
    } catch (err) {
      console.error("SearchHistory save failed:", err.message);
    }

    if (!result || !result.data) {
      return res.status(404).json({ error: "Weather data not found" });
    }

    res.json(result.data);
  } catch (err) {
    console.error("Weather error:", err.message);
    const statusCode = err.message && err.message.toLowerCase().includes("not found") ? 404 : 500;
    res.status(statusCode).json({ error: err.message || "Failed to fetch weather" });
  }
};
