const Cart = require("../models/cartModel");
const Book = require("../models/bookModel");

// Helper function to populate cart with book and user details
const populateCart = async (cartId) => {
  return await Cart.findById(cartId)
    .populate("items.book", "title sellingPrice images authors publisher")
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

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { bookId, quantity } = req.body;

    if (!bookId || !quantity) {
      return res.status(400).json({
        message: "Book ID and quantity are required",
        status: "Error",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
        status: "Error",
      });
    }

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        message: "Book not found",
        status: "Error",
      });
    }

    // Check if book is in stock
    if (book.stockQuantity < quantity) {
      return res.status(400).json({
        message: "Not enough stock available",
        status: "Error",
      });
    }

    let cart = await Cart.findOne({ user: req.account._id });

    if (!cart) {
      cart = new Cart({
        user: req.account._id,
        items: [{ book: bookId, quantity }],
      });
    } else {
      // Check if book already in cart
      const existingItem = cart.items.find(
        (item) => item.book.toString() === bookId
      );

      if (existingItem) {
        // Check if new total quantity exceeds stock
        if (book.stockQuantity < existingItem.quantity + quantity) {
          return res.status(400).json({
            message: "Not enough stock available",
            status: "Error",
          });
        }
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ book: bookId, quantity });
      }
    }

    await cart.save();

    // Populate book details and calculate total
    cart = await Cart.findById(cart._id)
      .populate("items.book", "title sellingPrice images authors publisher")
      .populate("user", "email customerInfo.fullName");

    const total = calculateTotal(cart.items);

    return res.status(201).json({
      message: "Add to cart successfully",
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
