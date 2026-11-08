import React from "react";
import {
  Clock,
  Play,
  Pause,
  Heart,
  Trash2,
  MoreHorizontal,
  Music,
} from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";
import { useFavoritesStore } from "../store/useFavoritesStore";

export default function RecentView({ onOpenAddToPlaylist }) {
  const {
    recentlyPlayed,
    clearRecent,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
  } = usePlayerStore();
  const { toggleLike, isLiked } = useFavoritesStore();

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
      playTrack(song, recentlyPlayed);
    }
  };

  const handlePlayAll = () => {
    if (recentlyPlayed.length > 0) {
      playTrack(recentlyPlayed[0], recentlyPlayed);
    }
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-8 bg-gradient-to-r from-blue-900/40 via-[#181a26] to-[#12131d] border border-white/5 shadow-2xl flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
          <div className="w-28 h-28 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-xl shadow-blue-600/20">
            <Clock size={48} />
          </div>

          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              History
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-2 mb-1 tracking-tight">
              Recently Played
            </h1>
            <p className="text-xs font-semibold text-gray-400">
              {recentlyPlayed.length} {recentlyPlayed.length === 1 ? "track" : "tracks"} played in this session
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {recentlyPlayed.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-full shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer text-xs"
            >
              <Play size={16} fill="currentColor" />
              <span>Play All</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm("Clear your listening history?")) {
                  clearRecent();
                }
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-full text-xs font-bold text-gray-400 hover:text-red-400 bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
              title="Clear History"
            >
              <Trash2 size={15} />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* Track List */}
      <div className="bg-[#181a26]/70 rounded-3xl p-5 border border-white/5">
        {recentlyPlayed.length === 0 ? (
          <div className="py-20 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500">
              <Music size={26} />
            </div>
            <p className="text-sm font-semibold text-gray-300">No recently played songs</p>
            <p className="text-xs text-gray-500 max-w-sm">
              Songs you listen to will automatically show up here so you can easily replay your favorites.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {recentlyPlayed.map((song, idx) => {
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
                  {/* Play Indicator / Index */}
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
                        src={song.coverArt || "https://via.placeholder.com/100"}
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