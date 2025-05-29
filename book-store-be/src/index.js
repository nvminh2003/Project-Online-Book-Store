const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const routes = require("./routes");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
dotenv.config();
const connectDB = require("../dbConnect/db");

const app = express();
const port = process.env.PORT || 9999;

const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:3000", // Cho phép frontend truy cập
    methods: ["GET", "POST", "PUT", "DELETE"], // Các phương thức được phép
    credentials: true, // Cho phép gửi cookie, authentication headers
    allowedHeaders: ["Content-Type", "Authorization", "token"]
};

// CORS phải được gọi trước tất cả middleware khác
app.use(cors(corsOptions));

// Sau đó, tiếp tục với các middleware khác
app.use(express.json({ limit: "2000mb" }));
app.use(express.urlencoded({ limit: "2000mb", extended: true }));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());

routes(app);

const http = require("http");
const server = http.createServer(app);

// CORS Configuration
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000", // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
}));

// Chạy server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB();
});