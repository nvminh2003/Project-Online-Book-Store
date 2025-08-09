// pages/Review.jsx
import React, { useEffect, useState } from 'react';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import AdminSearch from '../../components/admin/AdminSearch';
import AdminTable from '../../components/admin/AdminTable';
import AdminPagination from '../../components/admin/AdminPagination';
import AdminModal from '../../components/admin/AdminModal';
import Icon from '../../components/common/Icon';
import reviewService from '../../services/reviewService';
import { notifyError, notifySuccess } from '../../components/common/ToastManager';

const Review = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [keyword, setKeyword] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    // Thêm state cho xác nhận ẩn/hiện
    const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
    const [reviewToToggle, setReviewToToggle] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        rating: '',
        bookId: '',
        userId: ''
    });

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 10,
                keyword,
                ...filters
            };
            const res = await reviewService.getAllReviews(currentPage, 10, params);
            setReviews(res.data.reviews);
            setTotalPages(res.data.pagination.totalPages);
            setTotalItems(res.data.pagination.total);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            notifyError('Không thể tải danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [currentPage, filters]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setCurrentPage(1);
    };

    // Hàm xác nhận toggle
    const handleToggleVisibility = async () => {
        if (!reviewToToggle) return;
        try {
            await reviewService.toggleReviewVisibility(reviewToToggle._id);
            notifySuccess('Cập nhật trạng thái đánh giá thành công');
            fetchReviews();
        } catch (error) {
            console.error('Failed to toggle review visibility:', error);
            notifyError('Không thể cập nhật trạng thái đánh giá');
        } finally {
            setIsToggleModalOpen(false);
            setReviewToToggle(null);
        }
    };

    const confirmDeleteReview = async () => {
        if (!reviewToDelete) return;
        try {
            await reviewService.deleteReview(reviewToDelete._id);
            notifySuccess('Xóa đánh giá thành công');
            fetchReviews();
        } catch (error) {
            console.error('Failed to delete review:', error);
            notifyError('Không thể xóa đánh giá');
        } finally {
            setIsConfirmModalOpen(false);
            setReviewToDelete(null);
        }
    };

    const columns = [
        {
            label: 'Sách',
            key: 'bookTitle',
            render: (item) => <span>{item.book?.title || 'N/A'}</span>
        },
        {
            label: 'Người đánh giá',
            key: 'userName',
            render: (item) => <span>{item.user?.info?.fullName || item.user?.email}</span>
        },
        {
            label: 'Sao',
            key: 'rating',
            render: (item) => <span className="text-yellow-500">{'★'.repeat(item.rating)}</span>
        },
        {
            label: 'Nội dung',
            key: 'comment',
            render: (item) => <span className="line-clamp-2 max-w-[250px]">{item.comment}</span>
        },
        {
            label: 'Ảnh',
            key: 'images',
            render: (item) => item.images?.length > 0 ? <span>{item.images.length} ảnh</span> : '-'
        },
        {
            label: 'Trạng thái',
            key: 'isHidden',
            render: (item) => item.isHidden ? <span className="text-red-500">Đã ẩn</span> : <span className="text-green-600">Hiển thị</span>
        },
        {
            label: 'Thao tác',
            key: 'actions',
            render: (item) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setReviewToToggle(item);
                            setIsToggleModalOpen(true);
                        }}
                        className={`px-3 py-1 text-sm text-white rounded hover:opacity-90 ${item.isHidden ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                    >
                        {item.isHidden ? 'Hiện' : 'Ẩn'}
                    </button>
                    {/* <button
                        onClick={() => {
                            setReviewToDelete(item);
                            setIsConfirmModalOpen(true);
                        }}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Xóa
                    </button> */}
                </div>
            )
        }
    ];

    return (
        <AdminPageLayout title="Quản lý đánh giá">
            <div className="p-6">
                <AdminSearch
                    placeholder="Tìm kiếm theo nội dung"
                    value={keyword}
                    onChange={setKeyword}
                    onSearch={() => fetchReviews()}
                    filters={[
                        {
                            placeholder: 'Tất cả trạng thái',
                            value: filters.status,
                            onChange: (v) => handleFilterChange('status', v),
                            options: [
                                { label: 'Hiển thị', value: 'visible' },
                                { label: 'Đã ẩn', value: 'hidden' }
                            ]
                        },
                        {
                            placeholder: 'Tất cả sao',
                            value: filters.rating,
                            onChange: (v) => handleFilterChange('rating', v),
                            options: [
                                ...([1, 2, 3, 4, 5].map(s => ({ label: `${s} sao`, value: s })))
                            ]
                        }
                    ]}
                />

                <AdminTable
                    columns={columns}
                    data={reviews}
                    loading={loading}
                />

                <AdminPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={10}
                    onPageChange={setCurrentPage}
                />

                {/* Xác nhận ẩn/hiện review */}
                <AdminModal
                    isOpen={isToggleModalOpen}
                    onClose={() => {
                        setIsToggleModalOpen(false);
                        setReviewToToggle(null);
                    }}
                    title={`Xác nhận ${reviewToToggle?.isHidden ? 'hiện' : 'ẩn'} đánh giá`}
                >
                    <p className="text-gray-700 mb-4">
                        Bạn có chắc chắn muốn {reviewToToggle?.isHidden ? 'hiện' : 'ẩn'} đánh giá này của người dùng
                        <span className="font-semibold"> {reviewToToggle?.user?.info?.fullName || reviewToToggle?.user?.email}</span> không?
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsToggleModalOpen(false);
                                setReviewToToggle(null);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleToggleVisibility}
                            className={`px-4 py-2 ${reviewToToggle?.isHidden ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-md`}
                        >
                            {reviewToToggle?.isHidden ? 'Hiện' : 'Ẩn'}
                        </button>
                    </div>
                </AdminModal>

                {/* Xác nhận xóa review */}
                <AdminModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => {
                        setIsConfirmModalOpen(false);
                        setReviewToDelete(null);
                    }}
                    title="Xác nhận xóa đánh giá"
                >
                    <p className="text-gray-700 mb-4">
                        Bạn có chắc chắn muốn xóa đánh giá này của người dùng
                        <span className="font-semibold"> {reviewToDelete?.user?.info?.fullName || reviewToDelete?.user?.email}</span> không?
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsConfirmModalOpen(false);
                                setReviewToDelete(null);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={confirmDeleteReview}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Xóa
                        </button>
                    </div>
                </AdminModal>
            </div>
        </AdminPageLayout>
    );
};

export default Review;