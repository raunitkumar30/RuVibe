import { create } from "zustand";
import api from "../api/axios";
import { useToastStore } from "./useToastStore";

export const useFavoritesStore = create((set, get) => ({
  likedSongs: [],
  likedSongIds: new Set(),
  isLoading: false,

  // 1. Fetch user's liked songs from database
  fetchLikedSongs: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/music/liked");
      const musics = response.data?.musics || [];
      const ids = new Set(musics.map((m) => m._id));
      set({ likedSongs: musics, likedSongIds: ids, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  // 2. Toggle like on a track & show notification
  toggleLike: async (track) => {
    if (!track?._id) return;

    const { likedSongs, likedSongIds } = get();
    const isCurrentlyLiked = likedSongIds.has(track._id);

    // Optimistic UI update
    const updatedIds = new Set(likedSongIds);
    let updatedSongs = [...likedSongs];

    if (isCurrentlyLiked) {
      updatedIds.delete(track._id);
      updatedSongs = updatedSongs.filter((s) => s._id !== track._id);
      useToastStore.getState().showToast(`Removed from Liked Songs`, "info");
    } else {
      updatedIds.add(track._id);
      updatedSongs = [track, ...updatedSongs];
      useToastStore.getState().showToast(`Added to your Liked Songs!`, "heart");
    }

    set({ likedSongs: updatedSongs, likedSongIds: updatedIds });

    // Sync with backend database
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
      console.error("Failed to toggle like on backend:", err);
      // Revert if API failed
      set({ likedSongs, likedSongIds });
    }
  },

  // Helper check
  isLiked: (trackId) => {
    return get().likedSongIds.has(trackId);
  },
}));