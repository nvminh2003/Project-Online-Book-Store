const Review = require("../models/reviewModel");
const Book = require("../models/bookModel");
const Order = require("../models/orderModel");
const { validateCreateReview, validateUpdateReview } = require("../utils/validateReviewData");
const mongoose = require('mongoose');
const updateBookRating = require("../utils/updateBookRating");

// Create review
const createReview = async (req, res) => {
    try {
        if (req.account.role !== 'customer') {
            return res.status(403).json({
                status: "Error",
                message: "Chỉ khách hàng mới được phép đánh giá sản phẩm",
            });
        }

        const { book, order, rating, comment, images } = req.body;

        const validationErrors = validateCreateReview(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                status: "Error",
                errors: validationErrors,
                message: "Dữ liệu đánh giá không hợp lệ",
            });
        }

        const bookExists = await Book.findById(book);
        if (!bookExists) {
            return res.status(404).json({
                status: "Error",
                message: "Không tìm thấy sách để đánh giá",
            });
        }

        const orderExists = await Order.findById(order);
        if (!orderExists) {
            return res.status(404).json({
                status: "Error",
                message: "Không tìm thấy đơn hàng",
            });
        }

        if (!orderExists.user.equals(req.account._id)) {
            return res.status(403).json({
                status: "Error",
                message: "Bạn chỉ có thể đánh giá đơn hàng của chính mình",
            });
        }

        const hasBook = orderExists.items.some(item => item.book.equals(book));
        if (!hasBook) {
            return res.status(400).json({
                status: "Error",
                message: "Sách này không nằm trong đơn hàng của bạn",
            });
        }

        if (orderExists.orderStatus !== "completed") {
            return res.status(400).json({
                status: "Error",
                message: "Chỉ có thể đánh giá các đơn hàng đã hoàn thành",
            });
        }

        const existing = await Review.findOne({ user: req.account._id, book, order });
        if (existing) {
            return res.status(400).json({
                status: "Error",
                message: "Bạn đã đánh giá sách này cho đơn hàng này rồi",
            });
        }

        const review = new Review({
            book,
            user: req.account._id,
            order,
            rating,
            comment: comment.trim(),
            images: images || [],
            isHidden: false,
        });

        await review.save();
        await updateBookRating(book);

        // Cập nhật reviewId vào order.items
        await Order.findByIdAndUpdate(order, {
            $set: {
                "items.$[elem].reviewId": review._id
            }
        }, {
            arrayFilters: [{ "elem.book": book }]
        });

        res.status(201).json({
            status: "Success",
            message: "Đánh giá đã được tạo thành công",
            review,
        });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "Error" });
    }
};

// Update review
const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment, images } = req.body;

        if (req.account.role !== "customer") {
            return res.status(403).json({
                status: "Error",
                message: "Chỉ khách hàng mới được phép cập nhật đánh giá",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                status: "Error",
                message: "ID đánh giá không hợp lệ",
            });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                status: "Error",
                message: "Không tìm thấy đánh giá",
            });
        }

        if (!review.user.equals(req.account._id)) {
            return res.status(403).json({
                status: "Error",
                message: "Bạn chỉ có thể sửa đánh giá của chính mình",
            });
        }

        if (review.isHidden) {
            return res.status(400).json({
                status: "Error",
                message: "Không thể chỉnh sửa đánh giá đã bị ẩn",
            });
        }

        const validationErrors = validateUpdateReview({ rating, comment, images });
        if (validationErrors.length > 0) {
            return res.status(400).json({
                status: "Error",
                message: "Dữ liệu cập nhật không hợp lệ",
                errors: validationErrors,
            });
        }

        if (rating !== undefined) review.rating = rating;
        if (comment !== undefined) review.comment = comment.trim();
        if (images !== undefined) review.images = images;

        await review.save();
        if (rating !== undefined) await updateBookRating(review.book);

        res.status(200).json({
            status: "Success",
            message: "Đánh giá đã được cập nhật thành công",
            review,
        });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "Error" });
    }
};

// Get reviews by book ID - Public (but filtered by visibility)
const getReviewsByBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({
                status: "Error",
                message: "ID sách không hợp lệ"
            });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                status: "Error",
                message: "Không tìm thấy sách"
            });
        }

        const query = { book: bookId };
        if (!req.account || req.account.role !== "adminbusiness") {
            query.isHidden = false;
        }

        const reviews = await Review.find(query)
            .populate('user', 'email info.fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments(query);

        res.status(200).json({
            status: "Success",
            message: "Lấy đánh giá thành công",
            data: {
                reviews,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "Error",
            message: "Lỗi máy chủ: " + error.message
        });
    }
};

// Get customer's reviews - Customer only
const getUserReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (req.account.role !== "customer") {
            return res.status(403).json({
                status: "Error",
                message: "Chỉ khách hàng mới có thể xem đánh giá của chính mình"
            });
        }

        const query = { user: req.account._id };

        const reviews = await Review.find(query)
            .populate('book', 'title coverImage')
            .populate('order', 'orderNumber status')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments(query);

        res.status(200).json({
            status: "Success",
            message: "Lấy đánh giá của bạn thành công",
            data: {
                reviews,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "Error",
            message: "Lỗi máy chủ: " + error.message
        });
    }
};

