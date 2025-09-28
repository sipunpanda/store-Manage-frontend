import React, { useRef } from "react";

export default function ImageUpload({ handleImage }) {
  const fileInputRef = useRef(null);

  const openCamera = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment"; // camera only
    input.onchange = handleImage;
    input.click();
  };

  const openGallery = () => {
    fileInputRef.current.click(); // regular file picker
  };

  return (
    <div className="flex justify-around items-center gap-4 mt-3">
      <button
        type="button"
        onClick={openCamera}
        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-3 rounded-full shadow-md hover:from-blue-600 hover:to-blue-800 transition flex justify-center items-center gap-2"
      >
        <span className="text-lg">📷</span>
        <span>Camera</span>
      </button>

      <button
        type="button"
        onClick={openGallery}
        className="flex-1 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold py-3 rounded-full shadow-md hover:from-green-600 hover:to-green-800 transition flex justify-center items-center gap-2"
      >
        <span className="text-lg">🖼️</span>
        <span>Gallery</span>
      </button>

      <input
        type="file"
        accept="image/*"
        onChange={handleImage}
        ref={fileInputRef}
        className="hidden"
      />
    </div>
  );
}
