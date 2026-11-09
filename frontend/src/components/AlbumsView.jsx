import React, { useEffect, useState } from "react";
import {
  Disc,
  Play,
  Pause,
  Heart,
  Clock,
  ArrowLeft,
  Loader2,
  Search,
  Plus,
} from "lucide-react";
import api from "../api/axios";
import { usePlayerStore } from "../store/usePlayerStore";
import { useFavoritesStore } from "../store/useFavoritesStore";

export default function AlbumsView({ onOpenAddToPlaylist }) {
  const [albums, setAlbums] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumLoading, setAlbumLoading] = useState(false);

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const { toggleLike, isLiked } = useFavoritesStore();

  // 1. Initial Page 1 Albums Load
  useEffect(() => {
    async function fetchInitialAlbums() {
      setLoading(true);
      try {
        const res = await api.get("/music/albums?page=1&limit=18");
        const list = res.data?.albums || [];
        setAlbums(list);
        setHasMore(res.data?.hasMore ?? true);
        setPage(1);
      } catch (err) {
        console.error("Failed to load initial albums:", err);
      } finally {
        setLoading(false);
      }
    }

    if (!searchQuery.trim()) {
      fetchInitialAlbums();
    }
  }, [searchQuery]);

  // 2. Debounced Live Search for any album globally
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/music/albums?q=${encodeURIComponent(searchQuery.trim())}&page=1&limit=18`
        );
        setAlbums(res.data?.albums || []);
        setHasMore(res.data?.hasMore ?? false);
        setPage(1);
      } catch (err) {
        console.error("Live album search error:", err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 3. Infinite Load More Albums
  const handleLoadMoreAlbums = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const endpoint = searchQuery.trim()
        ? `/music/albums?q=${encodeURIComponent(searchQuery.trim())}&page=${nextPage}&limit=18`
        : `/music/albums?page=${nextPage}&limit=18`;

      const res = await api.get(endpoint);
      const newAlbums = res.data?.albums || [];

      if (newAlbums.length > 0) {
        setAlbums((prev) => {
          const existingIds = new Set(prev.map((a) => a._id || a.albumid));
          const uniqueNew = newAlbums.filter((a) => !existingIds.has(a._id || a.albumid));
          return [...prev, ...uniqueNew];
        });
        setPage(nextPage);
        setHasMore(res.data?.hasMore ?? true);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Load more albums error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // 4. Select & Load Full Album Tracklist
  const handleSelectAlbum = async (album) => {
    if (album.musics && album.musics.length > 0 && album.musics[0].uri) {
      setSelectedAlbum(album);
      return;
    }

    setAlbumLoading(true);
    try {
      const res = await api.get(`/music/albums/${album._id || album.albumid}`);
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
    if (!art) return "Various Artists";
    if (typeof art === "object") return art.username || art.name || "Artist";
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
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80";
              }}
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <span className="text-[11px] font-bold tracking-widest uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Studio Album
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-2 mb-1 tracking-tight">
              {selectedAlbum.title}
            </h1>
            <p className="text-sm font-semibold text-gray-300">
              {albumArtist} •{" "}
              <span className="text-gray-500 font-normal">
                {selectedAlbum.year || "2026"} • {tracks.length} songs
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
            <span className="col-span-8">Title</span>
            <span className="col-span-2 text-right hidden sm:block">
              <Clock size={14} className="inline ml-auto" />
            </span>
            <span className="col-span-3 sm:col-span-1 text-right">Like</span>
          </div>

          {albumLoading ? (
            <div className="py-20 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
              <Loader2 size={24} className="animate-spin text-blue-500" />
              <span className="text-xs">Loading album tracks...</span>
            </div>
          ) : tracks.length === 0 ? (
            <div className="py-16 text-center text-gray-500 text-xs">
              No tracks available for this album right now.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {tracks.map((song, index) => {
                const isCurrent = currentTrack?._id === song._id;
                const isThisPlaying = isCurrent && isPlaying;
                const liked = isLiked(song._id);

                return (
                  <div
                    key={song._id || index}
                    onClick={() => handlePlaySong(song, tracks)}
                    className={`grid grid-cols-12 items-center px-4 py-3 rounded-2xl hover:bg-white/[0.04] transition-all cursor-pointer group ${
                      isCurrent ? "bg-blue-600/10" : ""
                    }`}
                  >
                    {/* Index / Play Indicator */}
                    <div className="col-span-1 text-center">
                      {isThisPlaying ? (
                        <div className="flex items-end justify-center gap-0.5 h-3">
                          <span className="w-0.5 bg-blue-500 h-3 animate-pulse"></span>
                          <span className="w-0.5 bg-blue-500 h-2 animate-pulse delay-75"></span>
                          <span className="w-0.5 bg-blue-500 h-3 animate-pulse delay-150"></span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-mono group-hover:hidden">
                          {index + 1}
                        </span>
                      )}
                      <Play
                        size={14}
                        fill="currentColor"
                        className={`text-white mx-auto hidden ${
                          isThisPlaying ? "" : "group-hover:block"
                        }`}
                      />
                    </div>

                    {/* Title & Artist */}
                    <div className="col-span-8 flex items-center gap-3 min-w-0 pr-4">
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold truncate ${
                            isCurrent
                              ? "text-blue-400"
                              : "text-white group-hover:text-blue-300"
                          }`}
                        >
                          {song.title}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {song.artist || albumArtist}
                        </p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="col-span-2 text-right hidden sm:block text-xs font-mono text-gray-400">
                      {formatDuration(song.duration)}
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 sm:col-span-1 flex items-center justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(song);
                        }}
                        className={`p-1.5 rounded-full transition-transform active:scale-75 cursor-pointer ${
                          liked ? "text-red-500 fill-red-500" : "text-gray-500 hover:text-white"
                        }`}
                        title={liked ? "Remove from Liked" : "Save to Liked"}
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
  // VIEW A: ALL ALBUMS GRID VIEW
  // ──────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Disc size={24} className="text-blue-500" />
            <span>Studio Albums</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Official trending albums and compilations available in full
          </p>
        </div>

        {/* Global Album Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search any album worldwide..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181a24] text-xs text-white placeholder-gray-500 pl-10 pr-4 py-2.5 rounded-2xl border border-white/5 focus:outline-none focus:border-blue-500/50 shadow-inner"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="animate-spin text-blue-500" />
          <span className="text-xs">Loading studio albums...</span>
        </div>
      ) : albums.length === 0 ? (
        <div className="py-24 text-center text-gray-500 text-xs">
          No albums found matching "{searchQuery}".
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {albums.map((album) => (
              <div
                key={album._id || album.albumid}
                onClick={() => handleSelectAlbum(album)}
                className="group bg-[#181a24] hover:bg-[#1f2130] p-3.5 rounded-2xl flex flex-col border border-white/5 hover:border-blue-500/30 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95 shadow-md"
              >
                {/* Album Cover */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 shadow-lg bg-[#222538] border border-white/10">
                  <img
                    src={album.coverArt}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Album Title & Artist */}
                <p className="text-xs font-bold text-white truncate w-full group-hover:text-blue-400 transition-colors">
                  {album.title}
                </p>
                <p className="text-[11px] text-gray-400 truncate w-full mt-0.5">
                  {getArtistName(album.artist)}
                </p>
                <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1 font-mono">
                  <span>{album.year || "2026"}</span>
                  <span>{album.language || "ALBUM"}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Infinite Dynamic Load More Albums Button */}
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLoadMoreAlbums}
                disabled={loadingMore}
                className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-white/5 hover:bg-blue-600/20 text-xs font-bold text-gray-300 hover:text-blue-400 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-blue-400" />
                    <span>Loading more albums...</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} className="text-blue-400" />
                    <span>Load More Albums</span>
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