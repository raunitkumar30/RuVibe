import React, { useState } from "react";
import {
  Radio,
  Play,
  Pause,
  Headphones,
  Sparkles,
  Signal,
  Flame,
  Volume2,
} from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";

export default function RadioView() {
  const [activeStationId, setActiveStationId] = useState("radio_lofi");
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

  const stations = [
    {
      id: "radio_lofi",
      name: "Lo-Fi Cafe 24/7",
      tagline: "Beats to study, code, and relax to. Mellow jazz chops & vinyl crackle.",
      listeners: "38.4k listening",
      frequency: "88.5 FM",
      color: "from-purple-900/60 to-indigo-950",
      accent: "text-purple-400",
      border: "border-purple-500/30",
      image:
        "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
      tracks: [
        {
          _id: "lofi_1",
          title: "Midnight Tokyo Rain",
          artist: "Chilled Cow Sessions",
          duration: 164,
          coverArt:
            "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
        {
          _id: "lofi_2",
          title: "Warm Coffee Steam",
          artist: "Study Beats Collective",
          duration: 182,
          coverArt:
            "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&auto=format&fit=crop&q=80",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
      ],
    },
    {
      id: "radio_global",
      name: "Top 50 Worldwide",
      tagline: "The most played songs on planet Earth right this second.",
      listeners: "82.1k listening",
      frequency: "95.1 FM",
      color: "from-blue-900/60 to-cyan-950",
      accent: "text-blue-400",
      border: "border-blue-500/30",
      image:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
      tracks: [
        {
          _id: "glob_1",
          title: "Blinding Lights",
          artist: "The Weeknd",
          duration: 200,
          coverArt:
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
        {
          _id: "glob_2",
          title: "Save Your Tears",
          artist: "The Weeknd",
          duration: 215,
          coverArt:
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
      ],
    },
    {
      id: "radio_hiphop",
      name: "Hip-Hop Heavyweights",
      tagline: "High-octane 808s, street anthems, and modern rap royalty.",
      listeners: "54.8k listening",
      frequency: "102.3 FM",
      color: "from-red-900/60 to-orange-950",
      accent: "text-red-400",
      border: "border-red-500/30",
      image:
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80",
      tracks: [
        {
          _id: "hh_1",
          title: "SICKO MODE",
          artist: "Travis Scott",
          duration: 312,
          coverArt:
            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
      ],
    },
    {
      id: "radio_rnb",
      name: "Late Night R&B Soul",
      tagline: "Silk vocals, slow-tempo trap drums, and midnight confessions.",
      listeners: "29.7k listening",
      frequency: "98.7 FM",
      color: "from-pink-900/60 to-rose-950",
      accent: "text-pink-400",
      border: "border-pink-500/30",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=80",
      tracks: [
        {
          _id: "rnb_1",
          title: "Fair Trade",
          artist: "Drake ft. Travis Scott",
          duration: 291,
          coverArt:
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=80",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
      ],
    },
    {
      id: "radio_dance",
      name: "Ibiza Club Sessions",
      tagline: "Deep house, euphoric vocal trance, and festival sunset drops.",
      listeners: "41.9k listening",
      frequency: "105.5 FM",
      color: "from-teal-900/60 to-emerald-950",
      accent: "text-teal-400",
      border: "border-teal-500/30",
      image:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80",
      tracks: [
        {
          _id: "edm_1",
          title: "Levitating (Club Mix)",
          artist: "Dua Lipa",
          duration: 203,
          coverArt:
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
      ],
    },
    {
      id: "radio_synth",
      name: "Cyberpunk 1984",
      tagline: "Driving analog synthesizers, neon highways, and retro outrun vibes.",
      listeners: "17.3k listening",
      frequency: "91.9 FM",
      color: "from-fuchsia-900/60 to-purple-950",
      accent: "text-fuchsia-400",
      border: "border-fuchsia-500/30",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80",
      tracks: [
        {
          _id: "synth_1",
          title: "Neo Tokyo Sunset",
          artist: "Synthwave Collective",
          duration: 220,
          coverArt:
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
      ],
    },
  ];

  const handleTuneIn = (station) => {
    setActiveStationId(station.id);
    if (station.tracks && station.tracks.length > 0) {
      playTrack(station.tracks[0], station.tracks);
    }
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {/* Hero Banner */}
      <div className="relative rounded-3xl p-8 bg-gradient-to-r from-blue-900/30 via-[#181a26] to-[#12131d] border border-white/5 shadow-2xl flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
          <div className="w-24 h-24 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-xl shadow-blue-600/20">
            <Radio size={44} className="animate-pulse" />
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-[11px] font-bold tracking-widest uppercase text-red-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>Live Broadcasts</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Groovvy Radio
            </h1>
            <p className="text-xs font-semibold text-gray-400 mt-0.5">
              Curated non-stop stations streaming 24 hours a day with zero interruptions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#12131d] px-4 py-2 rounded-2xl border border-white/10 text-xs font-semibold text-gray-300">
          <Signal size={15} className="text-emerald-400" />
          <span>High Fidelity Stream (320kbps)</span>
        </div>
      </div>

      {/* Grid of Stations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stations.map((station) => {
          const isTunedIn = activeStationId === station.id && isPlaying;

          return (
            <div
              key={station.id}
              onClick={() => handleTuneIn(station)}
              className={`group bg-gradient-to-br ${station.color} p-6 rounded-3xl border ${
                isTunedIn ? station.border : "border-white/5 hover:border-white/20"
              } cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between h-64 relative overflow-hidden`}
            >
              {/* Top Row: Frequency & Live Badge */}
              <div className="flex items-center justify-between z-10">
                <span className="text-xs font-mono font-bold tracking-widest text-white/70 bg-black/30 px-3 py-1 rounded-full border border-white/10">
                  {station.frequency}
                </span>

                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/90 bg-black/40 px-3 py-1 rounded-full">
                  <span className={`w-1.5 h-1.5 rounded-full ${isTunedIn ? "bg-emerald-400 animate-pulse" : "bg-red-500"}`}></span>
                  <span>{station.listeners}</span>
                </div>
              </div>

              {/* Station Info */}
              <div className="z-10 my-auto">
                <h3 className="text-xl font-black text-white tracking-tight mb-1 group-hover:text-white transition-colors">
                  {station.name}
                </h3>
                <p className="text-xs text-white/75 line-clamp-2 leading-relaxed">
                  {station.tagline}
                </p>
              </div>

              {/* Bottom Row: Play Button & Visualizer */}
              <div className="flex items-center justify-between z-10 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    {isTunedIn ? (
                      <Pause size={18} fill="currentColor" />
                    ) : (
                      <Play size={18} fill="currentColor" className="ml-0.5" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-white">
                    {isTunedIn ? "On Air" : "Tune In"}
                  </span>
                </div>

                {/* Animated Equalizer Bars when playing */}
                {isTunedIn ? (
                  <div className="flex items-end gap-1 h-5">
                    <span className="w-1 bg-white rounded-full animate-bounce h-5"></span>
                    <span className="w-1 bg-white rounded-full animate-bounce delay-100 h-3"></span>
                    <span className="w-1 bg-white rounded-full animate-bounce delay-200 h-4"></span>
                    <span className="w-1 bg-white rounded-full animate-bounce delay-150 h-2"></span>
                  </div>
                ) : (
                  <Headphones size={18} className="text-white/40" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}