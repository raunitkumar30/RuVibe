const mongoose = require("mongoose");

const musicSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Song title is required"],
            trim: true,
        },
        uri: {
            type: String,
            required: [true, "Audio file URL is required"],
        },
        artist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Artist is required"],
        },
        coverArt: {
            type: String,
            default: "https://via.placeholder.com/300?text=No+Cover",
        },
        genre: {
            type: String,
            trim: true,
            default: "Unknown",
        },
        duration: {
            type: Number, // duration in seconds
            default: 0,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

musicSchema.index({ title: "text", genre: "text" });

const musicModel = mongoose.model("music", musicSchema);

module.exports = musicModel;