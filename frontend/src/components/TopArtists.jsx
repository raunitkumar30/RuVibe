import React from "react";

export default function TopArtists({ onSelectArtist }) {
  const artists = [
    {
      name: "Travis Scott",
      plays: "44M Plays",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    },
    {
      name: "Billie Eilish",
      plays: "203M Plays",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    },
    {
      name: "The Kid LAROI",
      plays: "63M Plays",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    },
    {
      name: "Kanye West",
      plays: "15M Plays",
      avatar:
        "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80",
    },
    {
      name: "Nicki Minaj",
      plays: "100M Plays",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    },
    {
      name: "The Weeknd",
      plays: "120M Plays",
      avatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <section className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white tracking-wide">
          Top Artists
        </h2>
        <span className="text-xs text-gray-400 font-medium">
          Click artist to explore
        </span>
      </div>

      {/* Grid of Artist Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {artists.map((artist) => (
          <div
            key={artist.name}
            onClick={() => onSelectArtist && onSelectArtist(artist.name)}
            className="bg-[#181a24] hover:bg-[#202230] p-3 rounded-2xl flex flex-col items-center text-center border border-white/5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group active:scale-95"
            title={`Listen to ${artist.name}`}
          >
            {/* Artist Photo */}
            <div className="w-16 h-16 rounded-xl overflow-hidden mb-2.5 shadow-md">
              <img
                src={artist.avatar}
                alt={artist.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Name & Plays */}
            <p className="text-xs font-semibold text-white truncate w-full group-hover:text-blue-400 transition-colors">
              {artist.name}
            </p>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
              {artist.plays}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}