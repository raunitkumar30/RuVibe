const musicModel = require("../models/music.model");
const { uploadFile } = require("../services/storage.service");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


async function createMusic(req, res) {

    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "artist") {
            return res.status(403).json({ message: "You dont have permission to create music" });
        }


        const { title } = req.body;
        const file = req.file;

        const result = await uploadFile(file.buffer.toString("base64"));

        const music = new musicModel({
            uri: result.url,
            title,
            artist: decoded.id
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
    } catch (err) {
    console.error("Music upload error:", err);
    return res.status(500).json({
        message: err.message
    });
}
}
module.exports = {
    createMusic
};