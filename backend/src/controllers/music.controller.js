const musicModel = require("../models/music.model")
const albumModel = require("../models/album.model");
const { uploadFile } = require("../services/storage.service");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


async function createMusic(req, res) {
    const { title } = req.body;
    const file = req.file;

    const result = await uploadFile(file.buffer.toString("base64"));

    const music = new musicModel({
        uri: result.url,
        title,
        artist: req.user.id
    });

    await music.save();

    res.status(201).json({
        message: "Music created successfully",
        music: {
            id: music._id,
            uri: music.uri,
            title: music.title,
            artist: music.artist,
        }
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

module.exports = {
    createMusic,
    createAlbum,
    getAllMusics,
    getAllAlbums,
    getAlbumById,
    logoutUser,
    searchMusic,
};