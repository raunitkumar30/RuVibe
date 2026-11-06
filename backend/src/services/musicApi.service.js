const axios = require("axios");

// 1. Fetch metadata for a single song on upload
async function getTrackMetadata(trackTitle) {
    if (!trackTitle || trackTitle.trim() === "") return null;

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

// 2. 🌟 NEW: Search global music catalog (returns up to 15 real playable songs)
async function searchGlobalTracks(query, limit = 15) {
    if (!query || query.trim() === "") return [];

    try {
        const response = await axios.get("https://itunes.apple.com/search", {
            params: {
                term: query,
                entity: "song",
                limit: limit,
            },
            timeout: 6000,
        });

        const results = response.data.results || [];

        // Format to match our app's track schema
        return results.map((item) => ({
            _id: `global_${item.trackId}`,
            title: item.trackName,
            artist: item.artistName,
            album: item.collectionName,
            coverArt: item.artworkUrl100
                ? item.artworkUrl100.replace("100x100bb", "600x600bb")
                : "https://via.placeholder.com/600",
            uri: item.previewUrl, // Playable 30-sec audio stream!
            duration: Math.round(item.trackTimeMillis / 1000),
            genre: item.primaryGenreName || "Pop",
            isExternal: true, // Marker showing this is from the global music catalog
        }));
    } catch (error) {
        console.error("Global search error:", error.message);
        return [];
    }
}

module.exports = {
    getTrackMetadata,
    searchGlobalTracks, // <-- Export this
};