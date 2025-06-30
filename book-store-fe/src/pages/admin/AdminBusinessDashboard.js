import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Icon } from '@iconify/react';

const API_URL = process.env.REACT_APP_API_URL_BACKEND || 'http://localhost:9999/api';

const AdminBusinessDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalOrders: 0,
        newOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        monthRevenue: 0,
        activeDiscounts: 0,
        newReviews: 0,
        hiddenReviews: 0
    });
    const [orderStatusStats, setOrderStatusStats] = useState([]); // for pie chart
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // Get all orders
                const token = localStorage.getItem('accessToken');
                const orderRes = await axios.get(`${API_URL}/orders?limit=1000`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const orders = orderRes.data.data.orders || [];
                // console.log("Fetched Orders:", orders);
                const now = new Date();
                const thisMonth = now.getMonth();
                const thisYear = now.getFullYear();
                let total = 0, monthTotal = 0, completed = 0, pending = 0, newOrders = 0;
                const statusCount = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
                orders.forEach(o => {
                    total += o.totalAmount || 0;
                    if (o.orderStatus === 'completed') completed++;
                    if (o.orderStatus === 'pending') pending++;
                    if (o.createdAt) {
                        const d = new Date(o.createdAt);
                        if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
                            monthTotal += o.totalAmount || 0;
                            newOrders++;
                        }
                    }
                    statusCount[o.orderStatus] = (statusCount[o.orderStatus] || 0) + 1;
                });
                setStats(prev => ({
                    ...prev,
                    totalOrders: orders.length,
                    newOrders,
                    completedOrders: completed,
                    pendingOrders: pending,
                    totalRevenue: total,
                    monthRevenue: monthTotal
                }));
                setOrderStatusStats(Object.entries(statusCount).map(([status, count]) => ({ status, count })));

                // Get discounts
                const discountRes = await axios.get(`${API_URL}/discount-codes?limit=1000`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("Fetched Discounts:", discountRes.data);
                const discounts = discountRes.data.data.discounts || [];
                const activeDiscounts = discounts.filter(d => d.isActive).length;
                setStats(prev => ({ ...prev, activeDiscounts }));

                // Get reviews
                const reviewRes = await axios.get(`${API_URL}/reviews/admin/all?limit=1000`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const reviews = reviewRes.data.data.reviews || [];
                console.log("Fetched Reviews:", reviews);
                const newReviews = reviews.filter(r => {
                    const d = new Date(r.createdAt);
                    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
                }).length;
                const hiddenReviews = reviews.filter(r => r.isHidden).length;
                setStats(prev => ({ ...prev, newReviews, hiddenReviews }));
            } catch (e) {
                // handle error
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Pie chart for order status
    const PieChart = ({ data }) => {
        const total = data.reduce((sum, d) => sum + d.count, 0);
        let acc = 0;
        const colors = ['#3b82f6', '#22c55e', '#eab308', '#ef4444'];
        return (
            <svg viewBox="0 0 32 32" width={120} height={120}>
                {data.map((d, i) => {
                    const val = d.count / total * 100;
                    const start = acc;
                    acc += val;
                    const large = val > 50 ? 1 : 0;
                    const r = 16, cx = 16, cy = 16;
                    const a1 = (start / 100) * 2 * Math.PI;
                    const a2 = ((start + val) / 100) * 2 * Math.PI;
                    const x1 = cx + r * Math.sin(a1);
                    const y1 = cy - r * Math.cos(a1);
                    const x2 = cx + r * Math.sin(a2);
                    const y2 = cy - r * Math.cos(a2);
                    return (
                        <path
                            key={d.status}
                            d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`}
                            fill={colors[i % colors.length]}
                        />
                    );
                })}
            </svg>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Admin Business Dashboard</h1>
                <p className="text-gray-600 text-lg">Welcome, <span className="font-semibold">{user?.info?.fullName || user?.email}</span> <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Admin Business</span></p>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start">
                    <div className="flex items-center mb-2">
                        <Icon icon="mdi:cart" className="h-10 w-10 text-blue-500 mr-3" />
                        <div>
                            <p className="text-gray-500 text-sm">Total Orders</p>
                            <h2 className="text-2xl font-bold text-gray-800">{stats.totalOrders}</h2>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start">
                    <div className="flex items-center mb-2">
                        <Icon icon="mdi:cart-arrow-down" className="h-10 w-10 text-green-500 mr-3" />
                        <div>
                            <p className="text-gray-500 text-sm">New Orders (This Month)</p>
                            <h2 className="text-2xl font-bold text-gray-800">{stats.newOrders}</h2>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start">
                    <div className="flex items-center mb-2">
                        <Icon icon="mdi:check-circle" className="h-10 w-10 text-purple-500 mr-3" />
                        <div>
                            <p className="text-gray-500 text-sm">Completed Orders</p>
                            <h2 className="text-2xl font-bold text-gray-800">{stats.completedOrders}</h2>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start">
                    <div className="flex items-center mb-2">
                        <Icon icon="mdi:clock-outline" className="h-10 w-10 text-yellow-500 mr-3" />
                        <div>
                            <p className="text-gray-500 text-sm">Pending Orders</p>
                            <h2 className="text-2xl font-bold text-gray-800">{stats.pendingOrders}</h2>
                        </div>
                    </div>
                </div>
            </div>
            {/* Revenue & Discount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Icon icon="mdi:currency-usd" className="mr-2 text-green-500" /> Revenue</h3>
                    <div className="text-2xl font-bold text-green-700 mb-2">Total: {stats.totalRevenue.toLocaleString()}₫</div>
                    <div className="text-lg text-gray-600">This Month: <span className="font-semibold text-blue-600">{stats.monthRevenue.toLocaleString()}₫</span></div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Icon icon="mdi:ticket-percent" className="mr-2 text-pink-500" /> Active Discounts</h3>
                    <div className="text-2xl font-bold text-pink-700 mb-2">{stats.activeDiscounts}</div>
                </div>
            </div>
            {/* Pie Chart Order Status */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-10 flex flex-col items-center">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Icon icon="mdi:chart-pie" className="mr-2 text-blue-500" /> Order Status Distribution</h3>
                {orderStatusStats.length === 0 ? <div className="text-gray-400">No data</div> : (
                    <div className="flex flex-col items-center">
                        <PieChart data={orderStatusStats} />
                        <div className="flex flex-wrap gap-4 mt-4">
                            {orderStatusStats.map((d, i) => (
                                <div key={d.status} className="flex items-center gap-2 text-sm">
                                    <span className="inline-block w-3 h-3 rounded-full" style={{ background: ['#3b82f6', '#22c55e', '#eab308', '#ef4444'][i % 4] }}></span>
                                    <span className="font-semibold">{d.status}</span>
                                    <span>({d.count})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {/* Review Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Icon icon="mdi:star" className="mr-2 text-yellow-500" /> New Reviews (This Month)</h3>
                    <div className="text-2xl font-bold text-yellow-700 mb-2">{stats.newReviews}</div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Icon icon="mdi:eye-off" className="mr-2 text-gray-500" /> Hidden Reviews</h3>
                    <div className="text-2xl font-bold text-gray-700 mb-2">{stats.hiddenReviews}</div>
                </div>
            </div>
        </div>
    );
};

export default AdminBusinessDashboard;