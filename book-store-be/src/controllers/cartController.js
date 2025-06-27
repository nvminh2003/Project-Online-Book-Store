const Cart = require("../models/cartModel");
const Book = require("../models/bookModel");

// Helper function to populate cart with book and user details
const populateCart = async (cartId) => {
  return await Cart.findById(cartId)
    .populate(
      "items.book",
      "title sellingPrice images authors publisher stockQuantity"
    )
    .populate("user", "email customerInfo.fullName");
};

// Helper function to calculate total price safely
const calculateTotal = (items) => {
  return items.reduce((sum, item) => {
    // Handle case where item.book might be null (e.g., deleted book)
    const price = item.book ? item.book.sellingPrice : 0;
    return sum + price * item.quantity;
  }, 0);
};

// Get cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.account._id });
    if (!cart) {
      cart = new Cart({ user: req.account._id, items: [] });
      await cart.save();
    }

    cart = await populateCart(cart._id);

    const total = calculateTotal(cart.items);

    return res.status(200).json({
      message: "Get cart successfully",
      status: "Success",
      data: {
        ...cart.toObject(),
        total,
      },
    });
  } catch (error) {
    console.error(error);
    const message =
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message;
    return res.status(500).json({
      message,
      status: "Error",
    });
  }
};

const mongoose = require("mongoose");
// Add multiple items to cart (atomic, gộp trùng, kiểm tra tồn kho, validate book, transaction)
const addToCart = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 1. Gộp các item trùng bookId
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Items array is required", status: "Error" });
    }
    const normalizedItems = items.reduce((acc, curr) => {
      const found = acc.find((i) => i.bookId === curr.bookId);
      if (found) found.quantity += curr.quantity;
      else acc.push({ ...curr });
      return acc;
    }, []);

    // 2. Validate all items
    for (const item of normalizedItems) {
      if (!item.bookId || !item.quantity || item.quantity <= 0) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({
            message: "Each item must have bookId and quantity > 0",
            status: "Error",
          });
      }
    }

    // 3. Lấy tất cả bookId và truy vấn 1 lần
    const bookIds = normalizedItems.map((i) => i.bookId);
    const books = await Book.find({ _id: { $in: bookIds } }).session(session);
    const bookMap = {};
    books.forEach((b) => {
      bookMap[b._id.toString()] = b;
    });

    // 4. Kiểm tra tồn kho, trạng thái, loại bỏ sách không hợp lệ
    for (const item of normalizedItems) {
      const book = bookMap[item.bookId];
      if (!book) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(404)
          .json({ message: `Book not found: ${item.bookId}`, status: "Error" });
      }
      // Kiểm tra trạng thái sách (isAvailable, isHidden, deletedAt)
      if (book.isHidden || book.deletedAt || book.isAvailable === false) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({
            message: `Book is not available: ${book.title}`,
            status: "Error",
          });
      }
      if (book.stockQuantity < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({
            message: `Not enough stock for book: ${book.title}`,
            status: "Error",
          });
      }
    }

    // 5. Lấy hoặc tạo cart
    let cart = await Cart.findOne({ user: req.account._id }).session(session);
    if (!cart) cart = new Cart({ user: req.account._id, items: [] });

    // 6. Thêm/gộp từng item vào cart
    for (const item of normalizedItems) {
      const book = bookMap[item.bookId];
      const existingItem = cart.items.find(
        (i) => i.book.toString() === item.bookId
      );
      if (existingItem) {
        if (book.stockQuantity < existingItem.quantity + item.quantity) {
          await session.abortTransaction();
          session.endSession();
          return res
            .status(400)
            .json({
              message: `Not enough stock for book: ${book.title}`,
              status: "Error",
            });
        }
        existingItem.quantity += item.quantity;
      } else {
        cart.items.push({ book: item.bookId, quantity: item.quantity });
      }
    }

    await cart.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Populate book details and calculate total
    let populatedCart = await Cart.findById(cart._id)
      .populate(
        "items.book",
        "title sellingPrice images authors publisher stockQuantity isHidden isAvailable deletedAt"
      )
      .populate("user", "email customerInfo.fullName");
    // Lọc các item có book == null (sách đã xoá)
    populatedCart.items = populatedCart.items.filter((item) => item.book);
    const total = calculateTotal(populatedCart.items);

    return res.status(201).json({
      message: "Add to cart successfully",
      status: "Success",
      data: { ...populatedCart.toObject(), total },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ message: error.message, status: "Error" });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || !Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        message: "Valid quantity is required (0 or positive integer)",
        status: "Error",
      });
    }

    const cart = await Cart.findOne({ user: req.account._id });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
        status: "Error",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.book.toString() === bookId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        message: "Item not found in cart",
        status: "Error",
      });
    }

    // Check stock if updating quantity
    if (quantity > 0) {
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({
          message: "Book not found",
          status: "Error",
        });
      }

      if (book.stockQuantity < quantity) {
        return res.status(400).json({
          message: "Not enough stock available",
          status: "Error",
        });
      }
    }

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    const updatedCart = await populateCart(cart._id);

    const total = calculateTotal(updatedCart.items);

    return res.status(200).json({
      message: "Update cart successfully",
      status: "Success",
      data: {
        ...updatedCart.toObject(),
        total,
      },
    });
  } catch (error) {
    console.error(error);
    const message =
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message;
    return res.status(500).json({
      message,
      status: "Error",
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { bookId } = req.params;

    const cart = await Cart.findOne({ user: req.account._id });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
        status: "Error",
      });
    }

    cart.items = cart.items.filter((item) => item.book.toString() !== bookId);

    await cart.save();

    const updatedCart = await populateCart(cart._id);

    const total = calculateTotal(updatedCart.items);

    return res.status(200).json({
      message: "Remove from cart successfully",
      status: "Success",
      data: {
        ...updatedCart.toObject(),
        total,
      },
    });
  } catch (error) {
    console.error(error);
    const message =
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message;
    return res.status(500).json({
      message,
      status: "Error",
    });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.account._id });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
        status: "Error",
      });
    }

    cart.items = [];
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      "user",
      "email customerInfo.fullName"
    );

    return res.status(200).json({
      message: "Clear cart successfully",
      status: "Success",
      data: {
        ...updatedCart.toObject(),
        total: 0,
      },
    });
  } catch (error) {
    console.error(error);
    const message =
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message;
    return res.status(500).json({
      message,
      status: "Error",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
