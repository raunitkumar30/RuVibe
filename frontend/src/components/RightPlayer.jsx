import React from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  ChevronUp,
  ListMusic,
} from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";

export default function RightPlayer({ onSeek }) {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    isShuffle,
    isRepeat,
    toggleShuffle,
    toggleRepeat,
    currentTime,
    duration,
  } = usePlayerStore();

  // Fallback track if nothing has been selected yet
  const track = currentTrack || {
    title: "Butterfly Effect",
    artist: "Travis Scott",
    album: "Best of 2020",
    coverArt:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
    duration: 227,
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const currentDuration = duration || track.duration || 1;
  const progressPercent = (currentTime / currentDuration) * 100;

  const handleSliderChange = (e) => {
    const newTime = (Number(e.target.value) / 100) * currentDuration;
    if (onSeek) onSeek(newTime);
  };

  return (
    <aside className="w-80 h-screen bg-[#14151f] border-l border-white/5 p-6 flex flex-col justify-between select-none overflow-y-auto shrink-0">
      {/* 1. Header */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold text-white tracking-wider">Player</h2>
          <button className="text-gray-400 hover:text-white transition-colors cursor-pointer">
            <ListMusic size={18} />
          </button>
        </div>

        {/* 2. Large Album Art Card */}
        <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-2xl mb-6 bg-[#181a24] border border-white/5">
          <img
            src={track.coverArt || "https://via.placeholder.com/600"}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 3. Track Info */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-extrabold text-white tracking-tight truncate">
            {track.title}
          </h3>
          <p className="text-xs font-semibold text-gray-300 mt-0.5 truncate">
            {typeof track.artist === "object"
              ? track.artist?.username
              : track.artist || "Artist"}
          </p>
          <p className="text-[10px] text-gray-500 font-medium mt-0.5">
            {track.album || "Single Track"}
          </p>
        </div>

        {/* 4. Progress Scrubber Bar */}
        <div className="mb-6 px-1">
          <div className="relative flex items-center group">
            <input
              type="range"
              min="0"
              max="100"
              value={isNaN(progressPercent) ? 0 : progressPercent}
              onChange={handleSliderChange}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-semibold text-gray-400 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentDuration)}</span>
          </div>
        </div>
      </div>

      {/* 5. Blue Controller Card */}
      <div className="bg-blue-600 rounded-3xl p-5 shadow-xl shadow-blue-600/30 text-white flex flex-col items-center">
        {/* Buttons Row */}
        <div className="w-full flex items-center justify-between px-2 mb-4">
          {/* Shuffle Toggle */}
          <button
            onClick={toggleShuffle}
            title={isShuffle ? "Shuffle ON" : "Shuffle OFF"}
            className={`transition-colors cursor-pointer p-1 rounded-lg ${
              isShuffle
                ? "text-white bg-white/20 font-bold"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Shuffle size={16} />
          </button>

          {/* Previous Button */}
          <button
            onClick={playPrevious}
            title="Previous track"
            className="text-white/90 hover:text-white transition-colors active:scale-95 cursor-pointer"
          >
            <SkipBack size={20} fill="currentColor" />
          </button>

          {/* Big White Circular Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-lg active:scale-90 transition-transform hover:scale-105 cursor-pointer"
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={playNext}
            title="Next track"
            className="text-white/90 hover:text-white transition-colors active:scale-95 cursor-pointer"
          >
            <SkipForward size={20} fill="currentColor" />
          </button>

          {/* Repeat Toggle */}
          <button
            onClick={toggleRepeat}
            title={isRepeat ? "Repeat Track ON" : "Repeat OFF"}
            className={`transition-colors cursor-pointer p-1 rounded-lg ${
              isRepeat
                ? "text-white bg-white/20 font-bold"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Repeat size={16} />
          </button>
        </div>

        {/* Lyrics Pull-up Tab */}
        <div className="flex flex-col items-center cursor-pointer text-white/80 hover:text-white transition-colors">
          <ChevronUp size={14} className="-mb-0.5" />
          <span className="text-[10px] font-bold tracking-widest uppercase">
            Lyrics
          </span>
        </div>
      </div>
    </aside>
  );
}