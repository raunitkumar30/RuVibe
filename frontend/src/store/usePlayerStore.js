import { create } from "zustand";

export const usePlayerStore = create((set, get) => ({
  // State
  currentTrack: null,     // The song currently loaded: { title, artist, uri, coverArt, duration }
  isPlaying: false,       // Is music currently playing?
  currentTime: 0,         // Current timestamp in seconds
  duration: 0,            // Total duration in seconds
  queue: [],              // Array of upcoming tracks

  // Actions
  playTrack: (track) => {
    set({
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
      duration: track.duration || 0,
    });
  },

  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  setCurrentTime: (time) => {
    set({ currentTime: time });
  },

  setDuration: (duration) => {
    set({ duration });
  },

  setQueue: (tracks) => {
    set({ queue: tracks });
  },
}));