// Required models and libraries
const Order = require("../models/orderModel");
const Book = require("../models/bookModel");
const Cart = require("../models/cartModel");
const AdminActivityLog = require("../models/AdminActivityLog");
const { sendOrderConfirmationEmail } = require("../utils/emailService");
const Account = require("../models/accountModel");
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const PayOS = require("@payos/node");
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

const generateOrderCode = () => {
  // PayOS requires orderCode to be a positive integer
  // Use shorter timestamp (last 8 digits) + 2 digit random = max 10 digits
  const timestamp = Date.now();
  const timestampStr = timestamp.toString();
  // Take last 8 digits of timestamp
  const shortTimestamp = timestampStr.slice(-8);
  // Add 2-digit random number
  const random = Math.floor(Math.random() * 90) + 10; // 10-99
  const orderCode = Number(shortTimestamp + random.toString());

  console.log(
    "Generated orderCode:",
    orderCode,
    "Length:",
    orderCode.toString().length,
    "String length:",
    orderCode.toString().length
  );
  return orderCode;
};

// Create PayOS payment link
const createPaymentLink = async (paymentData) => {
  const { orderCode, totalAmount, fullName, phone, orderId } = paymentData;

  // Create order data according to PayOS documentation
  const payosOrderData = {
    orderCode: orderCode, // Keep as number - PayOS accepts number
    amount: Math.round(totalAmount), // Ensure amount is integer
    description: `Don hang sach #${orderCode}`, // Avoid special characters
    returnUrl: `${process.env.FRONTEND_URL}/auth/checkout/success/${orderId}`,
    cancelUrl: `${process.env.FRONTEND_URL}/auth/checkout/cancel/${orderId}`,
    // Remove buyerName and buyerPhone as they might cause issues
  };

  try {
    console.log("=== PayOS API Request ===");
    console.log("PayOS Config:", {
      clientId: process.env.PAYOS_CLIENT_ID ? "SET" : "NOT SET",
      apiKey: process.env.PAYOS_API_KEY ? "SET" : "NOT SET",
      checksumKey: process.env.PAYOS_CHECKSUM_KEY ? "SET" : "NOT SET",
      frontendUrl: process.env.FRONTEND_URL,
    });

    console.log("PayOS Order Data:", JSON.stringify(payosOrderData, null, 2));
    console.log("OrderCode validation:", {
      value: orderCode,
      type: typeof orderCode,
      length: orderCode.toString().length,
      isInteger: Number.isInteger(orderCode),
      isPositive: orderCode > 0,
      withinLimit: orderCode <= 9007199254740991,
    });

    const paymentLinkResponse = await payos.createPaymentLink(payosOrderData);

    console.log("=== PayOS API Response ===");
    console.log("Response Status: SUCCESS");
    console.log("Response Data:", JSON.stringify(paymentLinkResponse, null, 2));
    console.log("Checkout URL:", paymentLinkResponse.checkoutUrl);

    if (!paymentLinkResponse || !paymentLinkResponse.checkoutUrl) {
      throw new Error("Invalid PayOS response: Missing checkout URL");
    }

    return paymentLinkResponse.checkoutUrl;
  } catch (error) {
    console.error("=== PayOS API Error ===");
    console.error("Error Type:", error.constructor.name);
    console.error("Error Message:", error.message);
    console.error("Error Code:", error.code);
    console.error("Error Status:", error.status);
    console.error("Error Response:", error.response?.data);
    console.error("Full Error Stack:", error.stack);
    console.error(
      "PayOS Request Data:",
      JSON.stringify(payosOrderData, null, 2)
    );

    throw new Error(`PayOS link creation failed: ${error.message}`);
  }
};

