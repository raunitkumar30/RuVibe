import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
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
import UploadModal from "./components/UploadModal";
import PlaylistView from "./components/PlaylistView";
import AddToPlaylistModal from "./components/AddToPlaylistModal";

export default function App() {
  const audioRef = useRef(null);
  const [currentView, setCurrentView] = useState("explore");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null); // Active playlist
  const [playlistTrackToAdd, setPlaylistTrackToAdd] = useState(null); // Track opened in Add-To-Playlist modal
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false); // Controls Upload Modal
  const [tracks, setTracks] = useState([]);
  const [activeFilter, setActiveFilter] = useState("");

  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    setCurrentTime,
    setDuration,
    togglePlay,
    playNext,
    setQueue,
  } = usePlayerStore();

  const { isAuthenticated, checkAuth } = useAuthStore();
  const { fetchLikedSongs } = useFavoritesStore();

  // 1. Check existing session ONCE on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // 2. Fetch all default tracks & sync to player queue
  const fetchAllTracks = async () => {
    setActiveFilter("");
    try {
      const response = await api.get("/music");
      if (response.data?.musics && response.data.musics.length > 0) {
        setTracks(response.data.musics);
        setQueue(response.data.musics);
      }
    } catch {
      console.log("Using demo tracks until user logs in or uploads songs.");
    }
  };

  useEffect(() => {
    fetchAllTracks();
  }, [isAuthenticated]);

  // 3. Fetch user's liked songs whenever authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchLikedSongs();
    }
  }, [isAuthenticated]);

  // 4. Volume Synchronization
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // 5. Filter by Artist or Genre & update queue
  const handleFilterMusic = async (filterKeyword) => {
    if (!filterKeyword) return;
    setActiveFilter(filterKeyword);
    try {
      const res = await api.get(
        `/music/search?q=${encodeURIComponent(filterKeyword)}`
      );
      if (res.data?.musics) {
        setTracks(res.data.musics);
        setQueue(res.data.musics);
      }
    } catch (err) {
      console.error("Filter search failed:", err);
    }
  };

  // 6. Audio synchronization with HTML5 Audio element
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
      {/* Hidden Native Audio Element (Autoplay next song on ended) */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => playNext()}
      />

      {/* Auth Modal Popup */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Upload Modal Popup (for Artists) */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={(newSong) => {
          setTracks((prev) => [newSong, ...prev]);
          setQueue([newSong, ...tracks]);
        }}
      />

      {/* Add To Playlist Modal Popup */}
      <AddToPlaylistModal
        isOpen={Boolean(playlistTrackToAdd)}
        onClose={() => setPlaylistTrackToAdd(null)}
        track={playlistTrackToAdd}
      />

      {/* COLUMN 1: Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        onSelectPlaylist={(playlist) => {
          setSelectedPlaylist(playlist);
          setCurrentView("playlist");
        }}
      />

      {/* COLUMN 2: Center Scrollable Dashboard */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenUpload={() => setIsUploadOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-8 pb-10 space-y-7 scrollbar-thin scrollbar-thumb-white/10">
          {currentView === "favourites" ? (
            /* View A: Liked Songs Screen */
            <FavoritesView />
          ) : currentView === "playlist" ? (
            /* View B: Playlist Screen */
            <PlaylistView
              playlistId={selectedPlaylist?._id}
              playlistName={selectedPlaylist?.name}
            />
          ) : (
            /* View C: Home Dashboard */
            <>
              {/* Active Filter Pill */}
              {activeFilter && (
                <div className="flex items-center justify-between bg-blue-600/10 border border-blue-500/30 px-4 py-2.5 rounded-2xl">
                  <span className="text-xs font-semibold text-blue-300">
                    Showing tracks for:{" "}
                    <strong className="text-white font-bold">{activeFilter}</strong>
                  </span>
                  <button
                    onClick={fetchAllTracks}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={14} />
                    <span>Clear filter</span>
                  </button>
                </div>
              )}

              <HeroBanner featuredTrack={tracks[0]} />

              {/* Interactive Top Artists */}
              <TopArtists onSelectArtist={handleFilterMusic} />

              {/* Interactive Genres & Top Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <GenresGrid onSelectGenre={handleFilterMusic} />
                <TopCharts
                  tracks={tracks}
                  onOpenAddToPlaylist={(track) => setPlaylistTrackToAdd(track)}
                />
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