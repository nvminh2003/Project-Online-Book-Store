const Book = require("../models/bookModel");
const AdminActivityLog = require("../models/AdminActivityLog");
const Category = require("../models/categoryModel");
// Create a new book (Admin only)

const mongoose = require("mongoose"); // Thêm nếu chưa import ở đầu file

// Create a new book (Admin only)
const createBook = async (req, res) => {
  try {
    const {
      title,
      authors,
      publisher,
      publicationYear,
      pageCount,
      coverType,
      description,
      images,
      isbn,
      originalPrice,
      sellingPrice,
      stockQuantity,
      isFeatured,
      isNewArrival,
      categories,
    } = req.body;

    console.log("body: ", req.body);

    if (
      !title ||
      !authors ||
      !publisher ||
      !originalPrice ||
      !sellingPrice ||
      !stockQuantity
    ) {
      return res.status(400).json({
        message: "Missing required fields",
        status: "Error",
      });
    }

    function removeVietnameseTones(str) {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
    }

    const slug = removeVietnameseTones(title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newBook = new Book({
      title,
      slug,
      authors,
      publisher,
      publicationYear,
      pageCount,
      coverType,
      description,
      images,
      isbn,
      originalPrice,
      sellingPrice,
      stockQuantity,
      isFeatured: isFeatured || false,
      isNewArrival: isNewArrival || false,
      categories: categories.map((id) => new mongoose.Types.ObjectId(id)),
      createdBy: req.account?._id, // sẽ undefined nếu bạn chưa có login, có thể bỏ nếu chưa cần
    });

    await newBook.save();

    await AdminActivityLog.create({
      adminId: req.account._id,
      action: "CREATE_BOOK",
      details: `Admin ${req.account.email} created book ${newBook.title} (ID: ${newBook._id})`,
    });

    res.status(201).json({
      message: "Book created successfully",
      status: "Success",
      data: newBook,
    });
  } catch (error) {
    console.error("Error creating book:", error.stack);
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Get all books with pagination
const getAllBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .populate("categories")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments();

    res.status(200).json({
      message: "Get books successfully",
      status: "Success",
      data: {
        books,
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

// Search books
const searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const searchQuery = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { authors: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { publisher: { $regex: query, $options: "i" } },
      ],
    };

    const books = await Book.find(searchQuery)
      .populate("categories")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments(searchQuery);

    res.status(200).json({
      message: "Search books successfully",
      status: "Success",
      data: {
        books,
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

// Get book by ID
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("categories");

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
        status: "Error",
      });
    }

    res.status(200).json({
      message: "Get book successfully",
      status: "Success",
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Update book (Admin only)
const updateBook = async (req, res) => {
    // Kiểm tra ISBN trùng với sách khác (không phải sách đang sửa)
  try {
    const {
      title,
      authors,
      publisher,
      publicationYear,
      pageCount,
      coverType,
      description,
      images,
      isbn,
      originalPrice,
      sellingPrice,
      stockQuantity,
      isFeatured,
      isNewArrival,
      categories,
    } = req.body;

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        message: "Book not found",
        status: "Error",
      });
    }

    // Kiểm tra ISBN trùng với sách khác (không phải sách đang sửa)
    if (isbn && isbn !== book.isbn) {
      const existed = await Book.findOne({ isbn: isbn, _id: { $ne: new mongoose.Types.ObjectId(req.params.id) } });
      if (existed) {
        return res.status(400).json({
          message: "ISBN đã tồn tại cho một sách khác.",
          status: "Error",
        });
      }
    }

    // Generate new slug if title is changed
    const slug =
      title !== book.title
        ? title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
        : book.slug;

    // Update book fields
    const updatedFields = {
      title: title || book.title,
      slug,
      authors: authors || book.authors,
      publisher: publisher || book.publisher,
      publicationYear: publicationYear || book.publicationYear,
      pageCount: pageCount || book.pageCount,
      coverType: coverType || book.coverType,
      description: description || book.description,
      images: images || book.images,
      isbn: isbn || book.isbn,
      originalPrice: originalPrice || book.originalPrice,
      sellingPrice: sellingPrice || book.sellingPrice,
      stockQuantity: stockQuantity || book.stockQuantity,
      isFeatured: isFeatured !== undefined ? isFeatured : book.isFeatured,
      isNewArrival:
        isNewArrival !== undefined ? isNewArrival : book.isNewArrival,
      categories: categories || book.categories,
      updatedBy: req.account._id,
    };

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    ).populate("categories");
    await AdminActivityLog.create({
      adminId: req.account._id,
      action: "UPDATE_BOOK",
      details: `Admin ${req.account.email} updated account ${updatedBook.title} (ID: ${updatedBook._id})`,
    });

    res.status(200).json({
      message: "Book updated successfully",
      status: "Success",
      data: updatedBook,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
        status: "Error",
      });
    }

    await Book.findByIdAndDelete(req.params.id);
    await AdminActivityLog.create({
      adminId: req.account._id,
      action: "DELETE_BOOK",
      details: `Admin ${req.account.email} updated account ${book.title} (ID: ${book._id})`,
    });

    res.status(200).json({
      message: "Book deleted successfully",
      status: "Success",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};
const uploadBooksFromExcel = async (req, res) => {
  try {
    const books = req.body.books;
    if (!Array.isArray(books)) {
      return res.status(400).json({ message: "Invalid books data", status: "Error" });
    }

    function removeVietnameseTones(str) {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
    }

    // Các trường bắt buộc theo bookModel.js
    const requiredFields = [
      "title", "authors", "publisher", "publicationYear", "pageCount", "coverType", "description", "images", "isbn", "originalPrice", "sellingPrice", "stockQuantity", "categories"
    ];

    const createdBooks = [];
    const errors = [];

    for (const [idx, book] of books.entries()) {
      const excelRow = idx + 2; // Hàng đầu tiên là header, dữ liệu bắt đầu từ hàng 2
      // Validate đủ trường
      const missingFields = requiredFields.filter(f => !book[f] || (Array.isArray(book[f]) ? book[f].length === 0 : String(book[f]).trim() === ""));
      if (missingFields.length > 0) {
        errors.push({
          row: excelRow,
          title: book.title || "(Không có tiêu đề)",
          error: `Thiếu trường: ${missingFields.join(", ")}`
        });
        continue;
      }

      // Kiểm tra ISBN trùng
      const isbn = String(book.isbn).trim();
      if (!isbn) {
        errors.push({ row: excelRow, title: book.title || "(Không có tiêu đề)", error: "ISBN không hợp lệ" });
        continue;
      }
      const existed = await Book.findOne({ isbn });
      if (existed) {
        errors.push({ row: excelRow, title: book.title || "(Không có tiêu đề)", error: "ISBN đã tồn tại" });
        continue;
      }

      // Xử lý images đảm bảo đúng kiểu mảng chuỗi
      let imageArray = [];
      if (typeof book.images === "string") {
        imageArray = book.images.split(",").map((img) => img.trim()).filter(Boolean);
      } else if (Array.isArray(book.images)) {
        imageArray = book.images.map((img) => String(img).trim()).filter(Boolean);
      }
      if (!Array.isArray(imageArray) || imageArray.length === 0) {
        errors.push({ row: excelRow, title: book.title || "(Không có tiêu đề)", error: "Ảnh sách không hợp lệ" });
        continue;
      }

      // Xử lý categories từ slug
      let categoryIds = [];
      if (book.categories) {
        let categorySlugs = Array.isArray(book.categories)
          ? book.categories.map((c) => String(c).trim())
          : String(book.categories).split(",").map((c) => c.trim());
        const foundCategories = await Category.find({ slug: { $in: categorySlugs } });
        categoryIds = foundCategories.map((cat) => cat._id);
        if (categoryIds.length === 0) {
          errors.push({ row: excelRow, title: book.title || "(Không có tiêu đề)", error: "Không tìm thấy danh mục hợp lệ" });
          continue;
        }
      }

      // Parse các trường số
      const publicationYear = parseInt(book.publicationYear);
      const pageCount = parseInt(book.pageCount);
      const originalPrice = parseFloat(book.originalPrice);
      const sellingPrice = parseFloat(book.sellingPrice);
      const stockQuantity = parseInt(book.stockQuantity);
      if (
        isNaN(publicationYear) || publicationYear <= 0 ||
        isNaN(pageCount) || pageCount <= 0 ||
        isNaN(originalPrice) || originalPrice <= 0 ||
        isNaN(sellingPrice) || sellingPrice <= 0 ||
        isNaN(stockQuantity) || stockQuantity < 0
      ) {
        errors.push({ row: excelRow, title: book.title || "(Không có tiêu đề)", error: "Giá trị số không hợp lệ" });
        continue;
      }

      const slug = removeVietnameseTones(book.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const newBook = new Book({
        title: book.title,
        slug,
        authors: Array.isArray(book.authors) ? book.authors : String(book.authors).split(",").map((a) => a.trim()),
        publisher: book.publisher,
        publicationYear,
        pageCount,
        coverType: book.coverType,
        description: book.description,
        images: imageArray,
        isbn,
        originalPrice,
        sellingPrice,
        stockQuantity,
        isFeatured: book.isFeatured || false,
        isNewArrival: book.isNewArrival || false,
        categories: categoryIds,
        createdBy: req.account._id,
      });

      await newBook.save();
      await AdminActivityLog.create({
        adminId: req.account._id,
        action: "CREATE_BOOK",
        details: `Admin ${req.account.email} imported book "${newBook.title}" (ID: ${newBook._id}) via Excel`,
      });
      createdBooks.push(newBook);
    }

    res.status(201).json({
      message: `Import hoàn tất. Đã thêm ${createdBooks.length} sách, ${errors.length} sách chưa được thêm.`,
      status: errors.length > 0 ? "PartialSuccess" : "Success",
      data: createdBooks,
      errors,
    });
  } catch (err) {
    console.error("❌ Lỗi import Excel:", err);
    res.status(500).json({
      message: err.message,
      status: "Error",
    });
  }
};

module.exports = {
  createBook,
  getAllBooks,
  searchBooks,
  getBookById,
  updateBook,
  deleteBook,
  uploadBooksFromExcel,
};