const createOrder = async (req, res) => {
  try {
    const { fullName, phone, address, discountCode, paymentMethod, note } =
      req.body;

    // Chỉ cho phép customer đặt đơn hàng
    if (req.account.role !== "customer") {
      return res.status(403).json({
        message: "Chỉ khách hàng mới được phép đặt đơn hàng.",
        status: "Error"
      });
    }

    if (!fullName || !phone || !address || !paymentMethod) {
      return res.status(400).json({
        message: "Full name, phone, address and payment method are required",
        status: "Error",
      });
    }

    if (!["COD", "PAYOS"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
        status: "Error",
      });
    }

    const cart = await Cart.findOne({ user: req.account._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
        status: "Error",
      });
    }

    const bookIds = cart.items.map((item) => item.book);
    const books = await Book.find({ _id: { $in: bookIds } });
    const bookMap = new Map(books.map((book) => [book._id.toString(), book]));

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const book = bookMap.get(item.book.toString());
      if (!book) {
        return res.status(400).json({
          message: `Book with id ${item.book} is not available.`,
          status: "Error",
        });
      }

      if (book.stockQuantity < item.quantity) {
        return res.status(400).json({
          message: `Số lượng sách trong kho không đủ: ${book.title}`,
          status: "Error",
        });
      }

      orderItems.push({
        book: book._id,
        quantity: item.quantity,
        price: book.sellingPrice, // Use sellingPrice for order item price
      });

      totalAmount += book.sellingPrice * item.quantity;
    }

    let discountAmount = 0;
    let appliedDiscount = null;
    if (discountCode) {
      const discount = await DiscountCode.findOne({
        code: discountCode,
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (discount) {
        if (discount.maxUses && discount.usesCount >= discount.maxUses) {
          return res.status(400).json({
            message: "Discount code has reached maximum uses",
            status: "Error",
          });
        }

        appliedDiscount = discount;

        if (discount.type === "percent") {
          discountAmount = (totalAmount * discount.value) / 100;
        } else {
          discountAmount = discount.value;
        }

        // Ensure discount doesn't exceed total amount
        discountAmount = Math.min(discountAmount, totalAmount);
      }
    }

    // Calculate shipping fee: Free for orders >= 200k, otherwise 30k
    const FREE_SHIPPING_THRESHOLD = 200000;
    const STANDARD_SHIPPING_FEE = 30000;
    const shippingFee =
      totalAmount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    const finalTotal = totalAmount - discountAmount + shippingFee;
    const orderCode = generateOrderCode();

    const newOrder = new Order({
      user: req.account._id,
      orderCode,
      fullName,
      phone,
      address,
      note,
      discountCode: appliedDiscount ? appliedDiscount.code : null,
      discountAmount,
      shippingFee,
      totalAmount: finalTotal,
      paymentMethod,
      paymentStatus: paymentMethod === "PAYOS" ? "pending" : "pending",
      orderStatus: "pending",
      items: orderItems,
    });

    await newOrder.save();

    // Trừ tồn kho ngay khi tạo đơn cho cả COD và PAYOS
    const bulkOps = orderItems.map((item) => ({
      updateOne: {
        filter: { _id: item.book, stockQuantity: { $gte: item.quantity } },
        update: { $inc: { stockQuantity: -item.quantity } },
      },
    }));

    const result = await Book.bulkWrite(bulkOps);

    // Check if all stock updates were successful
    if (result.modifiedCount !== orderItems.length) {
      // Rollback: xóa đơn hàng vừa tạo
      await Order.findByIdAndDelete(newOrder._id);

      // Find which books failed
      const failedBooks = [];
      for (const item of orderItems) {
        const book = await Book.findById(item.book);
        if (book.stockQuantity < item.quantity) {
          failedBooks.push(book.title);
        }
      }

      return res.status(400).json({
        message: `Insufficient stock for: ${failedBooks.join(", ")}. Please refresh your cart and try again.`,
        status: "Error",
      });
    }

    console.log(`Stock updated successfully for order: ${newOrder._id}`);

    if (appliedDiscount) {
      appliedDiscount.usesCount += 1;
      await appliedDiscount.save();
    }

    if (paymentMethod === "PAYOS") {
      try {
        console.log("=== PayOS Payment Request ===");
        console.log("Order Details:", {
          orderId: newOrder._id.toString(),
          orderCode,
          totalAmount: finalTotal,
          fullName,
          phone,
          paymentMethod,
          discountAmount,
          shippingFee,
          items: orderItems.map((item) => ({
            bookId: item.book,
            quantity: item.quantity,
            price: item.price,
          })),
        });

        const checkoutUrl = await createPaymentLink({
          orderCode,
          totalAmount: finalTotal,
          fullName,
          phone,
          orderId: newOrder._id.toString(),
        });

        console.log("PayOS Payment Link Created Successfully:", checkoutUrl);

        // Only clear cart after successful PayOS link creation
        cart.items = [];
        cart.coupon = null;
        cart.subtotal = 0;
        await cart.save();
        console.log("Cart cleared successfully after PayOS link creation");

        // For PayOS orders, do NOT send email here
        // Email will be sent after payment success/failure in handlePayosSuccess/handlePayosCancel
        console.log(
          "PayOS order created, email will be sent after payment completion"
        );

        return res.status(200).json({
          message: "PayOS payment link created",
          status: "Success",
          data: {
            checkoutUrl,
            orderId: newOrder._id,
          },
        });
      } catch (error) {
        console.error("=== PayOS Error Details ===");
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        console.error("Order ID that failed:", newOrder._id.toString());

        // Don't clear cart if PayOS fails - keep the cart intact
        console.log("Cart preserved due to PayOS error");

        // Update order status to indicate payment link failure
        newOrder.paymentStatus = "failed";
        newOrder.orderStatus = "cancelled";
        await newOrder.save();

        return res.status(500).json({
          message:
            "Failed to create PayOS payment link. Your cart has been preserved. Please try again or choose COD payment method.",
          status: "Error",
          data: {
            orderId: newOrder._id,
            error: error.message,
          },
        });
      }
    } else {
      // For COD, clear cart immediately
      cart.items = [];
      cart.coupon = null;
      cart.subtotal = 0;
      await cart.save();

      // Gửi email (populate để có tên sản phẩm)
      const user = await Account.findById(req.account._id);
      const populatedOrder = await Order.findById(newOrder._id).populate(
        "items.book"
      );
      if (user?.email) {
        await sendOrderConfirmationEmail(user.email, populatedOrder);
      }
      return res.status(201).json({
        message: "Order created successfully with COD",
        status: "Success",
        data: { orderId: newOrder._id },
      });
    }
  } catch (error) {
    console.error("Order creation failed:", error);
    return res.status(500).json({
      message: `Order creation failed: ${error.message}`,
      status: "Error",
    });
  }
};

