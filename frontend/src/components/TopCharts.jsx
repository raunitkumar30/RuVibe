import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Heart,
  MoreHorizontal,
  ListPlus,
  FastForward,
  FolderPlus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";
import { useFavoritesStore } from "../store/useFavoritesStore";
import { useToastStore } from "../store/useToastStore";

export default function TopCharts({
  tracks,
  activeFilter,
  onClearFilter,
  onAddToPlaylist,
}) {
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
  const [showAllTracks, setShowAllTracks] = useState(false);
  const menuRef = useRef(null);

  const chartTracks = tracks && tracks.length > 0 ? tracks : [];
  const visibleTracks = showAllTracks ? chartTracks : chartTracks.slice(0, 15);

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
            {activeFilter ? `Tracks by "${activeFilter}"` : "Top Charts"}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {activeFilter
              ? "All matching songs available to stream in full"
              : "The most played songs right now"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium font-mono">
            {chartTracks.length} tracks loaded
          </span>
          {chartTracks.length > 15 && (
            <button
              onClick={() => setShowAllTracks((prev) => !prev)}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer transition-colors"
            >
              <span>{showAllTracks ? "Show Less" : `Show All (${chartTracks.length})`}</span>
              {showAllTracks ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Track List Table */}
      <div className="space-y-1.5 relative">
        {visibleTracks.map((track, index) => {
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
              className={`group flex items-center justify-between p-2.5 px-4 rounded-2xl cursor-pointer transition-all duration-200 relative ${
                isThisTrackCurrent
                  ? "bg-blue-600/15 border border-blue-500/30 shadow-md shadow-blue-500/10"
                  : "bg-[#181a24]/60 hover:bg-[#1f2130] border border-white/5"
              }`}
            >
              {/* Left Column: Rank / Play & Artwork & Title */}
              <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
                {/* Rank number or Equalizer animation */}
                <div className="w-6 text-center shrink-0">
                  {isThisTrackPlaying ? (
                    <div className="flex items-end justify-center gap-[2px] h-3.5">
                      <span className="w-1 bg-blue-500 rounded-full animate-eq-1"></span>
                      <span className="w-1 bg-blue-500 rounded-full animate-eq-2"></span>
                      <span className="w-1 bg-blue-500 rounded-full animate-eq-3"></span>
                    </div>
                  ) : (
                    <span
                      className={`text-xs font-mono font-bold ${
                        isThisTrackCurrent ? "text-blue-400" : "text-gray-500"
                      }`}
                    >
                      {track.rank || String(index + 1).padStart(2, "0")}
                    </span>
                  )}
                </div>

                {/* Album Cover with Play Overlay */}
                <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#242738] shrink-0 border border-white/10 shadow-sm">
                  <img
                    src={track.coverArt || "https://via.placeholder.com/100"}
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isThisTrackCurrent
                        ? "opacity-100 text-blue-400"
                        : "opacity-0 group-hover:opacity-100 text-white"
                    }`}
                  >
                    {isThisTrackPlaying ? (
                      <Pause size={16} fill="currentColor" />
                    ) : (
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Title & Artist */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold truncate transition-colors ${
                      isThisTrackCurrent
                        ? "text-blue-400"
                        : "text-white group-hover:text-blue-300"
                    }`}
                  >
                    {track.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {artistName}
                  </p>
                </div>
              </div>

              {/* Middle: Album Name */}
              <div className="hidden md:block w-44 truncate text-xs text-gray-400 pr-4">
                {track.album || "Single Track"}
              </div>

              {/* Middle: Plays Count */}
              <div className="hidden lg:block w-28 text-right text-xs font-medium text-gray-400 font-mono pr-6">
                {track.plays || "45M Plays"}
              </div>

              {/* Right Column: Duration, Heart & 3-Dots Menu */}
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs font-mono text-gray-400 w-10 text-right">
                  {track.duration
                    ? `${Math.floor(track.duration / 60)}:${String(
                        Math.floor(track.duration % 60)
                      ).padStart(2, "0")}`
                    : "3:30"}
                </span>

                {/* Favorite Heart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(track);
                  }}
                  className={`p-1.5 rounded-full transition-transform active:scale-75 cursor-pointer ${
                    trackIsLiked
                      ? "text-red-500 fill-red-500"
                      : "text-gray-500 hover:text-white"
                  }`}
                  title={trackIsLiked ? "Remove from Liked" : "Save to Liked"}
                >
                  <Heart
                    size={16}
                    fill={trackIsLiked ? "currentColor" : "none"}
                  />
                </button>

                {/* 3-Dots Menu Action */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuTrackId(isMenuOpen ? null : track._id);
                    }}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    title="More actions"
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {/* Floating Action Menu Dropdown */}
                  {isMenuOpen && (
                    <div
                      ref={menuRef}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-8 w-44 bg-[#1c1e2b] border border-white/10 rounded-2xl shadow-2xl p-1.5 z-40 animate-fadeIn"
                    >
                      <button
                        onClick={(e) => handlePlayNext(e, track)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
                      >
                        <FastForward size={14} className="text-blue-400" />
                        <span>Play Next</span>
                      </button>

                      <button
                        onClick={(e) => handleAddToQueue(e, track)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
                      >
                        <ListPlus size={14} className="text-purple-400" />
                        <span>Add to Queue</span>
                      </button>

                      {onAddToPlaylist && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToPlaylist(track);
                            setActiveMenuTrackId(null);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
                        >
                          <FolderPlus size={14} className="text-emerald-400" />
                          <span>Add to Playlist</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}