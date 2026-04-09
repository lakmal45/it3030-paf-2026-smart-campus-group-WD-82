import React, { useState } from "react";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";

/**
 * Reusable image upload component.
 * Allows up to 3 image files and provides preview thumbnails.
 */
const ImageUpload = ({ files, setFiles, maxFiles = 3 }) => {
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setError("");
    const selected = Array.from(e.target.files);
    
    if (files.length + selected.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} images.`);
      return;
    }

    // Filter only images
    const validImages = selected.filter((file) => file.type.startsWith("image/"));
    if (validImages.length !== selected.length) {
      setError("Only image files are allowed.");
    }

    setFiles((prev) => [...prev, ...validImages].slice(0, maxFiles));
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
            files.length >= maxFiles
              ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed"
              : "border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-300"
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-indigo-500">
            <UploadCloud className="w-8 h-8 mb-2" />
            <p className="mb-1 text-sm font-semibold">Click to upload images</p>
            <p className="text-xs text-indigo-400">
              PNG, JPG, GIF (Max {maxFiles} files)
            </p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={files.length >= maxFiles}
          />
        </label>
      </div>

      {error && <p className="text-sm text-rose-500 font-medium">{error}</p>}

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {files.map((file, index) => (
            <div key={index} className="relative group rounded-xl overflow-hidden shadow-sm border border-slate-200 aspect-video bg-slate-100 flex items-center justify-center">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index}`}
                className="object-cover w-full h-full"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1.5 right-1.5 p-1 bg-white/90 text-slate-700 hover:text-rose-600 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
