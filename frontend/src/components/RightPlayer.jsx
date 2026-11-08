import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";

export default function RightPlayer({ onSeek }) {
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
    queue,
    playTrack,
  } = usePlayerStore();

  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [lyrics, setLyrics] = useState("");
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  const track = currentTrack || {
    title: "Butterfly Effect",
    artist: "Travis Scott",
    album: "Best of 2020",
    coverArt:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
    duration: 227,
  };

  const artistName =
    typeof track.artist === "object"
      ? track.artist?.username || "Artist"
      : track.artist || "Artist";

  // Fetch free lyrics on track change or drawer open
  useEffect(() => {
    if (!showLyrics || !track?.title) return;

    let isMounted = true;
    async function fetchLyrics() {
      setLoadingLyrics(true);
      try {
        const cleanArtist = encodeURIComponent(artistName);
        const cleanTitle = encodeURIComponent(track.title);
        const res = await fetch(
          `https://api.lyrics.ovh/v1/${cleanArtist}/${cleanTitle}`
        );
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
          setLyrics(
            `♪ Now Playing: ${track.title} ♪\n\nSing along and enjoy the vibe!`
          );
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

  return (
    <aside className="relative w-80 h-screen bg-[#14151f]/95 backdrop-blur-xl border-l border-white/5 p-6 flex flex-col justify-between select-none overflow-y-auto shrink-0 z-20">
      {/* 1. Top Header */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <h2 className="text-xs font-bold text-gray-300 tracking-wider uppercase">
              Now Playing
            </h2>
          </div>
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
        </div>

        {/* 2. Large Album Art with Ambient Glow */}
        <div className="relative w-full aspect-square mb-6 group">
          {/* Ambient Glow Reflection */}
          <div
            className="absolute inset-0 rounded-3xl blur-2xl opacity-40 scale-95 transition-opacity duration-700 pointer-events-none group-hover:opacity-60"
            style={{
              backgroundImage: `url(${track.coverArt || "https://via.placeholder.com/600"})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Actual Album Image */}
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-black/80 bg-[#181a24] border border-white/10">
            <img
              src={track.coverArt || "https://via.placeholder.com/600"}
              alt={track.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>

        {/* 3. Track Info */}
        <div className="text-center mb-5 px-1">
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
        <div className="mb-4 px-1">
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

        {/* 5. Volume Slider Control */}
        <div className="flex items-center gap-2.5 px-1 mb-5">
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

      {/* 6. Refined Blue Controller Card */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 rounded-3xl p-5 shadow-xl shadow-blue-600/25 border border-blue-400/20 text-white flex flex-col items-center">
        {/* Buttons Row */}
        <div className="w-full flex items-center justify-between px-2 mb-3">
          {/* Shuffle Toggle */}
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

          {/* Previous Button */}
          <button
            onClick={playPrevious}
            title="Previous track"
            className="text-white/90 hover:text-white transition-transform active:scale-90 cursor-pointer"
          >
            <SkipBack size={20} fill="currentColor" />
          </button>

          {/* Big White Circular Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="w-13 h-13 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-2xl active:scale-90 transition-transform hover:scale-105 cursor-pointer"
          >
            {isPlaying ? (
              <Pause size={22} fill="currentColor" />
            ) : (
              <Play size={22} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={playNext}
            title="Next track"
            className="text-white/90 hover:text-white transition-transform active:scale-90 cursor-pointer"
          >
            <SkipForward size={20} fill="currentColor" />
          </button>

          {/* Repeat Toggle */}
          <button
            onClick={toggleRepeat}
            title={isRepeat ? "Repeat Track ON" : "Repeat OFF"}
            className={`transition-all cursor-pointer p-1.5 rounded-xl ${
              isRepeat
                ? "text-white bg-white/20 font-bold"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Repeat size={16} />
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

      {/* 7. SLIDE-UP OVERLAY: Up Next Queue Drawer */}
      {showQueue && (
        <div className="absolute inset-0 bg-[#14151f]/95 backdrop-blur-xl z-30 p-5 flex flex-col animate-fadeIn">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ListMusic size={16} className="text-blue-500" />
              Queue ({queue.length} songs)
            </h3>
            <button
              onClick={() => setShowQueue(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {queue.map((song, i) => {
              const isCurrent = song._id === track._id;
              const songArtist =
                typeof song.artist === "object"
                  ? song.artist?.username
                  : song.artist;

              return (
                <div
                  key={song._id || i}
                  onClick={() => playTrack(song, queue)}
                  className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all ${
                    isCurrent
                      ? "bg-blue-600/20 border border-blue-500/30 text-white"
                      : "hover:bg-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <img
                    src={song.coverArt || "https://via.placeholder.com/100"}
                    alt={song.title}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isCurrent ? "text-blue-400 font-bold" : "text-white"
                      }`}
                    >
                      {song.title}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">
                      {songArtist}
                    </p>
                  </div>
                  {isCurrent && isPlaying && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-1"></span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. SLIDE-UP OVERLAY: Lyrics Drawer */}
      {showLyrics && (
        <div className="absolute inset-0 bg-[#0d0e17]/95 backdrop-blur-xl z-30 p-6 flex flex-col animate-fadeIn">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">
                {track.title}
              </h3>
              <p className="text-[10px] text-gray-400 truncate">{artistName}</p>
            </div>
            <button
              onClick={() => setShowLyrics(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 text-center">
            {loadingLyrics ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-2">
                <Music size={24} className="animate-bounce text-blue-500" />
                <span>Finding lyrics...</span>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-gray-300 font-medium whitespace-pre-line py-4">
                {lyrics}
              </p>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}