// Get user orders (for customer)
const getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Customer chỉ xem orders của mình
    const query = { user: req.account._id };

    // Filter theo trạng thái đơn hàng
    if (req.query.orderStatus) {
      query.orderStatus = req.query.orderStatus;
    }

    // Filter theo trạng thái thanh toán
    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }

    // Filter theo khoảng thời gian
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const orders = await Order.find(query)
      .populate("items.book", "title sellingPrice images")
      .populate("items.reviewId", "rating comment images createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      message: "Get user orders successfully",
      status: "Success",
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Get all orders (for adminbusiness with search and filter)
const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Search theo nhiều trường nếu có searchTerm
    if (req.query.searchTerm) {
      const searchRegex = { $regex: req.query.searchTerm, $options: 'i' };

      const matchedUsers = await Account.find({
        email: searchRegex
      }).select('_id');

      query.$or = [
        { orderCode: searchRegex },
        { fullName: searchRegex },
        { phone: searchRegex },
      ];

      if (matchedUsers.length > 0) {
        query.$or.push({ user: { $in: matchedUsers.map(u => u._id) } });
      }
    }

    // Filter theo trạng thái đơn hàng
    if (req.query.orderStatus) {
      query.orderStatus = req.query.orderStatus;
    }

    // Filter theo trạng thái thanh toán
    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }

    // Filter theo phương thức thanh toán
    if (req.query.paymentMethod) {
      query.paymentMethod = req.query.paymentMethod;
    }

    // Filter theo khoảng thời gian
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Filter theo khoảng giá
    if (req.query.minAmount || req.query.maxAmount) {
      query.totalAmount = {};
      if (req.query.minAmount) query.totalAmount.$gte = parseFloat(req.query.minAmount);
      if (req.query.maxAmount) query.totalAmount.$lte = parseFloat(req.query.maxAmount);
    }

    // Filter theo có/không có mã giảm giá
    if (req.query.hasDiscount === 'true') {
      query.discountCode = { $ne: null };
    } else if (req.query.hasDiscount === 'false') {
      query.discountCode = null;
    }

    const orders = await Order.find(query)
      .populate("items.book", "title sellingPrice images")
      .populate("items.reviewId", "rating comment images createdAt")
      .populate("user", "email info.fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    // Tính tổng thống kê
    const stats = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          avgOrderValue: { $avg: "$totalAmount" }
        }
      }
    ]);

    res.status(200).json({
      message: "Get all orders successfully",
      status: "Success",
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: stats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0
        }
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Get order by ID (for both customer and adminbusiness)
const getOrderById = async (req, res) => {
  try {
    const query = { _id: req.params.id };

    // Customer chỉ xem orders của mình, adminbusiness xem tất cả
    if (req.account.role === "customer") {
      query.user = req.account._id;
    }

    const order = await Order.findOne(query)
      .populate("items.book", "title sellingPrice images")
      .populate("items.reviewId", "rating comment images createdAt")
      .populate("user", "email info.fullName").lean();

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        status: "Error",
      });
    }

    res.status(200).json({
      message: "Get order successfully",
      status: "Success",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Update payment status (admin only)
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    const validStatuses = ["pending", "paid", "failed"];

    if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        message: `Trạng thái thanh toán không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(", ")}`,
        status: "Error"
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng.", status: "Error" });
    }

    if (order.paymentStatus === "paid" && paymentStatus !== "paid") {
      return res.status(400).json({
        message: "Đơn hàng đã được thanh toán, không thể thay đổi trạng thái.",
        status: "Error"
      });
    }

    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({
        message: "Không thể cập nhật thanh toán cho đơn hàng đã bị huỷ.",
        status: "Error"
      });
    }

    if (order.paymentStatus === paymentStatus) {
      return res.status(200).json({
        message: "Trạng thái thanh toán đã được đặt như hiện tại.",
        status: "Success",
        data: order
      });
    }

    if (order.orderStatus === 'completed' && paymentStatus !== 'paid') {
      return res.status(400).json({
        message: "Không thể thay đổi trạng thái thanh toán của đơn đã hoàn thành.",
        status: "Error"
      });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    await AdminActivityLog.create({
      adminId: req.account._id,
      action: 'UPDATE_PAYMENT_STATUS',
      details: `Admin ${req.account.email} đã cập nhật trạng thái thanh toán cho đơn hàng ${order._id} thành ${paymentStatus}`
    });

    res.status(200).json({
      message: "Cập nhật trạng thái thanh toán thành công.",
      status: "Success",
      data: order
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: "Error" });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];

    if (!orderStatus || !validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: "Trạng thái đơn hàng không hợp lệ.",
        status: "Error"
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng.", status: "Error" });
    }

    if (["completed", "cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({
        message:
          order.orderStatus === 'completed'
            ? 'Đơn hàng đã hoàn tất. Không thể cập nhật trạng thái mới.'
            : 'Đơn hàng đã bị huỷ. Không thể cập nhật trạng thái mới.',
        status: "Error"
      });
    }

    if (order.orderStatus === orderStatus) {
      return res.status(200).json({
        message: "Trạng thái đơn hàng đã được đặt như hiện tại.",
        status: "Success",
        data: order
      });
    }

    if (order.orderStatus === 'confirmed' && orderStatus === 'cancelled') {
      return res.status(400).json({
        message: "Không thể huỷ đơn hàng sau khi đã được xác nhận.",
        status: "Error"
      });
    }

    //Chặn trường hợp huỷ đơn đã thanh toán
    if (orderStatus === 'cancelled' && order.paymentStatus === 'paid') {
      return res.status(400).json({
        message: "Không thể huỷ đơn hàng đã thanh toán.",
        status: "Error"
      });
    }

    if (orderStatus === "completed" && order.paymentStatus !== "paid") {
      return res.status(400).json({
        message: "Không thể hoàn thành đơn hàng chưa được thanh toán.",
        status: "Error"
      });
    }

    // Chặn không cho cập nhật về "pending" nếu đã thanh toán
    if (order.paymentStatus === 'paid' && orderStatus === 'pending') {
      return res.status(400).json({
        message: "Không thể chuyển đơn hàng đã thanh toán về trạng thái chờ xác nhận.",
        status: "Error"
      });
    }

    if (orderStatus === "cancelled") {
      for (const item of order.items) {
        const book = await Book.findById(item.book);
        if (book) {
          await book.updateOne({ $inc: { stockQuantity: item.quantity } });
        }
      }
    }

    order.orderStatus = orderStatus;
    await order.save();

    await AdminActivityLog.create({
      adminId: req.account._id,
      action: 'UPDATE_ORDER_STATUS',
      details: `Admin ${req.account.email} đã cập nhật trạng thái đơn hàng ${order._id} thành ${orderStatus}`
    });

    res.status(200).json({
      message: "Cập nhật trạng thái đơn hàng thành công.",
      status: "Success",
      data: order
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: "Error" });
  }
};

