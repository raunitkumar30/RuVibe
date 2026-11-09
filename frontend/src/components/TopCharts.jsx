import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Heart,
  MoreHorizontal,
  ListPlus,
  FastForward,
  FolderPlus,
} from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";
import { useFavoritesStore } from "../store/useFavoritesStore";
import { useToastStore } from "../store/useToastStore";

export default function TopCharts({ tracks, onOpenAddToPlaylist }) {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    addToQueue,
    playNextInQueue,
  } = usePlayerStore();

  const { toggleLike, isLiked } = useFavoritesStore();
  const { showToast } = useToastStore();

  const [activeMenuTrackId, setActiveMenuTrackId] = useState(null);
  const menuRef = useRef(null);

  const chartTracks = tracks && tracks.length > 0 ? tracks : [];

  // Close floating menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuTrackId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRowClick = (track) => {
    if (currentTrack?._id === track._id) {
      togglePlay();
    } else {
      playTrack(track, chartTracks);
    }
  };

  const handlePlayNext = (e, track) => {
    e.stopPropagation();
    playNextInQueue(track);
    setActiveMenuTrackId(null);
    showToast(`Will play next: ${track.title}`);
  };

  const handleAddToQueue = (e, track) => {
    e.stopPropagation();
    addToQueue(track);
    setActiveMenuTrackId(null);
    showToast(`Added to queue: ${track.title}`);
  };

  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">
            Top Charts
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            The most played songs right now
          </p>
        </div>
        <span className="text-xs text-gray-400 font-medium font-mono">
          {chartTracks.length} tracks
        </span>
      </div>

      {/* Track List Table */}
      <div className="space-y-1.5 relative">
        {chartTracks.slice(0, 10).map((track, index) => {
          const isThisTrackCurrent = currentTrack?._id === track._id;
          const isThisTrackPlaying = isThisTrackCurrent && isPlaying;
          const isMenuOpen = activeMenuTrackId === track._id;

          const artistName =
            typeof track.artist === "object"
              ? track.artist?.username || "Artist"
              : track.artist || "Artist";

          const trackIsLiked = isLiked ? isLiked(track._id) : false;

          return (
            <div
              key={track._id || index}
              onClick={() => handleRowClick(track)}
              className={`group relative flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                isThisTrackCurrent
                  ? "bg-blue-600/15 border border-blue-500/25"
                  : "hover:bg-[#181a26] border border-transparent"
              }`}
            >
              {/* Left: Rank / Equalizer + Thumbnail + Title/Artist */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-5 text-center flex items-center justify-center shrink-0">
                  {isThisTrackPlaying ? (
                    <div className="flex items-end gap-0.5 h-3.5">
                      <span className="w-1 bg-blue-500 rounded-full animate-eq-1"></span>
                      <span className="w-1 bg-blue-500 rounded-full animate-eq-2"></span>
                      <span className="w-1 bg-blue-500 rounded-full animate-eq-3"></span>
                    </div>
                  ) : (
                    <span
                      className={`text-xs font-semibold ${
                        isThisTrackCurrent ? "text-blue-400 font-bold" : "text-gray-500"
                      }`}
                    >
                      {track.rank || String(index + 1).padStart(2, "0")}
                    </span>
                  )}
                </div>

                <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-md bg-black/40">
                  <img
                    src={track.coverArt || "https://via.placeholder.com/100"}
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isThisTrackPlaying
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {isThisTrackPlaying ? (
                      <Pause size={15} className="text-white" fill="white" />
                    ) : (
                      <Play size={15} className="text-white ml-0.5" fill="white" />
                    )}
                  </div>
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold truncate ${
                      isThisTrackCurrent ? "text-blue-400 font-bold" : "text-white"
                    }`}
                  >
                    {track.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {artistName} {track.album ? `• ${track.album}` : ""}
                  </p>
                </div>
              </div>

              {/* Right: Plays + Duration + Heart + Menu */}
              <div className="flex items-center gap-4 shrink-0 relative">
                <span className="text-xs text-gray-500 hidden sm:inline font-medium">
                  {track.plays || "Popular"}
                </span>

                <span className="text-[11px] text-gray-400 font-mono">
                  {track.durationFormatted ||
                    (track.duration
                      ? `${Math.floor(track.duration / 60)}:${String(
                          track.duration % 60
                        ).padStart(2, "0")}`
                      : "3:45")}
                </span>

                {/* Heart Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (toggleLike) toggleLike(track);
                  }}
                  className={`transition-all active:scale-125 cursor-pointer p-1.5 rounded-lg hover:bg-white/5 ${
                    trackIsLiked
                      ? "text-red-500"
                      : "text-gray-500 hover:text-red-400"
                  }`}
                  title={trackIsLiked ? "Remove from Favorites" : "Add to Favorites"}
                >
                  <Heart
                    size={16}
                    fill={trackIsLiked ? "currentColor" : "none"}
                  />
                </button>

                {/* 3-Dots Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuTrackId(isMenuOpen ? null : track._id);
                  }}
                  className="text-gray-500 hover:text-white transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-white/10"
                  title="More actions"
                >
                  <MoreHorizontal size={15} />
                </button>

                {/* Floating Context Dropdown Menu */}
                {isMenuOpen && (
                  <div
                    ref={menuRef}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-10 w-44 bg-[#1a1c28] border border-white/10 rounded-2xl shadow-2xl p-1.5 z-50 animate-fadeIn space-y-0.5"
                  >
                    <button
                      onClick={(e) => handlePlayNext(e, track)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <FastForward size={14} className="text-blue-400" />
                      <span>Play Next</span>
                    </button>

                    <button
                      onClick={(e) => handleAddToQueue(e, track)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <ListPlus size={14} className="text-emerald-400" />
                      <span>Add to Queue</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuTrackId(null);
                        if (onOpenAddToPlaylist) onOpenAddToPlaylist(track);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <FolderPlus size={14} className="text-purple-400" />
                      <span>Add to Playlist</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}