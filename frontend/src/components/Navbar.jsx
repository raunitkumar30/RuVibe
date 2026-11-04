import React, { useState } from "react";
import { Search, Bell, Settings } from "lucide-react";

export default function Navbar({ onSearch }) {
  const [activeTab, setActiveTab] = useState("MUSIC");
  const [searchTerm, setSearchTerm] = useState("");

  const tabs = ["MUSIC", "PODCAST", "LIVE"];

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) onSearch(val);
  };

  return (
    <header className="h-20 px-8 flex items-center justify-between bg-transparent select-none">
      {/* 1. Category Switcher */}
      <div className="flex items-center gap-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-bold tracking-widest transition-all ${
              activeTab === tab
                ? "text-white border-b-2 border-blue-500 pb-1"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 2. Center Search Bar */}
      <div className="w-96 relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Type here to search"
          className="w-full bg-[#1c1e2b] text-sm text-white placeholder-gray-500 pl-11 pr-4 py-2.5 rounded-full border border-white/5 focus:outline-none focus:border-blue-500/50 transition-all"
        />
      </div>

      {/* 3. User & Quick Actions */}
      <div className="flex items-center gap-5">
        <button className="text-gray-400 hover:text-white transition-colors">
          <Bell size={18} />
        </button>
        <button className="text-gray-400 hover:text-white transition-colors">
          <Settings size={18} />
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-3 pl-2 border-l border-white/10">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30"
          />
          <span className="text-xs font-semibold text-white">Dave Cooper</span>
        </div>
      </div>
    </header>
  );
}