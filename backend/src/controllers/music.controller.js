const musicModel = require("../models/music.model");
const albumModel = require("../models/album.model");
const userModel = require("../models/user.model");
const {
  uploadFile,
} = require("../services/storage.service");
const {
  getTrackMetadata,
  searchGlobalTracks,
  fetchLiveTopCharts,
  fetchTopArtists,
  fetchTopAlbums,
  fetchAlbumDetails,
  searchPodcasts: fetchPodcastsFromApi,
  getRadioStations: fetchRadioStationsFromApi,
  getSongLyrics,
} = require("../services/musicApi.service");

// 1. Upload Music
async function createMusic(req, res) {
  const { title, album } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "Music file is required" });
  }

  try {
    const uploadResult = await uploadFile(file);
    const metadata = await getTrackMetadata(title);

    const music = await musicModel.create({
      title: title,
      artist: req.user.id,
      album: album || metadata?.albumTitle,
      coverArt: metadata?.coverArt,
      duration: metadata?.duration,
      genre: metadata?.genre,
      uri: uploadResult.url,
    });

    if (album) {
      await albumModel.findByIdAndUpdate(album, {
        $push: { musics: music._id },
      });
    }

    res.status(201).json({
      message: "Music uploaded successfully",
      music: music,
    });
  } catch (error) {
    console.error("Error creating music:", error);
    res.status(500).json({ message: "Failed to upload music" });
  }
}

// 2. Create Album
async function createAlbum(req, res) {
  const { title, musics } = req.body;

  if (!title || String(title).trim() === "") {
    return res.status(400).json({ message: "Album title is required" });
  }

  const cleanTitle = String(title).trim().slice(0, 150);
  const cleanMusics = Array.isArray(musics)
    ? musics.map((id) => String(id)).slice(0, 50)
    : [];

  const album = await albumModel.create({
    title: cleanTitle,
    artist: req.user.id,
    musics: cleanMusics,
  });

  res.status(201).json({
    message: "Album created successfully",
    album: album,
  });
}

// 3. 🌟 GET ALL MUSICS: Dynamic Live Top Charts with Pagination (page, limit)
async function getAllMusics(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 15);
    const skip = (page - 1) * limit;

    let chartSongs = [];
    try {
      chartSongs = await fetchLiveTopCharts(limit, page);
    } catch (err) {
      console.warn("Live chart fetch error fallback:", err.message);
    }

    let localMusics = [];
    if (page === 1) {
      localMusics = await musicModel
        .find()
        .limit(10)
        .populate("artist", "username email");
    }

    // Verified chart songs come first; uploaded tracks follow afterwards
    const combined = chartSongs.length > 0 ? [...chartSongs, ...localMusics] : localMusics;

    const formatted = combined.map((track, i) => {
      const globalIndex = skip + i + 1;
      const playsCount = Math.max(15, Math.floor(98 - (globalIndex - 1) * 1.2));
      return {
        ...(track.toObject ? track.toObject() : track),
        rank: String(globalIndex).padStart(2, "0"),
        plays: track.plays || `${playsCount}M Plays`,
      };
    });

    res.status(200).json({
      message: "All musics fetched successfully",
      page,
      limit,
      total: formatted.length,
      hasMore: chartSongs.length === limit,
      musics: formatted,
    });
  } catch (error) {
    console.error("Error in getAllMusics:", error);
    res.status(500).json({ message: "Error fetching music tracks" });
  }
}

// 4. 🌟 GET TOP ARTISTS: Infinite Dynamic Artists with Search & Pagination (page, limit, q)
async function getTopArtists(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 18);
    const q = req.query.q || "";

    const result = await fetchTopArtists(page, limit, q);
    return res.status(200).json({
      message: "Top artists fetched successfully",
      page,
      limit,
      artists: result.artists,
      hasMore: result.hasMore,
      total: result.total,
    });
  } catch (error) {
    console.error("Error fetching top artists:", error);
    return res.status(500).json({ message: "Failed to fetch top artists" });
  }
}

// 5. 🌟 GET ALL ALBUMS: Dynamic Streaming Albums + Local DB with Pagination & Search
async function getAllAlbums(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 18);
    const query = req.query.q || "";

    let localAlbums = [];
    if (page === 1 && !query) {
      try {
        const found = await albumModel
          .find()
          .limit(6)
          .select("title artist musics")
          .populate("artist", "username email");

        localAlbums = (found || [])
          .filter((a) => a.musics && a.musics.length > 0)
          .map((a) => ({
            _id: a._id,
            title: a.title,
            artist: a.artist || { username: "Artist" },
            coverArt:
              "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
            year: "2026",
            language: "LOCAL",
          }));
      } catch (err) {
        console.warn("Local albums query fallback:", err.message);
      }
    }

    const dynamicResult = await fetchTopAlbums(page, limit, query);
    const dynamicAlbums = dynamicResult?.albums || [];
    const combined = [...localAlbums, ...dynamicAlbums];

    res.status(200).json({
      message: "All albums fetched successfully",
      albums: combined,
      page,
      hasMore: dynamicResult?.hasMore ?? true,
    });
  } catch (error) {
    console.error("Error fetching albums:", error);
    res.status(500).json({ message: "Failed to fetch albums" });
  }
}

