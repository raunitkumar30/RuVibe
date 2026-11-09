import React, { useEffect, useRef, useState } from "react";
import { X, CheckCircle2, Heart, Info } from "lucide-react";
import api from "./api/axios";
import { usePlayerStore } from "./store/usePlayerStore";
import { useAuthStore } from "./store/useAuthStore";
import { useFavoritesStore } from "./store/useFavoritesStore";
import { useToastStore } from "./store/useToastStore";

// Components
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";
import TopArtists from "./components/TopArtists";
import TopCharts from "./components/TopCharts";
import RightPlayer from "./components/RightPlayer";
import AuthModal from "./components/AuthModal";
import FavoritesView from "./components/FavoritesView";
import UploadModal from "./components/UploadModal";
import PlaylistView from "./components/PlaylistView";
import AddToPlaylistModal from "./components/AddToPlaylistModal";
import AlbumsView from "./components/AlbumsView";
import ArtistsView from "./components/ArtistsView";
import RecentView from "./components/RecentView";
import GenresView from "./components/GenresView";
import LocalView from "./components/LocalView";
import RadioView from "./components/RadioView";
import PodcastView from "./components/PodcastView";

export default function App() {
  const audioRef = useRef(null);
  const [currentView, setCurrentView] = useState("explore");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [playlistTrackToAdd, setPlaylistTrackToAdd] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
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
    playPrevious,
    toggleMute,
    setQueue,
  } = usePlayerStore();

  const { isAuthenticated, checkAuth } = useAuthStore();
  const { fetchLikedSongs, toggleLike } = useFavoritesStore();
  const { toast } = useToastStore();

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
    } catch (err) {
      console.error("Could not fetch tracks:", err);
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

  // 5. Global Spotify Desktop Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      ) {
        return;
      }

      // Spacebar: Play / Pause
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }

      // ArrowRight: Next Track
      if (e.key === "ArrowRight") {
        playNext();
      }

      // ArrowLeft: Previous Track
      if (e.key === "ArrowLeft") {
        playPrevious();
      }

      // M Key: Mute / Unmute
      if (e.key === "m" || e.key === "M") {
        toggleMute();
      }

      // L Key: Like / Unlike current song
      if ((e.key === "l" || e.key === "L") && currentTrack) {
        toggleLike(currentTrack);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTrack, togglePlay, playNext, playPrevious, toggleMute, toggleLike]);

  // 6. Filter by Keyword
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

  // 7. Audio synchronization with HTML5 Audio element
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

  const activeCategory =
    currentView === "radio"
      ? "LIVE"
      : currentView === "podcast"
      ? "PODCAST"
      : "MUSIC";

  return (
    <div className="flex h-screen w-screen bg-[#11121a] text-white overflow-hidden select-none relative">
      {/* Hidden Native Audio Element (Autoplay next song on ended) */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => playNext()}
      />

      {/* Floating Animated Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1c1e2b]/95 backdrop-blur-md text-white text-xs font-semibold px-5 py-3 rounded-full border border-white/10 shadow-2xl flex items-center gap-2.5 animate-bounce">
          {toast.type === "heart" ? (
            <Heart size={16} className="text-red-500 fill-red-500" />
          ) : toast.type === "info" ? (
            <Info size={16} className="text-blue-400" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

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
        onSelectView={(view) => {
          if (view === "artists") setSelectedArtist(null);
          setCurrentView(view);
        }}
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
          currentCategory={activeCategory}
          onSelectCategory={(tab) => {
            if (tab === "LIVE") setCurrentView("radio");
            else if (tab === "PODCAST") setCurrentView("podcast");
            else setCurrentView("explore");
          }}
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
          ) : currentView === "albums" ? (
            /* View C: Albums Screen */
            <AlbumsView
              onOpenAddToPlaylist={(track) => setPlaylistTrackToAdd(track)}
            />
          ) : currentView === "artists" ? (
            /* View D: Artists Screen */
            <ArtistsView
              initialArtist={selectedArtist}
              onOpenAddToPlaylist={(track) => setPlaylistTrackToAdd(track)}
            />
          ) : currentView === "genres" ? (
            /* View E: Full Dedicated Genres & Moods Screen */
            <GenresView
              onOpenAddToPlaylist={(track) => setPlaylistTrackToAdd(track)}
            />
          ) : currentView === "recent" ? (
            /* View F: Recently Played Screen */
            <RecentView
              onOpenAddToPlaylist={(track) => setPlaylistTrackToAdd(track)}
            />
          ) : currentView === "local" ? (
            /* View G: Local Computer Files Screen */
            <LocalView />
          ) : currentView === "radio" ? (
            /* View H: Live Radio Stations Screen */
            <RadioView />
          ) : currentView === "podcast" ? (
            /* View I: Podcasts & Shows Screen */
            <PodcastView />
          ) : (
            /* View J: Home Dashboard */
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

              {/* Hero Banner */}
              <HeroBanner featuredTrack={tracks[0]} allTracks={tracks} />

              {/* Interactive Top Artists */}
              <TopArtists
                onSelectArtist={(artistName) => {
                  setSelectedArtist(artistName);
                  setCurrentView("artists");
                }}
              />

              {/* Spacious Full-Width Top Charts */}
              <TopCharts
                tracks={tracks}
                onOpenAddToPlaylist={(track) => setPlaylistTrackToAdd(track)}
              />
            </>
          )}
        </main>
      </div>

      {/* COLUMN 3: Right Player Card */}
      <RightPlayer onSeek={handleSeek} />
    </div>
  );
}