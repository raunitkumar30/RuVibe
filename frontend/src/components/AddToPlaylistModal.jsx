import React, { useEffect, useState } from "react";
import { X, Plus, Check, ListMusic, Loader2 } from "lucide-react";
import api from "../api/axios";

export default function AddToPlaylistModal({ isOpen, onClose, track }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedMap, setAddedMap] = useState({}); // track which playlist has it
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadPlaylists() {
      setLoading(true);
      try {
        const res = await api.get("/playlists");
        const list = res.data?.playlists || [];
        setPlaylists(list);

        // Check if track is already in any playlist
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
  }, [isOpen, track]);

  if (!isOpen || !track) return null;

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await api.post(`/playlists/${playlistId}/add`, {
        musicId: track._id,
        title: track.title,
        uri: track.uri,
        coverArt: track.coverArt,
        duration: track.duration,
        genre: track.genre,
      });

      // Mark as added in UI
      setAddedMap((prev) => ({ ...prev, [playlistId]: true }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add song");
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    setCreating(true);
    try {
      const res = await api.post("/playlists", {
        name: newPlaylistName.trim(),
      });
      const newPlaylist = res.data?.playlist;

      if (newPlaylist) {
        setPlaylists((prev) => [...prev, newPlaylist]);
        setNewPlaylistName("");
        // Automatically add track to the newly created playlist
        await handleAddToPlaylist(newPlaylist._id);
      }
    } catch (err) {
      alert("Failed to create playlist");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none">
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
            src={track.coverArt || "https://via.placeholder.com/80"}
            alt={track.title}
            className="w-12 h-12 rounded-xl object-cover bg-black/40 shrink-0 shadow-sm"
          />
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Add To Playlist
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
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase text-gray-400 mb-2">
            Your Playlists
          </p>

          {loading ? (
            <div className="py-8 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin text-blue-500" />
              <span>Loading playlists...</span>
            </div>
          ) : playlists.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-400">
              No playlists found. Create one below!
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-1">
              {playlists.map((playlist) => {
                const isAdded = addedMap[playlist._id];

                return (
                  <div
                    key={playlist._id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#1e202e] hover:bg-[#252839] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ListMusic size={16} className="text-blue-400 shrink-0" />
                      <span className="text-xs font-semibold text-white truncate">
                        {playlist.name}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToPlaylist(playlist._id)}
                      disabled={isAdded}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                        isAdded
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                          : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 active:scale-95"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={12} />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus size={12} />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create New Playlist Form */}
        <form onSubmit={handleCreateAndAdd} className="pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="New playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="flex-1 bg-[#1e202e] text-xs text-white placeholder-gray-500 px-3 py-2.5 rounded-xl border border-white/5 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={creating || !newPlaylistName.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all disabled:opacity-50 active:scale-95 cursor-pointer shrink-0"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}