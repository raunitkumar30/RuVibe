import React, { useEffect, useRef, useState } from "react";
import api from "./api/axios";
import { usePlayerStore } from "./store/usePlayerStore";
import { useAuthStore } from "./store/useAuthStore";
import { useFavoritesStore } from "./store/useFavoritesStore";

// Components
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";
import TopArtists from "./components/TopArtists";
import GenresGrid from "./components/GenresGrid";
import TopCharts from "./components/TopCharts";
import RightPlayer from "./components/RightPlayer";
import AuthModal from "./components/AuthModal";
import FavoritesView from "./components/FavoritesView";

export default function App() {
  const audioRef = useRef(null);
  const [currentView, setCurrentView] = useState("explore"); // "explore" or "favourites"
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [tracks, setTracks] = useState([]);

  const {
    currentTrack,
    isPlaying,
    setCurrentTime,
    setDuration,
    togglePlay,
  } = usePlayerStore();

  const { isAuthenticated, checkAuth } = useAuthStore();
  const { fetchLikedSongs } = useFavoritesStore();

  // 1. Check existing session ONCE on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // 2. Fetch tracks when authenticated or on mount
  useEffect(() => {
    async function fetchTracks() {
      try {
        const response = await api.get("/music");
        if (response.data?.musics && response.data.musics.length > 0) {
          setTracks(response.data.musics);
        }
      } catch {
        console.log("Using demo tracks until user logs in or uploads songs.");
      }
    }
    fetchTracks();
  }, [isAuthenticated]);

  // 3. Fetch user's liked songs whenever authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchLikedSongs();
    }
  }, [isAuthenticated]);

  // 4. Audio synchronization with Zustand store
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

  return (
    <div className="flex h-screen w-screen bg-[#11121a] text-white overflow-hidden select-none">
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => togglePlay()}
      />

      {/* Auth Modal Popup */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* COLUMN 1: Left Sidebar (with navigation switching) */}
      <Sidebar currentView={currentView} onSelectView={setCurrentView} />

      {/* COLUMN 2: Center Scrollable Dashboard */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar onOpenAuth={() => setIsAuthOpen(true)} />

        <main className="flex-1 overflow-y-auto px-8 pb-10 space-y-7 scrollbar-thin scrollbar-thumb-white/10">
          {currentView === "favourites" ? (
            /* View A: Liked Songs Screen */
            <FavoritesView />
          ) : (
            /* View B: Home Dashboard */
            <>
              <HeroBanner featuredTrack={tracks[0]} />
              <TopArtists />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <GenresGrid />
                <TopCharts tracks={tracks} />
              </div>
            </>
          )}
        </main>
      </div>

      {/* COLUMN 3: Right Player Card */}
      <RightPlayer onSeek={handleSeek} />
    </div>
  );
}