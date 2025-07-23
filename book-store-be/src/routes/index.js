const AccountRoutes = require("./accountRoutes");
const BookRouter = require("./bookRoutes");
const CategoryRouter = require("./categoryRoutes");
const BlogRouter = require("./blogRoutes");
const CartRouter = require("./cartRoutes");
const OrderRouter = require("./orderRoutes");
const ReviewRouter = require("./reviewRoutes");
const WishlistRouter = require("./wishlistRoutes");
const AdminActivityRouter = require("./adminActivityRoutes");
const SalesReportRouter = require("./salesReportRoutes");

const routes = (app) => {
    app.use("/api/accounts", AccountRoutes)
    app.use("/api/books", BookRouter);
    app.use("/api/categories", CategoryRouter);
    app.use("/api/blogs", BlogRouter);
    app.use("/api/cart", CartRouter);
    app.use("/api/orders", OrderRouter);
    app.use("/api/reviews", ReviewRouter);
    app.use("/api/wishlist", WishlistRouter);
    app.use("/api/admin", AdminActivityRouter);
    app.use("/api/sales-report", SalesReportRouter);
};

module.exports = routes;
