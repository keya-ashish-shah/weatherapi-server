const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

async function registerUser(name, email, dob, password) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    dob,
    passwordHash,
  });

  return user;
}

async function loginUser(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, dob: user.dob },
  };
}

module.exports = {
  registerUser,
  loginUser,
};
