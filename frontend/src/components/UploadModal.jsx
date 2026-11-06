import React, { useState } from "react";
import { X, Upload, Music, Tag, FileAudio, Loader2 } from "lucide-react";
import api from "../api/axios";

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Pop");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a song title");
      return;
    }
    if (!file) {
      setError("Please select an audio file to upload");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("genre", genre.trim());
      formData.append("file", file);

      const res = await api.post("/music/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.music) {
        if (onUploadSuccess) onUploadSuccess(res.data.music);
        // Reset form
        setTitle("");
        setGenre("Pop");
        setFile(null);
        onClose();
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to upload song. Make sure you are signed in as an artist."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="relative w-full max-w-md bg-[#161822] border border-white/10 rounded-3xl p-7 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-3 border border-blue-500/20">
            <Upload size={22} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Upload Your Track
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Audio is stored on ImageKit CDN with auto-generated cover artwork
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Song Title */}
          <div>
            <label className="text-[11px] font-semibold uppercase text-gray-400 block mb-1.5">
              Song Title
            </label>
            <div className="relative">
              <Music
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="e.g. Starboy, Midnight City"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#1e202e] text-sm text-white placeholder-gray-500 pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Genre Selection */}
          <div>
            <label className="text-[11px] font-semibold uppercase text-gray-400 block mb-1.5">
              Genre
            </label>
            <div className="relative">
              <Tag
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-[#1e202e] text-sm text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="Pop">Pop</option>
                <option value="Hip Hop">Hip Hop</option>
                <option value="Dance Beat">Dance Beat</option>
                <option value="Electro Pop">Electro Pop</option>
                <option value="Alternative Indie">Alternative Indie</option>
                <option value="Classical Period">Classical Period</option>
                <option value="R&B">R&B</option>
                <option value="Rock">Rock</option>
              </select>
            </div>
          </div>

          {/* Audio File Picker */}
          <div>
            <label className="text-[11px] font-semibold uppercase text-gray-400 block mb-1.5">
              Audio File (.mp3, .wav, .m4a)
            </label>
            <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-2xl bg-[#1e202e]/60 cursor-pointer transition-colors group">
              <FileAudio
                size={28}
                className="text-gray-400 group-hover:text-blue-400 transition-colors mb-2"
              />
              {file ? (
                <div className="text-center">
                  <span className="text-xs font-semibold text-blue-400 block truncate max-w-xs">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-xs font-semibold text-gray-300 block">
                    Choose audio file
                  </span>
                  <span className="text-[10px] text-gray-500">
                    Click to browse files
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 active:scale-98 disabled:opacity-50 mt-4 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Uploading & Fetching Artwork...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Upload Song</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}