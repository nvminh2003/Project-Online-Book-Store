import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    CartesianGrid
} from 'recharts';

const SalesChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold mb-4">Biểu đồ doanh thu</h3>
                <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold mb-4">Biểu đồ doanh thu</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                    Không có dữ liệu để hiển thị
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Biểu đồ doanh thu</h3>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
                    barGap={8}
                    barCategoryGap="15%"
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />

                    {/* Trục Y chính (Doanh thu) */}
                    <YAxis
                        yAxisId="left"
                        tickFormatter={(value) => value >= 1000 ? (value / 1000) + 'k' : value}
                    />

                    {/* Trục Y phụ (Đơn hàng) */}
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        tickCount={5}
                        allowDecimals={false}
                    />

                    <Tooltip
                        formatter={(value, name) => {
                            if (name === "Doanh thu") return [`${value.toLocaleString('vi-VN')}đ`, name];
                            return [value, name];
                        }}
                    />
                    <Legend />

                    {/* Cột Doanh thu */}
                    <Bar
                        dataKey="revenue"
                        name="Doanh thu"
                        fill="#3b82f6"
                        radius={[6, 6, 0, 0]}
                        yAxisId="left"
                    />

                    {/* Cột Đơn hàng */}
                    <Bar
                        dataKey="orders"
                        name="Đơn hàng"
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                        yAxisId="right"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SalesChart;
