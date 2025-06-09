import React, { useState } from 'react';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import { Icon } from '@iconify/react';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleAddCategory = () => {
        // TODO: Implement add category functionality
    };

    const handleEditCategory = (categoryId) => {
        // TODO: Implement edit category functionality
    };

    const handleDeleteCategory = (categoryId) => {
        // TODO: Implement delete category functionality
    };

    return (
        <AdminPageLayout
            title="Quản lý danh mục"
            actions={
                <button
                    onClick={handleAddCategory}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    <Icon icon="mdi:plus" width="20" />
                    Thêm danh mục mới
                </button>
            }
        >
            <div className="p-6">
                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Tìm kiếm danh mục..."
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>

                {/* Categories Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tên danh mục
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mô tả
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Số lượng sách
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        Chưa có danh mục nào
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr key={category.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {category.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500">
                                                {category.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {category.bookCount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${category.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {category.status === 'active' ? 'Đang hoạt động' : 'Đã ẩn'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEditCategory(category.id)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                <Icon icon="mdi:pencil" width="20" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(category.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Icon icon="mdi:delete" width="20" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                        Hiển thị <span className="font-medium">1</span> đến{' '}
                        <span className="font-medium">10</span> của{' '}
                        <span className="font-medium">20</span> kết quả
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                            Trước
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                            Sau
                        </button>
                    </div>
                </div>
            </div>
        </AdminPageLayout>
    );
};

export default Categories; 