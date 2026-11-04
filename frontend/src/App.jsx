import React, { useEffect, useRef, useState } from "react";
import api from "./api/axios";
import { usePlayerStore } from "./store/usePlayerStore";

// Import our 6 atomic components
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";
import TopArtists from "./components/TopArtists";
import GenresGrid from "./components/GenresGrid";
import TopCharts from "./components/TopCharts";
import RightPlayer from "./components/RightPlayer";

export default function App() {
  const audioRef = useRef(null);
  const {
    currentTrack,
    isPlaying,
    setCurrentTime,
    setDuration,
    togglePlay,
  } = usePlayerStore();

  const [tracks, setTracks] = useState([]);

  // 1. Fetch songs from backend on mount
  useEffect(() => {
    async function fetchTracks() {
      try {
        const response = await api.get("/music");
        if (response.data?.musics) {
          setTracks(response.data.musics);
        }
      } catch (error) {
        console.log("No backend songs or unauthorized yet, using demo tracks.");
      }
    }
    fetchTracks();
  }, []);

  // 2. Handle audio play/pause when Zustand state changes
  useEffect(() => {
    if (!audioRef.current) return;

    if (currentTrack?.uri) {
      if (audioRef.current.src !== currentTrack.uri) {
        audioRef.current.src = currentTrack.uri;
      }

      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn("Autoplay was prevented by browser:", err.message);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrack, isPlaying]);

  // 3. Audio element event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (newTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // 4. Search Handler (Queries backend /api/music/search)
  const handleSearch = async (query) => {
    if (!query.trim()) {
      // Re-fetch all if empty
      const res = await api.get("/music").catch(() => null);
      if (res?.data?.musics) setTracks(res.data.musics);
      return;
    }

    try {
      const res = await api.get(`/music/search?q=${encodeURIComponent(query)}`);
      if (res.data?.musics) {
        setTracks(res.data.musics);
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#11121a] text-white overflow-hidden select-none">
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => togglePlay()}
      />

      {/* COLUMN 1: Left Sidebar */}
      <Sidebar />

      {/* COLUMN 2: Center Scrollable Dashboard */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <Navbar onSearch={handleSearch} />

        {/* Scrollable Feed */}
        <main className="flex-1 overflow-y-auto px-8 pb-10 space-y-7 scrollbar-thin scrollbar-thumb-white/10">
          {/* Hero "Trending New Hits" Banner */}
          <HeroBanner featuredTrack={tracks[0]} />

          {/* Top Artists Row */}
          <TopArtists />

          {/* Bottom Dual Grid: Genres + Top Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <GenresGrid />
            <TopCharts tracks={tracks} />
          </div>
        </main>
      </div>

      {/* COLUMN 3: Right Player Card */}
      <RightPlayer onSeek={handleSeek} />
    </div>
  );
}