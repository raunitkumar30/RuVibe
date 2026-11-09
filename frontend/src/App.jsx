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
import FullScreenPlayer from "./components/FullScreenPlayer";

export default function App() {
  const audioRef = useRef(null);
  const [currentView, setCurrentView] = useState("explore");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [playlistTrackToAdd, setPlaylistTrackToAdd] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [activeFilter, setActiveFilter] = useState("");

  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    playbackRate,
    sleepTimer,
    sleepTimerRemaining,
    cancelSleepTimer,
    tickSleepTimer,
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
  const { toast, showToast } = useToastStore();

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

  // 4. Volume & Playback Rate Synchronization
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackRate || 1.0;
    }
  }, [volume, isMuted, playbackRate]);

  // 5. Sleep Timer Countdown Interval
  useEffect(() => {
    if (!isPlaying || sleepTimerRemaining === null) return;

    if (sleepTimerRemaining <= 0) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      usePlayerStore.setState({ isPlaying: false });
      cancelSleepTimer();
      showToast("🌙 Sleep timer ended. Music paused. Goodnight!", "info");
      return;
    }

    const interval = setInterval(() => {
      tickSleepTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, sleepTimerRemaining, tickSleepTimer, cancelSleepTimer, showToast]);

  // 6. Global Spotify Desktop Keyboard Shortcuts
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

      // F Key: Toggle Full Screen Ambient Mode
      if (e.key === "f" || e.key === "F") {
        setIsFullScreenOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTrack, togglePlay, playNext, playPrevious, toggleMute, toggleLike]);

  // 7. Filter by Keyword
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

  // 8. Audio synchronization with HTML5 Audio element
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

  const handleTrackEnded = () => {
    if (sleepTimer === "end_of_track") {
      if (audioRef.current) audioRef.current.pause();
      usePlayerStore.setState({ isPlaying: false });
      cancelSleepTimer();
      showToast("🌙 Track finished. Sleep timer completed.", "info");
      return;
    }
    playNext();
  };

  // Dynamic active tab name
  const activeCategory =
    currentView === "radio"
      ? "LIVE"
      : currentView === "podcast"
      ? "PODCAST"
      : "MUSIC";

  const handleNavigateView = (viewName) => {
    setCurrentView(viewName);
    setSelectedPlaylist(null);
    setSelectedArtist(null);
  };

  return (
    <div className="flex h-screen w-screen bg-[#11121a] text-white overflow-hidden select-none relative">
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnded}
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

      {/* Full-Screen Ambient / Karaoke Player Modal */}
      <FullScreenPlayer
        isOpen={isFullScreenOpen}
        onClose={() => setIsFullScreenOpen(false)}
        onSeek={handleSeek}
      />

      {/* COLUMN 1: Left Sidebar */}
      <Sidebar
        currentView={currentView}
        activeTab={currentView}
        onSelectView={handleNavigateView}
        setActiveTab={handleNavigateView}
        onSelectPlaylist={(pl) => {
          setSelectedPlaylist(pl);
          setCurrentView("playlist");
        }}
        onRequireAuth={() => setIsAuthOpen(true)}
      />

      {/* COLUMN 2: Center Dashboard (Navbar pinned to top, scrollable view underneath) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar ALWAYS at the very top */}
        <Navbar
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenUpload={() => setIsUploadOpen(true)}
          currentCategory={activeCategory}
          activeCategory={activeCategory}
          onSelectCategory={(tab) => {
            if (tab === "LIVE") handleNavigateView("radio");
            else if (tab === "PODCAST") handleNavigateView("podcast");
            else handleNavigateView("explore");
          }}
          onFilterMusic={handleFilterMusic}
          onSelectArtist={(artist) => {
            setSelectedArtist(artist);
            setCurrentView("artist-profile");
          }}
        />

        {/* Scrollable View Area below Navbar */}
        <main className="flex-1 overflow-y-auto px-8 py-6 space-y-7 custom-scrollbar">
          {/* VIEW 1: Explore / Home */}
          {currentView === "explore" && (
            <div className="space-y-6">
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

              <HeroBanner onPlayMusic={() => {}} />

              {/* Dynamic Top Artists */}
              <TopArtists
                onSelectArtist={(artist) => {
                  setSelectedArtist(artist);
                  setCurrentView("artist-profile");
                }}
              />

              {/* Full-Width Top Charts */}
              <div className="w-full">
                <TopCharts
                  tracks={tracks}
                  activeFilter={activeFilter}
                  onClearFilter={fetchAllTracks}
                  onAddToPlaylist={(track) => setPlaylistTrackToAdd(track)}
                />
              </div>
            </div>
          )}

          {/* VIEW 2: Liked Songs */}
          {(currentView === "favorites" || currentView === "favourites") && (
            <FavoritesView
              onAddToPlaylist={(track) => setPlaylistTrackToAdd(track)}
            />
          )}

          {/* VIEW 3: Custom Playlist View */}
          {currentView === "playlist" && selectedPlaylist && (
            <PlaylistView
              playlist={selectedPlaylist}
              onBack={() => handleNavigateView("explore")}
            />
          )}

          {/* VIEW 4: Verified Artists Directory */}
          {currentView === "artists" && (
            <ArtistsView
              onSelectArtist={(artist) => {
                setSelectedArtist(artist);
                setCurrentView("artist-profile");
              }}
            />
          )}

          {/* VIEW 5: Single Artist Profile View */}
          {currentView === "artist-profile" && selectedArtist && (
            <ArtistsView
              initialArtist={selectedArtist}
              onBack={() => handleNavigateView("explore")}
            />
          )}

          {/* VIEW 6: Studio Albums Catalog */}
          {currentView === "albums" && <AlbumsView />}

          {/* VIEW 7: Recently Played History */}
          {currentView === "recent" && <RecentView />}

          {/* VIEW 8: Browse All Genres */}
          {currentView === "genres" && (
            <GenresView
              onSelectGenre={(genre) => {
                handleFilterMusic(genre);
                handleNavigateView("explore");
              }}
            />
          )}

          {/* VIEW 9: Local Audio Files (Drag & Drop) */}
          {currentView === "local" && <LocalView />}

          {/* VIEW 10: Live Streaming Radio Stations */}
          {currentView === "radio" && <RadioView />}

          {/* VIEW 11: Real Podcast Episodes Streaming */}
          {currentView === "podcast" && <PodcastView />}
        </main>
      </div>

      {/* COLUMN 3: Right Persistent Now Playing Dock */}
      <RightPlayer
        onSeek={handleSeek}
        onOpenFullScreen={() => setIsFullScreenOpen(true)}
      />

      {/* Add To Playlist Floating Modal */}
      {playlistTrackToAdd && (
        <AddToPlaylistModal
          track={playlistTrackToAdd}
          onClose={() => setPlaylistTrackToAdd(null)}
          onRequireAuth={() => {
            setPlaylistTrackToAdd(null);
            setIsAuthOpen(true);
          }}
        />
      )}

      {/* User Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Song / Album Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => {
          setIsUploadOpen(false);
          fetchAllTracks();
        }}
      />
    </div>
  );
}