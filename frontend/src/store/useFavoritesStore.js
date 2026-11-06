import { create } from "zustand";
import api from "../api/axios";

export const useFavoritesStore = create((set, get) => ({
  likedSongs: [],
  likedSongIds: [], // Standard crash-proof array

  // 1. Fetch user's liked songs from backend
  fetchLikedSongs: async () => {
    try {
      const res = await api.get("/music/liked");
      const musics = res.data?.musics || [];
      const ids = musics.map((m) => String(m._id));
      set({ likedSongs: musics, likedSongIds: ids });
    } catch {
      console.log("Could not fetch favorites yet (user may be logged out)");
    }
  },

  // 2. Toggle like on a track
  toggleLike: async (track) => {
    if (!track || !track._id) return;
    const { likedSongIds, likedSongs } = get();
    const trackId = String(track._id);
    const isCurrentlyLiked = likedSongIds.includes(trackId);

    // Optimistic UI update
    let updatedIds = isCurrentlyLiked
      ? likedSongIds.filter((id) => id !== trackId)
      : [...likedSongIds, trackId];

    let updatedSongs = isCurrentlyLiked
      ? likedSongs.filter((s) => String(s._id) !== trackId)
      : [track, ...likedSongs];

    set({ likedSongIds: updatedIds, likedSongs: updatedSongs });

    // Send request to backend
    try {
      await api.post(`/music/${track._id}/like`, {
        title: track.title,
        uri: track.uri,
        coverArt: track.coverArt,
        duration: track.duration,
        genre: track.genre,
        artist:
          typeof track.artist === "object"
            ? track.artist?.username
            : track.artist,
      });
    } catch (err) {
      console.error("Failed to sync like with server:", err);
      // Revert if error
      set({ likedSongIds, likedSongs });
    }
  },

  isLiked: (trackId) => {
    if (!trackId) return false;
    const ids = get().likedSongIds || [];
    return ids.includes(String(trackId));
  },
}));