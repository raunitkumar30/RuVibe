import React from "react";
import { Heart, Play, Pause } from "lucide-react";
import { useFavoritesStore } from "../store/useFavoritesStore";
import { usePlayerStore } from "../store/usePlayerStore";

export default function FavoritesView() {
  const { likedSongs, toggleLike } = useFavoritesStore();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

  const handlePlaySong = (song) => {
    if (currentTrack?._id === song._id) {
      togglePlay();
    } else {
      playTrack(song);
    }
  };

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      playTrack(likedSongs[0]);
    }
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {/* Header Banner */}
      <div className="h-52 rounded-3xl bg-gradient-to-r from-red-600/40 via-[#181a24] to-[#14151f] border border-white/5 p-8 flex items-end justify-between shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-red-500/20 shrink-0">
            <Heart size={48} fill="white" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Playlist
            </span>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mt-1 mb-2">
              Liked Songs
            </h1>
            <p className="text-xs text-gray-300 font-medium">
              {likedSongs.length} {likedSongs.length === 1 ? "song" : "songs"} saved
            </p>
          </div>
        </div>

        {likedSongs.length > 0 && (
          <button
            onClick={handlePlayAll}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-all shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
          >
            <Play size={16} fill="white" />
            <span>Play All</span>
          </button>
        )}
      </div>

      {/* Song List */}
      {likedSongs.length === 0 ? (
        <div className="text-center py-16 bg-[#181a24] rounded-3xl border border-white/5">
          <Heart size={40} className="mx-auto text-gray-600 mb-3" />
          <h3 className="text-sm font-semibold text-white">No liked songs yet</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Click the heart icon on any track in Top Charts or Search to save it here.
          </p>
        </div>
      ) : (
        <div className="bg-[#181a24] rounded-3xl p-4 border border-white/5">
          <div className="space-y-1">
            {likedSongs.map((track, idx) => {
              const isThisTrackPlaying =
                currentTrack?._id === track._id && isPlaying;
              const artistName =
                typeof track.artist === "object"
                  ? track.artist?.username
                  : track.artist || "Artist";

              return (
                <div
                  key={track._id || idx}
                  onClick={() => handlePlaySong(track)}
                  className="group flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/5 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-xs font-semibold text-gray-500 w-5 text-center">
                      {idx + 1}
                    </span>

                    <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-black/40 shadow-sm">
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
                          <Pause size={14} className="text-white" fill="white" />
                        ) : (
                          <Play size={14} className="text-white" fill="white" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${
                          currentTrack?._id === track._id
                            ? "text-blue-500"
                            : "text-white"
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {artistName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track);
                      }}
                      className="text-red-500 hover:scale-110 transition-transform cursor-pointer"
                      title="Remove from Liked"
                    >
                      <Heart size={16} fill="currentColor" />
                    </button>

                    <span className="text-xs text-gray-400 font-medium">
                      {track.duration
                        ? `${Math.floor(track.duration / 60)}:${String(
                            track.duration % 60
                          ).padStart(2, "0")}`
                        : "3:30"}
                    </span>
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