const express = require("express");
const router = express.Router();
const discountCodeController = require("../controllers/discountCodeController");
const {
  authorizeRole,
  checkAuthMiddleware,
} = require("../middleware/authMiddleware");

// Public routes (for validation only)
router.post("/validate", discountCodeController.validateDiscountCode);

// Temporary test route to verify routing works
router.get("/test", (req, res) => {
  res.json({ message: "Discount routes are working", timestamp: new Date() });
});

// Authenticated user routes
router.post(
  "/apply",
  checkAuthMiddleware,
  discountCodeController.applyDiscountCode
);

// Admin routes (require authentication and proper role)
// Temporarily relaxed for debugging
router.get(
  "/",
  (req, res, next) => {
    console.log("Discount codes GET route hit");
    console.log("Headers:", req.headers.authorization);
    next();
  },
  authorizeRole(["superadmin", "adminbusiness"]),
  discountCodeController.getAllDiscountCodes
);
router.get(
  "/:id",
  authorizeRole(["superadmin", "adminbusiness"]),
  discountCodeController.getDiscountCodeById
);

// Admin only routes
router.post(
  "/",
  authorizeRole(["superadmin", "adminbusiness"]),
  discountCodeController.createDiscountCode
);
router.put(
  "/:id",
  authorizeRole(["superadmin", "adminbusiness"]),
  discountCodeController.updateDiscountCode
);
router.delete(
  "/:id",
  authorizeRole(["superadmin", "adminbusiness"]),
  discountCodeController.deleteDiscountCode
);

// Advanced admin routes
router.get(
  "/:id/analytics",
  authorizeRole(["superadmin", "adminbusiness"]),
  discountCodeController.getDiscountAnalytics
);
router.post(
  "/bulk",
  authorizeRole(["superadmin", "adminbusiness"]),
  discountCodeController.bulkUpdateDiscountCodes
);
router.get(
  "/analytics",
  authorizeRole(["superadmin", "adminbusiness"]),
  discountCodeController.getDiscountAnalytics
);
router.get(
  "/statistics",
  authorizeRole(["superadmin", "adminbusiness"]),
  discountCodeController.getDiscountStatistics
);
router.post(
  "/generate",
  authorizeRole(["superadmin", "adminbusiness"]),
  discountCodeController.generateDiscountCodes
);

module.exports = router;