// Delete review - Customer (own reviews) or AdminBusiness
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                status: "Error",
                message: "ID đánh giá không hợp lệ",
            });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                status: "Error",
                message: "Không tìm thấy đánh giá",
            });
        }

        const isOwner = review.user.equals(req.account._id);
        const isAdminBusiness = req.account.role === "adminbusiness";

        if (!isOwner && !isAdminBusiness) {
            return res.status(403).json({
                status: "Error",
                message: "Bạn không có quyền xóa đánh giá này",
            });
        }

        await review.deleteOne();

        // Xóa reviewId khỏi order.items
        await Order.findByIdAndUpdate(review.order, {
            $unset: {
                "items.$[elem].reviewId": ""
            }
        }, {
            arrayFilters: [{ "elem.book": review.book }]
        });

        const reviews = await Review.find({
            book: review.book,
            isHidden: false,
        });

        const totalRatings = reviews.length;
        const averageRating =
            totalRatings > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings
                : 0;

        await Book.findByIdAndUpdate(review.book, {
            averageRating,
            totalRatings,
        });

        res.status(200).json({
            status: "Success",
            message: "Đánh giá đã được xóa thành công",
        });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "Error" });
    }
};

// Hide/Unhide review - AdminBusiness only (for negative comments)
const toggleReviewVisibility = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (req.account.role !== "adminbusiness") {
            return res.status(403).json({
                status: "Error",
                message: "Chỉ quản trị viên doanh nghiệp mới có quyền ẩn/hiện đánh giá",
            });
        }

        if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                status: "Error",
                message: "ID đánh giá không hợp lệ",
            });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                status: "Error",
                message: "Không tìm thấy đánh giá",
            });
        }

        review.isHidden = !review.isHidden;
        await review.save();

        res.status(200).json({
            status: "Success",
            message: review.isHidden
                ? "Đánh giá đã bị ẩn thành công"
                : "Đánh giá đã được hiển thị lại",
            data: review,
        });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "Error" });
    }
};


// Get all reviews for admin business - AdminBusiness only
const getAllReviews = async (req, res) => {
    try {
        // Kiểm tra quyền truy cập
        if (req.account.role !== "adminbusiness") {
            return res.status(403).json({
                status: "Error",
                message: "Chỉ quản trị viên doanh nghiệp mới được phép xem tất cả đánh giá",
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { status, bookId, userId, rating, keyword } = req.query;

        // Tạo điều kiện tìm kiếm
        const query = {};
        if (status === "hidden") query.isHidden = true;
        else if (status === "visible") query.isHidden = false;

        if (bookId) query.book = bookId;
        if (userId) query.user = userId;
        if (rating) query.rating = parseInt(rating);

        if (keyword) {
            query.comment = { $regex: keyword, $options: "i" };
        }

        const reviews = await Review.find(query)
            .populate("user", "email info.fullName")
            .populate("book", "title coverImage")
            .populate("order", "orderNumber status")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments(query);

        res.status(200).json({
            status: "Success",
            message: "Lấy danh sách đánh giá thành công",
            data: {
                reviews,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "Error" });
    }
};

// Get review by orderId and bookId for current user
const getReviewByOrderAndBook = async (req, res) => {
    try {
        if (req.account.role !== "customer") {
            return res.status(403).json({
                status: "Error",
                message: "Chỉ khách hàng mới có thể xem đánh giá của chính mình"
            });
        }
        const { orderId, bookId } = req.query;
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId) || !bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({
                status: "Error",
                message: "orderId hoặc bookId không hợp lệ"
            });
        }
        const review = await Review.findOne({
            user: req.account._id,
            order: orderId,
            book: bookId
        });
        if (!review) {
            return res.status(404).json({
                status: "Error",
                message: "Không tìm thấy đánh giá"
            });
        }
        res.status(200).json({
            status: "Success",
            review
        });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "Error" });
    }
};

// Get review by reviewId for current user
const getReviewById = async (req, res) => {
    try {
        if (req.account.role !== "customer") {
            return res.status(403).json({
                status: "Error",
                message: "Chỉ khách hàng mới có thể xem đánh giá của chính mình"
            });
        }
        const { reviewId } = req.params;
        if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                status: "Error",
                message: "ID đánh giá không hợp lệ"
            });
        }
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                status: "Error",
                message: "Không tìm thấy đánh giá"
            });
        }
        if (!review.user.equals(req.account._id)) {
            return res.status(403).json({
                status: "Error",
                message: "Bạn chỉ có thể xem đánh giá của chính mình"
            });
        }
        res.status(200).json({
            status: "Success",
            data: review
        });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "Error" });
    }
};

module.exports = {
    createReview,
    getReviewsByBook,
    getUserReviews,
    updateReview,
    deleteReview,
    toggleReviewVisibility,
    getAllReviews,
    getReviewByOrderAndBook,
    getReviewById
};
