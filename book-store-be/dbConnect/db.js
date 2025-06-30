const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error(`Error connecting to DB: ${err.message}`);
    process.exit(1); // thoát với mã lỗi
  }
};

module.exports = connectDb;
