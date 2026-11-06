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
} from "lucide-react";
import api from "../api/axios";
import { useAuthStore } from "../store/useAuthStore";

export default function Sidebar({ currentView, onSelectView }) {
  const [playlists, setPlaylists] = useState([]);
  const { isAuthenticated } = useAuthStore();

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
    { id: "favourites", label: "Favourites", icon: Heart },
    { id: "local", label: "Local", icon: Disc },
  ];

  // 1. Fetch user's real playlists from MongoDB on load/login
  useEffect(() => {
    async function fetchPlaylists() {
      if (!isAuthenticated) {
        setPlaylists(["Design Flow", "Best of 2020", "Nigeria Jams"]);
        return;
      }
      try {
        const res = await api.get("/playlists");
        const list = res.data?.playlists || [];
        if (list.length > 0) {
          setPlaylists(list.map((p) => p.name));
        } else {
          setPlaylists(["Design Flow", "Best of 2020", "Nigeria Jams"]);
        }
      } catch {
        setPlaylists(["Design Flow", "Best of 2020", "Nigeria Jams"]);
      }
    }
    fetchPlaylists();
  }, [isAuthenticated]);

  // 2. Create a new real playlist in MongoDB
  const handleCreatePlaylist = async () => {
    const name = window.prompt("Enter new playlist name:");
    if (!name || !name.trim()) return;

    if (!isAuthenticated) {
      setPlaylists((prev) => [name.trim(), ...prev]);
      return;
    }

    try {
      const res = await api.post("/playlists", { name: name.trim() });
      if (res.data?.playlist) {
        setPlaylists((prev) => [res.data.playlist.name, ...prev]);
      }
    } catch (err) {
      console.error("Create playlist error:", err);
      setPlaylists((prev) => [name.trim(), ...prev]);
    }
  };

  return (
    <aside className="w-60 h-screen bg-[#14151f] flex flex-col justify-between p-5 border-r border-white/5 select-none overflow-y-auto shrink-0">
      <div>
        {/* Brand Logo */}
        <div
          onClick={() => onSelectView && onSelectView("explore")}
          className="flex items-center gap-2 mb-8 px-2 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
            <Activity size={18} />
          </div>
          <span className="text-xl font-bold tracking-wide text-white">
            Groovvy
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
              const isActive = (currentView || "explore") === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView && onSelectView(item.id)}
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
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView && onSelectView(item.id)}
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
            onClick={handleCreatePlaylist}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all mb-2 cursor-pointer"
          >
            <PlusSquare size={18} className="text-blue-500" />
            <span>Create New</span>
          </button>
          <div className="space-y-1">
            {playlists.map((playlist, idx) => (
              <button
                key={idx}
                className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all truncate cursor-pointer"
              >
                {playlist}
              </button>
            ))}
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
            <span>Playing on Device</span>
          </div>
        </div>
      </div>
    </aside>
  );
}