const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const asyncHandler = require("../middlewares/asyncHandler");

const router = express.Router();

router.post("/register", asyncHandler(authController.registerUser));
router.post("/login", asyncHandler(authController.loginUser));
router.get("/me", authMiddleware.authUser, asyncHandler(authController.getMe));

module.exports = router;