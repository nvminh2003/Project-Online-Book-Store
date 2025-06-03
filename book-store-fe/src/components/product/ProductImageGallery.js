import React, { useState } from "react";

const ProductImageGallery = ({ images = [] }) => {
  const [mainImageIndex, setMainImageIndex] = useState(0);

  if (!images.length) {
    return <div className="text-center text-gray-500">No images available</div>;
  }

  const handleThumbnailClick = (index) => {
    setMainImageIndex(index);
  };

  return (
    <div className="space-y-4">
      <div className="w-full h-96 overflow-hidden rounded-md border border-gray-200">
        <img
          src={images[mainImageIndex]}
          alt={`Product image ${mainImageIndex + 1}`}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex space-x-2 overflow-x-auto">
        {images.map((img, idx) => (
          <button
            key={idx}
            className={`flex-shrink-0 w-20 h-20 rounded-md border ${
              idx === mainImageIndex
                ? "border-blue-600 ring-2 ring-blue-300"
                : "border-gray-300"
            } overflow-hidden`}
            onClick={() => handleThumbnailClick(idx)}
            aria-label={`Thumbnail ${idx + 1}`}
          >
            <img
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;
