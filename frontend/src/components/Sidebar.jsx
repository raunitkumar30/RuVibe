import React, { useEffect, useState } from "react";
import {
  Compass,
  LayoutGrid,
  Disc,
  Mic2,
  Radio,
  Clock,
  Heart,
  Folder,
  PlusSquare,
  Speaker,
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
    { id: "albums", label: "Albums", icon: Folder },
    { id: "favorites", label: "Favourites", icon: Heart },
    { id: "local", label: "Local", icon: Disc },
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
        {/* Brand Logo: RuVibe */}
        <div
          onClick={() => handleSelect("explore")}
          className="flex items-center gap-2.5 mb-8 px-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <Activity size={20} />
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

        {/* PLAYLIST SECTION */}
        <div className="mb-4">
          <p className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase px-2 mb-2">
            Playlist
          </p>

          <button
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all mb-2 cursor-pointer"
          >
            <PlusSquare size={18} className="text-blue-500" />
            <span>Create New</span>
          </button>

          {isCreating && (
            <form onSubmit={handleCreateSubmit} className="mb-2 px-1 animate-fadeIn">
              <div className="flex items-center gap-1 bg-[#1c1e2b] border border-blue-500/50 rounded-xl p-1 shadow-lg">
                <input
                  type="text"
                  placeholder="Playlist name..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  autoFocus
                  className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 px-2 py-1 outline-none min-w-0"
                />
                <button
                  type="submit"
                  disabled={loadingCreate}
                  className="p-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shrink-0"
                  title="Save Playlist"
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
                  className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer shrink-0"
                  title="Cancel"
                >
                  <X size={13} />
                </button>
              </div>
            </form>
          )}

          <div className="space-y-1">
            {playlists.map((playlist, idx) => {
              const playlistName =
                typeof playlist === "string" ? playlist : playlist.name;
              return (
                <button
                  key={playlist._id || idx}
                  onClick={() => {
                    if (onSelectPlaylist) onSelectPlaylist(playlist);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all truncate cursor-pointer"
                >
                  {playlistName}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM PLAYING ON DEVICE WIDGET */}
      <div className="bg-[#1c1e2b] p-3 rounded-2xl flex items-center gap-3 border border-white/5">
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-gray-300">
          <Speaker size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            Google Homepod
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span>Playing on RuVibe</span>
          </div>
        </div>
      </div>
    </aside>
  );
}