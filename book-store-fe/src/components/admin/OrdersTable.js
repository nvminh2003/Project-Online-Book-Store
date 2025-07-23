import React from 'react';
import AdminPagination from './AdminPagination';

const OrdersTable = ({ data, pagination, loading, onPageChange }) => {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold mb-4">Đơn hàng gần đây</h3>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center space-x-4 animate-pulse">
                            <div className="w-16 h-4 bg-gray-200 rounded"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold mb-4">Đơn hàng gần đây</h3>
                <div className="text-center text-gray-500 py-8">
                    Không có đơn hàng nào
                </div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Đơn hàng gần đây</h3>
            <div className="overflow-x-auto">
                <table className="table-auto w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="whitespace-nowrap text-left py-3 px-4 font-medium text-gray-700">Mã đơn</th>
                            <th className="whitespace-nowrap text-left py-3 px-4 font-medium text-gray-700">Khách hàng</th>
                            <th className="whitespace-nowrap text-left py-3 px-4 font-medium text-gray-700">Sản phẩm</th>
                            <th className="whitespace-nowrap text-left py-3 px-4 font-medium text-gray-700">Tổng tiền</th>
                            <th className="whitespace-nowrap text-left py-3 px-4 font-medium text-gray-700">Trạng thái</th>
                            <th className="whitespace-nowrap text-left py-3 px-4 font-medium text-gray-700">Thanh toán</th>
                            <th className="whitespace-nowrap text-left py-3 px-4 font-medium text-gray-700">Ngày tạo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((order) => (
                            <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                    <div className="font-medium text-blue-600">{order.orderCode}</div>
                                </td>
                                <td className="py-3 px-4">
                                    <div>
                                        <div className="font-medium text-gray-900">{order.fullName}</div>
                                        <div className="text-sm text-gray-500">{order.phone}</div>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="text-sm text-gray-600">
                                        {order.items?.length || 0} sản phẩm
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {order.items?.slice(0, 2).map(item => item.book?.title).join(', ')}
                                        {order.items?.length > 2 && '...'}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="font-medium text-gray-900">
                                        {order.totalAmount?.toLocaleString('vi-VN')}đ
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`whitespace-nowrap px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.orderStatus)}`}>
                                        {order.orderStatus === 'completed' && 'Hoàn thành'}
                                        {order.orderStatus === 'confirmed' && 'Đã xác nhận'}
                                        {order.orderStatus === 'pending' && 'Chờ xác nhận'}
                                        {order.orderStatus === 'cancelled' && 'Đã hủy'}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`whitespace-nowrap px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                                        {order.paymentStatus === 'paid' && 'Đã thanh toán'}
                                        {order.paymentStatus === 'pending' && 'Chờ thanh toán'}
                                        {order.paymentStatus === 'failed' && 'Thất bại'}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                    {formatDate(order.createdAt)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <AdminPagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    );
};

export default OrdersTable; 