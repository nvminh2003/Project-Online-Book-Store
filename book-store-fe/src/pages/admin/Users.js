import React, { useState } from 'react';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import { Icon } from '@iconify/react';

const Users = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleAddDiscount = () => {
        // TODO: Implement add discount functionality
    };

    const handleEditDiscount = (discountId) => {
        // TODO: Implement edit discount functionality
    };

    const handleDeleteDiscount = (discountId) => {
        // TODO: Implement delete discount functionality
    };

    return (
        <AdminPageLayout
            title="Quản lý người dùng"
            actions={
                <button
                    onClick={handleAddDiscount}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    <Icon icon="mdi:plus" width="20" />
                    Thêm người dùng
                </button>
            }
        >
            <div className="p-6">
                {/* Search and Filter */}
                <div className="mb-6 flex gap-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm người dùng..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <select className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300">
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Đang diễn ra</option>
                        <option value="upcoming">Sắp diễn ra</option>
                        <option value="ended">Đã kết thúc</option>
                    </select>
                </div>

                {/* Discounts Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tên người dùng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Phone
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Địa chỉ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Giới tính
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
                            {discounts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        Chưa có người dùng nào
                                    </td>
                                </tr>
                            ) : (
                                discounts.map((discount) => (
                                    <tr key={discount.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {discount.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {discount.type === 'percentage' ? 'Phần trăm' : 'Số tiền cố định'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {discount.type === 'percentage'
                                                ? `${discount.value}%`
                                                : `${discount.value.toLocaleString('vi-VN')}đ`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(discount.startDate).toLocaleDateString('vi-VN')} - {new Date(discount.endDate).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${discount.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : discount.status === 'upcoming'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {discount.status === 'active'
                                                    ? 'Đang diễn ra'
                                                    : discount.status === 'upcoming'
                                                        ? 'Sắp diễn ra'
                                                        : 'Đã kết thúc'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEditDiscount(discount.id)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                <Icon icon="mdi:pencil" width="20" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDiscount(discount.id)}
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

export default Users; 