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
const mongoose = require("mongoose");

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
  // IMPORTANT: Transactions are disabled for standalone MongoDB instances.
  // For production, use a replica set and re-enable transactions.
  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    const { fullName, phone, address, discountCode, paymentMethod, note } =
      req.body;

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
      if (!book || book.isDeleted || !book.isPublished) {
        return res.status(400).json({
          message: `Book with id ${item.book} is not available.`,
          status: "Error",
        });
      }

      if (book.stockQuantity < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for book: ${book.title}`,
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

    const shippingFee = 30000;
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
      paymentStatus: paymentMethod === "PAYOS" ? "awaiting_payment" : "pending",
      orderStatus: "pending",
      items: orderItems,
    });

    // await newOrder.save({ session });
    await newOrder.save();

    // Atomically update stock for each book
    for (const item of orderItems) {
      await Book.updateOne(
        { _id: item.book },
        { $inc: { stockQuantity: -item.quantity } }
        // { session }
      );
    }

    if (appliedDiscount) {
      appliedDiscount.usesCount += 1;
      // await appliedDiscount.save({ session });
      await appliedDiscount.save();
    }

    // Clear the user's cart
    cart.items = [];
    cart.coupon = null;
    cart.subtotal = 0;
    // await cart.save({ session });
    await cart.save();

    // await session.commitTransaction();
    // session.endSession();

    if (paymentMethod === "PAYOS") {
      try {
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
      } catch (error) {
        // If PayOS fails, we should ideally roll back the order creation.
        // Since transactions are disabled, this part is tricky.
        // For now, we log the error and inform the user.
        console.error(
          "PayOS link creation failed after order creation:",
          error
        );
        return res.status(500).json({
          message:
            "Order created, but failed to generate payment link. Please contact support.",
          status: "Error",
        });
      }
    } else {
      return res.status(201).json({
        message: "Order created successfully with COD",
        status: "Success",
        data: { orderId: newOrder._id },
      });
    }
  } catch (error) {
    // if (session) {
    //   await session.abortTransaction();
    //   session.endSession();
    // }
    console.error("Order creation failed:", error);
    return res.status(500).json({
      message: `Order creation failed: ${error.message}`,
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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderStatus, paymentStatus } = req.body;

    if (!orderStatus && !paymentStatus) {
      return res.status(400).json({
        message: "Order status or payment status is required",
        status: "Error",
      });
    }

    const order = await Order.findById(req.params.id).session(session);

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

    // If order is cancelled, return stock
    if (orderStatus === "cancelled" && order.orderStatus !== "cancelled") {
      const bulkOps = order.items.map((item) => ({
        updateOne: {
          filter: { _id: item.book },
          update: { $inc: { stockQuantity: item.quantity } },
        },
      }));
      await Book.bulkWrite(bulkOps, { session });
    }

    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

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
    await session.abortTransaction();
    session.endSession();
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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ message: "Order not found", status: "Error" });
    }
    if (order.paymentStatus === "paid") {
      await session.abortTransaction();
      session.endSession();
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
    order.orderStatus = "pending"; // Or some other status like 'processing'

    // Reduce stock atomically
    const bulkOps = order.items.map((item) => ({
      updateOne: {
        filter: { _id: item.book, stockQuantity: { $gte: item.quantity } },
        update: { $inc: { stockQuantity: -item.quantity } },
      },
    }));

    const result = await Book.bulkWrite(bulkOps, { session });

    // Check if all stock updates were successful
    if (result.modifiedCount !== order.items.length) {
      await session.abortTransaction();
      session.endSession();
      // Handle stock unavailability issue, e.g., by refunding the user
      order.orderStatus = "failed";
      order.paymentStatus = "refund_pending"; // Custom status
      await order.save(); // Save outside transaction
      return res.status(400).json({
        message:
          "Order could not be processed due to insufficient stock. Please contact support.",
        status: "Error",
      });
    }

    await order.save({ session });

    // Clear the cart
    const cart = await Cart.findOne({ user: order.user }).session(session);
    if (cart) {
      cart.items = [];
      await cart.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Order payment successful",
      status: "Success",
      data: order,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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
