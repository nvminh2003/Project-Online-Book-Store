const AccountRouter = require("./accountRoutes");
const BookRouter = require("./bookRoutes");
const CategoryRouter = require("./categoryRoutes");
const BlogRouter = require("./blogRoutes");
const DiscountCodeRouter = require("./discountCodeRoutes");
const CartRouter = require("./cartRoutes");
const OrderRouter = require("./orderRoutes");
const ReviewRouter = require("./reviewRoutes");
const WishlistRouter = require("./wishlistRoutes");

const routes = (app) => {
    app.use("/api/accounts", AccountRouter);
    app.use("/api/books", BookRouter);
    app.use("/api/categories", CategoryRouter);
    app.use("/api/blogs", BlogRouter);
    app.use("/api/discount-codes", DiscountCodeRouter);
    app.use("/api/cart", CartRouter);
    app.use("/api/orders", OrderRouter);
    app.use("/api/reviews", ReviewRouter);
    app.use("/api/wishlist", WishlistRouter);
};

module.exports = routes;
