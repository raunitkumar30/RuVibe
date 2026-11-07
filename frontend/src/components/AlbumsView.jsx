import React, { useEffect, useState } from "react";
import {
  Disc,
  Play,
  Pause,
  Heart,
  Clock,
  ArrowLeft,
  Loader2,
  Music,
  MoreHorizontal,
} from "lucide-react";
import api from "../api/axios";
import { usePlayerStore } from "../store/usePlayerStore";
import { useFavoritesStore } from "../store/useFavoritesStore";

export default function AlbumsView({ onOpenAddToPlaylist }) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumLoading, setAlbumLoading] = useState(false);

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const { toggleLike, isLiked } = useFavoritesStore();

  // Curated Fallback Albums with real audio streams & artwork
  const fallbackAlbums = [
    {
      _id: "album_1",
      title: "After Hours",
      artist: { username: "The Weeknd" },
      coverArt:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
      year: "2020",
      musics: [
        {
          _id: "ah_1",
          title: "Blinding Lights",
          artist: "The Weeknd",
          duration: 200,
          coverArt:
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
        {
          _id: "ah_2",
          title: "Save Your Tears",
          artist: "The Weeknd",
          duration: 215,
          coverArt:
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
        {
          _id: "ah_3",
          title: "In Your Eyes",
          artist: "The Weeknd",
          duration: 237,
          coverArt:
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
      ],
    },
    {
      _id: "album_2",
      title: "Astroworld",
      artist: { username: "Travis Scott" },
      coverArt:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
      year: "2018",
      musics: [
        {
          _id: "astro_1",
          title: "SICKO MODE",
          artist: "Travis Scott",
          duration: 312,
          coverArt:
            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
        {
          _id: "astro_2",
          title: "Butterfly Effect",
          artist: "Travis Scott",
          duration: 212,
          coverArt:
            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
      ],
    },
    {
      _id: "album_3",
      title: "Certified Lover Boy",
      artist: { username: "Drake" },
      coverArt:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80",
      year: "2021",
      musics: [
        {
          _id: "clb_1",
          title: "Fair Trade",
          artist: "Drake ft. Travis Scott",
          duration: 291,
          coverArt:
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=80",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
        {
          _id: "clb_2",
          title: "Way 2 Sexy",
          artist: "Drake",
          duration: 257,
          coverArt:
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=80",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
      ],
    },
    {
      _id: "album_4",
      title: "Future Nostalgia",
      artist: { username: "Dua Lipa" },
      coverArt:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80",
      year: "2020",
      musics: [
        {
          _id: "fn_1",
          title: "Levitating",
          artist: "Dua Lipa",
          duration: 203,
          coverArt:
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
        {
          _id: "fn_2",
          title: "Don't Start Now",
          artist: "Dua Lipa",
          duration: 183,
          coverArt:
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
      ],
    },
  ];

  // 1. Fetch All Albums from MongoDB
  useEffect(() => {
    async function fetchAlbums() {
      setLoading(true);
      try {
        const res = await api.get("/music/albums");
        const list = res.data?.albums || [];
        if (list.length > 0) {
          setAlbums(list);
        } else {
          setAlbums(fallbackAlbums);
        }
      } catch {
        setAlbums(fallbackAlbums);
      } finally {
        setLoading(false);
      }
    }
    fetchAlbums();
  }, []);

  // 2. Select & Load an Album
  const handleSelectAlbum = async (album) => {
    // If it's a fallback album or already has full songs populated
    if (album.musics && album.musics.length > 0 && album.musics[0].uri) {
      setSelectedAlbum(album);
      return;
    }

    setAlbumLoading(true);
    try {
      const res = await api.get(`/music/albums/${album._id}`);
      if (res.data?.album) {
        setSelectedAlbum(res.data.album);
      } else {
        setSelectedAlbum(album);
      }
    } catch {
      setSelectedAlbum(album);
    } finally {
      setAlbumLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "3:30";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const getArtistName = (art) => {
    if (!art) return "Unknown Artist";
    if (typeof art === "object") return art.username || "Artist";
    return art;
  };

  // Play a single song from the album
  const handlePlaySong = (song, albumTracks) => {
    if (currentTrack?._id === song._id) {
      togglePlay();
    } else {
      playTrack(song, albumTracks);
    }
  };

  // Play All songs in the album
  const handlePlayAlbum = () => {
    const tracks = selectedAlbum?.musics || [];
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  // ──────────────────────────────────────────────
  // VIEW B: SINGLE ALBUM DETAIL VIEW
  // ──────────────────────────────────────────────
  if (selectedAlbum) {
    const tracks = selectedAlbum.musics || [];
    const albumArtist = getArtistName(selectedAlbum.artist);
    const albumCover =
      selectedAlbum.coverArt ||
      tracks[0]?.coverArt ||
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80";

    return (
      <div className="space-y-6 animate-fadeIn select-none">
        {/* Back Button */}
        <button
          onClick={() => setSelectedAlbum(null)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back to all albums</span>
        </button>

        {/* Album Header Banner */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 bg-gradient-to-b from-blue-900/30 via-[#181a26] to-[#12131d] p-7 rounded-3xl border border-white/5 shadow-2xl">
          <div className="w-44 h-44 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 bg-[#1e202e] shrink-0 border border-white/10">
            <img
              src={albumCover}
              alt={selectedAlbum.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <span className="text-[11px] font-bold tracking-widest uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Album
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-2 mb-1 tracking-tight">
              {selectedAlbum.title}
            </h1>
            <p className="text-sm font-semibold text-gray-300">
              {albumArtist} •{" "}
              <span className="text-gray-500 font-normal">
                {selectedAlbum.year || "2024"} • {tracks.length} songs
              </span>
            </p>

            {/* Play Album Button */}
            <div className="mt-5 flex items-center justify-center sm:justify-start gap-4">
              <button
                onClick={handlePlayAlbum}
                disabled={tracks.length === 0}
                className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-full shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
              >
                <Play size={18} fill="currentColor" />
                <span>Play Album</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tracklist Table */}
        <div className="bg-[#181a26]/70 rounded-3xl p-5 border border-white/5">
          <div className="grid grid-cols-12 text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 pb-3 border-b border-white/5">
            <span className="col-span-1 text-center">#</span>
            <span className="col-span-7">Title</span>
            <span className="col-span-2 text-right hidden sm:block">
              <Clock size={14} className="inline ml-auto" />
            </span>
            <span className="col-span-4 sm:col-span-2 text-right">Actions</span>
          </div>

          {tracks.length === 0 ? (
            <div className="py-16 text-center text-gray-500 text-xs">
              No songs added to this album yet.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03] mt-1">
              {tracks.map((song, idx) => {
                const isCurrent = currentTrack?._id === song._id;
                const trackIsLiked = isLiked ? isLiked(song._id) : false;
                const songArtist = getArtistName(song.artist) || albumArtist;

                return (
                  <div
                    key={song._id || idx}
                    onClick={() => handlePlaySong(song, tracks)}
                    className={`grid grid-cols-12 items-center px-4 py-3 rounded-2xl cursor-pointer transition-all ${
                      isCurrent
                        ? "bg-blue-600/15 text-blue-400 font-semibold"
                        : "hover:bg-white/5 text-gray-300"
                    }`}
                  >
                    {/* Index / Play Indicator */}
                    <div className="col-span-1 text-center text-xs text-gray-500">
                      {isCurrent && isPlaying ? (
                        <Pause
                          size={14}
                          className="mx-auto text-blue-400 fill-blue-400"
                        />
                      ) : (
                        <span className="group-hover:hidden">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      )}
                    </div>

                    {/* Title & Artist */}
                    <div className="col-span-7 flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#242738] shrink-0">
                        <img
                          src={song.coverArt || albumCover}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-sm truncate ${
                            isCurrent ? "text-blue-400 font-bold" : "text-white"
                          }`}
                        >
                          {song.title}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {songArtist}
                        </p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="col-span-2 text-right text-xs text-gray-400 hidden sm:block">
                      {formatDuration(song.duration)}
                    </div>

                    {/* Actions: Heart + Menu */}
                    <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (toggleLike) toggleLike(song);
                        }}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          trackIsLiked
                            ? "text-red-500"
                            : "text-gray-500 hover:text-red-400"
                        }`}
                        title={trackIsLiked ? "Unlike" : "Like"}
                      >
                        <Heart
                          size={15}
                          fill={trackIsLiked ? "currentColor" : "none"}
                        />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenAddToPlaylist) onOpenAddToPlaylist(song);
                        }}
                        className="text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        title="Add to Playlist"
                      >
                        <MoreHorizontal size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // VIEW A: ALBUMS GRID (MAIN)
  // ──────────────────────────────────────────────
  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Disc size={26} className="text-blue-500" />
            Featured Albums
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Browse through full studio albums and discographies.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="animate-spin text-blue-500" />
          <span className="text-xs">Loading albums...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {albums.map((album, idx) => {
            const albumArtist = getArtistName(album.artist);
            const cover =
              album.coverArt ||
              album.musics?.[0]?.coverArt ||
              fallbackAlbums[idx % fallbackAlbums.length].coverArt;
            const songCount = album.musics?.length || 8;

            return (
              <div
                key={album._id || idx}
                onClick={() => handleSelectAlbum(album)}
                className="group bg-[#181a26]/80 hover:bg-[#1e2030] p-4 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg flex flex-col"
              >
                {/* Artwork with hover play button */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-3 bg-[#242738] shadow-md">
                  <img
                    src={cover}
                    alt={album.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                      <Play size={20} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Album Info */}
                <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                  {album.title}
                </h4>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {albumArtist}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                  <span>Album</span>
                  <span>{songCount} songs</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}