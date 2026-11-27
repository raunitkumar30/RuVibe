const userModel = require("../models/user.model");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Standard cookie configuration
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  // 'none' allows cross-domain cookies between frontend (Vercel) & backend (Render)
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

    // Input Validation: Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    // Input Validation: Raw password length check BEFORE hashing
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return res.status(400).json({ message: "Username must be between 3 and 30 characters" });
    }

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
      likedSongs: [],
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
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar || "",
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
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
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
        avatar: user.avatar || "",
        likedSongs: user.likedSongs || [],
      },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    return res.status(500).json({ message: "Failed to fetch user profile" });
  }
}

// 4. Logout User (Clears cookie with exact matching options)
async function logoutUser(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.status(200).json({ message: "Logged out successfully" });
}

// 5. Google OAuth Login / Register
async function googleLogin(req, res) {
  try {
    const { credential, role } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential token is required" });
    }

    // Verify token cryptographically with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: "Google account has no verified email" });
    }

    const cleanEmail = email.toLowerCase();
    let user = await userModel.findOne({ $or: [{ googleId }, { email: cleanEmail }] });

    if (user) {
      // Link googleId if user previously registered via email/password
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.avatar && picture) user.avatar = picture;
        await user.save();
      }
    } else {
      // Build a safe, unique username (3-30 chars)
      const base = (name || cleanEmail.split("@")[0])
        .replace(/[^a-zA-Z0-9_]/g, "")
        .slice(0, 20) || "user";
      let candidate = base.length >= 3 ? base : `${base}123`;

      while (await userModel.findOne({ username: candidate })) {
        candidate = `${base.slice(0, 20)}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const safeRole = role === "artist" ? "artist" : "user";

      user = await userModel.create({
        username: candidate,
        email: cleanEmail,
        googleId,
        avatar: picture || "",
        role: safeRole,
        likedSongs: [],
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, getCookieOptions());

    return res.status(200).json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(401).json({ message: "Google authentication failed" });
  }
}

// 6. Upgrade Listener to Artist Account
async function becomeArtist(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "artist") {
      user.role = "artist";
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, getCookieOptions());

    return res.status(200).json({
      message: "Account upgraded to Artist Studio",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.error("Become artist error:", error);
    return res.status(500).json({ message: "Failed to upgrade account" });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  googleLogin,
  becomeArtist,
};