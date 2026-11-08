import { create } from "zustand";

const getSavedRecent = () => {
  try {
    const saved = localStorage.getItem("groovvy_recent");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const usePlayerStore = create((set, get) => ({
  // State
  currentTrack: null,     // Currently playing track
  isPlaying: false,       // Play / Pause state
  currentTime: 0,         // Current timestamp in seconds
  duration: 0,            // Total duration in seconds
  volume: 0.8,            // Default volume: 80% (0.0 to 1.0)
  isMuted: false,         // Mute toggle
  queue: [],              // Full list of tracks in current view
  currentIndex: 0,        // Position in queue
  isShuffle: false,       // Shuffle active?
  isRepeat: false,        // Repeat active?
  recentlyPlayed: getSavedRecent(), // Persisted recent songs list

  // Helper to record history
  addToRecent: (track) => {
    if (!track?._id) return;
    const current = get().recentlyPlayed || [];
    const updated = [track, ...current.filter((t) => t._id !== track._id)].slice(0, 30);
    try {
      localStorage.setItem("groovvy_recent", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
    set({ recentlyPlayed: updated });
  },

  clearRecent: () => {
    localStorage.removeItem("groovvy_recent");
    set({ recentlyPlayed: [] });
  },

  // 1. Play specific track & load playlist queue
  playTrack: (track, trackList = null) => {
    let currentQueue = get().queue;
    if (trackList && trackList.length > 0) {
      currentQueue = trackList;
    }

    const idx = currentQueue.findIndex((t) => t._id === track._id);

    // Save to history
    get().addToRecent(track);

    set({
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
      duration: track.duration || 0,
      queue: currentQueue,
      currentIndex: idx !== -1 ? idx : 0,
    });
  },

  // 2. Play / Pause
  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  // 3. Skip to Next Song
  playNext: () => {
    const { queue, currentIndex, isShuffle, isRepeat, currentTrack } = get();
    if (!queue || queue.length === 0) return;

    if (isRepeat && currentTrack) {
      set({ currentTime: 0, isPlaying: true });
      return;
    }

    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = (currentIndex + 1) % queue.length;
    }

    const nextTrack = queue[nextIndex];
    if (nextTrack) {
      get().addToRecent(nextTrack);
      set({
        currentTrack: nextTrack,
        currentIndex: nextIndex,
        isPlaying: true,
        currentTime: 0,
        duration: nextTrack.duration || 0,
      });
    }
  },

  // 4. Skip to Previous Song
  playPrevious: () => {
    const { queue, currentIndex, currentTime } = get();
    if (!queue || queue.length === 0) return;

    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    const prevTrack = queue[prevIndex];
    if (prevTrack) {
      get().addToRecent(prevTrack);
      set({
        currentTrack: prevTrack,
        currentIndex: prevIndex,
        isPlaying: true,
        currentTime: 0,
        duration: prevTrack.duration || 0,
      });
    }
  },

  // 5. Toggle Shuffle & Repeat
  toggleShuffle: () => {
    set((state) => ({ isShuffle: !state.isShuffle }));
  },

  toggleRepeat: () => {
    set((state) => ({ isRepeat: !state.isRepeat }));
  },

  // 6. Volume Controls
  setVolume: (val) => {
    const clamped = Math.max(0, Math.min(1, val));
    set({ volume: clamped, isMuted: clamped === 0 });
  },

  toggleMute: () => {
    set((state) => ({ isMuted: !state.isMuted }));
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