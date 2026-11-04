const playlistModel = require("../models/playlist.model");

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
        .populate("musics", "title coverArt duration");

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

// 4. Add a song to a playlist
async function addMusicToPlaylist(req, res) {
    const { id } = req.params; // playlist ID
    const { musicId } = req.body;

    const playlist = await playlistModel.findOne({ _id: id, user: req.user.id });
    if (!playlist) {
        return res.status(404).json({ message: "Playlist not found or unauthorized" });
    }

    // Prevent duplicates in the playlist
    if (playlist.musics.includes(musicId)) {
        return res.status(400).json({ message: "Song already in playlist" });
    }

    playlist.musics.push(musicId);
    await playlist.save();

    return res.status(200).json({
        message: "Song added to playlist",
        playlist,
    });
}

module.exports = {
    createPlaylist,
    getMyPlaylists,
    getPlaylistById,
    addMusicToPlaylist,
};