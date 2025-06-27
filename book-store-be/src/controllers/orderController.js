// Required models and libraries
const Order = require("../models/orderModel");
const Book = require("../models/bookModel");
const Cart = require("../models/cartModel");
const DiscountCode = require("../models/discountCodeModel");

const PayOS = require("@payos/node");
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

// Generate unique order code
const generateOrderCode = () => {
  // Use a safe positive integer, e.g. last 9 digits of timestamp + random
  const base = Number(Date.now().toString().slice(-9));
  const random = Math.floor(Math.random() * 1000);
  return base * 1000 + random; // Always a positive integer, < 9007199254740991
};

// Create PayOS payment link
const createPaymentLink = async (paymentData) => {
  const { orderCode, totalAmount, fullName, phone, orderId } = paymentData;

  const order = {
    amount: totalAmount,
    description: `Book order for ${fullName}`,
    orderCode: orderCode,
    returnUrl: `${process.env.FRONTEND_URL}/auth/checkout/success/${orderId}`,
    cancelUrl: `${process.env.FRONTEND_URL}/auth/checkout/cancel/${orderId}`,
    buyerName: fullName,
    buyerPhone: phone,
  };

  try {
    const paymentLinkResponse = await payos.createPaymentLink(order);
    return paymentLinkResponse.checkoutUrl;
  } catch (error) {
    throw new Error(`PayOS link creation failed: ${error.message}`);
  }
};

// Create Order
const createOrder = async (req, res) => {
  try {
    const { fullName, phone, address, discountCode, paymentMethod } = req.body;

    if (!fullName || !phone || !address || !paymentMethod) {
      return res.status(400).json({
        message: "Full name, phone, address and payment method are required",
        status: "Error",
      });
    }

    if (!["COD", "VNPAY", "MOMO", "PAYOS"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
        status: "Error",
      });
    }

    const cart = await Cart.findOne({ user: req.account._id }).populate(
      "items.book"
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
        status: "Error",
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const book = item.book;
      if (book.stockQuantity < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for book: ${book.title}`,
          status: "Error",
        });
      }

      orderItems.push({
        book: book._id,
        quantity: item.quantity,
        price: book.sellingPrice,
      });

      totalAmount += book.sellingPrice * item.quantity;
    }

    let discountAmount = 0;
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

        if (discount.books.length > 0) {
          const eligibleItems = orderItems.filter((item) =>
            discount.books.includes(item.book.toString())
          );

          if (eligibleItems.length > 0) {
            if (discount.type === "percent") {
              discountAmount = eligibleItems.reduce(
                (sum, item) =>
                  sum + (item.price * item.quantity * discount.value) / 100,
                0
              );
            } else {
              discountAmount = discount.value * eligibleItems.length;
            }
          }
        } else {
          if (discount.type === "percent") {
            discountAmount = (totalAmount * discount.value) / 100;
          } else {
            discountAmount = discount.value;
          }
        }

        discount.usesCount += 1;
        await discount.save();
      }
    }

    const shippingFee = 30000;
    const finalTotal = totalAmount - discountAmount + shippingFee;
    const orderCode = generateOrderCode();

    const newOrder = new Order({
      user: req.account._id,
      orderCode,
      fullName,
      phone,
      address,
      discountCode: discountCode || null,
      discountAmount,
      shippingFee,
      totalAmount: finalTotal,
      paymentMethod,
      paymentStatus: paymentMethod === "PAYOS" ? "awaiting_payment" : "pending",
      orderStatus: "pending",
      items: orderItems,
    });

    await newOrder.save();

    if (paymentMethod === "PAYOS") {
      const checkoutUrl = await createPaymentLink({
        orderCode,
        totalAmount: finalTotal,
        fullName,
        phone,
        orderId: newOrder._id.toString(),
      });

      return res.status(200).json({
        message: "PayOS payment link created",
        status: "Success",
        data: {
          checkoutUrl,
          orderId: newOrder._id,
        },
      });
    }

    for (const item of orderItems) {
      await Book.findByIdAndUpdate(item.book, {
        $inc: { stockQuantity: -item.quantity },
      });
    }

    cart.items = [];
    await cart.save();

    const populatedOrder = await Order.findById(newOrder._id)
      .populate("items.book", "title sellingPrice images")
      .populate("user", "email customerInfo.fullName");

    return res.status(201).json({
      message: "Order created successfully",
      status: "Success",
      data: populatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: "Error",
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
      .populate("items.book", "title sellingPrice images")
      .populate("user", "email customerInfo.fullName")
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
// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.account.role !== "admin") {
      query.user = req.account._id;
    }

    const order = await Order.findOne(query)
      .populate("items.book", "title sellingPrice images")
      .populate("user", "email customerInfo.fullName");

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

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    if (!orderStatus && !paymentStatus) {
      return res.status(400).json({
        message: "Order status or payment status is required",
        status: "Error",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        status: "Error",
      });
    }

    // Validate order status
    if (
      orderStatus &&
      !["pending", "shipping", "completed", "cancelled"].includes(orderStatus)
    ) {
      return res.status(400).json({
        message: "Invalid order status",
        status: "Error",
      });
    }

    // Validate payment status
    if (
      paymentStatus &&
      !["pending", "paid", "failed"].includes(paymentStatus)
    ) {
      return res.status(400).json({
        message: "Invalid payment status",
        status: "Error",
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
          $inc: { stockQuantity: item.quantity },
        });
      }
    }

    // Populate order details
    const updatedOrder = await Order.findById(order._id)
      .populate("items.book", "title sellingPrice images")
      .populate("user", "email customerInfo.fullName");

    res.status(200).json({
      message: "Update order status successfully",
      status: "Success",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
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
    if (order.paymentStatus === "paid") {
      return res.status(200).json({
        message: "Order already paid",
        status: "Success",
        data: order,
      });
    }
    // Optionally, verify with PayOS API
    // const payosStatus = await payos.getOrderStatus(order.orderCode);
    // if (payosStatus.status !== 'PAID') { ... }
    order.paymentStatus = "paid";
    order.orderStatus = "pending";
    await order.save();
    // Reduce stock
    for (const item of order.items) {
      await Book.findByIdAndUpdate(item.book, {
        $inc: { stockQuantity: -item.quantity },
      });
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
    console.log("[PayOS Cancel] Cancel request for orderId:", orderId);
    const order = await Order.findById(orderId);
    if (!order) {
      console.error("[PayOS Cancel] Order not found:", orderId);
      return res
        .status(404)
        .json({ message: "Order not found", status: "Error" });
    }
    if (
      order.paymentStatus === "failed" ||
      order.paymentStatus === "cancelled"
    ) {
      console.log("[PayOS Cancel] Order already cancelled:", orderId);
      return res.status(200).json({
        message: "Order already cancelled",
        status: "Success",
        data: order,
      });
    }
    order.paymentStatus = "failed";
    order.orderStatus = "cancelled";
    await order.save();
    // Optionally, restore stock
    for (const item of order.items) {
      await Book.findByIdAndUpdate(item.book, {
        $inc: { stockQuantity: item.quantity },
      });
    }
    console.log("[PayOS Cancel] Order cancelled and stock restored:", orderId);
    return res.status(200).json({
      message: "Order payment cancelled",
      status: "Success",
      data: order,
    });
  } catch (error) {
    console.error("[PayOS Cancel] Error:", error);
    return res.status(500).json({ message: error.message, status: "Error" });
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
};
