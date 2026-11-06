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
} from "lucide-react";
import api from "../api/axios";
import { useAuthStore } from "../store/useAuthStore";
import { usePlayerStore } from "../store/usePlayerStore";

export default function Navbar({ onOpenAuth }) {
  const [activeTab, setActiveTab] = useState("MUSIC");
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
    }, 300); // 300ms debounce

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
    playTrack(track);
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
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-bold tracking-widest transition-all cursor-pointer ${
              activeTab === tab
                ? "text-white border-b-2 border-blue-500 pb-1"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 2. Center Search Bar + Floating Dropdown */}
      <div ref={searchContainerRef} className="w-96 relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={searchTerm}
          onFocus={() => {
            if (searchResults.length > 0) setShowDropdown(true);
          }}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Type here to search (e.g. Eminem, Starboy)"
          className="w-full bg-[#1c1e2b] text-sm text-white placeholder-gray-500 pl-11 pr-10 py-2.5 rounded-full border border-white/5 focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
        />

        {/* Clear or Loading Icon */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
          {isSearching ? (
            <Loader2 size={16} className="text-blue-400 animate-spin" />
          ) : searchTerm ? (
            <button
              onClick={handleClearSearch}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          ) : null}
        </div>

        {/* 🌟 FLOATING SEARCH RESULTS DROPDOWN 🌟 */}
        {showDropdown && searchTerm.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#181a24]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            {isSearching ? (
              <div className="p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin text-blue-500" />
                <span>Searching tracks...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Search Results ({searchResults.length})
                </div>

                {searchResults.map((track) => {
                  const artistName =
                    typeof track.artist === "object"
                      ? track.artist?.username
                      : track.artist;

                  return (
                    <div
                      key={track._id}
                      onClick={() => handleSelectTrack(track)}
                      className="group flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Cover thumbnail */}
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-sm bg-black/40">
                          <img
                            src={track.coverArt || "https://via.placeholder.com/100"}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Play size={14} fill="white" className="text-white" />
                          </div>
                        </div>

                        {/* Title and Artist */}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                            {track.title}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">
                            {artistName || "Unknown Artist"}
                          </p>
                        </div>
                      </div>

                      {/* Tag & Duration */}
                      <div className="flex items-center gap-2 shrink-0">
                        {track.isExternal ? (
                          <span className="text-[9px] bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                            Preview
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Uploaded
                          </span>
                        )}

                        <span className="text-[11px] text-gray-400 font-medium">
                          {track.duration
                            ? `${Math.floor(track.duration / 60)}:${String(
                                track.duration % 60
                              ).padStart(2, "0")}`
                            : "3:30"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-gray-400">
                No songs found for "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. User & Quick Actions */}
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white transition-colors cursor-pointer">
          <Bell size={18} />
        </button>
        <button className="text-gray-400 hover:text-white transition-colors cursor-pointer">
          <Settings size={18} />
        </button>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-blue-500/20">
              {user.username ? user.username.charAt(0).toUpperCase() : "U"}
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white leading-tight">
                {user.username}
              </span>
              <span className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">
                {user.role}
              </span>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="text-gray-400 hover:text-red-400 ml-2 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all shadow-md shadow-blue-600/30 active:scale-95 cursor-pointer"
          >
            <UserIcon size={14} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}