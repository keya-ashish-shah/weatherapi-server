function validateRegister(req, res, next) {
  const { name, email, dob, password } = req.body;

  if (!name || !email || !dob || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  next();
}

function validateWeather(req, res, next) {
  const { city } = req.body;

  if (!city || city.trim() === "") {
    return res.status(400).json({ error: "City is required" });
  }

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateWeather,
};
