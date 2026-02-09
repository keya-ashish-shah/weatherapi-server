// const mongoose = require("mongoose");

// const SearchHistorySchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   userName: { type: String },
//   latitude: { type: Number, required: true },
//   longitude: { type: Number, required: true },
//   cityName: { type: String },
//   userToken: { type: String },
//   ip: { type: String },
//   createdAt: { type: Date, default: Date.now, index: true },
// });

// module.exports = mongoose.model("SearchHistory", SearchHistorySchema);
const mongoose = require("mongoose");

const SearchHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: { type: String },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  cityName: { type: String },
  userToken: { type: String },
  ip: { type: String },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model("SearchHistory", SearchHistorySchema);
