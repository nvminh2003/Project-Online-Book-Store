// Required models and libraries
const Cart = require("../models/cartModel");
const Book = require("../models/bookModel");
const mongoose = require("mongoose");

// Helper function to populate cart with book and user details
const populateCart = async (cartId) => {
  return await Cart.findById(cartId)
    .populate(
      "items.book",
      // Removed non-existent fields isPublished and isDeleted
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

    const populatedCart = await populateCart(cart._id);

    if (!populatedCart) {
      return res
        .status(404)
        .json({ message: "Cart not found", status: "Error" });
    }

    const originalItemCount = populatedCart.items.length;

    // Filter out items that are unavailable (book doesn't exist or has zero stock)
    const validItems = populatedCart.items.filter(
      (item) => item.book && item.book.stockQuantity > 0
    );

    const itemsRemoved = originalItemCount !== validItems.length;
    let message = "Get cart successfully";

    // If items were removed, update the cart in the DB and set a message
    if (itemsRemoved) {
      cart.items = validItems.map((item) => ({
        book: item.book._id,
        quantity: item.quantity,
      }));
      await cart.save();
      message =
        "Cart updated. Some items were removed as they are no longer available.";
    }

    // Recalculate total with only valid items
    const total = calculateTotal(validItems);

    // The populated cart object to be returned
    const cartToReturn = {
      ...populatedCart.toObject(),
      items: validItems, // Return the filtered list of items
      total,
    };

    return res.status(200).json({
      message,
      status: "Success",
      data: cartToReturn,
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

// Add multiple items to cart (atomic, gộp trùng, kiểm tra tồn kho, validate book)
const addToCart = async (req, res) => {
  try {
    // 1. Gộp các item trùng bookId
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (items.length === 0) {
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
        return res.status(400).json({
          message: "Each item must have bookId and quantity > 0",
          status: "Error",
        });
      }
    }

    // 3. Lấy tất cả bookId và truy vấn 1 lần
    const bookIds = normalizedItems.map((i) => i.bookId);
    const books = await Book.find({ _id: { $in: bookIds } });
    const bookMap = {};
    books.forEach((b) => {
      bookMap[b._id.toString()] = b;
    });

    // 4. Kiểm tra tồn kho, trạng thái, loại bỏ sách không hợp lệ
    for (const item of normalizedItems) {
      const book = bookMap[item.bookId];
      if (!book) {
        return res
          .status(404)
          .json({ message: `Book not found: ${item.bookId}`, status: "Error" });
      }
      // NOTE: Removed checks for isPublished and isDeleted fields as they do not exist on the book model.

      if (book.stockQuantity < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for book: ${book.title}`,
          status: "Error",
        });
      }
    }

    // 5. Lấy hoặc tạo cart
    let cart = await Cart.findOne({ user: req.account._id });
    if (!cart) cart = new Cart({ user: req.account._id, items: [] });

    // 6. Thêm/gộp từng item vào cart
    for (const item of normalizedItems) {
      const book = bookMap[item.bookId];
      const existingItem = cart.items.find(
        (i) => i.book.toString() === item.bookId
      );
      if (existingItem) {
        const newQuantity = existingItem.quantity + item.quantity;
        if (book.stockQuantity < newQuantity) {
          return res.status(400).json({
            message: `Not enough stock for book: ${book.title}`,
            status: "Error",
          });
        }
        existingItem.quantity = newQuantity;
      } else {
        cart.items.push({ book: item.bookId, quantity: item.quantity });
      }
    }

    await cart.save();

    // Populate book details and calculate total
    const populatedCart = await populateCart(cart._id);

    // Filter for response consistency
    const validItems = populatedCart.items.filter((item) => item.book);
    const total = calculateTotal(validItems);

    return res.status(201).json({
      message: "Add to cart successfully",
      status: "Success",
      data: { ...populatedCart.toObject(), items: validItems, total },
    });
  } catch (error) {
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

    // Filter for response consistency
    const validItems = updatedCart.items.filter((item) => item.book);
    const total = calculateTotal(validItems);

    return res.status(200).json({
      message: "Update cart successfully",
      status: "Success",
      data: {
        ...updatedCart.toObject(),
        items: validItems,
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

    // Filter for response consistency
    const validItems = updatedCart.items.filter((item) => item.book);
    const total = calculateTotal(validItems);

    return res.status(200).json({
      message: "Remove from cart successfully",
      status: "Success",
      data: {
        ...updatedCart.toObject(),
        items: validItems,
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
