import React from "react";

export default function GenresGrid({ onSelectGenre }) {
  const genres = [
    { name: "Dance Beat", bg: "bg-[#4a6485]" },
    { name: "Electro Pop", bg: "bg-[#7c7365]" },
    { name: "Alternative Indie", bg: "bg-[#915643]" },
    { name: "Hip Hop", bg: "bg-[#275355]" },
    { name: "Classical Period", bg: "bg-[#714b60]" },
    { name: "Hip Hop Rap", bg: "bg-[#384869]" },
  ];

  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white tracking-wide">Genres</h2>
        <button className="text-xs text-gray-400 hover:text-white font-medium transition-colors">
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