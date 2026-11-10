import React, { useEffect, useState } from "react";
import {
  Mic2,
  Play,
  Pause,
  Heart,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  UserPlus,
  Check,
  Search,
  Plus,
} from "lucide-react";
import api from "../api/axios";
import { usePlayerStore } from "../store/usePlayerStore";
import { useFavoritesStore } from "../store/useFavoritesStore";

export default function ArtistsView({ initialArtist, onBack, onOpenAddToPlaylist }) {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistsList, setArtistsList] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [artistTracks, setArtistTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const { toggleLike, isLiked } = useFavoritesStore();

  // Sync selected artist when initialArtist is passed
  useEffect(() => {
    if (initialArtist) {
      if (typeof initialArtist === "object") {
        setSelectedArtist(initialArtist);
      } else {
        setSelectedArtist({
          name: initialArtist,
          monthlyListeners: "85,000,000",
          genre: "Top Verified Artist",
          avatar:
            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
        });
      }
    }
  }, [initialArtist]);

  // 1. Initial Page 1 load (18 artists)
  useEffect(() => {
    async function loadInitialArtists() {
      setLoadingArtists(true);
      try {
        const res = await api.get("/music/top-artists?page=1&limit=18");
        const list = res.data?.artists || [];
        setArtistsList(list);
        setHasMore(res.data?.hasMore ?? true);
        setPage(1);
      } catch (err) {
        console.error("Failed to load artists:", err);
      } finally {
        setLoadingArtists(false);
      }
    }

    if (!searchQuery.trim()) {
      loadInitialArtists();
    }
  }, [searchQuery]);

  // 2. Debounced live search across all artists globally
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const timer = setTimeout(async () => {
      setLoadingArtists(true);
      try {
        const res = await api.get(
          `/music/top-artists?q=${encodeURIComponent(searchQuery.trim())}&page=1&limit=18`
        );
        const list = res.data?.artists || [];
        setArtistsList(list);
        setHasMore(res.data?.hasMore ?? false);
        setPage(1);
      } catch (err) {
        console.error("Live artist search failed:", err);
      } finally {
        setLoadingArtists(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 3. Dynamic Infinite Pagination: Load more artists
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const url = searchQuery.trim()
        ? `/music/top-artists?q=${encodeURIComponent(searchQuery.trim())}&page=${nextPage}&limit=18`
        : `/music/top-artists?page=${nextPage}&limit=18`;

      const res = await api.get(url);
      const newArtists = res.data?.artists || [];

      if (newArtists.length > 0) {
        setArtistsList((prev) => {
          const existingIds = new Set(prev.map((a) => a.id || a.name));
          const uniqueNew = newArtists.filter((a) => !existingIds.has(a.id || a.name));
          return [...prev, ...uniqueNew];
        });
        setPage(nextPage);
        setHasMore(res.data?.hasMore ?? newArtists.length >= 18);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more artists:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // 4. Fetch selected artist's complete songs
  useEffect(() => {
    if (!selectedArtist) return;

    async function fetchArtistTracks() {
      setLoadingTracks(true);
      try {
        const queryName = selectedArtist.name;
        const res = await api.get(`/music/search?q=${encodeURIComponent(queryName)}`);
        const results = res.data?.musics || [];
        setArtistTracks(results);
      } catch (err) {
        console.error("Failed to load artist tracks:", err);
      } finally {
        setLoadingTracks(false);
      }
    }

    fetchArtistTracks();
  }, [selectedArtist]);

  const handlePlayAll = () => {
    if (artistTracks.length > 0) {
      playTrack(artistTracks[0], artistTracks);
    }
  };

  const handlePlaySong = (song) => {
    if (currentTrack?._id === song._id) {
      togglePlay();
    } else {
      playTrack(song, artistTracks);
    }
  };

  // ──────────────────────────────────────────────
  // VIEW B: SINGLE ARTIST PROFILE VIEW
  // ──────────────────────────────────────────────
  if (selectedArtist) {
    return (
      <div className="space-y-7 animate-fadeIn select-none">
        {/* Back Button */}
        <button
          onClick={() => {
            if (onBack) onBack();
            else setSelectedArtist(null);
          }}
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full w-fit"
        >
          <ArrowLeft size={16} />
          <span>Back to All Artists</span>
        </button>

        {/* Artist Profile Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-blue-900/40 via-[#181a26] to-[#12131d] p-8 border border-white/5">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 relative z-10">
            {/* Large Artist Portrait */}
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden shadow-2xl shrink-0 bg-[#242738] border-4 border-white/10">
              <img
                src={selectedArtist.avatar}
                alt={selectedArtist.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80";
                }}
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-blue-400 mb-1">
                <CheckCircle2 size={16} />
                <span className="text-xs font-bold tracking-wider uppercase">
                  Verified Artist
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">
                {selectedArtist.name}
              </h1>
              <p className="text-gray-300 text-sm font-medium mb-6">
                {selectedArtist.monthlyListeners || "12,500,000"} monthly listeners
                {selectedArtist.genre ? ` • ${selectedArtist.genre}` : ""}
              </p>

              {/* Actions: Play All & Follow */}
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <button
                  onClick={handlePlayAll}
                  disabled={artistTracks.length === 0}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider px-7 py-3 rounded-full transition-all shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
                >
                  <Play size={16} fill="currentColor" />
                  <span>Play All Songs</span>
                </button>
                <button
                  onClick={() => setIsFollowing((prev) => !prev)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    isFollowing
                      ? "bg-white/10 border-blue-400 text-blue-400"
                      : "border-white/15 text-gray-300 hover:text-white hover:border-white/30"
                  }`}
                >
                  {isFollowing ? <Check size={14} /> : <UserPlus size={14} />}
                  <span>{isFollowing ? "Following" : "Follow"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Songs Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-wide">
              Popular Tracks by {selectedArtist.name}
            </h2>
            <span className="text-xs text-gray-400 font-mono">
              {artistTracks.length} tracks available
            </span>
          </div>

          {loadingTracks ? (
            // Shimmering Track Rows Skeleton
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 px-4 rounded-2xl bg-[#181a24]/50 border border-white/5 animate-pulse"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-5 h-4 bg-white/10 rounded" />
                    <div className="w-11 h-11 bg-white/10 rounded-xl shrink-0" />
                    <div className="space-y-1.5 flex-1 max-w-xs">
                      <div className="h-3.5 bg-white/10 rounded w-4/5" />
                      <div className="h-2.5 bg-white/5 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-3 bg-white/10 rounded hidden sm:block" />
                    <div className="w-10 h-3 bg-white/10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : artistTracks.length === 0 ? (
            <div className="py-16 text-center text-gray-500 text-xs">
              No tracks found for this artist right now.
            </div>
          ) : (
            <div className="space-y-1.5">
              {artistTracks.map((song, idx) => {
                const isCurrent = currentTrack?._id === song._id;
                const isThisPlaying = isCurrent && isPlaying;
                const liked = isLiked(song._id);

                return (
                  <div
                    key={song._id || idx}
                    onClick={() => handlePlaySong(song)}
                    className={`flex items-center justify-between p-2.5 px-4 rounded-2xl cursor-pointer transition-all duration-200 group ${
                      isCurrent
                        ? "bg-blue-600/15 border border-blue-500/30"
                        : "bg-[#181a24]/60 hover:bg-[#1f2130] border border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
                      <span className="w-5 text-center text-xs font-mono font-bold text-gray-500">
                        {String(idx + 1).padStart(2, "0")}
                      </span>

                      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#242738] shrink-0 border border-white/10">
                        <img
                          src={song.coverArt}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                        <div
                          className={`absolute inset-0 bg-black/40 flex items-center justify-center ${
                            isThisPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          {isThisPlaying ? (
                            <Pause size={16} fill="currentColor" />
                          ) : (
                            <Play size={16} fill="currentColor" className="ml-0.5" />
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs font-bold truncate group-hover:text-blue-400 transition-colors ${
                            isCurrent ? "text-blue-400" : "text-white"
                          }`}
                        >
                          {song.title}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {song.album || "Single"}
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:block text-xs font-mono text-gray-400 pr-6">
                      {song.duration
                        ? `${Math.floor(song.duration / 60)}:${String(
                            Math.floor(song.duration % 60)
                          ).padStart(2, "0")}`
                        : "3:30"}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(song);
                        }}
                        className={`p-1.5 rounded-full transition-transform active:scale-75 cursor-pointer ${
                          liked ? "text-red-500 fill-red-500" : "text-gray-500 hover:text-white"
                        }`}
                      >
                        <Heart size={16} fill={liked ? "currentColor" : "none"} />
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
  // VIEW A: ALL ARTISTS GRID VIEW
  // ──────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Mic2 size={24} className="text-blue-500" />
            <span>Verified Artists</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Top global artists with verified full music catalogs
          </p>
        </div>

        {/* Global Artist Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search any artist worldwide..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181a24] text-xs text-white placeholder-gray-500 pl-10 pr-4 py-2.5 rounded-2xl border border-white/5 focus:outline-none focus:border-blue-500/50 shadow-inner"
          />
        </div>
      </div>

      {loadingArtists && artistsList.length === 0 ? (
        // Shimmering 12-Card Artist Grid Skeleton
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="bg-[#181a24]/60 p-4 rounded-3xl flex flex-col items-center text-center border border-white/5 animate-pulse"
            >
              <div className="w-28 h-28 rounded-full bg-white/10 mb-3" />
              <div className="w-20 h-3.5 bg-white/10 rounded mb-1.5" />
              <div className="w-14 h-2.5 bg-white/5 rounded mb-2" />
              <div className="w-16 h-2 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {artistsList.map((artist) => (
              <div
                key={artist.id || artist.name}
                onClick={() => setSelectedArtist(artist)}
                className="group bg-[#181a24] hover:bg-[#1f2130] p-4 rounded-3xl flex flex-col items-center text-center border border-white/5 hover:border-blue-500/30 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95 shadow-md animate-fadeIn"
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
                <p className="text-[11px] text-gray-400 font-medium mt-0.5 truncate w-full">
                  {artist.genre}
                </p>
                <span className="text-[10px] text-gray-500 mt-1 truncate w-full">
                  {artist.plays || artist.monthlyListeners || "Verified Artist"}
                </span>
              </div>
            ))}
          </div>

          {/* Load More Artists Button */}
          {hasMore && (
            <div className="pt-6 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white/5 hover:bg-blue-600/20 text-xs font-bold text-gray-300 hover:text-blue-400 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-blue-400" />
                    <span>Loading more artists...</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} className="text-blue-400" />
                    <span>Load More Artists</span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}