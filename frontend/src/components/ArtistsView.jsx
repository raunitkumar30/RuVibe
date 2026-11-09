import React, { useEffect, useState } from "react";
import {
  Mic2,
  Play,
  Pause,
  Heart,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MoreHorizontal,
  UserPlus,
  Check,
  Search,
} from "lucide-react";
import api from "../api/axios";
import { usePlayerStore } from "../store/usePlayerStore";
import { useFavoritesStore } from "../store/useFavoritesStore";

export default function ArtistsView({ initialArtist, onOpenAddToPlaylist }) {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistsList, setArtistsList] = useState([]);
  const [artistTracks, setArtistTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const { toggleLike, isLiked } = useFavoritesStore();

  // 1. Fetch real top artists from backend on mount
  useEffect(() => {
    async function loadArtists() {
      try {
        const res = await api.get("/music/top-artists");
        const list = res.data?.artists || [];
        setArtistsList(list);

        if (initialArtist) {
          const match = list.find(
            (a) => a.name.toLowerCase() === initialArtist.toLowerCase()
          );
          setSelectedArtist(
            match || {
              name: initialArtist,
              monthlyListeners: "75,000,000",
              genre: "Popular Artist",
              avatar:
                "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
            }
          );
        }
      } catch (err) {
        console.error("Failed to load artists:", err);
      } finally {
        setLoadingArtists(false);
      }
    }

    loadArtists();
  }, [initialArtist]);

  // 2. Fetch full hit songs for the selected artist
  useEffect(() => {
    if (!selectedArtist) return;

    async function loadArtistSongs() {
      setLoadingTracks(true);
      try {
        const res = await api.get(
          `/music/search?q=${encodeURIComponent(selectedArtist.name)}`
        );
        setArtistTracks(res.data?.musics || []);
      } catch (err) {
        console.error("Failed to load artist tracks:", err);
        setArtistTracks([]);
      } finally {
        setLoadingTracks(false);
      }
    }

    loadArtistSongs();
  }, [selectedArtist]);

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "3:30";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handlePlaySong = (song) => {
    if (currentTrack?._id === song._id) {
      togglePlay();
    } else {
      playTrack(song, artistTracks);
    }
  };

  const handlePlayAll = () => {
    if (artistTracks.length > 0) {
      playTrack(artistTracks[0], artistTracks);
    }
  };

  const filteredArtists = artistsList.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ──────────────────────────────────────────────
  // VIEW B: SINGLE VERIFIED ARTIST PAGE
  // ──────────────────────────────────────────────
  if (selectedArtist) {
    const avatar =
      selectedArtist.avatar ||
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80";

    return (
      <div className="space-y-6 select-none animate-fadeIn">
        {/* Back Button */}
        <button
          onClick={() => setSelectedArtist(null)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back to all artists</span>
        </button>

        {/* Hero Banner with Real Photo & Verified Badge */}
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-10 bg-gradient-to-r from-blue-950 via-[#181a28] to-[#12131d] border border-white/5 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 relative z-10">
            {/* Real Circular Photo */}
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden shadow-2xl shadow-black/80 shrink-0 border-2 border-white/10 bg-[#222538]">
              <img
                src={avatar}
                alt={selectedArtist.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80";
                }}
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-blue-400 text-xs font-bold tracking-wider uppercase mb-2">
                <CheckCircle2 size={16} fill="currentColor" className="text-black" />
                <span>Verified Artist</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2">
                {selectedArtist.name}
              </h1>

              <p className="text-sm font-semibold text-gray-300">
                {selectedArtist.monthlyListeners || "75,000,000"} monthly listeners
                {selectedArtist.genre && (
                  <span className="text-gray-500 font-normal">
                    {" "}• {selectedArtist.genre}
                  </span>
                )}
              </p>

              {/* Actions: Play All + Follow */}
              <div className="mt-5 flex items-center justify-center sm:justify-start gap-4">
                <button
                  onClick={handlePlayAll}
                  disabled={artistTracks.length === 0}
                  className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-7 py-3 rounded-full shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  <Play size={18} fill="currentColor" />
                  <span>Play</span>
                </button>

                <button
                  onClick={() => setIsFollowing((prev) => !prev)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold transition-all border cursor-pointer active:scale-95 ${
                    isFollowing
                      ? "bg-white/10 text-white border-white/20 hover:bg-white/15"
                      : "bg-transparent text-gray-300 border-white/10 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check size={14} className="text-blue-400" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Tracks Section */}
        <div className="bg-[#181a26]/70 rounded-3xl p-6 border border-white/5">
          <h3 className="text-base font-bold text-white mb-4">
            Popular Hits by {selectedArtist.name}
          </h3>

          {loadingTracks ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
              <Loader2 size={22} className="animate-spin text-blue-500" />
              <span className="text-xs">Loading songs...</span>
            </div>
          ) : artistTracks.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs">
              No songs found for this artist.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {artistTracks.map((song, idx) => {
                const isCurrent = currentTrack?._id === song._id;
                const trackIsLiked = isLiked ? isLiked(song._id) : false;

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
                    {/* Index or Pause */}
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
                          {song.genre || selectedArtist.genre || "Pop"}
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
  // VIEW A: REAL ARTISTS EXPLORER
  // ──────────────────────────────────────────────
  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Mic2 size={26} className="text-blue-500" />
            Top Artists
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Explore world-renowned artists, their discographies, and top streams.
          </p>
        </div>

        {/* Search Artists Box */}
        <div className="relative w-full sm:w-64">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181a24] text-xs text-white placeholder-gray-500 pl-10 pr-4 py-2.5 rounded-2xl border border-white/5 focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      {loadingArtists ? (
        <div className="py-24 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="animate-spin text-blue-500" />
          <span className="text-xs">Loading artists...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {filteredArtists.map((artist) => (
            <div
              key={artist.name}
              onClick={() => setSelectedArtist(artist)}
              className="group bg-[#181a24] hover:bg-[#1f2130] p-4 rounded-3xl flex flex-col items-center text-center border border-white/5 hover:border-blue-500/30 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95 shadow-md"
            >
              {/* Real Circular Portrait */}
              <div className="relative w-28 h-28 rounded-full overflow-hidden mb-3 shadow-lg bg-[#222538] border border-white/10">
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                    <Play size={16} fill="currentColor" className="ml-0.5" />
                  </div>
                </div>
              </div>

              <p className="text-sm font-bold text-white truncate w-full group-hover:text-blue-400 transition-colors">
                {artist.name}
              </p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                {artist.genre}
              </p>
              <span className="text-[10px] text-gray-500 mt-1">
                {artist.monthlyListeners || "Popular Artist"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}