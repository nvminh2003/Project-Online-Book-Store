const Review = require("../models/reviewModel");
const Order = require("../models/orderModel");

const updateOrderReviewIds = async () => {
    try {
        console.log("🔄 Bắt đầu cập nhật reviewId cho các order...");

        // Lấy tất cả review
        const reviews = await Review.find({}).populate('order');

        let updatedCount = 0;

        for (const review of reviews) {
            if (review.order) {
                // Cập nhật reviewId vào order.items
                const result = await Order.findByIdAndUpdate(review.order._id, {
                    $set: {
                        "items.$[elem].reviewId": review._id
                    }
                }, {
                    arrayFilters: [{ "elem.book": review.book }],
                    new: true
                });

                if (result) {
                    updatedCount++;
                    console.log(`✅ Đã cập nhật reviewId cho order ${review.order.orderCode}`);
                }
            }
        }

        console.log(`🎉 Hoàn thành! Đã cập nhật ${updatedCount} order.`);

    } catch (error) {
        console.error("❌ Lỗi khi cập nhật reviewId:", error);
    }
};

module.exports = updateOrderReviewIds; 