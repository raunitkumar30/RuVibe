import React, { useEffect, useState } from "react";
import {
  Compass,
  LayoutGrid,
  Disc,
  Mic2,
  Radio,
  Clock,
  Heart,
  PlusSquare,
  Activity,
  Check,
  X,
  Loader2,
} from "lucide-react";
import api from "../api/axios";
import { useAuthStore } from "../store/useAuthStore";
import { useToastStore } from "../store/useToastStore";

export default function Sidebar({
  currentView,
  onSelectView,
  activeTab,
  setActiveTab,
  onSelectPlaylist,
  onRequireAuth,
}) {
  const [playlists, setPlaylists] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { showToast } = useToastStore();

  const active = currentView || activeTab || "explore";

  const handleSelect = (viewId) => {
    const normalized = viewId === "favourites" ? "favorites" : viewId;
    if (onSelectView) onSelectView(normalized);
    if (setActiveTab) setActiveTab(normalized);
  };

  const menuItems = [
    { id: "explore", label: "Explore", icon: Compass },
    { id: "genres", label: "Genres", icon: LayoutGrid },
    { id: "albums", label: "Albums", icon: Disc },
    { id: "artists", label: "Artists", icon: Mic2 },
    { id: "radio", label: "Radio", icon: Radio },
  ];

  const libraryItems = [
    { id: "recent", label: "Recent", icon: Clock },
    { id: "favorites", label: "Favourites", icon: Heart },
  ];

  // 1. Fetch user's playlists
  useEffect(() => {
    async function fetchPlaylists() {
      if (!isAuthenticated) {
        setPlaylists([
          { _id: "demo_1", name: "Design Flow" },
          { _id: "demo_2", name: "Best of 2026" },
          { _id: "demo_3", name: "Chill Vibe" },
        ]);
        return;
      }
      try {
        const res = await api.get("/playlists");
        const list = res.data?.playlists || [];
        if (list.length > 0) {
          setPlaylists(list);
        } else {
          setPlaylists([
            { _id: "demo_1", name: "Design Flow" },
            { _id: "demo_2", name: "Best of 2026" },
            { _id: "demo_3", name: "Chill Vibe" },
          ]);
        }
      } catch {
        setPlaylists([
          { _id: "demo_1", name: "Design Flow" },
          { _id: "demo_2", name: "Best of 2026" },
          { _id: "demo_3", name: "Chill Vibe" },
        ]);
      }
    }
    fetchPlaylists();
  }, [isAuthenticated]);

  // 2. Submit new playlist smoothly without prompt
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) {
      setIsCreating(false);
      return;
    }

    const playlistName = newPlaylistName.trim();
    setLoadingCreate(true);

    if (!isAuthenticated) {
      const localPl = { _id: `local_${Date.now()}`, name: playlistName };
      setPlaylists((prev) => [localPl, ...prev]);
      setIsCreating(false);
      setNewPlaylistName("");
      setLoadingCreate(false);
      showToast(`Created playlist "${playlistName}"`);
      return;
    }

    try {
      const res = await api.post("/playlists", { name: playlistName });
      if (res.data?.playlist) {
        setPlaylists((prev) => [res.data.playlist, ...prev]);
        showToast(`Created playlist "${playlistName}"`);
      }
    } catch (err) {
      console.error("Create playlist error:", err);
      const fallbackPl = { _id: `local_${Date.now()}`, name: playlistName };
      setPlaylists((prev) => [fallbackPl, ...prev]);
      showToast(`Created playlist "${playlistName}"`);
    } finally {
      setIsCreating(false);
      setNewPlaylistName("");
      setLoadingCreate(false);
    }
  };

  return (
    <aside className="w-60 h-screen bg-[#14151f] flex flex-col justify-between p-5 border-r border-white/5 select-none overflow-y-auto shrink-0 z-20">
      <div>
        {/* Brand Logo: RuVibe with custom favicon/logo */}
        <div
          onClick={() => handleSelect("explore")}
          className="flex items-center gap-2.5 mb-8 px-2 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
            {!logoError ? (
              <img
                src="/favicon.svg"
                alt="RuVibe Logo"
                onError={(e) => {
                  if (!e.target.dataset.triedFallback) {
                    e.target.dataset.triedFallback = "true";
                    e.target.src = "/favicon-96x96.png";
                  } else {
                    setLogoError(true);
                  }
                }}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <Activity size={20} />
              </div>
            )}
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white font-sans">
            Ru<span className="text-blue-500">Vibe</span>
          </span>
        </div>

        {/* MENU SECTION */}
        <div className="mb-6">
          <p className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase px-2 mb-2">
            Menu
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? "text-blue-500 bg-blue-500/10 font-semibold"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* LIBRARY SECTION */}
        <div className="mb-6">
          <p className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase px-2 mb-2">
            Library
          </p>
          <nav className="space-y-1">
            {libraryItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? "text-blue-500 bg-blue-500/10 font-semibold"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* PLAYLISTS SECTION */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
              Playlists
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Create Playlist"
            >
              <PlusSquare size={16} />
            </button>
          </div>

          {/* In-line Create Playlist Input */}
          {isCreating && (
            <form onSubmit={handleCreateSubmit} className="mb-2 px-1">
              <div className="flex items-center gap-1.5 bg-[#1e202e] border border-blue-500/50 rounded-lg p-1.5">
                <input
                  type="text"
                  autoFocus
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Playlist name..."
                  className="bg-transparent text-xs text-white placeholder-gray-500 outline-none w-full px-1.5 py-0.5"
                />
                <button
                  type="submit"
                  disabled={loadingCreate}
                  className="text-blue-400 hover:text-blue-300 p-1 rounded disabled:opacity-50 cursor-pointer"
                >
                  {loadingCreate ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Check size={13} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewPlaylistName("");
                  }}
                  className="text-gray-400 hover:text-white p-1 rounded cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            </form>
          )}

          <div className="space-y-1">
            {playlists.map((pl) => (
              <button
                key={pl._id}
                onClick={() => {
                  if (onSelectPlaylist) onSelectPlaylist(pl);
                  if (onSelectView) onSelectView("playlist");
                  if (setActiveTab) setActiveTab("playlist");
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all text-left cursor-pointer ${
                  active === "playlist"
                    ? "text-blue-400 bg-white/5"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="truncate">{pl.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* General/Settings Footer */}
      <div className="border-t border-white/5 pt-4">
        <p className="text-[10px] text-gray-500 px-2 tracking-wide uppercase">
          RuVibe Player &copy; 2026
        </p>
      </div>
    </aside>
  );
}