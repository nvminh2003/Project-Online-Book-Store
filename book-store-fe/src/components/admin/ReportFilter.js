import React from 'react';

const ReportFilter = ({ filters, onFilterChange, onApplyFilter }) => {
    const handleDateChange = (field, value) => {
        onFilterChange({ ...filters, [field]: value });
    };

    const handleStatusChange = (field, value) => {
        onFilterChange({ ...filters, [field]: value });
    };

    const handleApply = () => {
        onApplyFilter(filters);
    };

    const handleReset = () => {
        const resetFilters = {
            from: '',
            to: '',
            orderStatus: '',
            paymentStatus: '',
            groupBy: 'day'
        };
        onFilterChange(resetFilters);
        onApplyFilter(resetFilters);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Bộ lọc báo cáo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Từ ngày
                    </label>
                    <input
                        type="date"
                        value={filters.from}
                        onChange={(e) => handleDateChange('from', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Đến ngày
                    </label>
                    <input
                        type="date"
                        value={filters.to}
                        onChange={(e) => handleDateChange('to', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Order Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trạng thái đơn hàng
                    </label>
                    <select
                        value={filters.orderStatus}
                        onChange={(e) => handleStatusChange('orderStatus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tất cả</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="pending">Chờ xác nhận</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>

                {/* Payment Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trạng thái thanh toán
                    </label>
                    <select
                        value={filters.paymentStatus}
                        onChange={(e) => handleStatusChange('paymentStatus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tất cả</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="pending">Chờ thanh toán</option>
                        <option value="failed">Thanh toán thất bại</option>
                    </select>
                </div>
            </div>

            {/* Group By for Chart */}
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhóm theo
                </label>
                <select
                    value={filters.groupBy}
                    onChange={(e) => handleStatusChange('groupBy', e.target.value)}
                    className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="day">Theo ngày</option>
                    <option value="month">Theo tháng</option>
                    <option value="year">Theo năm</option>
                </select>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
                <button
                    onClick={handleApply}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Áp dụng
                </button>
                <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                    Đặt lại
                </button>
            </div>
        </div>
    );
};

export default ReportFilter; 