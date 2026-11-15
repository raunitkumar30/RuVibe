import React, { useEffect, useState } from "react";
import {
  UploadCloud,
  Play,
  Pause,
  Heart,
  Loader2,
  ArrowLeft,
  Plus,
  Music2,
  ListPlus,
  Sparkles,
} from "lucide-react";
import api from "../api/axios";
import { usePlayerStore } from "../store/usePlayerStore";
import { useFavoritesStore } from "../store/useFavoritesStore";
import { useToastStore } from "../store/useToastStore";

export default function MyUploadsView({ onBack, onOpenUpload, onAddToPlaylist }) {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const { toggleLike, isLiked } = useFavoritesStore();
  const { showToast } = useToastStore();

  const fetchMyUploads = async () => {
    setLoading(true);
    try {
      const res = await api.get("/music/my-uploads");
      setUploads(res.data?.musics || []);
    } catch (err) {
      console.error("Failed to load uploaded songs:", err);
      showToast("Failed to load your uploaded tracks", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyUploads();
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "3:30";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handlePlayTrack = (track) => {
    if (currentTrack?._id === track._id) {
      togglePlay();
    } else {
      playTrack(track, uploads);
    }
  };

  const handlePlayAll = () => {
    if (uploads.length > 0) {
      playTrack(uploads[0], uploads);
    }
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {/* Top Navigation Row */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft size={16} />
          <span>Back to Explore</span>
        </button>
      )}

      {/* Header Banner */}
      <div className="relative rounded-3xl p-8 bg-gradient-to-r from-blue-700/35 via-[#181a28] to-[#12131d] border border-white/5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6 text-center md:text-left">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/30 shrink-0">
            <UploadCloud size={46} />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              <Sparkles size={11} /> Artist Studio • MongoDB Catalog
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-2 mb-1">
              My Uploaded Songs
            </h1>
            <p className="text-xs text-gray-300 font-medium">
              {uploads.length} {uploads.length === 1 ? "track" : "tracks"} published by your artist profile
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {uploads.length > 0 && (
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-all shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
            >
              <Play size={15} fill="white" />
              <span>Play All</span>
            </button>
          )}

          {onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full border border-white/10 transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Upload New</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-24 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="animate-spin text-blue-500" />
          <span className="text-xs">Fetching your uploaded catalog from MongoDB...</span>
        </div>
      ) : uploads.length === 0 ? (
        <div className="text-center py-20 bg-[#181a26]/50 rounded-3xl border border-white/5 p-8 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Music2 size={32} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-1">No songs uploaded yet</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
              You haven't uploaded any tracks to MongoDB yet. Release your first song to stream it across RuVibe!
            </p>
          </div>
          {onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="mt-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider px-7 py-3 rounded-full shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Upload Your First Song</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#181a26]/70 rounded-3xl p-4 md:p-6 border border-white/5 space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-12 text-[11px] font-bold text-gray-400 px-4 py-2 border-b border-white/5 uppercase tracking-wider">
            <span className="col-span-1 text-center">#</span>
            <span className="col-span-6 md:col-span-5">Title</span>
            <span className="hidden md:block md:col-span-3">Album</span>
            <span className="col-span-3 md:col-span-2 text-right">Time</span>
            <span className="col-span-2 md:col-span-1 text-right">Actions</span>
          </div>

          {/* Songs List */}
          <div className="space-y-1">
            {uploads.map((track, idx) => {
              const isThisPlaying = currentTrack?._id === track._id && isPlaying;
              const artistName =
                typeof track.artist === "object"
                  ? track.artist?.username || "You"
                  : track.artist || "You";

              return (
                <div
                  key={track._id || idx}
                  className={`grid grid-cols-12 items-center p-3 rounded-2xl transition-all cursor-pointer group ${
                    isThisPlaying
                      ? "bg-blue-600/15 border border-blue-500/30"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                  onClick={() => handlePlayTrack(track)}
                >
                  {/* Column 1: Index / Play Icon */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-xs text-gray-500 font-semibold group-hover:hidden">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <button className="hidden group-hover:flex items-center justify-center text-blue-400">
                      {isThisPlaying ? (
                        <Pause size={15} fill="currentColor" />
                      ) : (
                        <Play size={15} fill="currentColor" />
                      )}
                    </button>
                  </div>

                  {/* Column 2: Track Art & Title */}
                  <div className="col-span-6 md:col-span-5 flex items-center gap-3.5 min-w-0 pr-2">
                    <img
                      src={track.coverArt || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80"}
                      alt={track.title}
                      className="w-11 h-11 rounded-xl object-cover shrink-0 shadow-md bg-[#242738]"
                    />
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-bold truncate ${
                          isThisPlaying ? "text-blue-400" : "text-white"
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {artistName}
                      </p>
                    </div>
                  </div>

                  {/* Column 3: Album */}
                  <div className="hidden md:block md:col-span-3 text-xs text-gray-400 truncate pr-2">
                    {track.album || "Single"}
                  </div>

                  {/* Column 4: Duration */}
                  <div className="col-span-3 md:col-span-2 text-right text-xs text-gray-400 font-medium">
                    {formatDuration(track.duration)}
                  </div>

                  {/* Column 5: Like & Add to Playlist */}
                  <div
                    className="col-span-2 md:col-span-1 flex items-center justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => toggleLike(track)}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                        isLiked(track._id)
                          ? "text-red-500"
                          : "text-gray-500 hover:text-white"
                      }`}
                      title={isLiked(track._id) ? "Unlike" : "Like"}
                    >
                      <Heart
                        size={15}
                        fill={isLiked(track._id) ? "currentColor" : "none"}
                      />
                    </button>

                    {onAddToPlaylist && (
                      <button
                        onClick={() => onAddToPlaylist(track)}
                        className="p-1.5 text-gray-500 hover:text-white rounded-full transition-colors cursor-pointer"
                        title="Add to Playlist"
                      >
                        <ListPlus size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

