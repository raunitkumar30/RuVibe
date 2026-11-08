const express = require("express");
const musicController = require("../controllers/music.controller");
const multer = require("multer");
const authMiddleware = require("../middlewares/auth.middleware");

const upload = multer({
  storage: multer.memoryStorage(),
});

const router = express.Router();

router.get("/search", authMiddleware.authUser, musicController.searchMusic);

// 🎙️ Dynamic Podcasts Endpoint
router.get("/podcasts", authMiddleware.authUser, musicController.searchPodcasts);

// 📻 Live Radio Stations Endpoint
router.get("/radio-stations", authMiddleware.authUser, musicController.getRadioStations);

// 📝 Lyrics Endpoint
router.get("/lyrics", authMiddleware.authUser, musicController.getLyrics);

router.post("/upload", authMiddleware.authArtist, upload.single("file"), musicController.createMusic);

router.post("/create-album", authMiddleware.authArtist, upload.single("file"), musicController.createAlbum);

router.get("/", authMiddleware.authUser, musicController.getAllMusics);

router.get("/albums", authMiddleware.authUser, musicController.getAllAlbums);

router.get("/albums/:albumId", authMiddleware.authUser, musicController.getAlbumById);

router.post("/logout", authMiddleware.authUser, musicController.logoutUser);

router.post("/:musicId/like", authMiddleware.authUser, musicController.toggleLikeMusic);

router.get("/liked", authMiddleware.authUser, musicController.getLikedMusics);

module.exports = router;