import React from 'react';

const CategorySalesChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold mb-4">Doanh thu theo danh mục</h3>
                <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold mb-4">Doanh thu theo danh mục</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                    Không có dữ liệu để hiển thị
                </div>
            </div>
        );
    }

    // Tìm giá trị lớn nhất để tính tỷ lệ
    const maxRevenue = Math.max(...data.map(item => item.totalRevenue));

    // Màu sắc cho các danh mục
    const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Doanh thu theo danh mục</h3>
            <div className="space-y-4">
                {data.map((item, index) => (
                    <div key={item.categoryId} className="flex items-center space-x-4">
                        <div className="w-32 text-sm font-medium text-gray-700 truncate">
                            {item.categoryName}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                <div
                                    className={`h-6 rounded ${colors[index % colors.length]}`}
                                    style={{
                                        width: `${(item.totalRevenue / maxRevenue) * 100}%`,
                                        minWidth: '20px'
                                    }}
                                ></div>
                                <span className="text-sm font-medium text-gray-900">
                                    {item.totalRevenue.toLocaleString('vi-VN')}đ
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {item.totalQuantity.toLocaleString('vi-VN')} sản phẩm • {item.orderCount} đơn hàng
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-blue-600">
                            {data.length}
                        </div>
                        <div className="text-sm text-gray-600">Danh mục</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-600">
                            {data.reduce((sum, item) => sum + item.totalRevenue, 0).toLocaleString('vi-VN')}đ
                        </div>
                        <div className="text-sm text-gray-600">Tổng doanh thu</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-purple-600">
                            {data.reduce((sum, item) => sum + item.totalQuantity, 0).toLocaleString('vi-VN')}
                        </div>
                        <div className="text-sm text-gray-600">Tổng sản phẩm</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategorySalesChart; 