// --- PAYOS API CONTROLLERS ---
// Get PayOS payment status
const getPayosPaymentStatus = async (req, res) => {
  try {
    const { payosOrderCode } = req.query;
    if (!payosOrderCode) {
      return res
        .status(400)
        .json({ message: "Missing payosOrderCode", status: "Error" });
    }
    const status = await payos.getPaymentStatus(payosOrderCode);
    res.status(200).json({
      message: "PayOS payment status fetched",
      status: "Success",
      data: status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: "Error" });
  }
};
// Get PayOS order status
const getPayosOrderStatus = async (req, res) => {
  try {
    const { payosOrderCode } = req.query;
    if (!payosOrderCode) {
      return res
        .status(400)
        .json({ message: "Missing payosOrderCode", status: "Error" });
    }
    const status = await payos.getOrderStatus(payosOrderCode);
    res.status(200).json({
      message: "PayOS order status fetched",
      status: "Success",
      data: status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: "Error" });
  }
};
// PayOS webhook handler
const payosWebhook = async (req, res) => {
  try {
    // TODO: Verify signature and update order/payment status accordingly
    // const signature = req.headers['x-payos-signature'];
    // const body = req.body;
    // Implement signature verification and order update logic here
    res.status(200).json({ message: "Webhook received", status: "Success" });
  } catch (error) {
    res.status(500).json({ message: error.message, status: "Error" });
  }
};

