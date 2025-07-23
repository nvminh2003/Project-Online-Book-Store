import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '@iconify/react';
import orderService from '../../services/orderService';
import bookService from '../../services/bookService';
import reviewService from '../../services/reviewService';
import saleReportService from '../../services/saleReportService';

const AdminBusinessDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalOrders: 0,
        newOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        completionRate: 0,
        totalCustomers: 0,
        lowStockProducts: 0,
        newReviews: 0,
        hiddenReviews: 0,
        avgRating: 0,
    });
    const [orderStatusStats, setOrderStatusStats] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);
    const [lowStockList, setLowStockList] = useState([]);
    const [topReviewedProducts, setTopReviewedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelWarning, setCancelWarning] = useState(false);
    const [lowStockWarning, setLowStockWarning] = useState(false);
    const statusIcons = {
        pending: "mdi:clock-outline",
        confirmed: "mdi:check-circle-outline",
        delivering: "mdi:truck-delivery-outline",
        delivered: "mdi:check-bold",
        cancelled: "mdi:cancel",
        returned: "mdi:backup-restore",
    };

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            try {
                // 1. Đơn hàng
                const orderRes = await orderService.getAllOrders({ limit: 1000 });
                const orders = orderRes.data.orders || [];
                const now = new Date();
                const thisMonth = now.getMonth();
                const thisYear = now.getFullYear();
                let completed = 0, cancelled = 0, newOrders = 0;
                const statusCount = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
                orders.forEach(o => {
                    if (o.orderStatus === 'completed') completed++;
                    if (o.orderStatus === 'cancelled') cancelled++;
                    if (o.createdAt) {
                        const d = new Date(o.createdAt);
                        if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
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
                    cancelledOrders: cancelled,
                    completionRate: orders.length ? Math.round((completed / orders.length) * 100) : 0,
                }));
                setOrderStatusStats(Object.entries(statusCount).map(([status, count]) => ({ status, count })));
                setCancelWarning(orders.length > 0 && cancelled / orders.length > 0.1);

                // 2. Khách hàng
                const userRes = await saleReportService.getAllCustomer({ role: 'customer', limit: 1000 });
                const customers = userRes.data || [];
                // console.log("Customer: ", customers);
                setStats(prev => ({ ...prev, totalCustomers: customers.length }));
                // Top khách hàng mua nhiều nhất (nếu có API riêng thì dùng, tạm thời lấy random)
                const topCustRes = await saleReportService.getTopCustomers({ limit: 5 });
                // console.log(" topCustRes:", topCustRes);
                setTopCustomers(topCustRes.data || []);

                // 3. Sản phẩm
                const bookRes = await bookService.getAllBooks(1, 1000);
                // console.log(" Đang gọi book...", bookRes);
                const products = bookRes.data.books || [];
                const lowStock = products.filter(p => p.stockQuantity !== undefined && p.stockQuantity <= 10);
                setStats(prev => ({ ...prev, lowStockProducts: lowStock.length }));
                setLowStockList(lowStock);
                setLowStockWarning(lowStock.length > 0);
                // Top sản phẩm bán chạy
                const bestSellerRes = await saleReportService.getBestSellers({ limit: 5 });
                setTopProducts(bestSellerRes.data || []);

                // 4. Đánh giá
                const reviewRes = await reviewService.getAllReviews(1, 1000);
                const reviews = reviewRes.data.reviews || [];
                const newReviews = reviews.filter(r => {
                    const d = new Date(r.createdAt);
                    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
                }).length;
                const hiddenReviews = reviews.filter(r => r.isHidden).length;
                const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(2) : 0;
                setStats(prev => ({ ...prev, newReviews, hiddenReviews, avgRating }));
                // Top sản phẩm được đánh giá nhiều nhất
                const reviewCountByBook = {};
                reviews.forEach(r => {
                    const bookId = r.book?._id?.toString();
                    if (!bookId) return;
                    if (!reviewCountByBook[bookId]) reviewCountByBook[bookId] = 0;
                    reviewCountByBook[bookId]++;
                });

                const topReviewed = Object.entries(reviewCountByBook)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([bookId, count]) => {
                        const book = products.find(b => b._id === bookId);
                        return { book, count };
                    });
                setTopReviewedProducts(topReviewed);
            } catch (e) {
                // handle error
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    // Pie chart for order status
    const PieChart = ({ data }) => {
        const total = data.reduce((sum, d) => sum + d.count, 0);
        let acc = 0;
        const colors = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a21caf', '#f472b6'];

        return (
            <svg viewBox="0 0 32 32" width={180} height={180} className="md:mr-6">
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
                            key={d.status || i}
                            d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`}
                            fill={colors[i % colors.length]}
                        />
                    );
                })}
            </svg>
        );
    };

    // Bar chart for top products
    const BarChart = ({ data, type = "quantity" }) => {
        const getValue = (item) => {
            switch (type) {
                case "revenue":
                    return item.totalRevenue || 0;
                case "order":
                    return item.orderCount || 0;
                case "quantity":
                default:
                    return item.totalQuantity || item.count || 0;
            }
        };

        const max = Math.max(...data.map(getValue), 1);
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7']; // xanh, xanh lá, vàng, đỏ, tím

        return (
            <div style={{ width: 450 }}>
                {data.map((p, i) => (
                    <div key={p._id || i} className="flex items-center mb-3">
                        <span className="w-48 truncate text-sm">{p.title || p.book?.title || 'N/A'}</span>
                        <div className="flex-1 mx-2 bg-gray-200 rounded h-4 relative">
                            <div
                                className="bg-blue-500 h-4 rounded"
                                style={{
                                    width: `${(getValue(p) / max) * 100}%`,
                                    backgroundColor: colors[i % colors.length]
                                }}
                            ></div>
                        </div>
                        <span className="w-10 text-right text-sm">{getValue(p)}</span>
                    </div>
                ))}
            </div>
        );
    };


    return (
        <div className="p-6 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Admin Business Dashboard</h1>
                <p className="text-gray-600 text-lg">Welcome, <span className="font-semibold">{user?.info?.fullName || user?.email}</span> <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Admin Business</span></p>
            </div>
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start">
                    <div className="flex items-center mb-2">
                        <Icon icon="mdi:cart" className="h-10 w-10 text-blue-500 mr-3" />
                        <div>
                            <p className="text-gray-500 text-sm">Tổng đơn hàng</p>
                            <h2 className="text-2xl font-bold text-gray-800">{stats.totalOrders}</h2>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start">
                    <div className="flex items-center mb-2">
                        <Icon icon="mdi:cart-arrow-down" className="h-10 w-10 text-green-500 mr-3" />
                        <div>
                            <p className="text-gray-500 text-sm">Đơn mới (tháng này)</p>
                            <h2 className="text-2xl font-bold text-gray-800">{stats.newOrders}</h2>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start">
                    <div className="flex items-center mb-2">
                        <Icon icon="mdi:check-circle" className="h-10 w-10 text-purple-500 mr-3" />
                        <div>
                            <p className="text-gray-500 text-sm">Đơn hoàn thành</p>
                            <h2 className="text-2xl font-bold text-gray-800">{stats.completedOrders}</h2>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start">
                    <div className="flex items-center mb-2">
                        <Icon icon="mdi:close-circle" className="h-10 w-10 text-red-500 mr-3" />
                        <div>
                            <p className="text-gray-500 text-sm">Đơn bị hủy</p>
                            <h2 className="text-2xl font-bold text-gray-800">{stats.cancelledOrders}</h2>
                        </div>
                    </div>
                    {cancelWarning && <div className="text-xs text-red-600 mt-2">Cảnh báo: Tỉ lệ đơn bị hủy cao!</div>}
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start">
                    <div className="flex items-center mb-2">
                        <Icon icon="mdi:account-group" className="h-10 w-10 text-yellow-500 mr-3" />
                        <div>
                            <p className="text-gray-500 text-sm">Tổng khách hàng</p>
                            <h2 className="text-2xl font-bold text-gray-800">{stats.totalCustomers}</h2>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start">
                    <div className="flex items-center mb-2">
                        <Icon icon="mdi:alert" className="h-10 w-10 text-orange-500 mr-3" />
                        <div>
                            <p className="text-gray-500 text-sm">Sản phẩm tồn kho thấp</p>
                            <h2 className="text-2xl font-bold text-gray-800">{stats.lowStockProducts}</h2>
                        </div>
                    </div>
                    {lowStockWarning && <div className="text-xs text-orange-600 mt-2">Cảnh báo: Có sản phẩm sắp hết hàng!</div>}
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start">
                    <div className="flex items-center mb-2">
                        <Icon icon="mdi:star" className="h-10 w-10 text-yellow-500 mr-3" />
                        <div>
                            <p className="text-gray-500 text-sm">Đánh giá mới (tháng này)</p>
                            <h2 className="text-2xl font-bold text-gray-800">{stats.newReviews}</h2>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start">
                    <div className="flex items-center mb-2">
                        <Icon icon="mdi:percent" className="h-10 w-10 text-blue-500 mr-3" />
                        <div>
                            <p className="text-gray-500 text-sm">Tỉ lệ hoàn thành</p>
                            <h2 className="text-2xl font-bold text-gray-800">{stats.completionRate}%</h2>
                        </div>
                    </div>
                </div>
            </div>
            {/* Pie chart order status */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                    <span className="bg-blue-100 p-2 rounded-full mr-3">
                        <Icon icon="mdi:chart-pie" className="mr-2 text-blue-500" />
                    </span>
                    Thống kê trạng thái đơn hàng
                </h3>

                {orderStatusStats.length === 0 ? (
                    <div className="text-gray-400 text-center">Không có dữ liệu</div>
                ) : (
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        <PieChart data={orderStatusStats} />

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {orderStatusStats.map((d, i) => {
                                const total = orderStatusStats.reduce((sum, r) => sum + r.count, 0);
                                const percentage = ((d.count / total) * 100).toFixed(1);

                                const bgColors = [
                                    'bg-blue-100 text-blue-600',
                                    'bg-green-100 text-green-600',
                                    'bg-yellow-100 text-yellow-600',
                                    'bg-red-100 text-red-600',
                                    'bg-pink-100 text-pink-600',
                                    'bg-purple-100 text-purple-600'
                                ];

                                return (
                                    <div key={d.status} className="flex items-center p-3 border rounded-md">
                                        <div className={`w-10 h-10 flex items-center justify-center rounded-full mr-3 ${bgColors[i % bgColors.length]}`}>
                                            <Icon icon={statusIcons[d.status] || "mdi:clipboard-list-outline"} className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 capitalize">{d.status}</p>
                                            <p className="text-xs text-gray-500">{d.count} đơn hàng ({percentage}%)</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Section: Bar chart + Top customers */}
            <div className="flex flex-col md:flex-row gap-6 mb-10">
                {/* Bar chart top sản phẩm bán chạy */}
                <div className="bg-white rounded-xl shadow-lg p-6 flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <Icon icon="mdi:chart-bar" className="mr-2 text-green-500" />
                        Top 5 sản phẩm bán chạy
                    </h3>
                    {topProducts.length === 0 ? (
                        <div className="text-gray-400">No data</div>
                    ) : (
                        <BarChart data={topProducts} type="quantity" />
                    )}
                </div>

                {/* Bảng top khách hàng */}
                <div className="bg-white rounded-xl shadow-lg p-6 flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <Icon icon="mdi:account-star" className="mr-2 text-purple-500" />
                        Top khách hàng mua nhiều nhất
                    </h3>
                    {topCustomers.length === 0 ? (
                        <div className="text-gray-400">No data</div>
                    ) : (
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left border-b bg-blue-50">
                                    <th className="py-2 px-2">Khách hàng</th>
                                    <th className="py-2 px-2">Email</th>
                                    <th className="py-2 px-2">Số đơn</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topCustomers.map((c, i) => (
                                    <tr key={c._id || i} className="border-b">
                                        <td className="py-2 px-2">{c.fullName || c.email}</td>
                                        <td className="py-2 px-2">{c.email}</td>
                                        <td className="py-2 px-2">{c.orderCount || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-10">
                {/* Bảng sản phẩm tồn kho thấp */}
                <div className="bg-white rounded-xl shadow-lg p-6 flex-1 min-h-[300px]">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <Icon icon="mdi:alert" className="mr-2 text-orange-500" />
                        Sản phẩm tồn kho thấp
                    </h3>
                    {lowStockList.length === 0 ? (
                        <div className="text-gray-400">Không có sản phẩm nào sắp hết hàng.</div>
                    ) : (
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left border-b bg-blue-50">
                                    <th className="py-2 px-2">Sản phẩm</th>
                                    <th className="py-2 px-2">Tồn kho</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockList.map((p, i) => (
                                    <tr key={p._id || i} className="border-b">
                                        <td className="py-2 px-2">{p.title}</td>
                                        <td className="py-2 px-2">{p.stockQuantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Đánh giá tổng quan */}
                <div className="bg-white rounded-xl shadow-lg p-6 flex-1 min-h-[300px]">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <Icon icon="mdi:star" className="mr-2 text-yellow-500" />
                        Đánh giá sản phẩm
                    </h3>

                    <div className="flex justify-around text-center mb-6">
                        <div>
                            <div className="text-gray-500 text-sm">Đánh giá mới (tháng này)</div>
                            <div className="text-2xl font-bold text-yellow-700">{stats.newReviews}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-sm">Đánh giá bị ẩn</div>
                            <div className="text-2xl font-bold text-gray-700">{stats.hiddenReviews}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-sm">Điểm TB</div>
                            <div className="text-2xl font-bold text-green-700">{stats.avgRating}</div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-md font-semibold mb-2">Top sản phẩm được đánh giá nhiều nhất</h4>
                        {topReviewedProducts.length === 0 ? (
                            <div className="text-gray-400">Không có dữ liệu</div>
                        ) : (
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b bg-blue-50">
                                        <th className="py-2 px-2">Sản phẩm</th>
                                        <th className="py-2 px-2">Số đánh giá</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topReviewedProducts.map((item, i) => (
                                        <tr key={item.book?._id || i} className="border-b">
                                            <td className="py-2 px-2">{item.book?.title || 'N/A'}</td>
                                            <td className="py-2 px-2">{item.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminBusinessDashboard;