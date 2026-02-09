const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
  try {
    const { name, email, dob, password } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create user with password as base64 hash (same as your old code)
    const passwordHash = Buffer.from(password).toString('base64');
    
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      dob,
      passwordHash
    });

    res.status(201).json({ 
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password (base64 comparison)
    const passwordHash = Buffer.from(password).toString('base64');
    if (user.passwordHash !== passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;