import React from "react";
import { Heart, Play } from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";

export default function HeroBanner({ featuredTrack }) {
  const { playTrack } = usePlayerStore();

  // Fallback data if no database track is passed yet
  const track = featuredTrack || {
    title: "In My Feelings",
    artist: "Camila Cabello",
    plays: "63 Million Plays",
    coverArt:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80",
    uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
    duration: 215,
  };

  const handlePlay = () => {
    playTrack(track);
  };

  return (
    <div className="relative w-full h-72 rounded-3xl overflow-hidden bg-[#181a24] border border-white/5 shadow-2xl select-none">
      {/* 1. Background Artist Portrait */}
      <img
        src={track.coverArt}
        alt={track.title}
        className="absolute right-0 top-0 w-3/5 h-full object-cover object-center"
      />

      {/* 2. Gradient Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#14151f] via-[#14151f]/80 to-transparent" />

      {/* 3. Text and Actions */}
      <div className="relative z-10 h-full flex flex-col justify-center px-10 max-w-lg">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Trending New Hits
        </span>

        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
          {track.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-gray-300 font-medium mb-6">
          <span>{track.artist}</span>
          <span className="w-1 h-1 rounded-full bg-gray-500"></span>
          <span className="text-gray-400">{track.plays || "Popular Track"}</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-all shadow-lg shadow-blue-600/30 active:scale-95"
          >
            <Play size={14} fill="currentColor" />
            <span>Listen Now</span>
          </button>

          <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-300 hover:text-white hover:border-white transition-all active:scale-95">
            <Heart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}