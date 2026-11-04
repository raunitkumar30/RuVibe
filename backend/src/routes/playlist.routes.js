const express = require("express");
const playlistController = require("../controllers/playlist.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware.authUser, playlistController.createPlaylist);
router.get("/", authMiddleware.authUser, playlistController.getMyPlaylists);
router.get("/:id", authMiddleware.authUser, playlistController.getPlaylistById);
router.post("/:id/add", authMiddleware.authUser, playlistController.addMusicToPlaylist);

module.exports = router;