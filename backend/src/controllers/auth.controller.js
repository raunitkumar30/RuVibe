const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Standard cookie configuration
const getCookieOptions = () => ({
  httpOnly: true, // Prevents JavaScript from reading the cookie (protects against XSS)
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches JWT expiration)
});

// 1. Register User
async function registerUser(req, res) {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    const cleanUsername = String(username).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    // Prevent privilege escalation — only allow "user" or "artist"
    const safeRole = role === "artist" ? "artist" : "user";

    const isUserExist = await userModel.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }],
    });

    if (isUserExist) {
      return res.status(409).json({ message: "Username or email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      role: safeRole,
    });

    await newUser.save();

    // Sign JWT with 7-day expiration
    const token = jwt.sign(
      {
        id: newUser._id,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set secure cookie
    res.cookie("token", token, getCookieOptions());

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Registration failed. Please try again." });
  }
}

// 2. Login User
async function loginUser(req, res) {
  try {
    const { username, email, password } = req.body;

    if ((!username && !email) || !password) {
      return res.status(400).json({ message: "Please provide your username/email and password" });
    }

    const identifier = (username || email).trim();

    const user = await userModel.findOne({
      $or: [{ username: identifier }, { email: identifier.toLowerCase() }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set secure cookie
    res.cookie("token", token, getCookieOptions());

    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed. Please try again." });
  }
}

// 3. Get Authenticated User Profile
async function getMe(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        likedSongs: user.likedSongs || [],
      },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    return res.status(500).json({ message: "Failed to fetch user profile" });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getMe,
};