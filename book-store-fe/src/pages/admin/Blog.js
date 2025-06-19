import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import blogService from '../../services/blogService';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import AdminTable from '../../components/admin/AdminTable';
import AdminModal from '../../components/admin/AdminModal';
import AdminSearch from '../../components/admin/AdminSearch';
import AdminPagination from '../../components/admin/AdminPagination';
import Icon from '../../components/common/Icon';
import Spinner from '../../components/common/Spinner';

const Blog = () => {
    const { user } = useAuth();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusInput, setStatusInput] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [fromDateInput, setFromDateInput] = useState('');
    const [toDateInput, setToDateInput] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        status: 'draft'
    });

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);

    useEffect(() => {
        fetchBlogs();
    }, [pagination.page, searchTerm, statusFilter, fromDate, toDate]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            setError(null);
            let params = { page: pagination.page, limit: pagination.limit };
            if (searchTerm) params.search = searchTerm;
            if (statusFilter) params.status = statusFilter;
            if (fromDate) params.from = fromDate;
            if (toDate) params.to = toDate;
            const response = await blogService.getAllBlogs(params);
            if (response.status === 'Success') {
                setBlogs(response.data.blogs);
                setPagination(response.data.pagination);
            } else {
                setError(response.message || 'Có lỗi xảy ra khi tải danh sách bài viết');
            }
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi tải danh sách bài viết');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingBlog(null);
        setFormData({
            title: '',
            content: '',
            status: 'draft'
        });
        setShowModal(true);
    };

    const handleEdit = (blog) => {
        setEditingBlog(blog);
        setFormData({
            title: blog.title,
            content: blog.content,
            status: blog.status
        });
        setShowModal(true);
    };

    const handleDeleteClick = (blog) => {
        setBlogToDelete(blog);
        setIsConfirmModalOpen(true);
    };

    const getToken = () => localStorage.getItem('accessToken') || localStorage.getItem('access_token');

    const confirmDeleteBlog = async () => {
        if (!blogToDelete) return;
        try {
            const response = await blogService.deleteBlog(blogToDelete._id);
            if (response.status === 'Success') {
                fetchBlogs();
            } else {
                setError(response.message || 'Có lỗi xảy ra khi xóa bài viết');
            }
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi xóa bài viết');
        } finally {
            setIsConfirmModalOpen(false);
            setBlogToDelete(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (editingBlog) {
                response = await blogService.updateBlog(editingBlog._id, formData);
            } else {
                response = await blogService.createBlog(formData);
            }
            if (response.status === 'Success') {
                setShowModal(false);
                fetchBlogs();
                setFormData({ title: '', content: '', status: 'draft' });
            } else {
                setError(response.message || 'Có lỗi xảy ra khi lưu bài viết');
            }
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi lưu bài viết');
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleFromDateChange = (e) => {
        const value = e.target.value;
        setFromDate(value);
        if (value && toDate) setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleToDateChange = (e) => {
        const value = e.target.value;
        setToDate(value);
        if (fromDate && value) setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setFromDate('');
        setToDate('');
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const statusOptions = [
        { value: '', label: 'Tất cả trạng thái' },
        { value: 'published', label: 'Đã xuất bản' },
        { value: 'draft', label: 'Bản nháp' }
    ];

    const filters = [
        {
            value: statusFilter,
            onChange: setStatusFilter,
            placeholder: 'Tất cả trạng thái',
            options: statusOptions
        },
        {
            value: fromDate,
            onChange: setFromDate,
            placeholder: 'Từ ngày',
            type: 'date',
            options: []
        },
        {
            value: toDate,
            onChange: setToDate,
            placeholder: 'Đến ngày',
            type: 'date',
            options: []
        }
    ];

    const columns = [
        {
            key: 'title',
            label: 'Tiêu đề',
            className: 'text-left px-6',
            render: (blog) => (
                <span className="font-medium text-gray-900 truncate">{blog?.title || 'No Title'}</span>
            )
        },
        {
            key: 'author',
            label: 'Tác giả',
            className: 'text-left px-6',
            render: (blog) => (
                <span className="text-gray-700">{blog?.author?.info?.fullName || blog?.author?.email || 'Unknown Author'}</span>
            )
        },
        {
            key: 'status',
            label: 'Trạng thái',
            className: 'text-center px-4',
            render: (blog) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${blog?.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {blog?.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
            )
        },
        {
            key: 'viewCount',
            label: 'Lượt xem',
            className: 'text-center px-4',
            render: (blog) => <span className="text-gray-600">{blog?.viewCount || 0}</span>
        },
        {
            key: 'createdAt',
            label: 'Ngày tạo',
            className: 'text-center px-4',
            render: (blog) => (
                <span className="text-gray-600">
                    {blog?.createdAt ? new Date(blog.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Thao tác',
            className: 'text-center px-4',
            render: (blog) => (
                <div className="flex items-center justify-center space-x-2">
                    <button
                        onClick={() => handleEdit(blog)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Chỉnh sửa"
                    >
                        <Icon icon="fluent:edit-20-filled" width="20" height="20" />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(blog)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Xóa"
                    >
                        <Icon icon="fluent:delete-20-filled" width="20" height="20" />
                    </button>
                </div>
            )
        }
    ];

    const fromResult = blogs.length > 0 ? ((pagination.page - 1) * pagination.limit + 1) : 0;
    const toResult = blogs.length > 0 ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

    if (loading) {
        return (
            <AdminPageLayout>
                <div className="text-center py-12">
                    <Spinner />
                    <p className="text-gray-500 mt-4">Đang tải danh sách bài viết...</p>
                </div>
            </AdminPageLayout>
        );
    }

    return (
        <AdminPageLayout
            title="Quản lý Blog"
            actions={
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    <Icon icon="mdi:plus" width="20" />
                    Tạo bài viết mới
                </button>
            }
        >
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                    <div className="md:col-span-4">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Tìm kiếm theo tiêu đề"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="md:col-span-8 flex gap-4">
                        <select
                            value={statusFilter}
                            onChange={handleStatusChange}
                            className="flex-1 h-[40px] px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="published">Đã xuất bản</option>
                            <option value="draft">Bản nháp</option>
                        </select>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={handleFromDateChange}
                            className="flex-1 h-[40px] px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                            placeholder="Từ ngày"
                        />
                        <input
                            type="date"
                            value={toDate}
                            onChange={handleToDateChange}
                            className="flex-1 h-[40px] px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                            placeholder="Đến ngày"
                        />
                        {(searchTerm || statusFilter || fromDate || toDate) && (
                            <button
                                onClick={handleClearFilters}
                                className="h-[40px] px-4 rounded-lg text-white font-medium bg-gray-600 hover:bg-gray-700"
                                type="button"
                            >
                                Xóa
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white">
                    <AdminTable
                        data={blogs}
                        columns={columns}
                        loading={loading}
                        emptyMessage="Không có bài viết nào"
                    />
                </div>

                <AdminPagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                    onPageChange={page => setPagination(prev => ({ ...prev, page }))}
                />

                <AdminModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={editingBlog ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tiêu đề *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nội dung *
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                rows={10}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Trạng thái
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="draft">Bản nháp</option>
                                <option value="published">Xuất bản</option>
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                {editingBlog ? 'Cập nhật' : 'Tạo'}
                            </button>
                        </div>
                    </form>
                </AdminModal>

                <AdminModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => {
                        setIsConfirmModalOpen(false);
                        setBlogToDelete(null);
                    }}
                    title="Xác nhận xóa"
                >
                    <p className="text-gray-700 mb-4">
                        Bạn có chắc chắn muốn xóa bài viết{' '}
                        <span className="font-semibold">{blogToDelete?.title}</span> không?
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsConfirmModalOpen(false);
                                setBlogToDelete(null);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={confirmDeleteBlog}
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

export default Blog;