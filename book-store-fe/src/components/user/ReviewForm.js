import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import Icon from "../common/Icon";
import Button from '../../components/common/Button';
import AdminModal from '../admin/AdminModal';
import reviewService from '../../services/reviewService';
import { notifySuccess, notifyError } from '../../components/common/ToastManager';
import axios from "axios";
import moment from 'moment';

const ReviewForm = () => {
    const formatDate = (date) => {
        return moment(date).format('DD/MM/YYYY [lúc] HH:mm');
    };
    const { orderId, reviewId, bookId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const productInfo = location.state?.book;

    const [reviewCreatedAt, setReviewCreatedAt] = useState(null);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState(false);

    const isEditMode = Boolean(reviewId);
    const isReadOnly = viewMode && isEditMode;

    // Load dữ liệu nếu là sửa
    useEffect(() => {
        if (isEditMode) {
            setViewMode(true); // Mặc định vào chế độ xem khi có reviewId
            (async () => {
                setLoading(true);
                try {
                    const res = await reviewService.getReviewById(reviewId);
                    setRating(res.data.rating);
                    setComment(res.data.comment);
                    setReviewCreatedAt(res.data.createdAt);
                    if (res.data.images && Array.isArray(res.data.images)) {
                        setPreviewUrls(res.data.images);
                    }
                } catch (err) {
                    notifyError('Không thể tải đánh giá');
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [reviewId, isEditMode]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 5); // tối đa 5 ảnh
        setImages(files);
        setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
    };

    const uploadImagesToCloudinary = async () => {
        if (images.length === 0) return previewUrls.filter(url => url.startsWith('http')); // giữ lại ảnh cũ khi edit
        const uploadPromises = images.map((image) => {
            const formData = new FormData();
            formData.append("file", image);
            formData.append("upload_preset", "book_upload");
            return axios.post(
                "https://api.cloudinary.com/v1_1/dhwegqmxl/image/upload",
                formData
            );
        });
        const responses = await Promise.all(uploadPromises);
        return responses.map((res) => res.data.secure_url);
    };

    const handleRemoveImage = (indexToRemove) => {
        const newPreviews = previewUrls.filter((_, idx) => idx !== indexToRemove);
        const newFiles = images.filter((_, idx) => idx !== indexToRemove);
        setPreviewUrls(newPreviews);
        setImages(newFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating || !comment.trim()) {
            notifyError('Vui lòng đánh giá và viết nhận xét.');
            return;
        }

        try {
            setSubmitting(true);
            let imageUrls = [];
            if (images.length > 0) {
                imageUrls = await uploadImagesToCloudinary();
            } else if (isEditMode && previewUrls.length > 0) {
                imageUrls = previewUrls.filter(url => url.startsWith('http'));
            }

            if (isEditMode) {
                await reviewService.updateReview(reviewId, { rating, comment, images: imageUrls });
                notifySuccess('Cập nhật đánh giá thành công!');
            } else {
                await reviewService.createReview({ rating, comment, book: bookId, order: orderId, images: imageUrls });
                notifySuccess('Gửi đánh giá thành công!');
            }
            setSuccess(true);
            setTimeout(() => {
                navigate('/orders');
            }, 1200);
        } catch (err) {
            // Hiển thị message lỗi chi tiết từ BE
            if (err.errors && Array.isArray(err.errors)) {
                // Nếu có nhiều lỗi, hiển thị từng lỗi
                err.errors.forEach(error => {
                    notifyError(error);
                });
            } else if (err.message) {
                // Nếu có message lỗi
                notifyError(err.message);
            } else {
                // Fallback message
                notifyError('Đã xảy ra lỗi khi gửi đánh giá.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = () => {
        if (!reviewId) return;
        setIsConfirmModalOpen(true);
    };

    const confirmDeleteReview = async () => {
        try {
            setSubmitting(true);
            await reviewService.deleteReview(reviewId);
            notifySuccess('Xóa đánh giá thành công!');
            setTimeout(() => {
                navigate('/orders');
            }, 1000);
        } catch (err) {
            // Hiển thị message lỗi chi tiết từ BE
            if (err.errors && Array.isArray(err.errors)) {
                err.errors.forEach(error => {
                    notifyError(error);
                });
            } else if (err.message) {
                notifyError(err.message);
            } else {
                notifyError('Không thể xóa đánh giá.');
            }
        } finally {
            setSubmitting(false);
            setIsConfirmModalOpen(false);
        }
    };

    if (loading) return <div className="text-center py-10">Đang tải đánh giá...</div>;

    return (
        <div className="max-w-xl mx-auto p-4 bg-white shadow-md rounded-md mt-8">
            {/* Nút Quay về thông tin đơn hàng */}
            <div className="mb-4">
                <Link to={`/orders/${orderId}`} className="no-underline">
                    <Button variant="outline" className="flex items-center gap-2">
                        <Icon icon="tabler:arrow-left" width={18} height={18} />
                        Quay về thông tin đơn hàng
                    </Button>
                </Link>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {isReadOnly ? 'Xem đánh giá' : isEditMode ? 'Chỉnh sửa đánh giá' : 'Đánh giá sản phẩm'}
            </h2>

            {/* Thông tin sản phẩm */}
            {productInfo && (
                <div className="flex items-center gap-4 mb-2 p-3 bg-gray-50 rounded">
                    <img src={productInfo.image || '/default-book.jpg'} alt={productInfo.title} className="w-16 h-20 object-cover rounded border" />
                    <div>
                        <div className="font-semibold text-gray-800">{productInfo.title}</div>
                        <div className="text-sm text-gray-500">Giá: {productInfo.price?.toLocaleString('vi-VN')} đ</div>
                        <div className="text-sm text-gray-500">Số lượng: {productInfo.quantity}</div>
                    </div>
                </div>
            )}

            {success ? (
                <div className="text-green-600 font-medium">Cảm ơn bạn đã gửi đánh giá!</div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Rating */}
                    <div>
                        <p className="font-medium mb-1">Chọn số sao:</p>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Icon
                                    key={star}
                                    icon={(hover || rating) >= star ? "mdi:star" : "mdi:star-outline"}
                                    color={(hover || rating) >= star ? "#facc15" : "#d1d5db"}
                                    width="24"
                                    height="24"
                                    className={`transition-colors ${isReadOnly ? '' : 'cursor-pointer'}`}
                                    onClick={() => !isReadOnly && setRating(star)}
                                    onMouseEnter={() => !isReadOnly && setHover(star)}
                                    onMouseLeave={() => !isReadOnly && setHover(null)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label htmlFor="comment" className="block font-medium mb-1">Nhận xét:</label>
                        <textarea
                            id="comment"
                            rows={4}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={comment}
                            onChange={(e) => !isReadOnly && setComment(e.target.value)}
                            placeholder={isReadOnly ? "" : "Sản phẩm như thế nào? Chia sẻ cảm nhận của bạn..."}
                            required
                            disabled={isReadOnly}
                        />
                    </div>

                    {/* Upload ảnh - chỉ hiển thị khi không ở chế độ xem */}
                    {!isReadOnly && (
                        <div>
                            <label className="block font-medium mb-1">Ảnh minh họa (tối đa 5 ảnh):</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                disabled={submitting || previewUrls.length >= 5}
                                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {/* Gợi ý nếu đạt giới hạn ảnh */}
                            {previewUrls.length >= 5 && (
                                <p className="text-xs text-red-500 mt-1">Bạn chỉ có thể tải lên tối đa 5 ảnh</p>
                            )}
                            <div className="flex gap-3 mt-3 flex-wrap">
                                {previewUrls.map((url, idx) => (
                                    <div key={idx} className="relative group">
                                        <img
                                            src={url}
                                            alt={`Preview ${idx + 1}`}
                                            className="w-20 h-20 object-cover rounded border border-gray-300"
                                        />
                                        {/* Nút xoá ảnh */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(idx)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-80 hover:opacity-100 transition"
                                            title="Xoá ảnh"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hiển thị ảnh trong chế độ xem */}
                    {isReadOnly && previewUrls.length > 0 && (
                        <div>
                            <label className="block font-medium mb-1">Ảnh minh họa:</label>
                            <div className="flex gap-3 mt-3 flex-wrap">
                                {previewUrls.map((url, idx) => (
                                    <img
                                        key={idx}
                                        src={url}
                                        alt={`Review image ${idx + 1}`}
                                        className="w-20 h-20 object-cover rounded border border-gray-300"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {isReadOnly && reviewCreatedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                            Đánh giá ngày {moment(reviewCreatedAt).format('DD/MM/YYYY [lúc] HH:mm')}
                        </p>
                    )}

                    {/* Submit */}
                    <div className="flex justify-end gap-2">
                        {isReadOnly ? (
                            <>
                                {/* <Button type="button" variant="danger" onClick={handleDelete} disabled={submitting}>
                                    Xóa đánh giá
                                </Button> */}
                                <Button type="button" onClick={() => setViewMode(false)}>
                                    Sửa đánh giá
                                </Button>
                            </>
                        ) : isEditMode ? (
                            <>
                                {/* <Button type="button" variant="danger" onClick={handleDelete} disabled={submitting}>
                                    Xóa đánh giá
                                </Button> */}
                                <Button type="button" variant="secondary" onClick={() => setViewMode(true)}>
                                    Hủy
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                                </Button>
                            </>
                        ) : (
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </Button>
                        )}
                    </div>
                </form>
            )}

            {/* Modal xác nhận xóa */}
            <AdminModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                title="Xác nhận xóa"
            >
                <p className="text-gray-700 mb-4">
                    Bạn có chắc chắn muốn xóa đánh giá này không?
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setIsConfirmModalOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={confirmDeleteReview}
                        disabled={submitting}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                        {submitting ? 'Đang xóa...' : 'Xóa'}
                    </button>
                </div>
            </AdminModal>
        </div>
    );
};

export default ReviewForm;
