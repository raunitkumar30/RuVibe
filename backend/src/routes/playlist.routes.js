const express = require("express");
const playlistController = require("../controllers/playlist.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const asyncHandler = require("../middlewares/asyncHandler");

const router = express.Router();

router.post("/", authMiddleware.authUser, asyncHandler(playlistController.createPlaylist));
router.get("/", authMiddleware.authUser, asyncHandler(playlistController.getMyPlaylists));
router.get("/:id", authMiddleware.authUser, asyncHandler(playlistController.getPlaylistById));
router.post("/:id/add", authMiddleware.authUser, asyncHandler(playlistController.addMusicToPlaylist));

module.exports = router;