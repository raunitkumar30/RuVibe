const express = require("express");
const musicController = require("../controllers/music.controller");
const multer = require("multer");

const upload = multer({ 
    storage: multer.memoryStorage() 
});

const router = express.Router();

router.post("/upload", upload.single("file"), musicController.createMusic);

module.exports = router;