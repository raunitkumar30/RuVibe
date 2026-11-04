import React from "react";
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

export default function Sidebar() {
  const menuItems = [
    { label: "Explore", icon: Compass, active: true },
    { label: "Genres", icon: LayoutGrid },
    { label: "Albums", icon: Disc },
    { label: "Artists", icon: Mic2 },
    { label: "Radio", icon: Radio },
  ];

  const libraryItems = [
    { label: "Recent", icon: Clock },
    { label: "Albums", icon: Folder },
    { label: "Favourites", icon: Heart },
    { label: "Local", icon: Disc },
  ];

  const playlists = [
    "Design Flow",
    "Best of 2020",
    "Nigeria Jams",
  ];

  return (
    <aside className="w-60 h-screen bg-[#14151f] flex flex-col justify-between p-5 border-r border-white/5 select-none overflow-y-auto">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-2 mb-8 px-2">
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
              return (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    item.active
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
              return (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
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
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all mb-2">
            <PlusSquare size={18} className="text-blue-500" />
            <span>Create New</span>
          </button>
          <div className="space-y-1">
            {playlists.map((playlist) => (
              <button
                key={playlist}
                className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all truncate"
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
          <p className="text-xs font-semibold text-white truncate">Google Homepod</p>
          <div className="flex items-center gap-1.5 text-[10px] text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span>Playing on Device</span>
          </div>
        </div>
      </div>
    </aside>
  );
}