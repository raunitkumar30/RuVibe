import React from "react";
import { Heart, Play } from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";
import { useFavoritesStore } from "../store/useFavoritesStore";

export default function HeroBanner({ featuredTrack, allTracks = [] }) {
  const { playTrack } = usePlayerStore();
  const { toggleLike, isLiked } = useFavoritesStore();

  const track = featuredTrack || {
    _id: "demo_featured",
    title: "In My Feelings",
    artist: "Camila Cabello",
    plays: "63 Million Plays",
    coverArt:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80",
    uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
    duration: 215,
  };

  const artistName =
    typeof track.artist === "object"
      ? track.artist?.username || "Artist"
      : track.artist || "Artist";

  const handlePlay = () => {
    playTrack(track, allTracks.length > 0 ? allTracks : [track]);
  };

  return (
    <div className="relative w-full h-72 rounded-3xl overflow-hidden bg-gradient-to-r from-[#14151f] via-[#1a1c2b] to-[#12131d] border border-white/10 shadow-2xl select-none group">
      {/* 1. Background Artwork with Blur Glow */}
      <img
        src={track.coverArt || "https://via.placeholder.com/600"}
        alt={track.title}
        className="absolute right-0 top-0 w-3/5 h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
      />

      {/* 2. Glassmorphic Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#11121a] via-[#11121a]/85 to-transparent z-10" />

      {/* 3. Text and Actions */}
      <div className="relative z-20 h-full flex flex-col justify-center px-10 max-w-lg">
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/15 border border-blue-500/25 px-3 py-1 rounded-full w-fit mb-3">
          Featured Release
        </span>

        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2 truncate drop-shadow-md">
          {track.title}
        </h1>

        <div className="flex items-center gap-2.5 text-xs text-gray-300 font-medium mb-6">
          <span className="text-white font-semibold">{artistName}</span>
          <span className="w-1 h-1 rounded-full bg-gray-500"></span>
          <span className="text-gray-400">{track.plays || "Global Hit"}</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider px-7 py-3 rounded-full transition-all shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
          >
            <Play size={15} fill="currentColor" />
            <span>Listen Now</span>
          </button>

          <button
            onClick={() => toggleLike(track)}
            className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all active:scale-125 cursor-pointer ${
              isLiked(track._id)
                ? "bg-red-500/20 border-red-500 text-red-500"
                : "border-white/15 text-gray-300 hover:text-white hover:border-white/30 bg-white/5"
            }`}
            title={
              isLiked(track._id) ? "Remove from Favorites" : "Add to Favorites"
            }
          >
            <Heart
              size={17}
              fill={isLiked(track._id) ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>
    </div>
  );
}