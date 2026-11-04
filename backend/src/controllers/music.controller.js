const musicModel = require("../models/music.model")
const albumModel = require("../models/album.model");
const { uploadFile } = require("../services/storage.service");
const { getTrackMetadata } = require("../services/musicApi.service");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


async function createMusic(req, res) {
    const { title, genre } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: "Audio file is required" });
    }

    if (!title) {
        return res.status(400).json({ message: "Song title is required" });
    }

    // 1. Upload audio to ImageKit
    const uploadResult = await uploadFile(file.buffer.toString("base64"));

    // 2. Fetch cover art, genre, and duration from the free Music API
    const metaData = await getTrackMetadata(title);

    // 3. Save to MongoDB
    const music = new musicModel({
        title,
        uri: uploadResult.url,
        artist: req.user.id,
        coverArt: metaData?.coverArt || "https://via.placeholder.com/600?text=No+Cover",
        duration: metaData?.duration || 0,
        genre: genre || metaData?.genre || "Unknown",
    });

    await music.save();

    return res.status(201).json({
        message: "Music uploaded and created successfully",
        music,
    });
}


async function createAlbum(req, res) {
    const { title, musicsIds } = req.body;

    const album = new albumModel({
        title,
        musics: musicsIds,
        artist: req.user.id
    });

    await album.save();

    res.status(201).json({
        message: "Album created successfully",
        album: {
            id: album._id,
            title: album.title,
            artist: album.artist,
            musics: album.musics,
        }
    });

}


async function getAllMusics(req, res) {
    const musics = await musicModel.find().limit(10).populate("artist", "username email");

    res.status(200).json({
        message: "All musics fetched successfully",
        musics: musics,
    });

}


async function getAllAlbums(req, res) {
    const albums = await albumModel.find().limit(10).select("title artist").populate("artist", "username email");

    res.status(200).json({
        message: "All albums fetched successfully",
        albums: albums,
    });
}


async function getAlbumById(req, res) {
    const albumId = req.params.albumId;

    const album = await albumModel.findById(albumId).populate("artist", "username email").populate("musics", "title uri");

    if (!album) {
        return res.status(404).json({
            message: "Album not found"
        });
    }

    res.status(200).json({
        message: "Album fetched successfully",
        album: album,
    });
}

async function logoutUser(req, res) {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
}


async function searchMusic(req, res) {
    const { q } = req.query;

    if (!q || q.trim() === "") {
        return res.status(400).json({ message: "Search query 'q' parameter is required" });
    }

    const musics = await musicModel
        .find({
            $or: [
                { title: { $regex: q, $options: "i" } },
                { genre: { $regex: q, $options: "i" } },
            ],
        })
        .populate("artist", "username email role")
        .limit(20);

    return res.status(200).json({
        message: "Search completed successfully",
        totalResults: musics.length,
        musics,
    });
}



async function toggleLikeMusic(req, res) {
    const { musicId } = req.params;
    const userId = req.user.id;

    const music = await musicModel.findById(musicId);
    if (!music) {
        return res.status(404).json({ message: "Music not found" });
    }

    // Check if the user ID is already in the likes array
    const alreadyLikedIndex = music.likes.indexOf(userId);

    let isLiked = false;
    if (alreadyLikedIndex > -1) {
        // User already liked -> unlike it
        music.likes.splice(alreadyLikedIndex, 1);
        isLiked = false;
    } else {
        // Not liked yet -> add user ID
        music.likes.push(userId);
        isLiked = true;
    }

    await music.save();

    return res.status(200).json({
        message: isLiked ? "Added to Liked Songs" : "Removed from Liked Songs",
        isLiked,
        totalLikes: music.likes.length,
    });
}


async function getLikedMusics(req, res) {
    const userId = req.user.id;

    // Find all songs where the likes array contains this user's ID
    const musics = await musicModel
        .find({ likes: userId })
        .populate("artist", "username email");

    return res.status(200).json({
        message: "Liked songs fetched successfully",
        total: musics.length,
        musics,
    });
}

module.exports = {
    createMusic,
    createAlbum,
    getAllMusics,
    getAllAlbums,
    getAlbumById,
    logoutUser,
    searchMusic,
    toggleLikeMusic,
    getLikedMusics,

};