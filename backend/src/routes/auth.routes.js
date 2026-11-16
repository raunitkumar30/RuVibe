const express = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const asyncHandler = require("../middlewares/asyncHandler");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

router.post("/register", authLimiter, asyncHandler(authController.registerUser));
router.post("/login", authLimiter, asyncHandler(authController.loginUser));
router.post("/logout", authMiddleware.authUser, asyncHandler(authController.logoutUser));
router.get("/me", authMiddleware.authUser, asyncHandler(authController.getMe));

module.exports = router;