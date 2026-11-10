import React, { useEffect, useState } from "react";
import { X, Plus, Check, ListMusic, Loader2 } from "lucide-react";
import api from "../api/axios";
import { useToastStore } from "../store/useToastStore";

export default function AddToPlaylistModal({ isOpen, onClose, track }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedMap, setAddedMap] = useState({});
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [creating, setCreating] = useState(false);

  const { showToast } = useToastStore();

  const isModalOpen = isOpen !== undefined ? isOpen : Boolean(track);

  useEffect(() => {
    if (!isModalOpen) return;

    async function loadPlaylists() {
      setLoading(true);
      try {
        const res = await api.get("/playlists");
        const list = res.data?.playlists || [];
        setPlaylists(list);

        if (track?._id) {
          const map = {};
          list.forEach((p) => {
            const hasSong = p.musics?.some(
              (m) => String(m._id || m) === String(track._id)
            );
            if (hasSong) map[p._id] = true;
          });
          setAddedMap(map);
        }
      } catch (err) {
        console.error("Failed to load playlists:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPlaylists();
  }, [isModalOpen, track]);

  if (!isModalOpen || !track) return null;

  const handleAddToPlaylist = async (playlistId, playlistName = "Playlist") => {
    try {
      await api.post(`/playlists/${playlistId}/add`, {
        musicId: track._id,
        title: track.title,
        uri: track.uri,
        coverArt: track.coverArt,
        duration: track.duration,
        genre: track.genre,
      });

      setAddedMap((prev) => ({ ...prev, [playlistId]: true }));
      showToast(`Added to "${playlistName}"`);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not add to playlist", "info");
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    setCreating(true);
    const name = newPlaylistName.trim();
    try {
      const res = await api.post("/playlists", {
        name,
      });
      const newPlaylist = res.data?.playlist;

      if (newPlaylist) {
        setPlaylists((prev) => [...prev, newPlaylist]);
        setNewPlaylistName("");
        await handleAddToPlaylist(newPlaylist._id, newPlaylist.name);
      }
    } catch {
      showToast("Could not create playlist", "info");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#161822] border border-white/10 rounded-3xl p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Selected Track Preview */}
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/5">
          <img
            src={track.coverArt || "https://via.placeholder.com/100"}
            alt={track.title}
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div className="min-w-0">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Add to Playlist
            </span>
            <h3 className="text-sm font-bold text-white truncate">
              {track.title}
            </h3>
            <p className="text-xs text-gray-400 truncate">
              {typeof track.artist === "object"
                ? track.artist?.username
                : track.artist || "Artist"}
            </p>
          </div>
        </div>

        {/* Playlists List */}
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1 mb-4">
          {loading ? (
            <div className="py-8 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin text-blue-500" />
              <span className="text-xs">Loading playlists...</span>
            </div>
          ) : playlists.length === 0 ? (
            <p className="text-xs text-center text-gray-500 py-6">
              No playlists found. Create one below!
            </p>
          ) : (
            playlists.map((playlist) => {
              const isAdded = addedMap[playlist._id];

              return (
                <div
                  key={playlist._id}
                  onClick={() =>
                    !isAdded && handleAddToPlaylist(playlist._id, playlist.name)
                  }
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isAdded
                      ? "bg-blue-600/15 border border-blue-500/30 text-blue-400"
                      : "bg-[#1c1e2b] hover:bg-[#222536] text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ListMusic size={16} className="text-gray-400 shrink-0" />
                    <span className="text-xs font-semibold truncate">
                      {playlist.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isAdded
                        ? "bg-blue-500 text-white"
                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                  >
                    {isAdded ? <Check size={14} /> : <Plus size={14} />}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Create New Playlist & Add Section */}
        <form onSubmit={handleCreateAndAdd} className="pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="New playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="flex-1 bg-[#1c1e2b] border border-white/10 rounded-2xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
            />
            <button
              type="submit"
              disabled={creating || !newPlaylistName.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              {creating ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Plus size={13} />
              )}
              <span>Create</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}