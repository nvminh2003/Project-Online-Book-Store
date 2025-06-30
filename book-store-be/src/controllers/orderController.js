const Order = require("../models/orderModel");
const Book = require("../models/bookModel");
const Cart = require("../models/cartModel");
const DiscountCode = require("../models/discountCodeModel");

// Generate unique order code
const generateOrderCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp}${random}`;
};

// Create new order
const createOrder = async (req, res) => {
    try {
        const {
            fullName,
            phone,
            address,
            discountCode,
            paymentMethod
        } = req.body;

        // Validate required fields
        if (!fullName || !phone || !address || !paymentMethod) {
            return res.status(400).json({
                message: "Full name, phone, address and payment method are required",
                status: "Error"
            });
        }

        // Validate payment method
        if (!["COD", "VNPAY", "MOMO"].includes(paymentMethod)) {
            return res.status(400).json({
                message: "Invalid payment method",
                status: "Error"
            });
        }

        // Get user's cart
        const cart = await Cart.findOne({ user: req.account._id })
            .populate('items.book');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty",
                status: "Error"
            });
        }

        // Check stock and calculate total
        let totalAmount = 0;
        const orderItems = [];

        for (const item of cart.items) {
            const book = item.book;

            // Check stock
            if (book.stockQuantity < item.quantity) {
                return res.status(400).json({
                    message: `Not enough stock for book: ${book.title}`,
                    status: "Error"
                });
            }

            // Add to order items
            orderItems.push({
                book: book._id,
                quantity: item.quantity,
                price: book.sellingPrice
            });

            totalAmount += book.sellingPrice * item.quantity;
        }

        // Apply discount code if provided
        let discountAmount = 0;
        if (discountCode) {
            const discount = await DiscountCode.findOne({
                code: discountCode,
                isActive: true,
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() }
            });

            if (discount) {
                if (discount.maxUses && discount.usesCount >= discount.maxUses) {
                    return res.status(400).json({
                        message: "Discount code has reached maximum uses",
                        status: "Error"
                    });
                }

                // Check if books are eligible for discount
                if (discount.books.length > 0) {
                    const eligibleItems = orderItems.filter(item =>
                        discount.books.includes(item.book.toString())
                    );

                    if (eligibleItems.length > 0) {
                        if (discount.type === "percent") {
                            discountAmount = eligibleItems.reduce((sum, item) =>
                                sum + (item.price * item.quantity * discount.value / 100), 0
                            );
                        } else {
                            discountAmount = discount.value * eligibleItems.length;
                        }
                    }
                } else {
                    if (discount.type === "percent") {
                        discountAmount = totalAmount * discount.value / 100;
                    } else {
                        discountAmount = discount.value;
                    }
                }

                // Update discount code usage
                discount.usesCount += 1;
                await discount.save();
            }
        }

        // Calculate shipping fee (example: 30,000 VND)
        const shippingFee = 30000;

        // Create new order
        const order = new Order({
            user: req.account._id,
            orderCode: generateOrderCode(),
            fullName,
            phone,
            address,
            discountCode: discountCode || null,
            discountAmount,
            shippingFee,
            totalAmount: totalAmount - discountAmount + shippingFee,
            paymentMethod,
            paymentStatus: "pending",
            orderStatus: "pending",
            items: orderItems
        });

        await order.save();

        // Update book stock
        for (const item of orderItems) {
            await Book.findByIdAndUpdate(item.book, {
                $inc: { stockQuantity: -item.quantity }
            });
        }

        // Clear cart
        cart.items = [];
        await cart.save();

        // Populate order details
        const populatedOrder = await Order.findById(order._id)
            .populate('items.book', 'title sellingPrice images')
            .populate('user', 'email customerInfo.fullName');

        res.status(201).json({
            message: "Order created successfully",
            status: "Success",
            data: populatedOrder
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.account.role !== "admin") {
            query.user = req.account._id;
        }

        const orders = await Order.find(query)
            .populate('items.book', 'title sellingPrice images')
            .populate('user', 'email customerInfo.fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments(query);

        res.status(200).json({
            message: "Get orders successfully",
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

// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const query = { _id: req.params.id };
        if (req.account.role !== "admin") {
            query.user = req.account._id;
        }

        const order = await Order.findOne(query)
            .populate('items.book', 'title sellingPrice images')
            .populate('user', 'email customerInfo.fullName');

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
                status: "Error"
            });
        }

        res.status(200).json({
            message: "Get order successfully",
            status: "Success",
            data: order
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, paymentStatus } = req.body;

        if (!orderStatus && !paymentStatus) {
            return res.status(400).json({
                message: "Order status or payment status is required",
                status: "Error"
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
                status: "Error"
            });
        }

        // Validate order status
        if (orderStatus && !["pending", "shipping", "completed", "cancelled"].includes(orderStatus)) {
            return res.status(400).json({
                message: "Invalid order status",
                status: "Error"
            });
        }

        // Validate payment status
        if (paymentStatus && !["pending", "paid", "failed"].includes(paymentStatus)) {
            return res.status(400).json({
                message: "Invalid payment status",
                status: "Error"
            });
        }

        // Update status
        if (orderStatus) order.orderStatus = orderStatus;
        if (paymentStatus) order.paymentStatus = paymentStatus;

        await order.save();

        // If order is cancelled, return stock
        if (orderStatus === "cancelled" && order.orderStatus !== "cancelled") {
            for (const item of order.items) {
                await Book.findByIdAndUpdate(item.book, {
                    $inc: { stockQuantity: item.quantity }
                });
            }
        }

        // Populate order details
        const updatedOrder = await Order.findById(order._id)
            .populate('items.book', 'title sellingPrice images')
            .populate('user', 'email customerInfo.fullName');

        res.status(200).json({
            message: "Update order status successfully",
            status: "Success",
            data: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Error"
        });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus
};
