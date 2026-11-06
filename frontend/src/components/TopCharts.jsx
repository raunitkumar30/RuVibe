import React from "react";
import { Play, Pause, Heart, MoreHorizontal } from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";
import { useFavoritesStore } from "../store/useFavoritesStore";

export default function TopCharts({ tracks }) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const { toggleLike, isLiked } = useFavoritesStore(); // ✅ Added this missing line!

  // Fallback sample data if no songs are in database
  const chartTracks =
    tracks && tracks.length > 0
      ? tracks
      : [
          {
            _id: "demo_1",
            rank: "01",
            title: "Havana",
            artist: "Camila Cabello",
            duration: 225,
            durationFormatted: "3:45",
            coverArt:
              "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80",
            uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
          },
          {
            _id: "demo_2",
            rank: "02",
            title: "Jesus Is King",
            artist: "Kanye West",
            duration: 225,
            durationFormatted: "3:45",
            coverArt:
              "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&auto=format&fit=crop&q=80",
            uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
          },
          {
            _id: "demo_3",
            rank: "03",
            title: "Closer",
            artist: "The Chainsmokers",
            duration: 225,
            durationFormatted: "3:45",
            coverArt:
              "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&auto=format&fit=crop&q=80",
            uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
          },
          {
            _id: "demo_4",
            rank: "04",
            title: "Lean On",
            artist: "Major Lazer ft DJ Snake",
            duration: 225,
            durationFormatted: "3:45",
            coverArt:
              "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80",
            uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
          },
        ];

  const handleRowClick = (track) => {
    if (currentTrack?._id === track._id) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white tracking-wide">
          Top Charts
        </h2>
        <button className="text-xs text-gray-400 hover:text-white font-medium transition-colors cursor-pointer">
          See all
        </button>
      </div>

      {/* Track Rows */}
      <div className="space-y-1.5">
        {chartTracks.map((track, index) => {
          const isThisTrackPlaying =
            currentTrack?._id === track._id && isPlaying;

          const artistName =
            typeof track.artist === "object"
              ? track.artist?.username || "Artist"
              : track.artist || "Artist";

          const trackIsLiked = isLiked ? isLiked(track._id) : false;

          return (
            <div
              key={track._id || index}
              onClick={() => handleRowClick(track)}
              className="group flex items-center justify-between p-2 rounded-2xl hover:bg-[#1a1c26] transition-all cursor-pointer"
            >
              {/* Left: Rank + Thumbnail + Title/Artist */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-semibold text-gray-500 w-5 text-center">
                  {track.rank || `0${index + 1}`}
                </span>

                <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm bg-black/40">
                  <img
                    src={track.coverArt || "https://via.placeholder.com/100"}
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover Play/Pause Overlay */}
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isThisTrackPlaying
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {isThisTrackPlaying ? (
                      <Pause size={14} className="text-white" fill="white" />
                    ) : (
                      <Play size={14} className="text-white" fill="white" />
                    )}
                  </div>
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-xs font-semibold truncate ${
                      currentTrack?._id === track._id
                        ? "text-blue-500"
                        : "text-white"
                    }`}
                  >
                    {track.title}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {artistName}
                  </p>
                </div>
              </div>

              {/* Right: Duration + Heart + Menu */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-gray-400 font-medium">
                  {track.durationFormatted ||
                    (track.duration
                      ? `${Math.floor(track.duration / 60)}:${String(
                          track.duration % 60
                        ).padStart(2, "0")}`
                      : "3:45")}
                </span>

                {/* Heart / Favorite Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (toggleLike) toggleLike(track);
                  }}
                  className={`transition-all active:scale-125 cursor-pointer p-1 ${
                    trackIsLiked
                      ? "text-red-500"
                      : "text-gray-500 hover:text-red-400"
                  }`}
                  title={
                    trackIsLiked ? "Remove from Favorites" : "Add to Favorites"
                  }
                >
                  <Heart
                    size={15}
                    fill={trackIsLiked ? "currentColor" : "none"}
                  />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}