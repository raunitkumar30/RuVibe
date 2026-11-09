const express = require("express");
const musicController = require("../controllers/music.controller");
const multer = require("multer");
const authMiddleware = require("../middlewares/auth.middleware");

const upload = multer({
  storage: multer.memoryStorage(),
});

const router = express.Router();

// 🌐 Public Endpoints
router.get("/", musicController.getAllMusics);
router.get("/top-artists", musicController.getTopArtists);
router.get("/search", musicController.searchMusic);
router.get("/podcasts", musicController.searchPodcasts);
router.get("/radio-stations", musicController.getRadioStations);
router.get("/lyrics", musicController.getLyrics);
router.get("/albums", musicController.getAllAlbums);
router.get("/albums/:albumId", musicController.getAlbumById);

// 🔒 Protected Endpoints
router.post("/upload", authMiddleware.authArtist, upload.single("file"), musicController.createMusic);
router.post("/create-album", authMiddleware.authArtist, upload.single("file"), musicController.createAlbum);
router.post("/logout", authMiddleware.authUser, musicController.logoutUser);
router.post("/:musicId/like", authMiddleware.authUser, musicController.toggleLikeMusic);
router.get("/liked", authMiddleware.authUser, musicController.getLikedMusics);

module.exports = router;