import { create } from "zustand";

const getSavedRecent = () => {
  try {
    const saved = localStorage.getItem("ruvibe_recent");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const getSavedCurrentTrack = () => {
  try {
    const saved = localStorage.getItem("ruvibe_current_track");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const usePlayerStore = create((set, get) => ({
  // State
  currentTrack: getSavedCurrentTrack(), // Restores actual last song on refresh
  isPlaying: false,                    // Always paused on refresh
  currentTime: 0,                      // Current timestamp in seconds
  duration: 0,                         // Total duration in seconds
  volume: 0.8,                         // Default volume: 80% (0.0 to 1.0)
  isMuted: false,                      // Mute toggle
  playbackRate: 1.0,                   // Playback speed: 0.75, 1, 1.25, 1.5, 2
  sleepTimer: null,                    // null | 'end_of_track' | number (minutes)
  sleepTimerRemaining: null,           // Seconds remaining on timer
  queue: [],                           // Full list of tracks in current view
  currentIndex: 0,                     // Position in queue
  isShuffle: false,                    // Shuffle active?
  isRepeat: false,                     // Repeat active?
  recentlyPlayed: getSavedRecent(),

  // Helper to record history
  addToRecent: (track) => {
    if (!track?._id) return;
    const current = get().recentlyPlayed || [];
    const updated = [track, ...current.filter((t) => t._id !== track._id)].slice(0, 30);
    try {
      localStorage.setItem("ruvibe_recent", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
    set({ recentlyPlayed: updated });
  },

  clearRecent: () => {
    localStorage.removeItem("ruvibe_recent");
    localStorage.removeItem("ruvibe_current_track");
    set({ recentlyPlayed: [], currentTrack: null });
  },

  // 1. Play specific track & load playlist queue
  playTrack: (track, trackList = null) => {
    if (!track) return;
    let currentQueue = get().queue;
    if (trackList && trackList.length > 0) {
      currentQueue = trackList;
    }

    const idx = currentQueue.findIndex((t) => t._id === track._id);
    get().addToRecent(track);

    // Save actual playing song to localStorage
    try {
      localStorage.setItem("ruvibe_current_track", JSON.stringify(track));
    } catch (e) {
      console.warn("Could not save currentTrack to localStorage", e);
    }

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
      try {
        localStorage.setItem("ruvibe_current_track", JSON.stringify(nextTrack));
      } catch (e) {
        console.warn("Could not save currentTrack to localStorage", e);
      }
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
      try {
        localStorage.setItem("ruvibe_current_track", JSON.stringify(prevTrack));
      } catch (e) {
        console.warn("Could not save currentTrack to localStorage", e);
      }
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

  // 6. Volume & Playback Controls
  setVolume: (val) => {
    const clamped = Math.max(0, Math.min(1, val));
    set({ volume: clamped, isMuted: clamped === 0 });
  },

  toggleMute: () => {
    set((state) => ({ isMuted: !state.isMuted }));
  },

  setPlaybackRate: (rate) => {
    set({ playbackRate: rate });
  },

  // 7. Sleep Timer Controls
  setSleepTimer: (option) => {
    if (option === "end_of_track") {
      set({ sleepTimer: "end_of_track", sleepTimerRemaining: null });
    } else if (typeof option === "number" && option > 0) {
      set({ sleepTimer: option, sleepTimerRemaining: option * 60 });
    } else {
      set({ sleepTimer: null, sleepTimerRemaining: null });
    }
  },

  cancelSleepTimer: () => {
    set({ sleepTimer: null, sleepTimerRemaining: null });
  },

  tickSleepTimer: () => {
    const { sleepTimerRemaining } = get();
    if (sleepTimerRemaining !== null && sleepTimerRemaining > 0) {
      set({ sleepTimerRemaining: sleepTimerRemaining - 1 });
    }
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

  // 8. Queue Management
  addToQueue: (track) => {
    if (!track?._id) return;
    set((state) => ({
      queue: [...state.queue, track],
    }));
  },

  playNextInQueue: (track) => {
    if (!track?._id) return;
    set((state) => {
      const newQueue = [...state.queue];
      newQueue.splice(state.currentIndex + 1, 0, track);
      return { queue: newQueue };
    });
  },

  removeFromQueueByIndex: (indexToRemove) => {
    set((state) => {
      const newQueue = state.queue.filter((_, i) => i !== indexToRemove);
      let newIndex = state.currentIndex;
      if (indexToRemove < state.currentIndex) {
        newIndex = Math.max(0, state.currentIndex - 1);
      }
      return { queue: newQueue, currentIndex: newIndex };
    });
  },

  clearUpcomingQueue: () => {
    set((state) => ({
      queue: state.currentTrack ? [state.currentTrack] : [],
      currentIndex: 0,
    }));
  },
}));