// 6. 🌟 GET ALBUM BY ID: Dynamic Full Tracklist or Local DB
async function getAlbumById(req, res) {
  const albumId = req.params.albumId;

  // If dynamic album (starts with album_ or has custom alphanumeric ID)
  if (String(albumId).startsWith("album_") || !String(albumId).match(/^[0-9a-fA-F]{24}$/)) {
    const dynamicAlbum = await fetchAlbumDetails(albumId);
    if (dynamicAlbum) {
      return res.status(200).json({
        message: "Dynamic album fetched successfully",
        album: dynamicAlbum,
      });
    }
  }

  // Local MongoDB Album lookup
  try {
    const album = await albumModel
      .findById(albumId)
      .populate("artist", "username email")
      .populate("musics", "title uri duration coverArt");

    if (album) {
      return res.status(200).json({
        message: "Album fetched successfully",
        album: album,
      });
    }
  } catch (err) {
    console.warn("MongoDB album lookup error:", err.message);
  }

  // Fallback to dynamic lookup if not found in Mongo
  const fallbackAlbum = await fetchAlbumDetails(albumId);
  if (fallbackAlbum) {
    return res.status(200).json({
      message: "Dynamic album fetched successfully",
      album: fallbackAlbum,
    });
  }

  res.status(404).json({ message: "Album not found" });
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// 7. Search Music
async function searchMusic(req, res) {
  const { q } = req.query;

  if (!q || String(q).trim() === "") {
    return res.status(400).json({ message: "Search query 'q' parameter is required" });
  }

  const cleanQuery = String(q).trim().slice(0, 100);
  const safeRegex = new RegExp(escapeRegex(cleanQuery), "i");

  try {
    const localMusics = await musicModel
      .find({
        $or: [
          { title: { $regex: safeRegex } },
          { genre: { $regex: safeRegex } },
        ],
      })
      .populate("artist", "username email role")
      .limit(10);

    const globalMusics = await searchGlobalTracks(cleanQuery, 20);
    const allMusics = [...localMusics, ...globalMusics];

    return res.status(200).json({
      message: "Search completed successfully",
      totalResults: allMusics.length,
      musics: allMusics,
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ message: "Error searching music" });
  }
}

// 8. Search Podcasts
async function searchPodcasts(req, res) {
  const { q } = req.query;
  try {
    const episodes = await fetchPodcastsFromApi(q || "podcast", 15);
    return res.status(200).json({ episodes });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch podcasts" });
  }
}

// 9. Get Live Radio Stations
async function getRadioStations(req, res) {
  const { q } = req.query;
  try {
    const stations = await fetchRadioStationsFromApi(q || "hits", 15);
    return res.status(200).json({ stations });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch radio stations" });
  }
}

// 10. Get Song Lyrics
async function getLyrics(req, res) {
  const { artist, title } = req.query;
  if (!artist || !title) {
    return res.status(400).json({ message: "artist and title query parameters are required" });
  }

  try {
    const lyrics = await getSongLyrics(artist, title);
    return res.status(200).json({ lyrics });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch lyrics" });
  }
}

// 11. Toggle Like Music (With robust param detection & Mongoose markModified)
async function toggleLikeMusic(req, res) {
  const musicId = req.params.musicId || req.params.id;
  const userId = req.user.id;

  if (!musicId) {
    return res.status(400).json({ message: "Music ID is required" });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!Array.isArray(user.likedSongs)) {
      user.likedSongs = [];
    }

    const isAlreadyLiked = user.likedSongs.some(
      (song) => (song?._id ? String(song._id) : String(song)) === String(musicId)
    );

    if (isAlreadyLiked) {
      user.likedSongs = user.likedSongs.filter(
        (song) => (song?._id ? String(song._id) : String(song)) !== String(musicId)
      );
      user.markModified("likedSongs"); // Crucial for Mongoose Mixed array persistence
      await user.save();
      return res.status(200).json({
        message: "Removed from liked songs",
        isLiked: false,
      });
    } else {
      const raw = req.body.song || req.body;
      const songDetails = raw && (raw.title || raw.uri) ? {
        _id: String(raw._id || musicId),
        title: String(raw.title || "Unknown Title").slice(0, 200),
        uri: String(raw.uri || "").slice(0, 500),
        coverArt: String(raw.coverArt || "").slice(0, 500),
        duration: Number(raw.duration) || 0,
        genre: String(raw.genre || "Pop").slice(0, 50),
        artist: typeof raw.artist === "object"
          ? String(raw.artist?.username || raw.artist?.name || "Artist").slice(0, 100)
          : String(raw.artist || "Artist").slice(0, 100),
      } : { _id: String(musicId) };

      user.likedSongs.unshift(songDetails); // Add to beginning so newest like is at the top
      user.markModified("likedSongs"); // Crucial for Mongoose Mixed array persistence
      await user.save();
      return res.status(200).json({
        message: "Added to liked songs",
        isLiked: true,
      });
    }
  } catch (error) {
    console.error("Error in toggleLikeMusic:", error);
    return res.status(500).json({ message: "Error updating liked songs" });
  }
}

// 12. Get Liked Musics
async function getLikedMusics(req, res) {
  const userId = req.user.id;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const songs = Array.isArray(user.likedSongs) ? user.likedSongs : [];
    return res.status(200).json({
      likedSongs: songs,
      musics: songs,
    });
  } catch (error) {
    console.error("Error in getLikedMusics:", error);
    return res.status(500).json({ message: "Error fetching liked songs" });
  }
}

module.exports = {
  createMusic,
  createAlbum,
  getAllMusics,
  getAllAlbums,
  getAlbumById,
  searchMusic,
  searchPodcasts,
  getRadioStations,
  getLyrics,
  toggleLikeMusic,
  getLikedMusics,
  getTopArtists,
};