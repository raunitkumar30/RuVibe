import React, { useEffect, useState } from "react";
import {
  Minimize2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  Volume1,
  VolumeX,
  Heart,
  Music,
} from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";
import { useFavoritesStore } from "../store/useFavoritesStore";

export default function FullScreenPlayer({ isOpen, onClose, onSeek }) {
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
  } = usePlayerStore();

  const { toggleLike, isLiked } = useFavoritesStore();

  const [lyrics, setLyrics] = useState("");
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  const track = currentTrack || {
    title: "No Song Playing",
    artist: "Select a track to play",
    coverArt: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    duration: 210,
  };

  const artistName =
    typeof track.artist === "object"
      ? track.artist?.username || "Artist"
      : track.artist || "Artist";

  // Press ESC to exit full screen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch song lyrics
  useEffect(() => {
    if (!isOpen || !track?.title) return;

    let isMounted = true;
    async function loadLyrics() {
      setLoadingLyrics(true);
      try {
        const cleanArtist = encodeURIComponent(artistName);
        const cleanTitle = encodeURIComponent(track.title);
        const res = await fetch(`https://api.lyrics.ovh/v1/${cleanArtist}/${cleanTitle}`);
        const data = await res.json();
        if (isMounted) {
          if (data?.lyrics) {
            setLyrics(data.lyrics);
          } else {
            setLyrics(
              `♪ Listening to "${track.title}" by ${artistName} ♪\n\n(Official lyrics not currently indexed for this track.\nEnjoy the rhythm!)`
            );
          }
        }
      } catch {
        if (isMounted) {
          setLyrics(`♪ Now Playing: ${track.title} ♪\n\nSing along and enjoy the groove!`);
        }
      } finally {
        if (isMounted) setLoadingLyrics(false);
      }
    }

    loadLyrics();
    return () => {
      isMounted = false;
    };
  }, [isOpen, track?.title, artistName]);

  if (!isOpen) return null;

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const currentDuration = duration || track.duration || 1;
  const progressPercent = (currentTime / currentDuration) * 100;

  const handleSliderChange = (e) => {
    const newTime = (Number(e.target.value) / 100) * currentDuration;
    if (onSeek) onSeek(newTime);
  };

  const VolumeIcon =
    isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const trackIsLiked = isLiked ? isLiked(track._id) : false;

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0e15] overflow-hidden select-none flex flex-col justify-between animate-fadeIn">
      {/* 1. Dynamic Colored Ambient Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-3xl opacity-35 scale-125 pointer-events-none transition-all duration-1000"
        style={{
          backgroundImage: `url(${track.coverArt || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80"})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90 pointer-events-none" />

      {/* 2. Top Header with Exit Full Screen Button */}
      <header className="relative z-10 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Music size={16} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-white/70">
            Ambient Mode
          </span>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 cursor-pointer backdrop-blur-md"
          title="Exit Full Screen (Esc)"
        >
          <Minimize2 size={14} />
          <span>Exit (Esc)</span>
        </button>
      </header>

      {/* 3. Center Main Stage: Huge Artwork + Real-Time Lyrics */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 px-8 lg:px-16 items-center min-h-0 overflow-hidden">
        {/* Left Side: Large Glowing Artwork & Title */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left justify-center">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl shadow-black border border-white/15 mb-6 group">
            <img
              src={track.coverArt || "https://via.placeholder.com/600"}
              alt={track.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          <div className="w-full max-w-md">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight truncate drop-shadow-md">
                {track.title}
              </h1>
              <button
                onClick={() => toggleLike(track)}
                className={`p-2 rounded-full transition-all cursor-pointer ${
                  trackIsLiked
                    ? "text-red-500 bg-red-500/20"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
                title={trackIsLiked ? "Unlike" : "Like"}
              >
                <Heart size={20} fill={trackIsLiked ? "currentColor" : "none"} />
              </button>
            </div>
            <p className="text-lg text-blue-400 font-semibold truncate mt-1">
              {artistName}
            </p>
            <p className="text-xs text-white/50 truncate mt-0.5">
              {track.album || "Single Track"}
            </p>
          </div>
        </div>

        {/* Right Side: Karaoke Live Lyrics Display */}
        <div className="lg:col-span-7 h-72 lg:h-[450px] overflow-y-auto rounded-3xl bg-black/30 backdrop-blur-md p-8 border border-white/10 scrollbar-thin scrollbar-thumb-white/20">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Lyrics
            </span>
            <span className="text-[10px] text-white/40">Real-time Stream</span>
          </div>

          {loadingLyrics ? (
            <div className="h-full flex flex-col items-center justify-center text-white/50 text-sm gap-3">
              <Music size={28} className="animate-bounce text-blue-400" />
              <span>Fetching lyrics...</span>
            </div>
          ) : (
            <p className="text-xl sm:text-2xl font-bold leading-relaxed text-white/90 whitespace-pre-line font-sans tracking-wide">
              {lyrics}
            </p>
          )}
        </div>
      </main>

      {/* 4. Bottom Controls Dock */}
      <footer className="relative z-10 px-8 lg:px-16 pb-8 pt-4">
        {/* Scrubber Progress Bar */}
        <div className="max-w-4xl mx-auto mb-4">
          <input
            type="range"
            min="0"
            max="100"
            value={isNaN(progressPercent) ? 0 : progressPercent}
            onChange={handleSliderChange}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:h-2 transition-all"
          />
          <div className="flex justify-between items-center text-xs text-white/60 font-mono mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentDuration)}</span>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Left: Volume Slider */}
          <div className="flex items-center gap-3 w-44">
            <button
              onClick={toggleMute}
              className="text-white/70 hover:text-white cursor-pointer"
            >
              <VolumeIcon size={18} />
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : Math.round(volume * 100)}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Center: Playback Buttons */}
          <div className="flex items-center gap-6">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isShuffle ? "text-blue-400 bg-blue-500/20" : "text-white/60 hover:text-white"
              }`}
            >
              <Shuffle size={18} />
            </button>

            <button
              onClick={playPrevious}
              className="text-white/80 hover:text-white transition-transform active:scale-90 cursor-pointer"
            >
              <SkipBack size={24} fill="currentColor" />
            </button>

            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              {isPlaying ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" className="ml-1" />
              )}
            </button>

            <button
              onClick={playNext}
              className="text-white/80 hover:text-white transition-transform active:scale-90 cursor-pointer"
            >
              <SkipForward size={24} fill="currentColor" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isRepeat ? "text-blue-400 bg-blue-500/20" : "text-white/60 hover:text-white"
              }`}
            >
              <Repeat size={18} />
            </button>
          </div>

          {/* Right: Empty spacer for balanced flex centering */}
          <div className="w-44 hidden sm:block text-right text-xs text-white/40">
            Press <strong className="text-white">Esc</strong> to exit
          </div>
        </div>
      </footer>
    </div>
  );
}