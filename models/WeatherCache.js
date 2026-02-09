const mongoose = require("mongoose");

const WeatherCacheSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  data: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

WeatherCacheSchema.index({ latitude: 1, longitude: 1, createdAt: -1 });

module.exports = mongoose.model("WeatherCache", WeatherCacheSchema);