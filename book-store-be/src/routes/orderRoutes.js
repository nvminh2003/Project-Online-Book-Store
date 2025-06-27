const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { checkAuthMiddleware, authorizeRole } = require("../middleware/authMiddleware");
const A = require('../utils/actionTypes');
const checkPermission = require("../middleware/checkPermission");

// --- PayOS webhook (no auth) ---
router.post("/payos/webhook", orderController.payosWebhook);

// All order routes below require authentication
router.use(checkAuthMiddleware);

// PayOS status endpoints
router.get("/payos/payment-status", orderController.getPayosPaymentStatus);
router.get("/payos/order-status", orderController.getPayosOrderStatus);

// Public routes (authenticated users)
router.post("/", orderController.createOrder);
router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);

// PayOS checkout success/cancel handlers
router.get("/payos/success/:orderId", orderController.handlePayosSuccess);
router.get("/payos/cancel/:orderId", orderController.handlePayosCancel);

// Admin only routes
router.patch(
    "/update-order-status/:id",
    checkAuthMiddleware,
    authorizeRole(['adminbusiness']),
    checkPermission(A.UPDATE_ORDER_STATUS),
    orderController.updateOrderStatus
);
router.patch(
    "/update-payment-status/:id",
    checkAuthMiddleware,
    authorizeRole(['adminbusiness']),
    checkPermission(A.UPDATE_PAYMENT_STATUS),
    orderController.updatePaymentStatus
);

module.exports = router;
