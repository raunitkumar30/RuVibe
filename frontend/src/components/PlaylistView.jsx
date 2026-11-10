import React, { useEffect, useState } from "react";
import { ListMusic, Play, Pause, Heart, Loader2, ArrowLeft } from "lucide-react";
import api from "../api/axios";
import { usePlayerStore } from "../store/usePlayerStore";
import { useFavoritesStore } from "../store/useFavoritesStore";

export default function PlaylistView({ playlist: initialPlaylist, playlistId, playlistName, onBack }) {
  const [playlist, setPlaylist] = useState(initialPlaylist || null);
  const [loading, setLoading] = useState(!initialPlaylist?.musics?.length);

  const activeId = playlistId || initialPlaylist?._id;

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const { toggleLike, isLiked } = useFavoritesStore();

  useEffect(() => {
    if (initialPlaylist && initialPlaylist._id !== playlist?._id) {
      setPlaylist(initialPlaylist);
    }
  }, [initialPlaylist]);

  useEffect(() => {
    async function fetchPlaylist() {
      if (!activeId) return;
      if (!playlist?.musics?.length) {
        setLoading(true);
      }
      try {
        const res = await api.get(`/playlists/${activeId}`);
        if (res.data?.playlist) {
          setPlaylist(res.data.playlist);
        }
      } catch (err) {
        console.error("Failed to load playlist:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaylist();
  }, [activeId]);

  const tracks = playlist?.musics || [];

  const handlePlaySong = (track) => {
    if (currentTrack?._id === track._id) {
      togglePlay();
    } else {
      playTrack(track, tracks); // Load all playlist tracks into player queue!
    }
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-blue-500" />
        <span className="text-xs">Loading playlist...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      )}

      {/* Header Banner */}
      <div className="h-52 rounded-3xl bg-gradient-to-r from-blue-600/40 via-[#181a24] to-[#14151f] border border-white/5 p-8 flex items-end justify-between shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-blue-600/30 shrink-0">
            <ListMusic size={48} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Playlist
            </span>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mt-1 mb-2 truncate max-w-md">
              {playlist?.name || playlistName || "My Playlist"}
            </h1>
            <p className="text-xs text-gray-300 font-medium">
              {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
            </p>
          </div>
        </div>

        {tracks.length > 0 && (
          <button
            onClick={handlePlayAll}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-all shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
          >
            <Play size={16} fill="white" />
            <span>Play All</span>
          </button>
        )}
      </div>

      {/* Track List */}
      {tracks.length === 0 ? (
        <div className="text-center py-16 bg-[#181a24] rounded-3xl border border-white/5">
          <ListMusic size={40} className="mx-auto text-gray-600 mb-3" />
          <h3 className="text-sm font-semibold text-white">
            This playlist is empty
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Click the three dots (···) on any song in Top Charts or Search to add it to this playlist.
          </p>
        </div>
      ) : (
        <div className="bg-[#181a24] rounded-3xl p-4 border border-white/5">
          <div className="space-y-1">
            {tracks.map((track, idx) => {
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
                      className={`transition-colors cursor-pointer p-1 ${
                        isLiked(track._id)
                          ? "text-red-500"
                          : "text-gray-500 hover:text-red-400"
                      }`}
                    >
                      <Heart
                        size={16}
                        fill={isLiked(track._id) ? "currentColor" : "none"}
                      />
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