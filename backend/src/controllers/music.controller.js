const musicModel = require("../models/music.model");
const albumModel = require("../models/album.model");
const { uploadFile } = require("../services/storage.service");
const {
  getTrackMetadata,
  searchGlobalTracks,
  searchPodcasts: fetchPodcasts,
  getRadioStations: fetchRadioStations,
} = require("../services/musicApi.service");

async function createMusic(req, res) {
  const { title, genre } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "Audio file is required" });
  }

  if (!title) {
    return res.status(400).json({ message: "Song title is required" });
  }

  // 1. Upload audio to ImageKit
  const uploadResult = await uploadFile(file.buffer.toString("base64"));

  // 2. Fetch cover art, genre, and duration
  const metaData = await getTrackMetadata(title);

  // 3. Save song to MongoDB
  const music = await musicModel.create({
    title,
    uri: uploadResult.url,
    artist: req.user.id,
    duration: metaData?.duration || 215,
    coverArt:
      metaData?.coverArt ||
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80",
    genre: genre || metaData?.genre || "Music",
  });

  res.status(201).json({
    message: "Music uploaded and created successfully",
    music: music,
  });
}

async function createAlbum(req, res) {
  const { title, musics } = req.body;

  const album = await albumModel.create({
    title,
    artist: req.user.id,
    musics: musics,
  });

  res.status(201).json({
    message: "Album created successfully",
    album: {
      id: album._id,
      title: album.title,
      artist: album.artist,
      musics: album.musics,
    },
  });
}

async function getAllMusics(req, res) {
  const musics = await musicModel
    .find()
    .limit(20)
    .populate("artist", "username email");

  res.status(200).json({
    message: "All musics fetched successfully",
    musics: musics,
  });
}

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

async function logoutUser(req, res) {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
}

// Full Hybrid Search (Local MongoDB + Full-Length Global Music)
async function searchMusic(req, res) {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.status(400).json({ message: "Search query 'q' parameter is required" });
  }

  try {
    // 1. Search local MongoDB
    const localMusics = await musicModel
      .find({
        $or: [
          { title: { $regex: q, $options: "i" } },
          { genre: { $regex: q, $options: "i" } },
        ],
      })
      .populate("artist", "username email role")
      .limit(10);

    // 2. Search Global Music (Full-length streams!)
    const globalMusics = await searchGlobalTracks(q, 15);

    // 3. Combine: Local songs first, then Global catalog songs
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

// Real Podcasts Search Controller
async function searchPodcasts(req, res) {
  const { q } = req.query;
  try {
    const episodes = await fetchPodcasts(q || "podcast", 15);
    return res.status(200).json({ episodes });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch podcasts" });
  }
}

// Real Live Radio Stations Controller
async function getRadioStations(req, res) {
  const { q } = req.query;
  try {
    const stations = await fetchRadioStations(q || "hits", 15);
    return res.status(200).json({ stations });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch radio stations" });
  }
}

async function toggleLikeMusic(req, res) {
  const { musicId } = req.params;
  const { title, uri, coverArt, duration, genre, artist } = req.body;
  const userId = req.user.id;

  try {
    let music = null;

    if (musicId && musicId.match(/^[0-9a-fA-F]{24}$/)) {
      music = await musicModel.findById(musicId);
    }

    if (!music) {
      music = await musicModel.findOne({ uri });
    }

    if (!music && title && uri) {
      music = await musicModel.create({
        title,
        uri,
        coverArt: coverArt || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
        duration: duration || 210,
        genre: genre || "Music",
        artist: userId,
        likes: [],
      });
    }

    if (!music) {
      return res.status(404).json({ message: "Music track not found" });
    }

    const hasLiked = music.likes.includes(userId);
    let isLiked = false;

    if (hasLiked) {
      music.likes = music.likes.filter((id) => id.toString() !== userId.toString());
      isLiked = false;
    } else {
      music.likes.push(userId);
      isLiked = true;
    }

    await music.save();

    return res.status(200).json({
      message: isLiked ? "Added to Liked Songs" : "Removed from Liked Songs",
      isLiked,
      musicId: music._id,
      totalLikes: music.likes.length,
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    return res.status(500).json({ message: "Error updating favorite" });
  }
}

async function getLikedMusics(req, res) {
  const userId = req.user.id;

  const musics = await musicModel
    .find({ likes: userId })
    .populate("artist", "username email");

  return res.status(200).json({
    message: "Liked songs fetched successfully",
    total: musics.length,
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
  searchPodcasts,
  getRadioStations,
  toggleLikeMusic,
  getLikedMusics,
};