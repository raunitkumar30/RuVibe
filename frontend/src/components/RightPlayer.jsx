import React, { useEffect, useState, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  ChevronUp,
  ChevronDown,
  ListMusic,
  Volume2,
  Volume1,
  VolumeX,
  X,
  Music,
  Maximize2,
  Trash2,
  Moon,
  RotateCcw,
  RotateCw,
  Gauge,
  Check,
  Disc,
} from "lucide-react";
import api from "../api/axios";
import { usePlayerStore } from "../store/usePlayerStore";
import { useToastStore } from "../store/useToastStore";

export default function RightPlayer({ onSeek, onOpenFullScreen }) {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    isShuffle,
    isRepeat,
    toggleShuffle,
    toggleRepeat,
    currentTime,
    duration,
    volume,
    isMuted,
    setVolume,
    toggleMute,
    playbackRate,
    setPlaybackRate,
    sleepTimer,
    sleepTimerRemaining,
    setSleepTimer,
    cancelSleepTimer,
    queue,
    currentIndex,
    playTrack,
    removeFromQueueByIndex,
    clearUpcomingQueue,
    recentlyPlayed,
  } = usePlayerStore();

  const { toast } = useToastStore();

  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [lyrics, setLyrics] = useState("");
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  const sleepMenuRef = useRef(null);
  const speedMenuRef = useRef(null);

  // Uses restored track from localStorage or most recent track, NOT hardcoded Butterfly Effect
  const track = currentTrack || (recentlyPlayed && recentlyPlayed.length > 0 ? recentlyPlayed[0] : null);

  const artistName =
    typeof track?.artist === "object"
      ? track.artist?.username || track.artist?.name || "Artist"
      : track?.artist || "Artist";

  // Fetch free lyrics via backend endpoint strictly using process.env
  useEffect(() => {
    if (!showLyrics || !track?.title) return;

    let isMounted = true;
    async function fetchLyrics() {
      setLoadingLyrics(true);
      try {
        const res = await api.get(
          `/music/lyrics?artist=${encodeURIComponent(artistName)}&title=${encodeURIComponent(track.title)}`
        );
        if (isMounted) {
          if (res.data?.lyrics) {
            setLyrics(res.data.lyrics);
          } else {
            setLyrics(
              `♪ Listening to "${track.title}" by ${artistName} ♪\n\n(Official lyrics not currently indexed for this track.\nEnjoy the rhythm!)`
            );
          }
        }
      } catch {
        if (isMounted) {
          setLyrics(`♪ Now Playing: ${track.title} ♪\n\nSing along and feel the RuVibe!`);
        }
      } finally {
        if (isMounted) setLoadingLyrics(false);
      }
    }

    fetchLyrics();
    return () => {
      isMounted = false;
    };
  }, [showLyrics, track?.title, artistName]);

  // Click outside listener for popup menus
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sleepMenuRef.current && !sleepMenuRef.current.contains(e.target)) {
        setShowSleepMenu(false);
      }
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target)) {
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const currentDuration = duration || track?.duration || 1;
  const progressPercent = (currentTime / currentDuration) * 100;

  const handleSliderChange = (e) => {
    const newTime = (Number(e.target.value) / 100) * currentDuration;
    if (onSeek) onSeek(newTime);
  };

  const handleSkipSeconds = (offset) => {
    const target = Math.max(0, Math.min(currentDuration, currentTime + offset));
    if (onSeek) onSeek(target);
  };

  const VolumeIcon =
    isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const upcomingTracks = queue.slice(currentIndex + 1);

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0];

  const sleepOptions = [
    { label: "Turn off timer", value: null },
    { label: "5 minutes", value: 5 },
    { label: "15 minutes", value: 15 },
    { label: "30 minutes", value: 30 },
    { label: "45 minutes", value: 45 },
    { label: "1 hour", value: 60 },
    { label: "End of this song", value: "end_of_track" },
  ];

  const handleSelectSleepTimer = (val, label) => {
    if (val === null) {
      cancelSleepTimer();
      toast("Sleep timer turned off", "info");
    } else {
      setSleepTimer(val);
      toast(`Sleep timer set for ${label}`, "success");
    }
    setShowSleepMenu(false);
  };

  // Standby Empty State (Only if no track has ever been played)
  if (!track) {
    return (
      <aside className="relative w-80 h-screen bg-[#14151f]/95 backdrop-blur-xl border-l border-white/5 p-6 flex flex-col justify-between select-none shrink-0 z-20 text-center">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-gray-500"></span>
          <h2 className="text-xs font-bold text-gray-400 tracking-wider uppercase">
            Now Playing
          </h2>
        </div>

        <div className="flex flex-col items-center justify-center my-auto">
          <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 mb-3 shadow-inner">
            <Disc size={28} className="animate-pulse text-gray-400" />
          </div>
          <p className="text-sm font-bold text-white mb-1">No Track Playing</p>
          <p className="text-xs text-gray-500 max-w-[200px]">
            Select any song, artist, or album from Explore to start listening.
          </p>
        </div>

        <div className="text-[10px] text-gray-600 font-mono">
          RuVibe Audio Engine Ready
        </div>
      </aside>
    );
  }

  return (
    <aside className="relative w-80 h-screen bg-[#14151f]/95 backdrop-blur-xl border-l border-white/5 p-6 flex flex-col justify-between select-none overflow-y-auto shrink-0 z-20">
      {/* 1. Top Header with Queue + Full Screen */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? "bg-blue-500 animate-pulse" : "bg-gray-500"}`}></span>
            <h2 className="text-xs font-bold text-gray-300 tracking-wider uppercase">
              Now Playing
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setShowQueue((prev) => !prev);
                setShowLyrics(false);
              }}
              title="Queue"
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                showQueue
                  ? "text-blue-400 bg-blue-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <ListMusic size={18} />
            </button>

            <button
              onClick={onOpenFullScreen}
              title="Full-Screen Mode (F)"
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* 2. Large Album Art with Ambient Glow */}
        <div className="relative w-full aspect-square mb-5 group">
          <div
            className="absolute inset-0 rounded-3xl blur-2xl opacity-40 scale-95 transition-opacity duration-700 pointer-events-none group-hover:opacity-60"
            style={{
              backgroundImage: `url(${track.coverArt || "https://via.placeholder.com/600"})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-black/80 bg-[#181a24] border border-white/10">
            <img
              src={track.coverArt || "https://via.placeholder.com/600"}
              alt={track.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>

        {/* 3. Track Info */}
        <div className="text-center mb-4 px-1">
          <h3 className="text-base font-extrabold text-white tracking-tight truncate drop-shadow-sm">
            {track.title}
          </h3>
          <p className="text-xs font-medium text-blue-400 mt-0.5 truncate">
            {artistName}
          </p>
          <p className="text-[10px] text-gray-500 font-medium mt-0.5 truncate">
            {track.album || "Single Track"}
          </p>
        </div>

        {/* 4. Progress Scrubber Bar */}
        <div className="mb-3 px-1">
          <div className="relative flex items-center group">
            <input
              type="range"
              min="0"
              max="100"
              value={isNaN(progressPercent) ? 0 : progressPercent}
              onChange={handleSliderChange}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 group-hover:h-1.5 transition-all"
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-semibold text-gray-400 mt-2 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentDuration)}</span>
          </div>
        </div>

        {/* 5. Utility Controls Row: Speed, 10s Skip & Sleep Timer */}
        <div className="flex items-center justify-between px-2 mb-4 text-gray-400 text-xs">
          {/* Quick Skip -10s */}
          <button
            onClick={() => handleSkipSeconds(-10)}
            title="Rewind 10 seconds"
            className="flex items-center gap-0.5 p-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <RotateCcw size={14} />
            <span className="text-[10px] font-bold font-mono">10s</span>
          </button>

          {/* Speed Selector Pill */}
          <div className="relative" ref={speedMenuRef}>
            <button
              onClick={() => {
                setShowSpeedMenu((prev) => !prev);
                setShowSleepMenu(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white font-mono text-[11px] font-bold transition-all cursor-pointer border border-white/10"
              title="Playback Speed"
            >
              <Gauge size={12} className="text-blue-400" />
              <span>{playbackRate}x</span>
            </button>

            {/* Speed Dropdown Menu */}
            {showSpeedMenu && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-28 bg-[#181a24] border border-white/15 rounded-2xl shadow-2xl p-1.5 z-40 animate-fadeIn">
                <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold px-2 py-1">
                  Speed
                </p>
                {speedOptions.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      setPlaybackRate(rate);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                      playbackRate === rate
                        ? "text-blue-400 bg-blue-500/10 font-bold"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{rate}x</span>
                    {playbackRate === rate && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Skip +10s */}
          <button
            onClick={() => handleSkipSeconds(10)}
            title="Fast Forward 10 seconds"
            className="flex items-center gap-0.5 p-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <span className="text-[10px] font-bold font-mono">10s</span>
            <RotateCw size={14} />
          </button>

          {/* Sleep Timer Moon */}
          <div className="relative" ref={sleepMenuRef}>
            <button
              onClick={() => {
                setShowSleepMenu((prev) => !prev);
                setShowSpeedMenu(false);
              }}
              title="Sleep Timer"
              className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all cursor-pointer border ${
                sleepTimer
                  ? "bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-sm"
                  : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10"
              }`}
            >
              <Moon size={13} className={sleepTimer ? "text-amber-400" : ""} />
              {sleepTimerRemaining !== null && (
                <span className="text-[10px] font-mono font-bold">
                  {formatTime(sleepTimerRemaining)}
                </span>
              )}
              {sleepTimer === "end_of_track" && (
                <span className="text-[9px] font-bold uppercase tracking-wider">
                  Track
                </span>
              )}
            </button>

            {/* Sleep Timer Menu */}
            {showSleepMenu && (
              <div className="absolute bottom-8 right-0 w-44 bg-[#181a24] border border-white/15 rounded-2xl shadow-2xl p-1.5 z-40 animate-fadeIn">
                <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold px-2.5 py-1">
                  Sleep Timer
                </p>
                {sleepOptions.map((opt) => {
                  const isSelected =
                    (opt.value === null && !sleepTimer) ||
                    (opt.value === sleepTimer);

                  return (
                    <button
                      key={opt.label}
                      onClick={() => handleSelectSleepTimer(opt.value, opt.label)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "text-amber-300 bg-amber-500/10 font-bold"
                          : "text-gray-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check size={12} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 6. Volume Slider Control */}
        <div className="flex items-center gap-2.5 px-1 mb-4">
          <button
            onClick={toggleMute}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            <VolumeIcon size={16} />
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white hover:h-1.5 transition-all"
          />
          <span className="text-[10px] text-gray-500 font-mono w-7 text-right">
            {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
          </span>
        </div>
      </div>

      {/* 7. Refined Blue Controller Card */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 rounded-3xl p-5 shadow-xl shadow-blue-600/25 border border-blue-400/20 text-white flex flex-col items-center">
        {/* Buttons Row */}
        <div className="w-full flex items-center justify-between px-2 mb-3">
          <button
            onClick={toggleShuffle}
            title={isShuffle ? "Shuffle ON" : "Shuffle OFF"}
            className={`transition-all cursor-pointer p-1.5 rounded-xl ${
              isShuffle
                ? "text-white bg-white/20 font-bold"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Shuffle size={16} />
          </button>

          <button
            onClick={playPrevious}
            title="Previous track"
            className="text-white/90 hover:text-white transition-transform active:scale-90 cursor-pointer"
          >
            <SkipBack size={20} fill="currentColor" />
          </button>

          <button
            onClick={togglePlay}
            className="w-13 h-13 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-90 transition-transform cursor-pointer"
          >
            {isPlaying ? (
              <Pause size={22} fill="currentColor" />
            ) : (
              <Play size={22} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          <button
            onClick={playNext}
            title="Next track"
            className="text-white/90 hover:text-white transition-transform active:scale-90 cursor-pointer"
          >
            <SkipForward size={20} fill="currentColor" />
          </button>

          <button
            onClick={toggleRepeat}
            title={isRepeat ? "Repeat Track ON" : "Repeat OFF"}
            className={`transition-all cursor-pointer p-1.5 rounded-xl ${
              isRepeat
                ? "text-white bg-white/20 font-bold"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Repeat size={18} />
          </button>
        </div>

        {/* Lyrics Pull-Up Tab Button */}
        <button
          onClick={() => {
            setShowLyrics(true);
            setShowQueue(false);
          }}
          className="flex flex-col items-center cursor-pointer text-white/80 hover:text-white transition-colors group mt-0.5"
        >
          <ChevronUp
            size={14}
            className="-mb-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
          <span className="text-[10px] font-bold tracking-widest uppercase">
            Lyrics
          </span>
        </button>
      </div>

      {/* 8. SLIDE-UP OVERLAY: Live Queue Management Drawer */}
      {showQueue && (
        <div className="absolute inset-0 bg-[#14151f]/95 backdrop-blur-xl z-30 p-5 flex flex-col animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ListMusic size={16} className="text-blue-500" />
              Queue ({queue.length})
            </h3>
            <div className="flex items-center gap-2">
              {upcomingTracks.length > 0 && (
                <button
                  onClick={clearUpcomingQueue}
                  className="text-[11px] font-semibold text-gray-400 hover:text-red-400 cursor-pointer transition-colors"
                >
                  Clear Upcoming
                </button>
              )}
              <button
                onClick={() => setShowQueue(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Section A: Now Playing Track */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">
                Now Playing
              </p>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <img
                  src={track.coverArt || "https://via.placeholder.com/100"}
                  alt={track.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-blue-400 truncate">
                    {track.title}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {artistName}
                  </p>
                </div>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping mr-1"></span>
              </div>
            </div>

            {/* Section B: Next Up in Queue */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">
                Next Up ({upcomingTracks.length})
              </p>
              {upcomingTracks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  <Music size={24} className="mx-auto mb-2 opacity-40" />
                  <p>Queue is empty.</p>
                  <p className="text-[10px] mt-1 text-gray-600">
                    Click 3-dots on any track to add it here.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {upcomingTracks.map((item, idx) => {
                    const actualQueueIndex = currentIndex + 1 + idx;
                    const itemArtist =
                      typeof item.artist === "object"
                        ? item.artist?.username || "Artist"
                        : item.artist || "Artist";

                    return (
                      <div
                        key={`${item._id}-${idx}`}
                        className="group flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        <span className="text-[10px] font-mono text-gray-500 w-4 text-center">
                          {idx + 1}
                        </span>

                        <div
                          onClick={() => playTrack(item, queue)}
                          className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                        >
                          <img
                            src={
                              item.coverArt ||
                              item.thumbnailUrl ||
                              "https://via.placeholder.com/80"
                            }
                            alt={item.title}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate">
                              {itemArtist}
                            </p>
                          </div>
                        </div>

                        {/* Remove from queue button */}
                        <button
                          onClick={() => removeFromQueueByIndex(actualQueueIndex)}
                          title="Remove from queue"
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 9. SLIDE-UP OVERLAY: Live Lyrics Drawer */}
      {showLyrics && (
        <div className="absolute inset-0 bg-[#14151f]/95 backdrop-blur-xl z-30 p-6 flex flex-col justify-between animate-fadeIn">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Music size={16} className="text-blue-500" />
                <h3 className="text-sm font-bold text-white">Live Lyrics</h3>
              </div>
              <button
                onClick={() => setShowLyrics(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-bold text-white truncate">
                {track.title}
              </h4>
              <p className="text-[11px] text-blue-400 truncate">{artistName}</p>
            </div>
          </div>

          {/* Lyrics Scrollable Body */}
          <div className="flex-1 overflow-y-auto pr-2 my-2 custom-scrollbar">
            {loadingLyrics ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                <span className="text-xs">Finding official lyrics...</span>
              </div>
            ) : (
              <pre className="text-xs font-sans text-gray-300 leading-relaxed whitespace-pre-wrap select-text">
                {lyrics}
              </pre>
            )}
          </div>

          {/* Close Lyrics Drawer Button */}
          <button
            onClick={() => setShowLyrics(false)}
            className="w-full mt-3 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ChevronDown size={14} />
            Back to Player
          </button>
        </div>
      )}
    </aside>
  );
}