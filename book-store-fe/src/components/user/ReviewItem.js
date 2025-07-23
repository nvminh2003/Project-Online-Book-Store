// src/components/review/ReviewItem.jsx
import React from "react";
// import Icon from "../common/Icon";

const ReviewItem = ({ review }) => {
    const {
        reviewerName = "Ẩn danh",
        rating = 0,
        comment = "",
        images = [],
        createdAt,
    } = review;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    {/* <Icon icon="mdi:account-circle" className="text-gray-500" width={24} height={24} /> */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                        {reviewerName.charAt(0).toUpperCase()}
                    </div>

                    <span className="text-sm font-semibold text-gray-800">{reviewerName}</span>
                </div>
                <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map(i => (
                        <svg
                            key={i}
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill={i <= rating ? "#FFD600" : "#E0E0E0"}
                            style={{ marginRight: 2 }}
                        >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                    ))}
                </div>
            </div>
            <p className="text-sm text-gray-700 mb-2">{comment}</p>
            {images.length > 0 && (
                <div className="flex gap-2">
                    {images.map((imgUrl, index) => (
                        <img
                            key={index}
                            src={imgUrl}
                            alt={`Review image ${index + 1}`}
                            className="w-16 h-20 object-cover rounded"
                        />
                    ))}
                </div>
            )}
            {createdAt && (
                <p className="text-xs text-gray-400 mt-2 mb-0">
                    {formatDate(createdAt)}
                </p>
            )}
        </div>
    );
};

export default ReviewItem;
