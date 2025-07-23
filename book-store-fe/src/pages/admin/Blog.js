import React, { useState, useEffect } from 'react';
import moment from 'moment';
import blogService from '../../services/blogService';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import AdminSearch from '../../components/admin/AdminSearch';
import AdminTable from '../../components/admin/AdminTable';
import AdminPagination from '../../components/admin/AdminPagination';
import AdminModal from '../../components/admin/AdminModal';
import Icon from '../../components/common/Icon';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';


const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [blogToDelete, setBlogToDelete] = useState(null);

    const columns = [
        {
            key: 'createdAt',
            label: 'Ngày tạo',
            width: '200px',
            render: (item) => (
                <div className="whitespace-nowrap">
                    {moment(item.createdAt).format('DD/MM/YYYY HH:mm')}
                </div>
            )
        },
        {
            key: 'title',
            label: 'Tiêu đề',
            width: '350px',
            render: (item) => (
                <div
                    className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
                    title={item.title}
                >
                    {item.title.length > 200 ? item.title.slice(0, 200) + '...' : item.title}
                </div>
            )
        },
        {
            key: 'author',
            label: 'Người tạo',
            render: (item) => (
                <div className="whitespace-normal break-words max-w-xs">
                    {item.author?.info?.fullName || 'Ẩn danh'}
                </div>
            )
        },
        {
            key: 'viewCount',
            label: 'Lượt xem',
            render: (item) => <div>{item.viewCount}</div>
        },
        {
            key: 'actions',
            label: 'Thao tác',
            render: (item) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleEditBlog(item)}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        <Icon icon="fluent:edit-20-filled" width="20" height="20" />
                    </button>
                    <button
                        onClick={() => handleDeleteBlog(item)}
                        className="text-red-600 hover:text-red-800"
                    >
                        <Icon icon="fluent:delete-20-filled" width="20" height="20" />
                    </button>
                </div>
            )
        }
    ];

    const handleDeleteBlog = (blog) => {
        setBlogToDelete(blog);
        setIsConfirmModalOpen(true);
    };

    const confirmDeleteBlog = async () => {
        if (!blogToDelete) return;
        try {
            await blogService.deleteBlog(blogToDelete._id);
            setIsConfirmModalOpen(false);
            setBlogToDelete(null);
            loadBlogs();
        } catch (err) {
            setError(err.message || 'Xóa blog thất bại');
        }
    };


    const handleEditBlog = (blog) => {
        setEditingBlog(blog);
        setFormData({
            title: blog.title,
            content: blog.content
        });
        setShowModal(true);
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
                loadBlogs();
                setFormData({ title: '', content: '' });
            } else {
                setError(response.message || 'Có lỗi xảy ra khi lưu bài viết');
            }
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi lưu bài viết');
        }
    };

    const loadBlogs = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page: currentPage,
                limit: 10,
                sort: '-createdAt',
                ...(searchTerm && { searchTerm }),
                ...(fromDate && toDate && { from: fromDate, to: toDate })
            };

            const res = await blogService.getAllBlogs(params);
            // console.log("API response:", res);

            setBlogs(Array.isArray(res.data?.blogs) ? res.data.blogs : []);
            setTotalPages(res.data?.pagination?.totalPages || 1);
            setTotalItems(res.data?.pagination?.total || 0);
        } catch (err) {
            // Handle backend validation errors
            if (err.message) {
                setError(err.message);
            } else {
                setError(typeof err === 'string' ? err : 'Đã có lỗi xảy ra');
            }
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadBlogs();
    }, [currentPage]);

    useEffect(() => {
        setCurrentPage(1);
        loadBlogs();
    }, [searchTerm, fromDate, toDate]);

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFromDate('');
        setToDate('');
        setCurrentPage(1);
        loadBlogs();
    };

    return (
        <AdminPageLayout title="Quản lý Blog"
            actions={
                <button
                    onClick={() => {
                        setEditingBlog(null);
                        setFormData({ title: '', content: '' });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Thêm bài viết
                </button>
            }
        >

            <div className="p-6">
                {/* Tìm kiếm và lọc */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                    <div className="md:col-span-4">
                        <AdminSearch
                            placeholder="Tìm kiếm tiêu đề, nội dung..."
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onSearch={handleSearch}
                        />
                    </div>
                    <div className="md:col-span-8">
                        <div className="flex gap-4">
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            {(searchTerm || fromDate || toDate) && (
                                <button
                                    onClick={handleClearFilters}
                                    className="px-4 py-2 rounded-lg text-white bg-gray-600 hover:bg-gray-700"
                                >
                                    Xóa
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Thông báo lỗi */}
                {error && (
                    <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Bảng danh sách */}
                <AdminTable
                    columns={columns}
                    data={blogs}
                    loading={loading}
                />

                {/* Phân trang */}
                <AdminPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={10}
                    onPageChange={(page) => setCurrentPage(page)}
                />
                <AdminModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={editingBlog ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                    size="xl"
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
                            <SunEditor
                                setContents={formData.content}
                                onChange={value => setFormData(prev => ({ ...prev, content: value }))}
                                setOptions={{
                                    height: 200,
                                    buttonList: [
                                        ['undo', 'redo', 'formatBlock', 'font', 'fontSize', 'bold', 'underline', 'italic', 'strike', 'fontColor', 'hiliteColor', 'align', 'list', 'table', 'link', 'image', 'video', 'fullScreen', 'codeView']
                                    ]
                                }}
                            />
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
