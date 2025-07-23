const express = require('express');
const router = express.Router();
const {
    getSalesOverview,
    getSalesChartData,
    getBestSellers,
    getSalesByCategory,
    getTopCustomers,
    getRecentOrders,
    getAllAccounts
} = require('../controllers/salesReportController');
const { checkAuthMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/checkPermission');
const A = require('../utils/actionTypes');

// Tất cả routes đều yêu cầu authentication và quyền VIEW_SALES_REPORT
router.use(checkAuthMiddleware);
router.use(authorizeRole(['adminbusiness']), checkPermission(A.VIEW_SALES_REPORT));

// GET /api/sales-report/overview - Tổng quan doanh số
router.get('/overview', getSalesOverview);

// GET /api/sales-report/chart - Dữ liệu biểu đồ doanh thu
router.get('/chart', getSalesChartData);

// GET /api/sales-report/best-sellers - Sản phẩm bán chạy
router.get('/best-sellers', getBestSellers);

// GET /api/sales-report/category - Doanh thu theo danh mục
router.get('/category', getSalesByCategory);

// GET /api/sales-report/top-customers - Khách hàng mua nhiều nhất
router.get('/top-customers', getTopCustomers);

// GET /api/sales-report/recent-orders - Đơn hàng gần đây
router.get('/recent-orders', getRecentOrders);

// GET /api/sales-report/accounts - Danh sách tài khoản (nếu cần thiết)
router.get('/get-customer', getAllAccounts);
module.exports = router; 