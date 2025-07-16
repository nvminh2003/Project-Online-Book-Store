import React from 'react';

const ReportCards = ({ overview, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!overview) return null;

    const cards = [
        {
            title: 'Tổng doanh thu',
            value: `${overview.totalRevenue.toLocaleString('vi-VN')}đ`,
            icon: '💰',
            color: 'bg-green-500',
            textColor: 'text-green-600'
        },
        {
            title: 'Tổng đơn hàng',
            value: overview.totalOrders.toLocaleString('vi-VN'),
            icon: '📦',
            color: 'bg-blue-500',
            textColor: 'text-blue-600'
        },
        {
            title: 'Sản phẩm đã bán',
            value: overview.totalProductsSold.toLocaleString('vi-VN'),
            icon: '📚',
            color: 'bg-purple-500',
            textColor: 'text-purple-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {cards.map((card, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                            <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-full ${card.color} flex items-center justify-center text-white text-xl`}>
                            {card.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReportCards; 