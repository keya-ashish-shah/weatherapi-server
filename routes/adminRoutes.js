const express = require("express");
const router = express.Router();
const SearchHistory = require("../models/SearchHistory");

router.get("/history", async (req, res) => {
  try {
    const entries = await SearchHistory.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    res.json(entries);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

module.exports = router;
