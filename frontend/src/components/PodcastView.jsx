import React, { useState } from "react";
import {
  Mic,
  Play,
  Pause,
  Clock,
  Calendar,
  Share2,
  ArrowLeft,
  CheckCircle2,
  Bookmark,
} from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";
import { useToastStore } from "../store/useToastStore";

export default function PodcastView() {
  const [selectedShow, setSelectedShow] = useState(null);
  const [savedEpisodes, setSavedEpisodes] = useState(new Set());

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const { showToast } = useToastStore();

  const podcastShows = [
    {
      id: "pod_lex",
      title: "Lex Fridman Podcast",
      host: "Lex Fridman",
      category: "Tech & Science",
      description:
        "Conversations about AI, science, technology, history, philosophy, and the general nature of intelligence and consciousness.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      banner:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80",
      episodes: [
        {
          _id: "ep_lex_1",
          title: "#412 – Yann LeCun: Meta AI, Open Source, and AGI Architecture",
          date: "Nov 3, 2024",
          durationFormatted: "2 hr 45 min",
          duration: 9900,
          description:
            "Yann LeCun is the Chief AI Scientist at Meta, Turing Award winner, and professor at NYU discussing world models and future AI breakthroughs.",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
        {
          _id: "ep_lex_2",
          title: "#409 – Sam Altman: OpenAI, GPT-5, and Future of Robotics",
          date: "Oct 19, 2024",
          durationFormatted: "2 hr 10 min",
          duration: 7800,
          description:
            "Sam Altman is the CEO of OpenAI discussing compute clusters, reasoning benchmarks, and humanoid robot integration.",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
      ],
    },
    {
      id: "pod_huberman",
      title: "Huberman Lab",
      host: "Dr. Andrew Huberman",
      category: "Health & Fitness",
      description:
        "Dr. Andrew Huberman discusses neuroscience: how our brain and its connections with the organs of our body control our perceptions, our behaviors, and our health.",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      banner:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1000&auto=format&fit=crop&q=80",
      episodes: [
        {
          _id: "ep_hub_1",
          title: "Master Your Focus: Protocols for Dopamine and Attention",
          date: "Oct 28, 2024",
          durationFormatted: "1 hr 55 min",
          duration: 6900,
          description:
            "A masterclass on optimizing deep focus, neural plasticity, light exposure timing, and regulating mental fatigue.",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
      ],
    },
    {
      id: "pod_howibuilt",
      title: "How I Built This",
      host: "Guy Raz",
      category: "Business & Startups",
      description:
        "Guy Raz dives into the stories behind some of the world's best known companies. A masterclass in innovation, resilience, and entrepreneurship.",
      avatar:
        "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
      banner:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000&auto=format&fit=crop&q=80",
      episodes: [
        {
          _id: "ep_hibt_1",
          title: "Spotify: Daniel Ek and the Streaming Revolution",
          date: "Sep 15, 2024",
          durationFormatted: "1 hr 18 min",
          duration: 4680,
          description:
            "How Daniel Ek defied record label skepticism in Stockholm to build the world's leading music streaming platform.",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
      ],
    },
    {
      id: "pod_deepdive",
      title: "Deep Dive",
      host: "Ali Abdaal",
      category: "Productivity & Life",
      description:
        "Ali Abdaal chats with inspiring authors, creators, and entrepreneurs about the strategies and philosophies that help them live their best lives.",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      banner:
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1000&auto=format&fit=crop&q=80",
      episodes: [
        {
          _id: "ep_dd_1",
          title: "How to Build an 8-Figure Solopreneur Business",
          date: "Oct 12, 2024",
          durationFormatted: "1 hr 32 min",
          duration: 5520,
          description:
            "Actionable systems for high-leverage content creation, time audits, and avoiding creator burnout.",
          uri: "https://cdns-preview-d.dzcdn.net/stream/c-514d7a83d71959723ec09f6e3ab2b2a0-3.mp3",
        },
      ],
    },
  ];

  const handlePlayEpisode = (episode, show) => {
    const trackPayload = {
      _id: episode._id,
      title: episode.title,
      artist: show.title,
      album: show.category,
      coverArt: show.avatar,
      uri: episode.uri,
      duration: episode.duration,
    };

    if (currentTrack?._id === episode._id) {
      togglePlay();
    } else {
      playTrack(trackPayload, [trackPayload]);
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

  // ──────────────────────────────────────────────
  // VIEW B: SHOW DETAIL & EPISODES
  // ──────────────────────────────────────────────
  if (selectedShow) {
    return (
      <div className="space-y-6 select-none animate-fadeIn">
        {/* Back Button */}
        <button
          onClick={() => setSelectedShow(null)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back to all podcasts</span>
        </button>

        {/* Show Banner */}
        <div className="relative rounded-3xl p-8 bg-gradient-to-r from-blue-950/60 via-[#181a28] to-[#12131d] border border-white/5 shadow-2xl flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <div className="w-36 h-36 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 shrink-0">
            <img
              src={selectedShow.avatar}
              alt={selectedShow.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <span className="text-[11px] font-bold tracking-widest uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              {selectedShow.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-2 mb-1 tracking-tight">
              {selectedShow.title}
            </h1>
            <p className="text-xs font-semibold text-gray-300">
              Hosted by {selectedShow.host}
            </p>
            <p className="text-xs text-gray-400 mt-2 max-w-2xl leading-relaxed">
              {selectedShow.description}
            </p>
          </div>
        </div>

        {/* Episodes List */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white px-1">All Episodes</h3>

          <div className="space-y-3">
            {selectedShow.episodes.map((ep) => {
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
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium mb-1.5">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          {ep.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} />
                          {ep.durationFormatted}
                        </span>
                      </div>

                      <h4
                        className={`text-sm font-bold leading-snug cursor-pointer ${
                          isCurrent ? "text-blue-400" : "text-white hover:text-blue-400"
                        } transition-colors`}
                        onClick={() => handlePlayEpisode(ep, selectedShow)}
                      >
                        {ep.title}
                      </h4>

                      <p className="text-xs text-gray-400 line-clamp-2 mt-2 leading-relaxed">
                        {ep.description}
                      </p>
                    </div>

                    {/* Play Button */}
                    <button
                      onClick={() => handlePlayEpisode(ep, selectedShow)}
                      className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition-transform active:scale-95 cursor-pointer shrink-0"
                    >
                      {isCurrent && isPlaying ? (
                        <Pause size={18} fill="currentColor" />
                      ) : (
                        <Play size={18} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
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
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // VIEW A: PODCAST SHOWS HUB
  // ──────────────────────────────────────────────
  return (
    <div className="space-y-6 select-none animate-fadeIn">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <Mic size={26} className="text-blue-500" />
          Top Podcasts & Shows
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Explore world-class talk shows, interviews, deep dives, and educational masterclasses.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {podcastShows.map((show) => (
          <div
            key={show.id}
            onClick={() => setSelectedShow(show)}
            className="group bg-[#181a26] hover:bg-[#1e2030] p-4 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-3.5 bg-[#242738] shadow-md">
                <img
                  src={show.avatar}
                  alt={show.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white border border-white/10">
                  {show.category}
                </div>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                {show.title}
              </h3>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {show.host}
              </p>
              <p className="text-[11px] text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                {show.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-semibold text-blue-400 group-hover:text-blue-300">
              <span>{show.episodes.length} episodes</span>
              <span>Listen now →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}