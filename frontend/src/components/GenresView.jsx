import React, { useState, useEffect } from "react";
import {
  LayoutGrid,
  Play,
  Pause,
  Heart,
  ArrowLeft,
  Clock,
  MoreHorizontal,
  Loader2,
  Sparkles,
  Search,
} from "lucide-react";
import api from "../api/axios";
import { usePlayerStore } from "../store/usePlayerStore";
import { useFavoritesStore } from "../store/useFavoritesStore";

export default function GenresView({ initialGenre, onOpenAddToPlaylist }) {
  const [selectedGenre, setSelectedGenre] = useState(initialGenre || null);
  const [genreTracks, setGenreTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const { toggleLike, isLiked } = useFavoritesStore();

  const allGenres = [
    {
      name: "Hip Hop",
      tagline: "The hottest trap, drill, and lyrical hip-hop bangers.",
      gradient: "from-[#ba3225] to-[#45140f]",
      image:
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Pop",
      tagline: "Global chart-toppers, catchy hooks, and infectious melodies.",
      gradient: "from-[#1e6191] to-[#0c2d45]",
      image:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Lo-Fi Chill",
      tagline: "Beats to relax, study, and unwind to late at night.",
      gradient: "from-[#654062] to-[#2e1d2c]",
      image:
        "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "EDM & Dance",
      tagline: "Festival anthems, house beats, and bass-heavy drops.",
      gradient: "from-[#0f8b8d] to-[#073c3d]",
      image:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "R&B / Soul",
      tagline: "Smooth grooves, velvety vocals, and soulful late-night rhythms.",
      gradient: "from-[#8d3b75] to-[#3d1a33]",
      image:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Workout & Gym",
      tagline: "High-octane energetic beats to push through your limits.",
      gradient: "from-[#d94f26] to-[#591e0d]",
      image:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Alternative Indie",
      tagline: "Raw guitars, experimental vocals, and heartfelt songwriting.",
      gradient: "from-[#355c7d] to-[#142330]",
      image:
        "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Rock & Metal",
      tagline: "Electric riffs, pounding drums, and pure rock adrenaline.",
      gradient: "from-[#4a4e69] to-[#1a1b24]",
      image:
        "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Focus & Study",
      tagline: "Instrumental music scientifically designed for deep flow states.",
      gradient: "from-[#2b580c] to-[#112405]",
      image:
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Party & Club",
      tagline: "Upbeat party essentials guaranteed to light up any dance floor.",
      gradient: "from-[#8e44ad] to-[#3a1d47]",
      image:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Classical",
      tagline: "Timeless orchestral masterpieces from Bach to contemporary film scores.",
      gradient: "from-[#5d4037] to-[#251916]",
      image:
        "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Gaming Beats",
      tagline: "Synthesized synthwave, chiptune, and high-energy gamer soundtracks.",
      gradient: "from-[#16a085] to-[#0a473b]",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80",
    },
  ];

  // Load songs dynamically when a genre is selected
  useEffect(() => {
    if (!selectedGenre) return;

    async function fetchGenreSongs() {
      setLoadingTracks(true);
      try {
        const res = await api.get(
          `/music/search?q=${encodeURIComponent(selectedGenre.name)}`
        );
        setGenreTracks(res.data?.musics || []);
      } catch (err) {
        console.error("Failed to load genre songs:", err);
        setGenreTracks([]);
      } finally {
        setLoadingTracks(false);
      }
    }

    fetchGenreSongs();
  }, [selectedGenre]);

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "3:30";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const getArtistName = (art) => {
    if (!art) return "Artist";
    if (typeof art === "object") return art.username || "Artist";
    return art;
  };

  const handlePlaySong = (song) => {
    if (currentTrack?._id === song._id) {
      togglePlay();
    } else {
      playTrack(song, genreTracks);
    }
  };

  const handlePlayAll = () => {
    if (genreTracks.length > 0) {
      playTrack(genreTracks[0], genreTracks);
    }
  };

  const filteredGenres = allGenres.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ──────────────────────────────────────────────
  // VIEW B: SINGLE GENRE STATION
  // ──────────────────────────────────────────────
  if (selectedGenre) {
    return (
      <div className="space-y-6 select-none animate-fadeIn">
        {/* Back Button */}
        <button
          onClick={() => setSelectedGenre(null)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back to all genres</span>
        </button>

        {/* Station Hero Header */}
        <div
          className={`relative rounded-3xl p-8 bg-gradient-to-r ${selectedGenre.gradient} border border-white/10 shadow-2xl overflow-hidden flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6`}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left z-10">
            <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/20 shrink-0">
              <img
                src={selectedGenre.image}
                alt={selectedGenre.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-white/80 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                Genre Station
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white mt-2 mb-1 tracking-tight">
                {selectedGenre.name}
              </h1>
              <p className="text-xs sm:text-sm text-white/80 font-medium max-w-lg mt-1">
                {selectedGenre.tagline}
              </p>
            </div>
          </div>

          {/* Play All Button */}
          <button
            onClick={handlePlayAll}
            disabled={genreTracks.length === 0}
            className="flex items-center gap-2.5 bg-white text-black hover:bg-white/90 disabled:opacity-50 font-bold px-7 py-3 rounded-full shadow-xl transition-all active:scale-95 cursor-pointer z-10 shrink-0 text-xs"
          >
            <Play size={16} fill="currentColor" />
            <span>Play Station</span>
          </button>
        </div>

        {/* Tracklist Table */}
        <div className="bg-[#181a26]/70 rounded-3xl p-5 border border-white/5">
          {loadingTracks ? (
            <div className="py-20 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
              <Loader2 size={24} className="animate-spin text-blue-500" />
              <span className="text-xs">Tuning station...</span>
            </div>
          ) : genreTracks.length === 0 ? (
            <div className="py-16 text-center text-gray-500 text-xs">
              No tracks found for this genre.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {genreTracks.map((song, idx) => {
                const isCurrent = currentTrack?._id === song._id;
                const trackIsLiked = isLiked ? isLiked(song._id) : false;
                const artistName = getArtistName(song.artist);

                return (
                  <div
                    key={song._id || idx}
                    onClick={() => handlePlaySong(song)}
                    className={`grid grid-cols-12 items-center px-4 py-3 rounded-2xl cursor-pointer transition-all ${
                      isCurrent
                        ? "bg-blue-600/15 text-blue-400 font-semibold"
                        : "hover:bg-white/5 text-gray-300"
                    }`}
                  >
                    {/* Index */}
                    <div className="col-span-1 text-center text-xs text-gray-500">
                      {isCurrent && isPlaying ? (
                        <Pause
                          size={14}
                          className="mx-auto text-blue-400 fill-blue-400"
                        />
                      ) : (
                        <span>{String(idx + 1).padStart(2, "0")}</span>
                      )}
                    </div>

                    {/* Artwork + Title */}
                    <div className="col-span-7 flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#242738] shrink-0">
                        <img
                          src={
                            song.coverArt ||
                            selectedGenre.image ||
                            "https://via.placeholder.com/100"
                          }
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
                          {artistName}
                        </p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="col-span-2 text-right text-xs text-gray-400 hidden sm:block">
                      {formatDuration(song.duration)}
                    </div>

                    {/* Heart + Add to Playlist */}
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
  // VIEW A: GENRES & MOODS CATALOG
  // ──────────────────────────────────────────────
  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <LayoutGrid size={26} className="text-blue-500" />
            Genres & Moods
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Pick a vibe or genre to jump into non-stop streaming music.
          </p>
        </div>

        {/* Search Filter */}
        <div className="relative w-full sm:w-64">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Filter genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181a24] text-xs text-white placeholder-gray-500 pl-10 pr-4 py-2.5 rounded-2xl border border-white/5 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Grid of Spotify Category Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredGenres.map((genre) => (
          <div
            key={genre.name}
            onClick={() => setSelectedGenre(genre)}
            className={`group relative h-40 rounded-3xl p-5 overflow-hidden bg-gradient-to-br ${genre.gradient} border border-white/10 hover:border-white/30 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 active:scale-95 flex flex-col justify-between`}
          >
            {/* Title */}
            <h3 className="text-lg font-extrabold text-white tracking-tight drop-shadow-md z-10">
              {genre.name}
            </h3>

            {/* Corner Tilted Artwork (Classic Spotify browse tile style) */}
            <div className="absolute -bottom-2 -right-3 w-24 h-24 rounded-2xl overflow-hidden shadow-2xl rotate-[25deg] group-hover:rotate-[20deg] group-hover:scale-110 transition-all duration-300">
              <img
                src={genre.image}
                alt={genre.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Subtle Hover Play Pill */}
            <div className="z-10 flex items-center gap-1.5 text-[11px] font-bold text-white/80 group-hover:text-white transition-colors">
              <Sparkles size={13} />
              <span>Explore</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}