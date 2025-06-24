const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Account = require("../models/accountModel");
const Cart = require("../models/cartModel");
const Book = require("../models/bookModel");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/bookstore";

const sampleCartItems = [
  {
    bookTitle: "The Great Gatsby",
    quantity: 2,
  },
  {
    bookTitle: "To Kill a Mockingbird",
    quantity: 1,
  },
  {
    bookTitle: "1984",
    quantity: 3,
  },
];

async function addSampleCartToUser(email) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Trim and lowercase email for case-insensitive search
    const user = await Account.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      console.error("User not found with email:", email);
      return;
    }

    // Find books by title
    const books = await Book.find({
      title: { $in: sampleCartItems.map((item) => item.bookTitle) },
    });

    if (books.length === 0) {
      console.error("No books found for sample cart items");
      return;
    }

    // Map book titles to book IDs
    const bookMap = {};
    books.forEach((book) => {
      bookMap[book.title] = book._id;
    });

    // Prepare cart items with book IDs and quantities
    const items = sampleCartItems
      .filter((item) => bookMap[item.bookTitle])
      .map((item) => ({
        book: bookMap[item.bookTitle],
        quantity: item.quantity,
      }));

    if (items.length === 0) {
      console.error("No valid cart items to add");
      return;
    }

    // Find existing cart or create new
    let cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      cart = new Cart({ user: user._id, items });
    } else {
      // Replace existing items with sample items
      cart.items = items;
    }

    await cart.save();
    console.log("Sample cart added to user:", email);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error adding sample cart to user:", error);
  }
}

// Run script if called directly with email argument
if (require.main === module) {
  const email = process.argv[2];
  if (!email) {
    console.error("Please provide user email as argument");
    process.exit(1);
  }
  addSampleCartToUser(email).then(() => process.exit(0));
}

module.exports = addSampleCartToUser;
