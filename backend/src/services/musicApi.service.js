const axios = require("axios");

async function getTrackMetadata(trackTitle) {
    if (!trackTitle || trackTitle.trim() === "") {
        return null;
    }

    try {
        const response = await axios.get("https://itunes.apple.com/search", {
            params: {
                term: trackTitle,
                entity: "song",
                limit: 1,
            },
            timeout: 5000,
        });

        const track = response.data.results?.[0];
        if (!track) return null;

        const highResCover = track.artworkUrl100
            ? track.artworkUrl100.replace("100x100bb", "600x600bb")
            : null;

        return {
            coverArt: highResCover,
            duration: Math.round(track.trackTimeMillis / 1000),
            genre: track.primaryGenreName || "Music",
            previewUrl: track.previewUrl || null,
            albumTitle: track.collectionName || null,
        };
    } catch (error) {
        console.error("Music API fetch error:", error.message);
        return null;
    }
}

module.exports = {
    getTrackMetadata,
};