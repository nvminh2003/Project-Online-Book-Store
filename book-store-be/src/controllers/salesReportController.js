const Order = require("../models/orderModel");
const Book = require("../models/bookModel");
const Account = require("../models/accountModel");
const Category = require("../models/categoryModel");
const AdminActivityLog = require("../models/AdminActivityLog");

// Helper để build filter
function buildOrderFilter(query) {
    const { from, to, orderStatus, paymentStatus } = query;
    const filter = {};
    if (from || to) {
        filter.createdAt = {};
        if (from) filter.createdAt.$gte = new Date(from);
        if (to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            filter.createdAt.$lte = toDate;
        }
    }
    // Nếu truyền orderStatus (kể cả chuỗi rỗng), thì không filter theo trạng thái (lấy tất cả)
    if (orderStatus !== undefined && orderStatus !== 'undefined' && orderStatus !== 'null') {
        if (orderStatus.trim() !== '') {
            const arr = orderStatus.split(',').map(s => s.trim());
            filter.orderStatus = { $in: arr };
        }
        // Nếu chuỗi rỗng, không filter orderStatus (lấy tất cả)
    } else {
        // Mặc định chỉ lấy completed
        filter.orderStatus = "completed";
    }
    // Nếu truyền paymentStatus (kể cả chuỗi rỗng), thì không filter theo trạng thái (lấy tất cả)
    if (paymentStatus !== undefined && paymentStatus !== 'undefined' && paymentStatus !== 'null') {
        if (paymentStatus.trim() !== '') {
            const arr = paymentStatus.split(',').map(s => s.trim());
            filter.paymentStatus = { $in: arr };
        }
        // Nếu chuỗi rỗng, không filter paymentStatus (lấy tất cả)
    } else {
        // Mặc định chỉ lấy paid
        filter.paymentStatus = "paid";
    }
    return filter;
}

