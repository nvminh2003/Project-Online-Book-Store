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

// Validate cart before checkout - check stock availability
const validateCartForCheckout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.account._id }).populate({
      path: "items.book",
      select: "title sellingPrice images stockQuantity",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
        status: "Error",
      });
    }

    const validationResults = [];
    let hasErrors = false;

    for (const item of cart.items) {
      const book = item.book;
      const result = {
        bookId: book._id,
        bookTitle: book.title,
        requestedQuantity: item.quantity,
        availableStock: book.stockQuantity,
        isValid: true,
        message: "",
      };

      if (!book) {
        result.isValid = false;
        result.message = "Book no longer exists";
        hasErrors = true;
      } else if (book.stockQuantity < item.quantity) {
        result.isValid = false;
        result.message = `Only ${book.stockQuantity} items available`;
        hasErrors = true;
      } else if (book.stockQuantity === 0) {
        result.isValid = false;
        result.message = "Out of stock";
        hasErrors = true;
      }

      validationResults.push(result);
    }

    return res.status(200).json({
      message: hasErrors
        ? "Cart validation failed"
        : "Cart is valid for checkout",
      status: hasErrors ? "Error" : "Success",
      data: {
        isValid: !hasErrors,
        validationResults,
        totalItems: cart.items.length,
        validItems: validationResults.filter((r) => r.isValid).length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Apply coupon to cart
const applyCouponToCart = async (req, res) => {
  try {
    const { couponCode } = req.body;

    if (!couponCode) {
      return res.status(400).json({
        message: "Coupon code is required",
        status: "Error",
      });
    }

    // Get cart
    const cart = await Cart.findOne({ user: req.account._id }).populate({
      path: "items.book",
      select: "title sellingPrice images stockQuantity category",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
        status: "Error",
      });
    }

    // Validate discount code
    const DiscountCode = require("../models/discountCodeModel");
    const discountCode = await DiscountCode.findOne({
      code: couponCode.toUpperCase(),
    }).populate("books categories");

    if (!discountCode) {
      return res.status(404).json({
        message: "Invalid discount code",
        status: "Error",
      });
    }

    // Prepare items for validation
    const cartItems = cart.items.map((item) => ({
      book: item.book._id,
      quantity: item.quantity,
      price: item.book.sellingPrice,
    }));

    // Calculate cart subtotal
    const subtotal = cart.items.reduce((total, item) => {
      const price = item.book?.sellingPrice || 0;
      const quantity = item.quantity || 0;
      return total + price * quantity;
    }, 0);

    // Enhanced validation using the discount controller logic
    const now = new Date();

    // Check if discount is active and within date range
    if (
      !discountCode.isActive ||
      now < discountCode.startDate ||
      now > discountCode.endDate
    ) {
      let message = "Invalid discount code";
      if (now > discountCode.endDate) {
        message = "Discount code has expired";
      } else if (now < discountCode.startDate) {
        message = "Discount code is not yet active";
      } else if (!discountCode.isActive) {
        message = "Discount code is not active";
      }

      return res.status(400).json({
        message,
        status: "Error",
      });
    }

    // Check max uses
    if (
      discountCode.maxUses &&
      discountCode.usesCount >= discountCode.maxUses
    ) {
      return res.status(400).json({
        message: "Discount code has reached maximum uses",
        status: "Error",
      });
    }

    // Check min order value
    if (discountCode.minOrderValue && subtotal < discountCode.minOrderValue) {
      return res.status(400).json({
        message: `Minimum order value of ${discountCode.minOrderValue.toLocaleString(
          "vi-VN"
        )}đ required`,
        status: "Error",
      });
    }

    // Check max uses per user
    if (discountCode.maxUsesPerUser) {
      const userUsageCount = discountCode.usedBy.filter(
        (usage) => usage.user.toString() === req.account._id.toString()
      ).length;

      if (userUsageCount >= discountCode.maxUsesPerUser) {
        return res.status(400).json({
          message: "You have reached the maximum uses for this discount code",
          status: "Error",
        });
      }
    }

    // Calculate eligible items and discount amount
    let eligibleItems = cart.items;
    let eligibleValue = subtotal;

    // Filter by specific books if specified
    if (discountCode.books && discountCode.books.length > 0) {
      eligibleItems = cart.items.filter((item) =>
        discountCode.books.some(
          (book) => book._id.toString() === item.book._id.toString()
        )
      );

      if (eligibleItems.length === 0) {
        return res.status(400).json({
          message: "No eligible books in cart for this discount code",
          status: "Error",
        });
      }

      eligibleValue = eligibleItems.reduce((total, item) => {
        return total + item.book.sellingPrice * item.quantity;
      }, 0);
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discountCode.type === "percent") {
      discountAmount = (eligibleValue * discountCode.value) / 100;
    } else if (discountCode.type === "fixed") {
      discountAmount = discountCode.value;
    }

    // Apply max discount cap if specified
    if (
      discountCode.maxDiscountAmount &&
      discountAmount > discountCode.maxDiscountAmount
    ) {
      discountAmount = discountCode.maxDiscountAmount;
    }

    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);
    discountAmount = Math.round(discountAmount);

    // Update cart with coupon details
    cart.coupon = discountCode.code;
    cart.couponDetails = {
      code: discountCode.code,
      description: discountCode.description,
      type: discountCode.type,
      value: discountCode.value,
      discountAmountCalculated: discountAmount,
      eligibleValue,
      minOrderValue: discountCode.minOrderValue,
      maxDiscountAmount: discountCode.maxDiscountAmount,
    };

    await cart.save();

    // Return updated cart
    const populatedCart = await populateCart(cart._id);
    const validItems = populatedCart.items.filter((item) => item.book);
    const total = calculateTotal(validItems);

    return res.status(200).json({
      message: "Coupon applied successfully",
      status: "Success",
      data: {
        ...populatedCart.toObject(),
        items: validItems,
        total,
        couponDetails: cart.couponDetails,
      },
    });
  } catch (error) {
    console.error("Apply coupon error:", error);
    return res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Remove coupon from cart
const removeCouponFromCart = async (req, res) => {
  try {
    // Get cart
    const cart = await Cart.findOne({ user: req.account._id });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
        status: "Error",
      });
    }

    // Remove coupon details
    cart.coupon = null;
    cart.couponDetails = null;
    await cart.save();

    // Return updated cart
    const populatedCart = await populateCart(cart._id);
    if (!populatedCart) {
      return res.status(404).json({
        message: "Cart not found after update",
        status: "Error",
      });
    }

    const validItems = populatedCart.items.filter((item) => item.book);
    const total = calculateTotal(validItems);

    return res.status(200).json({
      message: "Coupon removed successfully",
      status: "Success",
      data: {
        ...populatedCart.toObject(),
        items: validItems,
        total,
        couponDetails: null,
      },
    });
  } catch (error) {
    console.error("Remove coupon error:", error);
    return res.status(500).json({
      message: error.message,
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
  validateCartForCheckout,
  applyCouponToCart,
  removeCouponFromCart,
};
