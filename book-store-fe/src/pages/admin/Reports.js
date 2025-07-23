import React, { useEffect, useState } from 'react';
import saleReportService from '../../services/saleReportService';
import ReportFilter from '../../components/admin/ReportFilter';
import ReportCards from '../../components/admin/ReportCards';
import SalesChart from '../../components/admin/SalesChart';
import BestSellersTable from '../../components/admin/BestSellersTable';
import CategorySalesChart from '../../components/admin/CategorySalesChart';
import OrdersTable from '../../components/admin/OrdersTable';

const Reports = () => {
    // State cho filters
    const [filters, setFilters] = useState({
        from: '',
        to: '',
        orderStatus: 'completed', // Mặc định completed
        paymentStatus: 'paid',    // Mặc định paid
        groupBy: 'day'
    });

    // State cho data
    const [overview, setOverview] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [categorySales, setCategorySales] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [ordersPagination, setOrdersPagination] = useState(null);

    // State cho loading
    const [loading, setLoading] = useState({
        overview: true,
        chart: true,
        bestSellers: true,
        categorySales: true,
        recentOrders: true
    });

    // State cho error
    const [error, setError] = useState(null);

    // Khởi tạo date range mặc định (30 ngày gần nhất)
    useEffect(() => {
        const today = new Date();
        const from = new Date(today);
        from.setDate(today.getDate() - 30);

        const defaultFilters = {
            from: from.toISOString().slice(0, 10),
            to: today.toISOString().slice(0, 10),
            orderStatus: 'completed', // Mặc định completed
            paymentStatus: 'paid',    // Mặc định paid
            groupBy: 'day'
        };

        setFilters(defaultFilters);
        fetchAllData(defaultFilters);
    }, []);

    // Helper để build params đúng cho API
    const buildParams = (filters) => {
        const params = { ...filters };
        // Nếu orderStatus là chuỗi rỗng, vẫn giữ lại (để truyền lên BE)
        // Nếu là undefined/null thì xóa khỏi params (mặc định BE sẽ lấy completed)
        if (filters.orderStatus === undefined || filters.orderStatus === null) delete params.orderStatus;
        if (filters.paymentStatus === undefined || filters.paymentStatus === null) delete params.paymentStatus;
        return params;
    };

    const fetchAllData = async (filters) => {
        setError(null);
        try {
            // Build params đúng logic
            const params = buildParams(filters);
            // Fetch tất cả data song song
            const [
                overviewRes,
                chartRes,
                bestSellersRes,
                categorySalesRes,
                recentOrdersRes
            ] = await Promise.all([
                saleReportService.getOverview(params),
                saleReportService.getChart(params),
                saleReportService.getBestSellers(params),
                saleReportService.getCategorySales(params),
                saleReportService.getRecentOrders({ ...params, page: 1, limit: 10 })
            ]);
            setOverview(overviewRes.data);
            setChartData(chartRes.data);
            setBestSellers(bestSellersRes.data);
            setCategorySales(categorySalesRes.data);
            setRecentOrders(recentOrdersRes.data.orders);
            setOrdersPagination(recentOrdersRes.data.pagination);
        } catch (err) {
            setError(err.message || 'Lỗi lấy dữ liệu báo cáo');
        } finally {
            setLoading({
                overview: false,
                chart: false,
                bestSellers: false,
                categorySales: false,
                recentOrders: false
            });
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleApplyFilter = (newFilters) => {
        setLoading({
            overview: true,
            chart: true,
            bestSellers: true,
            categorySales: true,
            recentOrders: true
        });
        fetchAllData(newFilters);
    };

    const handleOrdersPageChange = async (page) => {
        setLoading(prev => ({ ...prev, recentOrders: true }));
        try {
            const params = buildParams(filters);
            const res = await saleReportService.getRecentOrders({
                ...params,
                page,
                limit: 10
            });
            setRecentOrders(res.data.orders);
            setOrdersPagination(res.data.pagination);
        } catch (err) {
            setError(err.message || 'Lỗi lấy danh sách đơn hàng');
        } finally {
            setLoading(prev => ({ ...prev, recentOrders: false }));
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Báo cáo doanh số</h1>
                    <p className="text-gray-600 mt-2">Theo dõi hiệu quả kinh doanh và phân tích dữ liệu bán hàng</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Lỗi</h3>
                                <div className="mt-2 text-sm text-red-700">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter */}
                <ReportFilter
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onApplyFilter={handleApplyFilter}
                />

                {/* Overview Cards */}
                <ReportCards
                    overview={overview}
                    loading={loading.overview}
                />

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Sales Chart */}
                    <SalesChart
                        data={chartData}
                        loading={loading.chart}
                    />

                    {/* Category Sales Chart */}
                    <CategorySalesChart
                        data={categorySales}
                        loading={loading.categorySales}
                    />
                </div>

                {/* Tables Row */}
                <div className="grid grid-cols-1 gap-6 mb-6">
                    {/* Best Sellers */}
                    <BestSellersTable
                        data={bestSellers}
                        loading={loading.bestSellers}
                    />

                    {/* Recent Orders */}
                    <OrdersTable
                        data={recentOrders}
                        pagination={ordersPagination}
                        loading={loading.recentOrders}
                        onPageChange={handleOrdersPageChange}
                    />
                </div>

            </div>
        </div>
    );
};

export default Reports;