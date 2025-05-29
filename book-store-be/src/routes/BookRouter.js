const express = require("express");
const router = express.Router();
// const BookController = require("../controllers/BookController");

// // Lấy tất cả sách
// router.get("/", BookController.getAllBooks);

// // Lấy 1 sách theo ID
// router.get("/:id", BookController.getBookById);

// // Tạo mới sách
// router.post("/", BookController.createBook);

// // Cập nhật sách
// router.put("/:id", BookController.updateBook);

// // Xoá sách
// router.delete("/:id", BookController.deleteBook);
router.get("/", (req, res) => {
    res.send("GET revenue");
});

module.exports = router;
