import React, { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import api from "../api/axios";

export default function TopArtists({ onSelectArtist, onSeeAllArtists }) {
  const [artists, setArtists] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Initial load: page 1 (6 artists)
  useEffect(() => {
    async function loadInitialArtists() {
      setLoading(true);
      try {
        const res = await api.get("/music/top-artists?page=1&limit=6");
        const list = res.data?.artists || [];
        setArtists(list);
        setHasMore(res.data?.hasMore ?? list.length >= 6);
      } catch (err) {
        console.error("Failed to load top artists:", err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialArtists();
  }, []);

  // Dynamically load more artists and append to grid
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const res = await api.get(`/music/top-artists?page=${nextPage}&limit=6`);
      const newArtists = res.data?.artists || [];

      if (newArtists.length > 0) {
        setArtists((prev) => {
          const existingIds = new Set(prev.map((a) => a.id || a.name));
          const uniqueNew = newArtists.filter((a) => !existingIds.has(a.id || a.name));
          return [...prev, ...uniqueNew];
        });
        setPage(nextPage);
        setHasMore(res.data?.hasMore ?? newArtists.length >= 6);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more artists:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <section className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
            Top Artists
            <span className="text-[11px] font-mono font-medium text-gray-500">
              ({artists.length} loaded)
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Click any artist to explore all their songs
          </p>
        </div>

        {onSeeAllArtists && (
          <button
            onClick={onSeeAllArtists}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer transition-colors"
          >
            Explore All Artists →
          </button>
        )}
      </div>

      {/* Grid of Artist Cards or Skeletons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
        {loading && artists.length === 0
          ? [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-[#181a24]/60 p-3.5 rounded-2xl flex flex-col items-center text-center border border-white/5 animate-pulse"
              >
                <div className="w-20 h-20 rounded-full bg-white/10 mb-3" />
                <div className="w-16 h-3 bg-white/10 rounded mb-1.5" />
                <div className="w-12 h-2.5 bg-white/5 rounded" />
              </div>
            ))
          : artists.map((artist) => (
              <div
                key={artist.id || artist.name}
                onClick={() => onSelectArtist && onSelectArtist(artist)}
                className="bg-[#181a24] hover:bg-[#1f2130] p-3.5 rounded-2xl flex flex-col items-center text-center border border-white/5 hover:border-blue-500/35 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group active:scale-95 animate-fadeIn"
                title={`Open artist page for ${artist.name}`}
              >
                {/* Real Artist Photo (Circular Portrait) */}
                <div className="w-20 h-20 rounded-full overflow-hidden mb-3 shadow-lg bg-[#222538] border border-white/10 shrink-0">
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80";
                    }}
                  />
                </div>

                {/* Name & Plays */}
                <p className="text-xs font-bold text-white truncate w-full group-hover:text-blue-400 transition-colors">
                  {artist.name}
                </p>
                <p className="text-[10px] text-gray-500 truncate w-full mt-0.5">
                  {artist.plays || artist.genre || "Verified Artist"}
                </p>
              </div>
            ))}
      </div>

      {/* Dynamic Load More Artists Button */}
      {hasMore && artists.length > 0 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/5 hover:bg-blue-600/20 text-xs font-bold text-gray-300 hover:text-blue-400 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 size={13} className="animate-spin text-blue-400" />
                <span>Loading more artists...</span>
              </>
            ) : (
              <>
                <Plus size={13} className="text-blue-400" />
                <span>Load More Artists</span>
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}