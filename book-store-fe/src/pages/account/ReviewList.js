// src/components/review/ReviewList.jsx
import React from "react";
import ReviewItem from "../../components/user/ReviewItem";

const ReviewList = ({ reviews = [] }) => {
    return (
        <div className="mt-10 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Đánh giá sản phẩm</h2>
            {reviews.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Chưa có đánh giá nào cho sản phẩm này.</p>
            ) : (
                reviews.map((review, idx) => (
                    <ReviewItem key={idx} review={review} />
                ))
            )}
        </div>
    );
};

export default ReviewList;
