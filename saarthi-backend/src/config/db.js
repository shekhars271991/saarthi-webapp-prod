const mongoose = require("mongoose");

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
    });
    console.log("🟢  MongoDB connected");
  } catch (err) {
    console.error("🔴  MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
