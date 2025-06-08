import React, { useState } from 'react';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import AdminTable from '../../components/admin/AdminTable';
import AdminSearch from '../../components/admin/AdminSearch';
import AdminPagination from '../../components/admin/AdminPagination';
import AdminModal from '../../components/admin/AdminModal';
import AdminForm from '../../components/admin/AdminForm';
import { Icon } from '@iconify/react';

const Books = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formValues, setFormValues] = useState({});
    const [formErrors, setFormErrors] = useState({});

    const handleAddBook = () => {
        setFormValues({});
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleEditBook = (bookId) => {
        const book = books.find(b => b.id === bookId);
        if (book) {
            setFormValues(book);
            setFormErrors({});
            setIsModalOpen(true);
        }
    };

    const handleDeleteBook = (bookId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sách này?')) {
            // TODO: Implement delete book functionality
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement form submission
        setIsModalOpen(false);
    };

    const columns = [
        { key: 'title', label: 'Tên sách' },
        { key: 'author', label: 'Tác giả' },
        { key: 'category', label: 'Danh mục' },
        { key: 'price', label: 'Giá' },
        { key: 'status', label: 'Trạng thái' }
    ];

    const formFields = [
        { name: 'title', label: 'Tên sách', required: true },
        { name: 'author', label: 'Tác giả', required: true },
        { name: 'category', label: 'Danh mục', type: 'select', required: true },
        { name: 'price', label: 'Giá', type: 'number', required: true },
        { name: 'description', label: 'Mô tả', type: 'textarea' }
    ];

    const filters = [
        {
            value: selectedCategory,
            onChange: setSelectedCategory,
            placeholder: 'Tất cả danh mục',
            options: [
                { value: '', label: 'Tất cả danh mục' },
                { value: 'fiction', label: 'Tiểu thuyết' },
                { value: 'non-fiction', label: 'Phi hư cấu' },
                { value: 'children', label: 'Sách thiếu nhi' }
            ]
        }
    ];

    return (
        <AdminPageLayout
            title="Quản lý sách"
            actions={
                <button
                    onClick={handleAddBook}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    <Icon icon="mdi:plus" width="20" />
                    Thêm sách mới
                </button>
            }
        >
            <div className="p-6">
                <AdminSearch
                    value={searchQuery}
                    onChange={setSearchQuery}
                    filters={filters}
                    placeholder="Tìm kiếm sách..."
                />

                <AdminTable
                    columns={columns}
                    data={books}
                    loading={loading}
                    onEdit={handleEditBook}
                    onDelete={handleDeleteBook}
                    emptyMessage="Chưa có sách nào"
                />

                <AdminPagination
                    currentPage={currentPage}
                    totalPages={10}
                    totalItems={100}
                    itemsPerPage={10}
                    onPageChange={setCurrentPage}
                />

                <AdminModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={formValues.id ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
                    size="lg"
                    footer={
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleFormSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                {formValues.id ? 'Cập nhật' : 'Thêm mới'}
                            </button>
                        </div>
                    }
                >
                    <AdminForm
                        fields={formFields}
                        values={formValues}
                        onChange={handleFormChange}
                        errors={formErrors}
                    />
                </AdminModal>
            </div>
        </AdminPageLayout>
    );
};

export default Books; 