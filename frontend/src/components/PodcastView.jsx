import React, { useState, useEffect } from "react";
import {
  Mic,
  Play,
  Pause,
  Clock,
  Calendar,
  Search,
  Loader2,
  Bookmark,
  Radio,
} from "lucide-react";
import api from "../api/axios";
import { usePlayerStore } from "../store/usePlayerStore";
import { useToastStore } from "../store/useToastStore";

export default function PodcastView() {
  const [searchTerm, setSearchTerm] = useState("Lex Fridman");
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedEpisodes, setSavedEpisodes] = useState(new Set());

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const { showToast } = useToastStore();

  const curatedTopics = [
    "Lex Fridman",
    "Joe Rogan",
    "Huberman Lab",
    "Ranveer Allahbadia",
    "How I Built This",
    "NPR News",
    "Deep Dive",
  ];

  // Fetch real podcast episodes dynamically
  const fetchEpisodes = async (query) => {
    setLoading(true);
    try {
      const res = await api.get(`/music/podcasts?q=${encodeURIComponent(query)}`);
      setEpisodes(res.data?.episodes || []);
    } catch (err) {
      console.error("Failed to fetch podcasts:", err);
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisodes(searchTerm);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) fetchEpisodes(searchTerm);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "45 min";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs} hr ${mins} min`;
    return `${mins} min`;
  };

  const handlePlayEpisode = (ep) => {
    if (currentTrack?._id === ep._id) {
      togglePlay();
    } else {
      playTrack(ep, episodes);
    }
  };

  const toggleSaveEpisode = (epId) => {
    setSavedEpisodes((prev) => {
      const next = new Set(prev);
      if (next.has(epId)) {
        next.delete(epId);
        showToast("Removed from saved episodes", "info");
      } else {
        next.add(epId);
        showToast("Episode saved for later!");
      }
      return next;
    });
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {/* Hero Header */}
      <div className="relative rounded-3xl p-8 bg-gradient-to-r from-blue-900/40 via-[#181a28] to-[#12131d] border border-white/5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center md:text-left">
          <div className="w-20 h-20 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-xl shadow-blue-600/20 shrink-0">
            <Mic size={38} />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Real Audio Broadcasts
            </span>
            <h1 className="text-3xl font-black text-white mt-2 mb-1 tracking-tight">
              Podcasts & Talk Shows
            </h1>
            <p className="text-xs text-gray-400">
              Search and stream full-length episodes from top global creators.
            </p>
          </div>
        </div>

        {/* Dynamic Search Box */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search any podcast..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#12131d] text-xs text-white placeholder-gray-500 pl-10 pr-4 py-3 rounded-2xl border border-white/10 focus:outline-none focus:border-blue-500/50"
          />
        </form>
      </div>

      {/* Quick Topic Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {curatedTopics.map((topic) => (
          <button
            key={topic}
            onClick={() => {
              setSearchTerm(topic);
              fetchEpisodes(topic);
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              searchTerm.toLowerCase() === topic.toLowerCase()
                ? "bg-blue-600 text-white font-bold"
                : "bg-[#181a26] text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Episodes List */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white px-1">
          Episodes for "{searchTerm}" ({episodes.length})
        </h3>

        {loading ? (
          <div className="py-24 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
            <Loader2 size={24} className="animate-spin text-blue-500" />
            <span className="text-xs">Finding episodes...</span>
          </div>
        ) : episodes.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-xs bg-[#181a26]/40 rounded-3xl border border-white/5">
            No episodes found. Try searching another creator or topic above.
          </div>
        ) : (
          <div className="space-y-3">
            {episodes.map((ep) => {
              const isCurrent = currentTrack?._id === ep._id;
              const isSaved = savedEpisodes.has(ep._id);

              return (
                <div
                  key={ep._id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isCurrent
                      ? "bg-blue-600/10 border-blue-500/30"
                      : "bg-[#181a26]/70 hover:bg-[#1f2130] border-white/5"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={ep.coverArt}
                      alt={ep.title}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-md bg-[#242738]"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium mb-1">
                        <span className="text-blue-400 font-semibold truncate">
                          {ep.showTitle || ep.artist}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          {ep.releaseDate}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} />
                          {formatDuration(ep.duration)}
                        </span>
                      </div>

                      <h4
                        className={`text-sm font-bold leading-snug cursor-pointer line-clamp-1 ${
                          isCurrent ? "text-blue-400" : "text-white hover:text-blue-400"
                        } transition-colors`}
                        onClick={() => handlePlayEpisode(ep)}
                      >
                        {ep.title}
                      </h4>

                      <p className="text-xs text-gray-400 line-clamp-2 mt-1.5 leading-relaxed">
                        {ep.description}
                      </p>
                    </div>

                    {/* Play Button */}
                    <button
                      onClick={() => handlePlayEpisode(ep)}
                      className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition-transform active:scale-95 cursor-pointer shrink-0"
                    >
                      {isCurrent && isPlaying ? (
                        <Pause size={16} fill="currentColor" />
                      ) : (
                        <Play size={16} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                    <button
                      onClick={() => toggleSaveEpisode(ep._id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                        isSaved ? "text-blue-400" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
                      <span>{isSaved ? "Saved" : "Save Episode"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}