import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function TopArtists({ onSelectArtist, onSeeAllArtists }) {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback with real artist photos
  const fallbackArtists = [
    {
      name: "Arijit Singh",
      plays: "185M Plays",
      avatar: "https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_500x500.jpg",
    },
    {
      name: "The Weeknd",
      plays: "162M Plays",
      avatar: "https://c.saavncdn.com/artists/The_Weeknd_002_20241003071400_500x500.jpg",
    },
    {
      name: "Diljit Dosanjh",
      plays: "128M Plays",
      avatar: "https://c.saavncdn.com/artists/Diljit_Dosanjh_005_20231025073054_500x500.jpg",
    },
    {
      name: "Taylor Swift",
      plays: "190M Plays",
      avatar: "https://c.saavncdn.com/artists/Taylor_Swift_003_20200226074119_500x500.jpg",
    },
    {
      name: "Drake",
      plays: "145M Plays",
      avatar: "https://c.saavncdn.com/artists/Drake_006_20260520062317_500x500.jpg",
    },
    {
      name: "Shreya Ghoshal",
      plays: "115M Plays",
      avatar: "https://c.saavncdn.com/artists/Shreya_Ghoshal_007_20241101074144_500x500.jpg",
    },
  ];

  useEffect(() => {
    async function loadArtists() {
      try {
        const res = await api.get("/music/top-artists");
        if (res.data?.artists && res.data.artists.length > 0) {
          setArtists(res.data.artists);
        } else {
          setArtists(fallbackArtists);
        }
      } catch {
        setArtists(fallbackArtists);
      } finally {
        setLoading(false);
      }
    }

    loadArtists();
  }, []);

  const displayArtists = (artists.length > 0 ? artists : fallbackArtists).slice(0, 6);

  return (
    <section className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">
            Top Artists
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Click any artist to explore their hit tracks
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

      {/* Grid of Real Artist Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
        {displayArtists.map((artist) => (
          <div
            key={artist.name}
            onClick={() => onSelectArtist && onSelectArtist(artist.name)}
            className="bg-[#181a24] hover:bg-[#1f2130] p-3.5 rounded-2xl flex flex-col items-center text-center border border-white/5 hover:border-blue-500/35 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group active:scale-95"
            title={`Explore songs by ${artist.name}`}
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
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
              {artist.plays || "Top Artist"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}