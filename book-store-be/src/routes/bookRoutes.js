const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const { authorizeRole, checkAuthMiddleware } = require("../middleware/authMiddleware");
const A = require('../utils/actionTypes');
const checkPermission = require('../middleware/checkPermission');

// Public routes
router.get("/", bookController.getAllBooks);
router.get("/search", bookController.searchBooks);
router.get("/featured", bookController.getFeaturedBooks);
router.get("/new-arrivals", bookController.getNewArrivalBooks);
router.get("/:id", bookController.getBookById);

// Admin only routes
router.post(
  "/", checkAuthMiddleware,
  authorizeRole(["admindev"]), checkPermission(A.CREATE_BOOK),
  bookController.createBook
);
router.put(
  "/:id", checkAuthMiddleware,
  authorizeRole(['admindev']), checkPermission(A.UPDATE_BOOK),
  bookController.updateBook
);
router.delete(
  "/:id", checkAuthMiddleware,
  authorizeRole(['admindev']), checkPermission(A.DELETE_BOOK),
  bookController.deleteBook
);
router.post(
  "/upload-excel", checkAuthMiddleware,
  authorizeRole(['admindev']), checkPermission(A.CREATE_BOOK),
  bookController.uploadBooksFromExcel
);

module.exports = router;
