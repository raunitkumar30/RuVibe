const musicModel = require("../models/music.model");
const albumModel = require("../models/album.model");
const userModel = require("../models/user.model");
const {
  uploadFile,
  decryptJioSaavnUrl,
} = require("../services/storage.service");
const {
  getTrackMetadata,
  searchGlobalTracks,
  fetchLiveTopCharts,
  fetchTopArtists,
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

  const album = await albumModel.create({
    title: title,
    artist: req.user.id,
    musics: musics,
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

    let localMusics = [];
    if (page === 1) {
      localMusics = await musicModel
        .find()
        .limit(10)
        .populate("artist", "username email");
    }

    let chartSongs = [];
    try {
      chartSongs = await fetchLiveTopCharts(page, limit);
    } catch (err) {
      console.warn("Live chart fetch error fallback:", err.message);
    }

    const combined = [...localMusics, ...chartSongs];

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

// 5. Get All Albums
async function getAllAlbums(req, res) {
  const albums = await albumModel
    .find()
    .limit(10)
    .select("title artist musics")
    .populate("artist", "username email");

  res.status(200).json({
    message: "All albums fetched successfully",
    albums: albums,
  });
}

// 6. Get Album by ID
async function getAlbumById(req, res) {
  const albumId = req.params.albumId;

  const album = await albumModel
    .findById(albumId)
    .populate("artist", "username email")
    .populate("musics", "title uri duration coverArt");

  if (!album) {
    return res.status(404).json({ message: "Album not found" });
  }

  res.status(200).json({
    message: "Album fetched successfully",
    album: album,
  });
}

// 7. Logout User
async function logoutUser(req, res) {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
}

// 8. Search Music
async function searchMusic(req, res) {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.status(400).json({ message: "Search query 'q' parameter is required" });
  }

  try {
    const localMusics = await musicModel
      .find({
        $or: [
          { title: { $regex: q, $options: "i" } },
          { genre: { $regex: q, $options: "i" } },
        ],
      })
      .populate("artist", "username email role")
      .limit(10);

    const globalMusics = await searchGlobalTracks(q, 20);
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

// 9. Search Podcasts
async function searchPodcasts(req, res) {
  const { q } = req.query;
  try {
    const episodes = await fetchPodcastsFromApi(q || "podcast", 15);
    return res.status(200).json({ episodes });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch podcasts" });
  }
}

// 10. Get Live Radio Stations
async function getRadioStations(req, res) {
  const { q } = req.query;
  try {
    const stations = await fetchRadioStationsFromApi(q || "hits", 15);
    return res.status(200).json({ stations });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch radio stations" });
  }
}

// 11. Get Song Lyrics
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

// 12. Toggle Like Music
async function toggleLikeMusic(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAlreadyLiked = user.likedSongs?.some(
      (song) => song._id?.toString() === id || song.toString() === id
    );

    if (isAlreadyLiked) {
      user.likedSongs = user.likedSongs.filter(
        (song) => (song._id ? song._id.toString() : song.toString()) !== id
      );
      await user.save();
      return res.status(200).json({
        message: "Removed from liked songs",
        isLiked: false,
      });
    } else {
      const songDetails = req.body.song;
      if (songDetails) {
        user.likedSongs.push(songDetails);
      } else {
        user.likedSongs.push(id);
      }
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

// 13. Get Liked Musics
async function getLikedMusics(req, res) {
  const userId = req.user.id;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      likedSongs: user.likedSongs || [],
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
  logoutUser,
  searchMusic,
  searchPodcasts,
  getRadioStations,
  getLyrics,
  toggleLikeMusic,
  getLikedMusics,
  getTopArtists,
};