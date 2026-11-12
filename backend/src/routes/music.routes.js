const express = require("express");
const multer = require("multer");
const musicController = require("../controllers/music.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const asyncHandler = require("../middlewares/asyncHandler");

// 1. Secure Multer Configuration (Strict size + audio MIME filter)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max audio file
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "audio/m4a",
      "audio/aac",
      "audio/x-m4a",
      "audio/mp4",
    ];

    if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only audio formats (MP3, WAV, AAC, M4A, OGG) are permitted."
        ),
        false
      );
    }
  },
});

const router = express.Router();

// Public Endpoints
router.get("/", asyncHandler(musicController.getAllMusics));
router.get("/top-artists", asyncHandler(musicController.getTopArtists));
router.get("/search", asyncHandler(musicController.searchMusic));
router.get("/podcasts", asyncHandler(musicController.searchPodcasts));
router.get("/radio-stations", asyncHandler(musicController.getRadioStations));
router.get("/lyrics", asyncHandler(musicController.getLyrics));
router.get("/albums", asyncHandler(musicController.getAllAlbums));
router.get("/albums/:albumId", asyncHandler(musicController.getAlbumById));

// Protected Endpoints (Specific routes defined before parameterized wildcards)
router.get("/liked", authMiddleware.authUser, asyncHandler(musicController.getLikedMusics));
router.get("/my-uploads", authMiddleware.authUser, asyncHandler(musicController.getMyUploads));
router.post(
  "/upload",
  authMiddleware.authArtist,
  upload.single("file"),
  asyncHandler(musicController.createMusic)
);
router.post(
  "/create-album",
  authMiddleware.authArtist,
  upload.single("file"),
  asyncHandler(musicController.createAlbum)
);
router.post("/:musicId/like", authMiddleware.authUser, asyncHandler(musicController.toggleLikeMusic));

module.exports = router;