const BookRouter = require("./bookRoutes");

const routes = (app) => {
    app.use("/api/books", BookRouter);
    // thêm các router khác nếu có
};

module.exports = routes;
