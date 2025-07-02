const Wishlist = require("../models/wishlistModel");
const Book = require("../models/bookModel");
const Cart = require("../models/cartModel");

// Get wishlist with enhanced features
const getWishlist = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      filterAvailable = false,
      sortBy = "dateAdded", // dateAdded, price, name
    } = req.query;

    let wishlist = await Wishlist.findOne({ user: req.account._id }).populate({
      path: "books.book",
      select:
        "title sellingPrice originalPrice images authors publisher stockQuantity categories",
      match: filterAvailable === "true" ? { stockQuantity: { $gt: 0 } } : {},
      populate: {
        path: "categories",
        select: "name slug",
      },
    });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.account._id, books: [] });
      await wishlist.save();
    }

    // Filter out items where book is null (doesn't match the filter or was deleted)
    const availableBooks = wishlist.books.filter(
      (item) => item.book !== null && item.book !== undefined
    );

    // Sort books
    let sortedBooks = [...availableBooks];
    switch (sortBy) {
      case "price":
        sortedBooks.sort((a, b) => a.book.sellingPrice - b.book.sellingPrice);
        break;
      case "name":
        sortedBooks.sort((a, b) => a.book.title.localeCompare(b.book.title));
        break;
      case "dateAdded":
      default:
        sortedBooks.sort(
          (a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)
        );
        break;
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedBooks = sortedBooks.slice(startIndex, endIndex);

    // Calculate statistics
    const totalBooks = availableBooks.length;
    const totalValue = availableBooks.reduce((sum, item) => {
      // Double check that item.book exists and has sellingPrice
      if (item.book && typeof item.book.sellingPrice === "number") {
        return sum + item.book.sellingPrice;
      }
      return sum;
    }, 0);
    const outOfStockCount = availableBooks.filter(
      (item) => item.book && item.book.stockQuantity === 0
    ).length;
    const avgPrice = totalBooks > 0 ? Math.round(totalValue / totalBooks) : 0;

    const response = {
      _id: wishlist._id,
      user: wishlist.user,
      books: paginatedBooks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalBooks / limit),
        totalItems: totalBooks,
        limit: parseInt(limit),
        hasNextPage: endIndex < totalBooks,
        hasPrevPage: page > 1,
      },
      statistics: {
        totalBooks,
        totalValue,
        outOfStockCount,
        avgPrice,
        availableCount: totalBooks - outOfStockCount,
      },
    };

    res.status(200).json({
      message: "Get wishlist successfully",
      status: "Success",
      data: response,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Add book to wishlist with duplicate check
const addToWishlist = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        message: "Book ID is required",
        status: "Error",
      });
    }

    // Check if book exists and get its details
    const book = await Book.findById(
      bookId,
      "title sellingPrice stockQuantity"
    );
    if (!book) {
      return res.status(404).json({
        message: "Book not found",
        status: "Error",
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.account._id });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.account._id,
        books: [{ book: bookId, dateAdded: new Date() }],
      });
    } else {
      // Check if book already in wishlist
      const existingBook = wishlist.books.find(
        (item) => item.book && item.book.toString() === bookId
      );

      if (existingBook) {
        return res.status(400).json({
          message: "Book is already in wishlist",
          status: "Error",
        });
      }

      // Add to beginning (newest first)
      wishlist.books.unshift({ book: bookId, dateAdded: new Date() });
    }

    await wishlist.save();

    // Return book info for immediate UI update
    res.status(200).json({
      message: `"${book.title}" added to wishlist successfully`,
      status: "Success",
      data: {
        bookId: book._id,
        title: book.title,
        price: book.sellingPrice,
        inStock: book.stockQuantity > 0,
        totalWishlistItems: wishlist.books.length,
      },
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Remove book from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.account._id });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found",
        status: "Error",
      });
    }

    // Check if book is in wishlist
    const bookExists = wishlist.books.some(
      (item) => item.book && item.book.toString() === bookId
    );

    if (!bookExists) {
      return res.status(400).json({
        message: "Book is not in wishlist",
        status: "Error",
      });
    }

    // Remove book from wishlist
    wishlist.books = wishlist.books.filter(
      (item) => !item.book || item.book.toString() !== bookId
    );

    await wishlist.save();

    res.status(200).json({
      message: "Remove from wishlist successfully",
      status: "Success",
      data: {
        removedBookId: bookId,
        totalWishlistItems: wishlist.books.length,
      },
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Clear wishlist
const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.account._id });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found",
        status: "Error",
      });
    }

    wishlist.books = [];
    await wishlist.save();

    res.status(200).json({
      message: "Clear wishlist successfully",
      status: "Success",
      data: {
        totalWishlistItems: 0,
      },
    });
  } catch (error) {
    console.error("Clear wishlist error:", error);
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Check if book is in wishlist
const checkBookInWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.account._id });

    if (!wishlist) {
      return res.status(200).json({
        message: "Check wishlist successfully",
        status: "Success",
        data: { isInWishlist: false },
      });
    }

    const isInWishlist = wishlist.books.some(
      (item) => item.book && item.book.toString() === bookId
    );

    res.status(200).json({
      message: "Check wishlist successfully",
      status: "Success",
      data: { isInWishlist },
    });
  } catch (error) {
    console.error("Check wishlist error:", error);
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Move book from wishlist to cart
const moveToCart = async (req, res) => {
  try {
    const { bookId } = req.body;
    const { quantity = 1 } = req.body;

    if (!bookId) {
      return res.status(400).json({
        message: "Book ID is required",
        status: "Error",
      });
    }

    // Check if book exists and has stock
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        message: "Book not found",
        status: "Error",
      });
    }

    if (book.stockQuantity < quantity) {
      return res.status(400).json({
        message: `Only ${book.stockQuantity} items available in stock`,
        status: "Error",
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.account._id });
    if (!cart) {
      cart = new Cart({ user: req.account._id, items: [] });
    }

    // Check if book already in cart
    const existingCartItem = cart.items.find(
      (item) => item.book.toString() === bookId
    );

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      if (book.stockQuantity < newQuantity) {
        return res.status(400).json({
          message: `Cannot add ${quantity} more items. Only ${
            book.stockQuantity - existingCartItem.quantity
          } more available`,
          status: "Error",
        });
      }
      existingCartItem.quantity = newQuantity;
    } else {
      cart.items.push({ book: bookId, quantity });
    }

    await cart.save();

    // Remove from wishlist
    const wishlist = await Wishlist.findOne({ user: req.account._id });
    if (wishlist) {
      wishlist.books = wishlist.books.filter(
        (item) => !item.book || item.book.toString() !== bookId
      );
      await wishlist.save();
    }

    res.status(200).json({
      message: `"${book.title}" moved to cart successfully`,
      status: "Success",
      data: {
        bookId: book._id,
        title: book.title,
        quantity,
        cartItemsCount: cart.items.length,
        wishlistItemsCount: wishlist ? wishlist.books.length : 0,
      },
    });
  } catch (error) {
    console.error("Move to cart error:", error);
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Move multiple books from wishlist to cart
const moveMultipleToCart = async (req, res) => {
  try {
    const { bookIds } = req.body; // Array of bookIds

    if (!Array.isArray(bookIds) || bookIds.length === 0) {
      return res.status(400).json({
        message: "Book IDs array is required",
        status: "Error",
      });
    }

    // Get books and check stock
    const books = await Book.find({ _id: { $in: bookIds } });
    const outOfStockBooks = books.filter((book) => book.stockQuantity === 0);
    const availableBooks = books.filter((book) => book.stockQuantity > 0);

    if (availableBooks.length === 0) {
      return res.status(400).json({
        message: "All selected books are out of stock",
        status: "Error",
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.account._id });
    if (!cart) {
      cart = new Cart({ user: req.account._id, items: [] });
    }

    const addedBooks = [];
    const failedBooks = [];

    // Add available books to cart
    for (const book of availableBooks) {
      const existingCartItem = cart.items.find(
        (item) => item.book.toString() === book._id.toString()
      );

      if (existingCartItem) {
        if (book.stockQuantity > existingCartItem.quantity) {
          existingCartItem.quantity += 1;
          addedBooks.push(book.title);
        } else {
          failedBooks.push(`${book.title} (already max quantity in cart)`);
        }
      } else {
        cart.items.push({ book: book._id, quantity: 1 });
        addedBooks.push(book.title);
      }
    }

    await cart.save();

    // Remove successfully added books from wishlist
    if (addedBooks.length > 0) {
      const wishlist = await Wishlist.findOne({ user: req.account._id });
      if (wishlist) {
        const addedBookIds = availableBooks
          .filter((book) => addedBooks.includes(book.title))
          .map((book) => book._id.toString());

        wishlist.books = wishlist.books.filter(
          (item) => !item.book || !addedBookIds.includes(item.book.toString())
        );
        await wishlist.save();
      }
    }

    let message = "";
    if (addedBooks.length > 0) {
      message += `${addedBooks.length} books moved to cart. `;
    }
    if (failedBooks.length > 0) {
      message += `${failedBooks.length} books failed: ${failedBooks.join(
        ", "
      )}. `;
    }
    if (outOfStockBooks.length > 0) {
      message += `${outOfStockBooks.length} books out of stock.`;
    }

    res.status(200).json({
      message: message.trim(),
      status: addedBooks.length > 0 ? "Success" : "Warning",
      data: {
        addedCount: addedBooks.length,
        failedCount: failedBooks.length,
        outOfStockCount: outOfStockBooks.length,
        cartItemsCount: cart.items.length,
      },
    });
  } catch (error) {
    console.error("Move multiple to cart error:", error);
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

// Get wishlist summary/statistics
const getWishlistSummary = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.account._id }).populate(
      {
        path: "books",
        select: "title sellingPrice originalPrice stockQuantity category",
      }
    );

    if (!wishlist || wishlist.books.length === 0) {
      return res.status(200).json({
        message: "Wishlist is empty",
        status: "Success",
        data: {
          totalBooks: 0,
          totalValue: 0,
          avgPrice: 0,
          availableCount: 0,
          outOfStockCount: 0,
          categories: [],
          priceRange: { min: 0, max: 0 },
        },
      });
    }

    const books = wishlist.books.filter((book) => book !== null);
    const totalBooks = books.length;
    const totalValue = books.reduce((sum, book) => sum + book.sellingPrice, 0);
    const avgPrice = totalBooks > 0 ? Math.round(totalValue / totalBooks) : 0;

    const availableBooks = books.filter((book) => book.stockQuantity > 0);
    const outOfStockBooks = books.filter((book) => book.stockQuantity === 0);

    // Category breakdown
    const categoryCount = {};
    books.forEach((book) => {
      categoryCount[book.category] = (categoryCount[book.category] || 0) + 1;
    });

    const categories = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Price range
    const prices = books.map((book) => book.sellingPrice);
    const priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };

    // Potential savings
    const potentialSavings = books.reduce((sum, book) => {
      const discount = book.originalPrice - book.sellingPrice;
      return sum + (discount > 0 ? discount : 0);
    }, 0);

    res.status(200).json({
      message: "Get wishlist summary successfully",
      status: "Success",
      data: {
        totalBooks,
        totalValue,
        avgPrice,
        availableCount: availableBooks.length,
        outOfStockCount: outOfStockBooks.length,
        categories,
        priceRange,
        potentialSavings,
        lastUpdated: wishlist.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get wishlist summary error:", error);
    res.status(500).json({
      message: error.message,
      status: "Error",
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkBookInWishlist,
  moveToCart,
  moveMultipleToCart,
  getWishlistSummary,
};
