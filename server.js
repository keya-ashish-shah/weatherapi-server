require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const weatherRoutes = require("./routes/weatherRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log("Headers:", req.headers);
  console.log("Query:", req.query);
  console.log("Body:", req.body);
  next();
});

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/weathervision";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(" MongoDB error:", err.message));

app.use("/api/weather", weatherRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err && (err.stack || err.message || err));
  const status = err && err.status ? err.status : 500;
  res.status(status).json({ error: err && err.message ? err.message : "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));