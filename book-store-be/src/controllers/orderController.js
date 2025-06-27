// Required models and libraries
const Order = require("../models/orderModel");
const Book = require("../models/bookModel");
const Cart = require("../models/cartModel");
const DiscountCode = require("../models/discountCodeModel");
const AdminActivityLog = require("../models/AdminActivityLog");
const { sendOrderConfirmationEmail } = require("../utils/emailService");
const Account = require("../models/accountModel");

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
// const createOrder = async (req, res) => {
//   try {
//     const { fullName, phone, address, discountCode, paymentMethod, note, items } = req.body;

//     if (!fullName || !phone || !address || !paymentMethod || !items || !Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({
//         message: "Họ tên, số điện thoại, địa chỉ, phương thức thanh toán và danh sách sản phẩm là bắt buộc.",
//         status: "Error",
//       });
//     }

//     if (!["COD", "PAYOS"].includes(paymentMethod)) {
//       return res.status(400).json({
//         message: "Phương thức thanh toán không hợp lệ.",
//         status: "Error",
//       });
//     }

//     // Lấy danh sách book từ DB
//     const bookIds = items.map(item => item.book);
//     const books = await Book.find({ _id: { $in: bookIds } });
//     const bookMap = new Map(books.map(book => [book._id.toString(), book]));

//     let totalAmount = 0;
//     const orderItems = [];

//     for (const item of items) {
//       const book = bookMap.get(item.book.toString());
//       if (!book) {
//         return res.status(400).json({
//           message: `Sách với ID ${item.book} không tồn tại.`,
//           status: "Error",
//         });
//       }

//       if (book.stockQuantity < item.quantity) {
//         return res.status(400).json({
//           message: `Sách "${book.title}" không đủ số lượng trong kho.`,
//           status: "Error",
//         });
//       }

//       orderItems.push({
//         book: book._id,
//         quantity: item.quantity,
//         price: book.sellingPrice
//       });

//       totalAmount += book.sellingPrice * item.quantity;
//     }

//     // Xử lý mã giảm giá
//     let discountAmount = 0;
//     let appliedDiscount = null;

//     if (discountCode) {
//       const discount = await DiscountCode.findOne({
//         code: discountCode,
//         isActive: true,
//         startDate: { $lte: new Date() },
//         endDate: { $gte: new Date() },
//       });

//       if (!discount) {
//         return res.status(400).json({ message: "Mã giảm giá không hợp lệ hoặc đã hết hạn.", status: "Error" });
//       }

//       if (discount.maxUses && discount.usesCount >= discount.maxUses) {
//         return res.status(400).json({ message: "Mã giảm giá đã đạt số lượt sử dụng tối đa.", status: "Error" });
//       }

//       appliedDiscount = discount;
//       discountAmount = discount.type === "percent" ? (totalAmount * discount.value) / 100 : discount.value;
//       discountAmount = Math.min(discountAmount, totalAmount); // Không vượt quá tổng
//     }

//     const shippingFee = 30000;
//     const finalTotal = totalAmount - discountAmount + shippingFee;
//     const orderCode = generateOrderCode();

//     const newOrder = new Order({
//       user: req.account._id,
//       orderCode,
//       fullName,
//       phone,
//       address,
//       note,
//       discountCode: appliedDiscount?.code || null,
//       discountAmount,
//       shippingFee,
//       totalAmount: finalTotal,
//       paymentMethod,
//       paymentStatus: paymentMethod === "PAYOS" ? "awaiting_payment" : "pending",
//       orderStatus: "pending",
//       items: orderItems
//     });

//     await newOrder.save();

//     // Trừ kho
//     for (const item of orderItems) {
//       await Book.updateOne({ _id: item.book }, { $inc: { stockQuantity: -item.quantity } });
//     }

//     if (appliedDiscount) {
//       appliedDiscount.usesCount += 1;
//       await appliedDiscount.save();
//     }

//     // Gửi email (populate để có tên sản phẩm)
//     const user = await Account.findById(req.account._id);
//     const populatedOrder = await Order.findById(newOrder._id).populate('items.book');
//     if (user?.email) {
//       await sendOrderConfirmationEmail(user.email, populatedOrder);
//     }

//     // Xử lý trả về
//     if (paymentMethod === "PAYOS") {
//       try {
//         const checkoutUrl = await createPaymentLink({
//           orderCode,
//           totalAmount: finalTotal,
//           fullName,
//           phone,
//           orderId: newOrder._id.toString(),
//         });

//         return res.status(200).json({
//           message: "Tạo link thanh toán thành công",
//           status: "Success",
//           data: {
//             checkoutUrl,
//             orderId: newOrder._id,
//           },
//         });
//       } catch (err) {
//         return res.status(500).json({
//           message: "Tạo đơn hàng thành công nhưng lỗi khi tạo link thanh toán.",
//           status: "Error",
//         });
//       }
//     }

//     return res.status(201).json({
//       message: "Tạo đơn hàng thành công",
//       status: "Success",
//       data: { orderId: newOrder._id },
//     });

//   } catch (error) {
//     console.error("Lỗi khi tạo đơn hàng:", error);
//     return res.status(500).json({
//       message: `Lỗi máy chủ: ${error.message}`,
//       status: "Error",
//     });
//   }
// };

const createOrder = async (req, res) => {
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
      if (!book) {
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

    await newOrder.save();

    // Atomically update stock for each book
    for (const item of orderItems) {
      await Book.updateOne(
        { _id: item.book },
        { $inc: { stockQuantity: -item.quantity } }
      );
    }

    if (appliedDiscount) {
      appliedDiscount.usesCount += 1;
      await appliedDiscount.save();
    }

    // Clear the user's cart
    cart.items = [];
    cart.coupon = null;
    cart.subtotal = 0;
    await cart.save();

    if (paymentMethod === "PAYOS") {
      try {
        const checkoutUrl = await createPaymentLink({
          orderCode,
          totalAmount: finalTotal,
          fullName,
          phone,
          orderId: newOrder._id.toString(),
        });

        // Gửi email (populate để có tên sản phẩm)
        const user = await Account.findById(req.account._id);
        const populatedOrder = await Order.findById(newOrder._id).populate('items.book');
        if (user?.email) {
          await sendOrderConfirmationEmail(user.email, populatedOrder);
        }

        return res.status(200).json({
          message: "PayOS payment link created",
          status: "Success",
          data: {
            checkoutUrl,
            orderId: newOrder._id,
          },
        });
      } catch (error) {
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
      // Gửi email (populate để có tên sản phẩm)
      const user = await Account.findById(req.account._id);
      const populatedOrder = await Order.findById(newOrder._id).populate('items.book');
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
        message: `Không thể cập nhật đơn hàng đã ở trạng thái "${order.orderStatus}".`,
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
  updatePaymentStatus,
};
