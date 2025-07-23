import React from 'react';

const BestSellersTable = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold mb-4">Sản phẩm bán chạy</h3>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center space-x-4 animate-pulse">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold mb-4">Sản phẩm bán chạy</h3>
                <div className="text-center text-gray-500 py-8">
                    Không có dữ liệu để hiển thị
                </div>
            </div>
        );
    }

    const getRankColor = (rank) => {
        switch (rank) {
            case 1:
                return 'bg-yellow-500 text-white'; // 🥇 Vàng
            case 2:
                return 'bg-gray-400 text-white'; // 🥈 Bạc
            case 3:
                return 'bg-orange-500 text-white'; // 🥉 Đồng
            case 4:
                return 'bg-blue-500 text-white'; // Hạng 4 – Xanh dương đậm
            case 5:
                return 'bg-green-500 text-white'; // Hạng 5 – Xanh lá
            default:
                return 'bg-gray-200 text-gray-700'; // Hạng dưới – Xám nhẹ
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Sản phẩm bán chạy</h3>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">#</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Sản phẩm</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Tác giả</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-700">Số lượng bán</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-700">Doanh thu</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-700">Đơn hàng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={item.bookId} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(index + 1)}`}>
                                        {index + 1}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div>
                                        <div className="font-medium text-gray-900">{item.title}</div>
                                        <div className="text-sm text-gray-500">Giá: {item.sellingPrice?.toLocaleString('vi-VN')}đ</div>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-gray-600">
                                    {item.authors?.join(', ') || 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-right font-medium text-blue-600">
                                    {item.totalQuantity.toLocaleString('vi-VN')}
                                </td>
                                <td className="py-3 px-4 text-right font-medium text-green-600">
                                    {item.totalRevenue.toLocaleString('vi-VN')}đ
                                </td>
                                <td className="py-3 px-4 text-right text-gray-600">
                                    {item.orderCount}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BestSellersTable; 