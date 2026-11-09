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
  Music,
  Mic,
  Radio,
  Users,
} from "lucide-react";
import api from "../api/axios";
import { useAuthStore } from "../store/useAuthStore";
import { usePlayerStore } from "../store/usePlayerStore";

export default function Navbar({
  onOpenAuth,
  onOpenUpload,
  currentCategory = "MUSIC",
  activeCategory,
  onSelectCategory,
  onFilterMusic,
  onSelectArtist,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Result Buckets
  const [songResults, setSongResults] = useState([]);
  const [artistResults, setArtistResults] = useState([]);
  const [podcastResults, setPodcastResults] = useState([]);
  const [radioResults, setRadioResults] = useState([]);

  const searchContainerRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { playTrack } = usePlayerStore();

  const mainTabs = ["MUSIC", "PODCAST", "LIVE"];
  const currentTab = (activeCategory || currentCategory || "MUSIC").toUpperCase();

  const searchTabs = [
    { id: "all", label: "All", icon: Search },
    { id: "songs", label: "Songs", icon: Music },
    { id: "artists", label: "Artists", icon: Users },
    { id: "podcasts", label: "Podcasts", icon: Mic },
    { id: "radio", label: "Radio", icon: Radio },
  ];

  // 1. Debounced Live Search across all music sources
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSongResults([]);
      setArtistResults([]);
      setPodcastResults([]);
      setRadioResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setShowDropdown(true);

      try {
        const query = encodeURIComponent(searchTerm.trim());

        const [songsRes, artistsRes, podRes, radioRes] = await Promise.allSettled([
          api.get(`/music/search?q=${query}`),
          api.get(`/music/top-artists`),
          api.get(`/music/podcasts?q=${query}`),
          api.get(`/music/radio-stations?q=${query}`),
        ]);

        if (songsRes.status === "fulfilled" && songsRes.value.data?.musics) {
          setSongResults(songsRes.value.data.musics.slice(0, 10));
        } else {
          setSongResults([]);
        }

        if (artistsRes.status === "fulfilled" && artistsRes.value.data?.artists) {
          const lower = searchTerm.toLowerCase();
          const matched = artistsRes.value.data.artists.filter(
            (a) =>
              (a.name || "").toLowerCase().includes(lower) ||
              (a.genre || "").toLowerCase().includes(lower)
          );
          setArtistResults(
            matched.length > 0 ? matched.slice(0, 5) : artistsRes.value.data.artists.slice(0, 4)
          );
        } else {
          setArtistResults([]);
        }

        if (podRes.status === "fulfilled" && podRes.value.data?.episodes) {
          setPodcastResults(podRes.value.data.episodes.slice(0, 5));
        } else {
          setPodcastResults([]);
        }

        if (radioRes.status === "fulfilled" && radioRes.value.data?.stations) {
          setRadioResults(radioRes.value.data.stations.slice(0, 5));
        } else {
          setRadioResults([]);
        }
      } catch (err) {
        console.error("Unified search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Click outside & Escape listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelectTrack = (track, list = null) => {
    playTrack(track, list || songResults);
    setShowDropdown(false);
  };

  const handleSelectArtist = (artist) => {
    if (onSelectArtist) {
      onSelectArtist(artist);
    }
    setShowDropdown(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSongResults([]);
    setArtistResults([]);
    setPodcastResults([]);
    setRadioResults([]);
    setShowDropdown(false);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      if (onFilterMusic) onFilterMusic(searchTerm.trim());
      setShowDropdown(false);
    }
  };

  const hasResults =
    songResults.length > 0 ||
    artistResults.length > 0 ||
    podcastResults.length > 0 ||
    radioResults.length > 0;

  return (
    <header className="h-20 px-8 flex items-center justify-between bg-transparent select-none shrink-0 relative z-40 border-b border-white/5">
      {/* 1. Category Switcher with Animated Glowing Blue Indicator */}
      <div className="flex items-center gap-7">
        {mainTabs.map((tab) => {
          const isActive = currentTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onSelectCategory && onSelectCategory(tab)}
              className={`text-xs font-bold tracking-widest transition-all cursor-pointer relative pb-2 pt-1 ${
                isActive
                  ? "text-white font-extrabold"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <span>{tab}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.85)] transition-all duration-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Floating Live Search Bar with Filter Pills & Dropdown */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-xl mx-8">
        <div className="relative flex items-center">
          <Search
            size={16}
            className="absolute left-4 text-gray-400 pointer-events-none"
          />

          <input
            type="text"
            placeholder="Search songs, artists, podcasts, live radio... (Press Enter)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchSubmit}
            onFocus={() => {
              if (hasResults) setShowDropdown(true);
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
        {showDropdown && (
          <div className="absolute top-12 left-0 right-0 bg-[#161722]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[500px] overflow-y-auto custom-scrollbar animate-fadeIn">
            {/* Filter Tabs Header */}
            <div className="flex items-center gap-1.5 p-2.5 border-b border-white/5 bg-[#12131d]/90 sticky top-0 z-10 overflow-x-auto">
              {searchTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeFilterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilterTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                        : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon size={12} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Results Content */}
            <div className="p-2 space-y-4">
              {/* SECTION: ARTISTS */}
              {(activeFilterTab === "all" || activeFilterTab === "artists") &&
                artistResults.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-2 mb-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Users size={12} className="text-blue-400" />
                        Artists ({artistResults.length})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 px-1">
                      {artistResults.map((artist) => (
                        <div
                          key={artist.id || artist.name}
                          onClick={() => handleSelectArtist(artist)}
                          className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-blue-600/15 border border-white/5 hover:border-blue-500/30 cursor-pointer transition-all group"
                        >
                          <img
                            src={artist.avatar || "https://via.placeholder.com/100"}
                            alt={artist.name}
                            className="w-10 h-10 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                              {artist.name}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate">
                              {artist.genre || "Top Artist"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* SECTION: SONGS */}
              {(activeFilterTab === "all" || activeFilterTab === "songs") &&
                songResults.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-2 mb-1.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Music size={12} className="text-blue-400" />
                        Songs ({songResults.length})
                      </span>
                    </div>

                    <div className="space-y-1">
                      {songResults.map((song) => {
                        const songArtist =
                          typeof song.artist === "object"
                            ? song.artist?.username
                            : song.artist || "Artist";

                        return (
                          <div
                            key={song._id}
                            onClick={() => handleSelectTrack(song, songResults)}
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
                                {songArtist} • {song.album || "Track"}
                              </p>
                            </div>

                            {song.duration && (
                              <span className="text-[10px] font-mono text-gray-500 pr-2">
                                {Math.floor(song.duration / 60)}:
                                {String(Math.floor(song.duration % 60)).padStart(2, "0")}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* SECTION: PODCASTS */}
              {(activeFilterTab === "all" || activeFilterTab === "podcasts") &&
                podcastResults.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-2 mb-1.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Mic size={12} className="text-purple-400" />
                        Podcasts ({podcastResults.length})
                      </span>
                    </div>

                    <div className="space-y-1">
                      {podcastResults.map((ep) => (
                        <div
                          key={ep._id}
                          onClick={() => handleSelectTrack(ep, podcastResults)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                        >
                          <img
                            src={ep.coverArt || "https://via.placeholder.com/100"}
                            alt={ep.title}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                              {ep.title}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate">
                              {ep.showTitle || ep.artist}
                            </p>
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                            Episode
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* SECTION: RADIO STATIONS */}
              {(activeFilterTab === "all" || activeFilterTab === "radio") &&
                radioResults.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-2 mb-1.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Radio size={12} className="text-emerald-400" />
                        Live Radio ({radioResults.length})
                      </span>
                    </div>

                    <div className="space-y-1">
                      {radioResults.map((st) => (
                        <div
                          key={st._id}
                          onClick={() => handleSelectTrack(st, radioResults)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                        >
                          <img
                            src={st.coverArt || "https://via.placeholder.com/100"}
                            alt={st.title}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                              {st.title}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate">
                              {st.country || "Worldwide"} • {st.genre || "Live"}
                            </p>
                          </div>
                          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Live
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Fallback empty view */}
              {!hasResults && !isSearching && (
                <div className="p-8 text-center text-gray-500 text-xs">
                  <Search size={24} className="mx-auto mb-2 opacity-30" />
                  <p>No results found for "{searchTerm}"</p>
                  <p className="text-[10px] text-gray-600 mt-1">
                    Try searching by song, artist name, or podcast episode.
                  </p>
                </div>
              )}
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