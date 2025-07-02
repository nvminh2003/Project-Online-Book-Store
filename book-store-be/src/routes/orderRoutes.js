const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { checkAuthMiddleware, authorizeRole } = require("../middleware/authMiddleware");
const A = require('../utils/actionTypes');
const checkPermission = require("../middleware/checkPermission");

// --- PayOS webhook and callbacks (no auth required) ---
router.post("/payos/webhook", orderController.payosWebhook);
router.get("/payos/success/:orderId", orderController.handlePayosSuccess);
router.get("/payos/cancel/:orderId", orderController.handlePayosCancel);

// All order routes below require authentication
router.use(checkAuthMiddleware);

// PayOS status endpoints
router.get("/payos/payment-status", orderController.getPayosPaymentStatus);
router.get("/payos/order-status", orderController.getPayosOrderStatus);

// Public routes (authenticated users)
router.post("/", orderController.createOrder);

// Customer routes
router.get('/my-orders',
    authorizeRole(['customer']),
    orderController.getUserOrders
);
router.get('/:id/detail',
    authorizeRole(['adminbusiness', 'customer']),
    orderController.getOrderById
);
router.get(
    "/:id",
    authorizeRole(["adminbusiness", "customer"]),
    orderController.getOrderById
);

// Admin routes
router.get("/",
    authorizeRole(['adminbusiness']),
    orderController.getAllOrders
);
router.patch(
    "/update-order-status/:id",
    authorizeRole(['adminbusiness']),
    checkPermission(A.UPDATE_ORDER_STATUS),
    orderController.updateOrderStatus
);
router.patch(
    "/update-payment-status/:id",
    authorizeRole(['adminbusiness']),
    checkPermission(A.UPDATE_PAYMENT_STATUS),
    orderController.updatePaymentStatus
);
router.get(
    "/export/excel",
    authorizeRole(['adminbusiness']),
    orderController.exportOrdersToExcel
);
module.exports = router;
