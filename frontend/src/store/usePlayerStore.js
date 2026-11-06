import { create } from "zustand";

export const usePlayerStore = create((set, get) => ({
  // State
  currentTrack: null,     // Currently playing track
  isPlaying: false,       // Play / Pause state
  currentTime: 0,         // Current timestamp in seconds
  duration: 0,            // Total duration in seconds
  queue: [],              // Full list of tracks in the current view
  currentIndex: 0,        // Position in queue
  isShuffle: false,       // Shuffle active?
  isRepeat: false,        // Repeat active?

  // 1. Play specific track & load the playlist queue
  playTrack: (track, trackList = null) => {
    let currentQueue = get().queue;
    if (trackList && trackList.length > 0) {
      currentQueue = trackList;
    }

    const idx = currentQueue.findIndex((t) => t._id === track._id);

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
      // Repeat same song
      set({ currentTime: 0, isPlaying: true });
      return;
    }

    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = (currentIndex + 1) % queue.length; // Loop back to start
    }

    const nextTrack = queue[nextIndex];
    if (nextTrack) {
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

    // If song played for > 3s, restart from 0:00 like Spotify does!
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    const prevTrack = queue[prevIndex];
    if (prevTrack) {
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