import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  Settings,
  LogOut,
  User as UserIcon,
  Play,
  X,
  Loader2,
  Upload,
} from "lucide-react";
import api from "../api/axios";
import { useAuthStore } from "../store/useAuthStore";
import { usePlayerStore } from "../store/usePlayerStore";

export default function Navbar({
  onOpenAuth,
  onOpenUpload,
  currentCategory = "MUSIC",
  onSelectCategory,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchContainerRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { playTrack } = usePlayerStore();

  const tabs = ["MUSIC", "PODCAST", "LIVE"];

  // 1. Debounced live search when user types
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const res = await api.get(
          `/music/search?q=${encodeURIComponent(searchTerm)}`
        );
        setSearchResults(res.data?.musics || []);
      } catch (err) {
        console.error("Live search failed:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTrack = (track) => {
    playTrack(track, searchResults);
    setShowDropdown(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  return (
    <header className="h-20 px-8 flex items-center justify-between bg-transparent select-none shrink-0 relative z-30">
      {/* 1. Category Switcher */}
      <div className="flex items-center gap-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onSelectCategory && onSelectCategory(tab)}
            className={`text-xs font-bold tracking-widest transition-all cursor-pointer ${
              currentCategory === tab
                ? "text-white border-b-2 border-blue-500 pb-1"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 2. Floating Live Search Bar with Dropdown */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-md mx-8">
        <div className="relative flex items-center">
          <Search
            size={16}
            className="absolute left-4 text-gray-400 pointer-events-none"
          />

          <input
            type="text"
            placeholder="Search artists, songs, podcasts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setShowDropdown(true);
            }}
            className="w-full bg-[#181a24] text-xs text-white placeholder-gray-500 pl-11 pr-10 py-2.5 rounded-full border border-white/5 focus:outline-none focus:border-blue-500/50 transition-colors shadow-inner"
          />

          {isSearching ? (
            <Loader2
              size={14}
              className="absolute right-4 text-blue-500 animate-spin"
            />
          ) : searchTerm ? (
            <button
              onClick={handleClearSearch}
              className="absolute right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        {/* Live Search Floating Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-12 left-0 right-0 bg-[#181a24] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            <div className="p-2 border-b border-white/5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">
                Top Matches ({searchResults.length})
              </span>
            </div>

            <div className="p-1 space-y-0.5">
              {searchResults.map((song) => {
                const songArtist =
                  typeof song.artist === "object"
                    ? song.artist?.username
                    : song.artist || "Artist";

                return (
                  <div
                    key={song._id}
                    onClick={() => handleSelectTrack(song)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#242738] shrink-0">
                      <img
                        src={song.coverArt || "https://via.placeholder.com/100"}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Play size={14} fill="currentColor" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                        {song.title}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {songArtist} • {song.genre || "Music"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Action Controls & Profile Pill */}
      <div className="flex items-center gap-4">
        {/* Artist Upload Track Button */}
        {isAuthenticated && user?.role === "artist" && (
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
            title="Upload your track to Groovvy"
          >
            <Upload size={14} />
            <span className="hidden sm:inline">Upload Track</span>
          </button>
        )}

        <button className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1">
          <Bell size={18} />
        </button>

        <button className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1">
          <Settings size={18} />
        </button>

        {/* Profile Pill */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2.5 bg-[#181a24] p-1.5 pr-3 rounded-full border border-white/5">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.username ? user.username[0].toUpperCase() : "U"}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white leading-tight">
                {user?.username}
              </span>
              <span className="text-[9px] text-blue-400 font-medium uppercase tracking-wider">
                {user?.role || "user"}
              </span>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="text-gray-400 hover:text-red-400 transition-colors ml-2 cursor-pointer"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <UserIcon size={14} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}