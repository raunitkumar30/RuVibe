import React, { useState, useRef } from "react";
import {
  FolderOpen,
  Play,
  Pause,
  UploadCloud,
  Trash2,
  Music,
  Clock,
  Search,
  HardDrive,
} from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";
import { useToastStore } from "../store/useToastStore";

export default function LocalView() {
  const [localTracks, setLocalTracks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const { showToast } = useToastStore();

  // Process selected or dropped audio files
  const processFiles = (files) => {
    const audioFiles = Array.from(files).filter((file) =>
      file.type.startsWith("audio/") ||
      /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name)
    );

    if (audioFiles.length === 0) {
      showToast("Please choose valid audio files (.mp3, .wav, etc.)", "info");
      return;
    }

    const newTracks = audioFiles.map((file, i) => {
      const blobUri = URL.createObjectURL(file);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);

      return {
        _id: `local_${Date.now()}_${i}`,
        title: cleanTitle,
        artist: "Local File",
        album: `${sizeMB} MB • ${file.type || "audio/mp3"}`,
        coverArt:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
        uri: blobUri,
        duration: 0, // Will update when metadata loads
        isLocal: true,
      };
    });

    // Extract durations in background
    newTracks.forEach((track) => {
      const tempAudio = new Audio(track.uri);
      tempAudio.onloadedmetadata = () => {
        setLocalTracks((prev) =>
          prev.map((t) =>
            t._id === track._id ? { ...t, duration: Math.round(tempAudio.duration) } : t
          )
        );
      };
    });

    setLocalTracks((prev) => [...newTracks, ...prev]);
    showToast(`Added ${newTracks.length} local ${newTracks.length === 1 ? "track" : "tracks"}!`);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveTrack = (trackId) => {
    setLocalTracks((prev) => prev.filter((t) => t._id !== trackId));
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handlePlaySong = (song) => {
    if (currentTrack?._id === song._id) {
      togglePlay();
    } else {
      playTrack(song, localTracks);
    }
  };

  const handlePlayAll = () => {
    if (localTracks.length > 0) {
      playTrack(localTracks[0], localTracks);
    }
  };

  const filteredTracks = localTracks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Header Banner */}
      <div className="relative rounded-3xl p-8 bg-gradient-to-r from-emerald-950/40 via-[#181a26] to-[#12131d] border border-white/5 shadow-2xl flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
          <div className="w-28 h-28 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-600/20">
            <HardDrive size={48} />
          </div>

          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Your Computer
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-2 mb-1 tracking-tight">
              Local Files
            </h1>
            <p className="text-xs font-semibold text-gray-400">
              {localTracks.length} local audio {localTracks.length === 1 ? "file" : "files"} loaded
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-full shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer text-xs"
          >
            <FolderOpen size={16} />
            <span>Choose Files</span>
          </button>

          {localTracks.length > 0 && (
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 bg-white text-black hover:bg-white/90 font-bold px-5 py-3 rounded-full shadow-lg transition-all active:scale-95 cursor-pointer text-xs"
            >
              <Play size={16} fill="currentColor" />
              <span>Play All</span>
            </button>
          )}
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
          isDragging
            ? "border-emerald-500 bg-emerald-500/10 scale-[1.01]"
            : "border-white/10 hover:border-emerald-500/40 bg-[#181a26]/40 hover:bg-[#181a26]/70"
        }`}
      >
        <UploadCloud size={32} className={isDragging ? "text-emerald-400 animate-bounce" : "text-gray-500"} />
        <p className="text-sm font-bold text-white">
          Drag and drop audio files here
        </p>
        <p className="text-xs text-gray-400">
          Supports MP3, WAV, M4A, FLAC, and AAC files directly from your hard drive
        </p>
      </div>

      {/* Tracks Section */}
      {localTracks.length > 0 && (
        <div className="bg-[#181a26]/70 rounded-3xl p-5 border border-white/5 space-y-4">
          {/* Search bar inside local tracks */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Music size={16} className="text-emerald-400" />
              Imported Songs ({filteredTracks.length})
            </h3>

            <div className="relative w-56">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Filter local files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#12131d] text-xs text-white placeholder-gray-500 pl-8 pr-3 py-1.5 rounded-xl border border-white/5 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Table */}
          <div className="divide-y divide-white/[0.03]">
            {filteredTracks.map((song, idx) => {
              const isCurrent = currentTrack?._id === song._id;

              return (
                <div
                  key={song._id}
                  onClick={() => handlePlaySong(song)}
                  className={`grid grid-cols-12 items-center px-4 py-3 rounded-2xl cursor-pointer transition-all ${
                    isCurrent
                      ? "bg-emerald-600/15 text-emerald-400 font-semibold"
                      : "hover:bg-white/5 text-gray-300"
                  }`}
                >
                  {/* Index / Pause */}
                  <div className="col-span-1 text-center text-xs text-gray-500">
                    {isCurrent && isPlaying ? (
                      <Pause
                        size={14}
                        className="mx-auto text-emerald-400 fill-emerald-400"
                      />
                    ) : (
                      <span>{String(idx + 1).padStart(2, "0")}</span>
                    )}
                  </div>

                  {/* Artwork + Title */}
                  <div className="col-span-7 flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#242738] shrink-0 flex items-center justify-center text-emerald-400">
                      <Music size={18} />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm truncate ${
                          isCurrent ? "text-emerald-400 font-bold" : "text-white"
                        }`}
                      >
                        {song.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {song.album}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="col-span-2 text-right text-xs text-gray-400 hidden sm:block">
                    {formatDuration(song.duration)}
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-4 sm:col-span-2 flex items-center justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTrack(song._id);
                      }}
                      className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      title="Remove from list"
                    >
                      <Trash2 size={15} />
                    </button>
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