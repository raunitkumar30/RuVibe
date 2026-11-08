import React from "react";
import { Play, Pause, Heart, MoreHorizontal } from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";
import { useFavoritesStore } from "../store/useFavoritesStore";

export default function TopCharts({ tracks, onOpenAddToPlaylist }) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const { toggleLike, isLiked } = useFavoritesStore();

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
            duration: 190,
            durationFormatted: "3:10",
            coverArt:
              "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80",
            uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
          },
          {
            _id: "demo_3",
            rank: "03",
            title: "Closer",
            artist: "The Chainsmokers",
            duration: 245,
            durationFormatted: "4:05",
            coverArt:
              "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&auto=format&fit=crop&q=80",
            uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
          },
        ];

  const handleRowClick = (track) => {
    if (currentTrack?._id === track._id) {
      togglePlay();
    } else {
      playTrack(track, chartTracks);
    }
  };

  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white tracking-wide">
          Top Charts
        </h2>
        <span className="text-xs text-gray-400 font-medium">
          Popular tracks
        </span>
      </div>

      {/* Track List Table */}
      <div className="space-y-1.5">
        {chartTracks.slice(0, 5).map((track, index) => {
          const isThisTrackCurrent = currentTrack?._id === track._id;
          const isThisTrackPlaying = isThisTrackCurrent && isPlaying;

          const artistName =
            typeof track.artist === "object"
              ? track.artist?.username || "Artist"
              : track.artist || "Artist";

          const trackIsLiked = isLiked ? isLiked(track._id) : false;

          return (
            <div
              key={track._id || index}
              onClick={() => handleRowClick(track)}
              className={`group flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer ${
                isThisTrackCurrent
                  ? "bg-blue-600/15 border border-blue-500/20"
                  : "hover:bg-[#181a26] border border-transparent"
              }`}
            >
              {/* Left: Rank / Equalizer + Thumbnail + Title/Artist */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Dynamic Rank / Soundwave */}
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
                      {track.rank || `0${index + 1}`}
                    </span>
                  )}
                </div>

                <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-md bg-black/40">
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
                      <Pause size={15} className="text-white" fill="white" />
                    ) : (
                      <Play size={15} className="text-white ml-0.5" fill="white" />
                    )}
                  </div>
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-xs font-semibold truncate ${
                      isThisTrackCurrent ? "text-blue-400 font-bold" : "text-white"
                    }`}
                  >
                    {track.title}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">
                    {artistName}
                  </p>
                </div>
              </div>

              {/* Right: Duration + Heart + Menu */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] text-gray-400 font-mono">
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
                  className={`transition-all active:scale-125 cursor-pointer p-1 rounded-lg hover:bg-white/5 ${
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

                {/* More / Add to Playlist */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenAddToPlaylist) onOpenAddToPlaylist(track);
                  }}
                  className="text-gray-500 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/10"
                  title="Add to Playlist"
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