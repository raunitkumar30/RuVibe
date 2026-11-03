const express = require("express");
const musicController = require("../controllers/music.controller");
const multer = require("multer");
const authMiddleware = require("../middlewares/auth.middleware"); 

const upload = multer({ 
    storage: multer.memoryStorage() 
});

const router = express.Router();

router.get("/search", authMiddleware.authUser, musicController.searchMusic);

router.post("/upload",authMiddleware.authArtist, upload.single("file"), musicController.createMusic);

router.post("/create-album", authMiddleware.authArtist, upload.single("file"), musicController.createAlbum);

router.get("/", authMiddleware.authUser, musicController.getAllMusics);

router.get("/albums", authMiddleware.authUser, musicController.getAllAlbums);

router.get("/albums/:albumId", authMiddleware.authUser, musicController.getAlbumById);

router.post("/logout", authMiddleware.authUser, musicController.logoutUser);

module.exports = router;