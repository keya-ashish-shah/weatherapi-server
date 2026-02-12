const userService = require("../services/userService");

exports.register = async (req, res) => {
  try {
    const { name, email, dob, password } = req.body;

    await userService.registerUser(name, email, dob, password);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err.message);
    const statusCode = err.message.includes("already exists") ? 400 : 500;
    res.status(statusCode).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.loginUser(email, password);

    res.json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(401).json({ error: err.message });
  }
};
