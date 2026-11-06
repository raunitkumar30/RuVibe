const playlistModel = require("../models/playlist.model");
const musicModel = require("../models/music.model");

// 1. Create a new playlist
async function createPlaylist(req, res) {
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json({ message: "Playlist name is required" });
    }

    const playlist = new playlistModel({
        name,
        description: description || "",
        user: req.user.id,
        musics: [],
    });

    await playlist.save();

    return res.status(201).json({
        message: "Playlist created successfully",
        playlist,
    });
}

// 2. Get all playlists created by the logged-in user
async function getMyPlaylists(req, res) {
    const playlists = await playlistModel
        .find({ user: req.user.id })
        .populate("musics", "title coverArt duration uri artist");

    return res.status(200).json({
        message: "Playlists fetched successfully",
        playlists,
    });
}

// 3. Get single playlist by ID (with all track details)
async function getPlaylistById(req, res) {
    const { id } = req.params;

    const playlist = await playlistModel
        .findById(id)
        .populate({
            path: "musics",
            populate: { path: "artist", select: "username email" },
        });

    if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
    }

    return res.status(200).json({
        message: "Playlist fetched successfully",
        playlist,
    });
}

// 4. Add a song to a playlist (supports both uploaded & search songs)
async function addMusicToPlaylist(req, res) {
    const { id } = req.params; // playlist ID
    let { musicId, title, uri, coverArt, duration, genre } = req.body;

    try {
        const playlist = await playlistModel.findOne({ _id: id, user: req.user.id });
        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found or unauthorized" });
        }

        // If it's a global track or not yet an ObjectId in DB, save it to MongoDB first
        if (!musicId || String(musicId).startsWith("global_") || String(musicId).length !== 24) {
            let existingMusic = await musicModel.findOne({ uri });
            if (!existingMusic && title) {
                existingMusic = new musicModel({
                    title: title || "Unknown Title",
                    uri: uri,
                    artist: req.user.id,
                    coverArt: coverArt || "https://via.placeholder.com/600",
                    duration: duration || 0,
                    genre: genre || "Pop",
                    likes: [],
                });
                await existingMusic.save();
            }
            if (existingMusic) {
                musicId = existingMusic._id;
            }
        }

        // Check if already in playlist
        const alreadyInPlaylist = playlist.musics.some(
            (m) => String(m) === String(musicId)
        );

        if (alreadyInPlaylist) {
            return res.status(400).json({ message: "Song is already in this playlist" });
        }

        playlist.musics.push(musicId);
        await playlist.save();

        return res.status(200).json({
            message: "Song added to playlist",
            playlist,
        });
    } catch (error) {
        console.error("Add to playlist error:", error);
        return res.status(500).json({ message: "Failed to add song to playlist" });
    }
}

module.exports = {
    createPlaylist,
    getMyPlaylists,
    getPlaylistById,
    addMusicToPlaylist,
};