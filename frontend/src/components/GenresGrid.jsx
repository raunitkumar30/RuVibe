import React from "react";

export default function GenresGrid({ onSelectGenre, onSeeAll }) {
  const genres = [
    { name: "Hip Hop", bg: "bg-[#ba3225]" },
    { name: "Pop", bg: "bg-[#1e6191]" },
    { name: "Lo-Fi Chill", bg: "bg-[#654062]" },
    { name: "EDM & Dance", bg: "bg-[#0f8b8d]" },
    { name: "Workout & Gym", bg: "bg-[#d94f26]" },
    { name: "Alternative Indie", bg: "bg-[#355c7d]" },
  ];

  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white tracking-wide">Genres</h2>
        <button
          onClick={onSeeAll}
          className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors cursor-pointer"
        >
          See all
        </button>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {genres.map((genre) => (
          <button
            key={genre.name}
            onClick={() => onSelectGenre && onSelectGenre(genre.name)}
            className={`${genre.bg} hover:brightness-110 active:scale-95 h-16 rounded-2xl flex items-center justify-center text-center p-2 text-xs font-bold text-white shadow-md transition-all duration-200 cursor-pointer`}
          >
            <span className="leading-tight drop-shadow-sm">{genre.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}