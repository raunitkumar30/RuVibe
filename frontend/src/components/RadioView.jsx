import React, { useState, useEffect } from "react";
import {
  Radio,
  Play,
  Pause,
  Signal,
  Search,
  Loader2,
  Headphones,
} from "lucide-react";
import api from "../api/axios";
import { usePlayerStore } from "../store/usePlayerStore";

export default function RadioView() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTag, setSearchTag] = useState("bollywood");

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

  const curatedTags = [
    { label: "Bollywood", query: "bollywood" },
    { label: "Pop Hits", query: "pop" },
    { label: "Classic Rock", query: "rock" },
    { label: "Chillout & Lofi", query: "chill" },
    { label: "Electronic / Dance", query: "dance" },
    { label: "Hip-Hop", query: "rap" },
    { label: "Jazz FM", query: "jazz" },
  ];

  const fetchStations = async (query) => {
    setLoading(true);
    try {
      const res = await api.get(`/music/radio-stations?q=${encodeURIComponent(query)}`);
      setStations(res.data?.stations || []);
    } catch (err) {
      console.error("Failed to load radio stations:", err);
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations(searchTag);
  }, []);

  const handleTuneIn = (station) => {
    if (currentTrack?._id === station._id) {
      togglePlay();
    } else {
      playTrack(station, stations);
    }
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {/* Banner */}
      <div className="relative rounded-3xl p-8 bg-gradient-to-r from-red-950/40 via-[#181a28] to-[#12131d] border border-white/5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shadow-xl shadow-red-600/20 shrink-0">
            <Radio size={40} className="animate-pulse" />
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-[10px] font-bold tracking-widest uppercase text-red-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>Global Live Airwaves</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Live Streaming Radio
            </h1>
            <p className="text-xs text-gray-400">
              Tune in to real-time live FM & digital broadcasts from around the world.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#12131d] px-4 py-2 rounded-2xl border border-white/10 text-xs font-semibold text-gray-300">
          <Signal size={15} className="text-emerald-400" />
          <span>Real-time Audio Stream</span>
        </div>
      </div>

      {/* Genre Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {curatedTags.map((t) => (
          <button
            key={t.query}
            onClick={() => {
              setSearchTag(t.query);
              fetchStations(t.query);
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              searchTag === t.query
                ? "bg-red-600 text-white font-bold"
                : "bg-[#181a26] text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Stations Grid */}
      {loading ? (
        <div className="py-24 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="animate-spin text-red-500" />
          <span className="text-xs">Tuning into live airwaves...</span>
        </div>
      ) : stations.length === 0 ? (
        <div className="py-16 text-center text-gray-500 text-xs bg-[#181a26]/40 rounded-3xl border border-white/5">
          No live stations found. Try selecting another genre above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stations.map((st) => {
            const isTunedIn = currentTrack?._id === st._id && isPlaying;

            return (
              <div
                key={st._id}
                onClick={() => handleTuneIn(st)}
                className={`group p-5 rounded-3xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 flex items-center justify-between gap-4 ${
                  isTunedIn
                    ? "bg-red-600/15 border-red-500/40 shadow-xl shadow-red-600/10"
                    : "bg-[#181a26] hover:bg-[#1e2030] border-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#242738] overflow-hidden shrink-0 flex items-center justify-center border border-white/10">
                    <img
                      src={st.coverArt}
                      alt={st.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80";
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <h4
                      className={`text-sm font-bold truncate ${
                        isTunedIn ? "text-red-400" : "text-white"
                      }`}
                    >
                      {st.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 truncate">
                      {st.album} • {st.genre || "Broadcast"}
                    </p>
                  </div>
                </div>

                {/* Live Indicator / Tune In Button */}
                <div className="flex items-center gap-2 shrink-0">
                  {isTunedIn && (
                    <div className="flex items-end gap-0.5 h-4 mr-1">
                      <span className="w-1 bg-red-500 rounded-full animate-bounce h-4"></span>
                      <span className="w-1 bg-red-500 rounded-full animate-bounce delay-100 h-2.5"></span>
                      <span className="w-1 bg-red-500 rounded-full animate-bounce delay-200 h-3.5"></span>
                    </div>
                  )}

                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    {isTunedIn ? (
                      <Pause size={16} fill="currentColor" />
                    ) : (
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}