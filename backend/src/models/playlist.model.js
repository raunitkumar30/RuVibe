const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Playlist name is required"],
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        musics: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "music",
            },
        ],
    },
    {
        timestamps: true,
    }
);

const playlistModel = mongoose.model("Playlist", playlistSchema);

module.exports = playlistModel;