// Get sales overview (tổng quan doanh số)
const getSalesOverview = async (req, res) => {
    try {
        const filter = buildOrderFilter(req.query);
        const [totalRevenue, totalOrders, totalProductsSold] = await Promise.all([
            // Tổng doanh thu
            Order.aggregate([
                { $match: filter },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]),
            // Tổng số đơn hàng
            Order.countDocuments(filter),
            // Tổng số sản phẩm đã bán
            Order.aggregate([
                { $match: filter },
                { $unwind: "$items" },
                { $group: { _id: null, total: { $sum: "$items.quantity" } } }
            ])
        ]);
        const overview = {
            totalRevenue: totalRevenue[0]?.total || 0,
            totalOrders: totalOrders,
            totalProductsSold: totalProductsSold[0]?.total || 0
        };
        res.status(200).json({
            message: "Get sales overview successfully",
            status: "Success",
            data: overview
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Get sales chart data (dữ liệu biểu đồ doanh thu)
const getSalesChartData = async (req, res) => {
    try {
        const { from, to, groupBy = "day" } = req.query;
        if (!from || !to) {
            return res.status(400).json({
                message: "Vui lòng nhập cả ngày bắt đầu và ngày kết thúc.",
                status: "Error"
            });
        }
        if (from > to) {
            return res.status(400).json({
                message: "Ngày bắt đầu không được lớn hơn ngày kết thúc.",
                status: "Error"
            });
        }
        const filter = buildOrderFilter(req.query);
        // Đảm bảo filter theo đúng khoảng thời gian
        filter.createdAt = { $gte: new Date(from), $lte: (() => { const d = new Date(to); d.setHours(23, 59, 59, 999); return d; })() };
        let groupByField;
        switch (groupBy) {
            case "month":
                groupByField = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
                break;
            case "year":
                groupByField = { year: { $year: "$createdAt" } };
                break;
            default:
                groupByField = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } };
        }
        const salesData = await Order.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: groupByField,
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 },
                    products: { $sum: { $sum: "$items.quantity" } }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);
        const formattedData = salesData.map(item => {
            let date;
            if (groupBy === "month") {
                date = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`;
            } else if (groupBy === "year") {
                date = item._id.year.toString();
            } else {
                date = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`;
            }
            return {
                date,
                revenue: item.revenue,
                orders: item.orders,
                products: item.products
            };
        });
        res.status(200).json({
            message: "Get sales chart data successfully",
            status: "Success",
            data: formattedData
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Get best selling products (sản phẩm bán chạy)
const getBestSellers = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const filter = buildOrderFilter(req.query);
        const bestSellers = await Order.aggregate([
            { $match: filter },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.book",
                    totalQuantity: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: "books",
                    localField: "_id",
                    foreignField: "_id",
                    as: "bookInfo"
                }
            },
            { $unwind: "$bookInfo" },
            {
                $project: {
                    bookId: "$_id",
                    title: "$bookInfo.title",
                    authors: "$bookInfo.authors",
                    sellingPrice: "$bookInfo.sellingPrice",
                    totalQuantity: 1,
                    totalRevenue: 1,
                    orderCount: 1
                }
            }
        ]);
        res.status(200).json({
            message: "Get best sellers successfully",
            status: "Success",
            data: bestSellers
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Get sales by category (doanh thu theo danh mục)
const getSalesByCategory = async (req, res) => {
    try {
        const filter = buildOrderFilter(req.query);
        const categorySales = await Order.aggregate([
            { $match: filter },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "books",
                    localField: "items.book",
                    foreignField: "_id",
                    as: "bookInfo"
                }
            },
            { $unwind: "$bookInfo" },
            { $unwind: "$bookInfo.categories" },
            {
                $group: {
                    _id: "$bookInfo.categories",
                    totalQuantity: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            },
            { $unwind: "$categoryInfo" },
            {
                $project: {
                    categoryId: "$_id",
                    categoryName: "$categoryInfo.name",
                    totalQuantity: 1,
                    totalRevenue: 1,
                    orderCount: 1
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);
        res.status(200).json({
            message: "Get sales by category successfully",
            status: "Success",
            data: categorySales
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Get top customers (khách hàng mua nhiều nhất)
const getTopCustomers = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const filter = buildOrderFilter(req.query);
        const topCustomers = await Order.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$user",
                    totalSpent: { $sum: "$totalAmount" },
                    orderCount: { $sum: 1 },
                    totalProducts: { $sum: { $sum: "$items.quantity" } }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: "accounts",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            { $unwind: "$userInfo" },
            {
                $project: {
                    userId: "$_id",
                    email: "$userInfo.email",
                    fullName: "$userInfo.info.fullName",
                    phone: "$userInfo.info.phone",
                    totalSpent: 1,
                    orderCount: 1,
                    totalProducts: 1
                }
            }
        ]);
        res.status(200).json({
            message: "Get top customers successfully",
            status: "Success",
            data: topCustomers
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Get recent orders (đơn hàng gần đây)
const getRecentOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = buildOrderFilter(req.query);
        const orders = await Order.find(filter)
            .populate('user', 'email info.fullName info.phone')
            .populate('items.book', 'title authors sellingPrice')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await Order.countDocuments(filter);
        res.status(200).json({
            message: "Get recent orders successfully",
            status: "Success",
            data: {
                orders,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Get all accounts with filters and search
const getAllAccounts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { searchTerm, role, isActive } = req.query; // Lấy các tham số filter từ query

        const query = {};

        // Thêm search term nếu có
        if (searchTerm) {
            const regex = new RegExp(searchTerm, 'i'); // 'i' for case-insensitive
            query.$or = [
                { email: regex },
                { 'info.fullName': regex },
                { 'info.phone': regex },
                { 'info.address': regex }
            ];
        }

        // Thêm filter theo vai trò nếu có
        if (role) {
            query.role = role;
        }

        // Thêm filter theo trạng thái nếu có
        if (isActive !== undefined) {
            query.isActive = isActive === 'true'; // Chuyển đổi chuỗi 'true'/'false' thành boolean
        }

        const [accounts, total] = await Promise.all([
            Account.find(query)
                .skip(skip)
                .limit(limit)
                .select('-password -refreshToken'),
            Account.countDocuments(query)
        ]);

        res.json({
            status: 'Success',
            data: accounts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error in getAllAccounts:", error);
        res.status(500).json({ status: 'Error', message: error.message || 'Internal server error' });
    }
};

module.exports = {
    getSalesOverview,
    getSalesChartData,
    getBestSellers,
    getSalesByCategory,
    getTopCustomers,
    getRecentOrders,
    getAllAccounts
}; 