// Handle PayOS checkout success
const handlePayosSuccess = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found", status: "Error" });
    }
    // Nếu đã thanh toán rồi thì không xử lý lại
    if (order.paymentStatus === "paid") {
      return res.status(200).json({
        message: "Order already paid",
        status: "Success",
        data: order,
      });
    }

    // Không cần trừ tồn kho nữa, chỉ cập nhật trạng thái
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    await order.save();

    // 1. Clear giỏ hàng sau khi thanh toán PayOS thành công
    await Cart.updateOne(
      { user: order.user },
      { $set: { items: [], coupon: null, subtotal: 0 } }
    );

    // 2. Gửi email xác nhận đơn hàng
    const user = await Account.findById(order.user);
    if (user?.email) {
      const populatedOrder = await Order.findById(order._id).populate("items.book");
      await sendOrderConfirmationEmail(user.email, populatedOrder);
    }

    return res.status(200).json({
      message: "Order payment successful",
      status: "Success",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: "Error" });
  }
};
// Handle PayOS checkout cancel
const handlePayosCancel = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(`[${new Date().toISOString()}] [PayOS Cancel] Cancel request for orderId: ${orderId}`);

    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`[${new Date().toISOString()}] [PayOS Cancel] Order not found: ${orderId}`);
      return res.status(404).json({ message: "Order not found", status: "Error" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        message: "Order has already been paid and cannot be cancelled.",
        status: "Error",
      });
    }

    if (["failed", "cancelled"].includes(order.paymentStatus)) {
      console.log(`[${new Date().toISOString()}] [PayOS Cancel] Order already cancelled: ${orderId}`);
      return res.status(200).json({
        message: "Order already cancelled",
        status: "Success",
        data: order,
      });
    }

    order.paymentStatus = "failed";
    order.orderStatus = "cancelled";
    await order.save();

    // Hoàn lại tồn kho khi hủy/thanh toán thất bại
    await Promise.all(order.items.map(item =>
      Book.findByIdAndUpdate(item.book, {
        $inc: { stockQuantity: item.quantity },
      })
    ));

    console.log(`[${new Date().toISOString()}] [PayOS Cancel] Order cancelled and stock restored: ${orderId}`);
    return res.status(200).json({
      message: "Order payment cancelled",
      status: "Success",
      data: order,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [PayOS Cancel] Error:`, error);
    return res.status(500).json({ message: error.message, status: "Error" });
  }
};

const exportOrdersToExcel = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, paymentMethod, startDate, endDate, searchTerm } = req.query;

    const query = {};

    // Lọc trạng thái đơn hàng
    if (orderStatus) query.orderStatus = orderStatus;

    // Lọc trạng thái thanh toán
    if (paymentStatus) query.paymentStatus = paymentStatus;

    // Lọc phương thức thanh toán
    if (paymentMethod) query.paymentMethod = paymentMethod;

    // Lọc theo ngày tạo
    if (startDate && startDate !== 'undefined') {
      query.createdAt = query.createdAt || {};
      query.createdAt.$gte = new Date(startDate);
    }

    if (endDate && endDate !== 'undefined') {
      query.createdAt = query.createdAt || {};
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }

    // Lọc theo mã đơn, tên, email, sdt
    if (searchTerm) {
      query.$or = [
        { orderCode: { $regex: searchTerm, $options: 'i' } },
        { fullName: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const orders = await Order.find(query)
      .populate("items.book", "title")
      .populate("user", "email info.fullName")
      .sort({ createdAt: -1 });

    // Chuẩn bị dữ liệu cho sheet
    const data = orders.map(order => ({
      'Mã đơn': order.orderCode,
      'Khách hàng': order.fullName || order.user?.info?.fullName || '',
      'Email': order.user?.email || '',
      'Số điện thoại': order.phone,
      'Tổng tiền': order.totalAmount,
      'Trạng thái đơn': order.orderStatus,
      'Trạng thái thanh toán': order.paymentStatus,
      'Phương thức thanh toán': order.paymentMethod,
      'Ngày tạo': order.createdAt ? new Date(order.createdAt).toLocaleString() : '',
      'Sản phẩm': order.items.map(i => `${i.book?.title} (SL: ${i.quantity})`).join('; ')
    }));

    // Tạo workbook và worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');

    // Ghi file vào buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Gửi file về FE
    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.end(buf);
  } catch (error) {
    res.status(500).json({ message: error.message, status: "Error" });
  }
};

// Hủy đơn hàng bởi customer
const cancelOrderByCustomer = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    if (order.user.toString() !== req.account._id.toString())
      return res.status(403).json({ message: "Không có quyền hủy đơn này" });
    if (order.orderStatus !== "pending")
      return res.status(400).json({ message: "Chỉ được hủy đơn ở trạng thái chờ xử lý" });
    // Nếu là PayOS và đã thanh toán thì không cho hủy
    if (order.paymentMethod === "PAYOS" && order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Đơn hàng đã thanh toán không thể hủy." });
    }
    order.orderStatus = "cancelled";
    order.paymentStatus = "failed";
    await order.save();
    // Cộng lại kho
    await Promise.all(order.items.map(item =>
      Book.findByIdAndUpdate(item.book, { $inc: { stockQuantity: item.quantity } })
    ));
    res.json({ message: "Đã hủy đơn hàng thành công", status: "Success" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xác nhận đã nhận hàng bởi customer
const completeOrderByCustomer = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    if (order.user.toString() !== req.account._id.toString())
      return res.status(403).json({ message: "Không có quyền xác nhận đơn này" });
    if (order.orderStatus !== "confirmed")
      return res.status(400).json({ message: "Chỉ xác nhận khi đơn đã giao thành công" });
    // Nếu là PayOS thì phải đã thanh toán mới cho xác nhận
    if (order.paymentMethod === "PAYOS" && order.paymentStatus !== "paid") {
      return res.status(400).json({ message: "Đơn hàng chưa thanh toán không thể xác nhận hoàn thành." });
    }
    order.orderStatus = "completed";
    await order.save();
    res.json({ message: "Đã xác nhận nhận hàng thành công", status: "Success" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getPayosPaymentStatus,
  getPayosOrderStatus,
  payosWebhook,
  handlePayosSuccess,
  handlePayosCancel,
  updatePaymentStatus,
  getUserOrders,
  exportOrdersToExcel,
  cancelOrderByCustomer,
  completeOrderByCustomer
};
