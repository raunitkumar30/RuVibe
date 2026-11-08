const axios = require("axios");
const CryptoJS = require("crypto-js");

// Environment API variables with safe defaults
const JIOSAAVN_API_URL = process.env.JIOSAAVN_API_URL || "https://www.jiosaavn.com/api.php";
const JIOSAAVN_DES_KEY = process.env.JIOSAAVN_DES_KEY || "38346591";
const ITUNES_API_URL = process.env.ITUNES_API_URL || "https://itunes.apple.com/search";
const RADIO_BROWSER_API_URL = process.env.RADIO_BROWSER_API_URL || "https://de1.api.radio-browser.info/json/stations/search";
const LYRICS_API_URL = process.env.LYRICS_API_URL || "https://api.lyrics.ovh/v1";

// Helper to clean HTML entities
function cleanHtml(str) {
  if (!str) return "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// Decrypt JioSaavn encrypted_media_url using key from .env
function decryptJioSaavnUrl(encryptedUrl) {
  if (!encryptedUrl) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse(JIOSAAVN_DES_KEY);
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const raw = decrypted.toString(CryptoJS.enc.Utf8);
    if (!raw) return null;
    return raw.replace("_96.mp4", "_160.mp4");
  } catch (err) {
    console.error("JioSaavn decryption error:", err.message);
    return null;
  }
}

// 1. Fetch metadata on upload
async function getTrackMetadata(trackTitle) {
  if (!trackTitle || trackTitle.trim() === "") return null;

  try {
    const res = await axios.get(JIOSAAVN_API_URL, {
      params: {
        __call: "search.getResults",
        _format: "json",
        _marker: "0",
        cc: "in",
        includeMetaTags: "1",
        q: trackTitle,
        p: 1,
        n: 1,
      },
      timeout: 5000,
    });

    const song = res.data?.results?.[0];
    if (song) {
      const coverArt = song.image ? song.image.replace("150x150", "500x500") : null;
      return {
        coverArt,
        duration: Number(song.duration) || 210,
        genre: song.language ? song.language.toUpperCase() : "Music",
        albumTitle: cleanHtml(song.album),
        previewUrl: decryptJioSaavnUrl(song.encrypted_media_url),
      };
    }
  } catch (error) {
    console.warn("JioSaavn metadata fallback:", error.message);
  }

  return null;
}

// 2. Search Global Full-Length Songs
async function searchGlobalTracks(query, limit = 15) {
  if (!query || query.trim() === "") return [];

  try {
    const response = await axios.get(JIOSAAVN_API_URL, {
      params: {
        __call: "search.getResults",
        _format: "json",
        _marker: "0",
        cc: "in",
        includeMetaTags: "1",
        q: query,
        p: 1,
        n: limit,
      },
      timeout: 6000,
    });

    const results = response.data?.results || [];

    if (results.length > 0) {
      return results
        .map((item) => {
          const fullAudioUrl = decryptJioSaavnUrl(item.encrypted_media_url);
          if (!fullAudioUrl) return null;

          const coverArt = item.image
            ? item.image.replace("150x150", "500x500")
            : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80";

          return {
            _id: `global_${item.id}`,
            title: cleanHtml(item.song),
            artist: cleanHtml(item.primary_artists || item.singers || "Artist"),
            album: cleanHtml(item.album || "Single"),
            coverArt,
            uri: fullAudioUrl,
            duration: Number(item.duration) || 210,
            genre: (item.language || "Music").toUpperCase(),
            isExternal: true,
          };
        })
        .filter(Boolean);
    }
  } catch (error) {
    console.error("JioSaavn search error:", error.message);
  }

  // Fallback to iTunes API from .env
  try {
    const itunesRes = await axios.get(ITUNES_API_URL, {
      params: { term: query, entity: "song", limit },
      timeout: 5000,
    });

    return (itunesRes.data.results || []).map((item) => ({
      _id: `global_${item.trackId}`,
      title: item.trackName,
      artist: item.artistName,
      album: item.collectionName,
      coverArt: item.artworkUrl100
        ? item.artworkUrl100.replace("100x100bb", "600x600bb")
        : "https://via.placeholder.com/600",
      uri: item.previewUrl,
      duration: Math.round(item.trackTimeMillis / 1000),
      genre: item.primaryGenreName || "Music",
      isExternal: true,
    }));
  } catch {
    return [];
  }
}

// 3. Search Podcasts
async function searchPodcasts(query = "technology", limit = 15) {
  try {
    const response = await axios.get(ITUNES_API_URL, {
      params: {
        term: query,
        entity: "podcastEpisode",
        limit,
      },
      timeout: 6000,
    });

    const episodes = response.data?.results || [];

    return episodes.map((ep) => ({
      _id: `pod_${ep.trackId}`,
      title: ep.trackName,
      showTitle: ep.collectionName,
      artist: ep.artistName || ep.collectionName,
      album: "Podcast Episode",
      coverArt: ep.artworkUrl600 || ep.artworkUrl160 || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80",
      uri: ep.episodeUrl,
      duration: ep.trackTimeMillis ? Math.round(ep.trackTimeMillis / 1000) : 3600,
      releaseDate: ep.releaseDate ? new Date(ep.releaseDate).toLocaleDateString() : "Recent",
      description: ep.description || "Tune in to this full podcast episode.",
      isPodcast: true,
    }));
  } catch (error) {
    console.error("Podcast fetch error:", error.message);
    return [];
  }
}

// 4. Search Live Radio Stations
async function getRadioStations(query = "hits", limit = 15) {
  try {
    const response = await axios.get(RADIO_BROWSER_API_URL, {
      params: {
        name: query,
        limit,
        order: "votes",
        reverse: "true",
        hidebroken: "true",
      },
      timeout: 6000,
    });

    const stations = response.data || [];

    return stations.map((st) => ({
      _id: `radio_${st.stationuuid}`,
      title: st.name,
      artist: "Live Broadcast",
      album: st.country || "Worldwide",
      coverArt: st.favicon && st.favicon.startsWith("http")
        ? st.favicon
        : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
      uri: st.url_resolved || st.url,
      duration: 0,
      genre: st.tags || "Radio",
      isRadio: true,
      country: st.country || "Global",
      listeners: `${Math.floor(Math.random() * 50 + 10)}k listening`,
    }));
  } catch (error) {
    console.error("Radio stations fetch error:", error.message);
    return [];
  }
}

// 5. Fetch Song Lyrics
async function getSongLyrics(artist, title) {
  if (!artist || !title) return null;
  try {
    const res = await axios.get(`${LYRICS_API_URL}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, {
      timeout: 5000,
    });
    return res.data?.lyrics || null;
  } catch {
    return null;
  }
}

module.exports = {
  getTrackMetadata,
  searchGlobalTracks,
  searchPodcasts,
  getRadioStations,
  getSongLyrics,
};