const mongoose = require("mongoose");

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // MongoDB Atlas optimized connection options (updated for latest mongoose)
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    console.log("🟢  MongoDB Atlas connected successfully");
  } catch (err) {
    console.error("🔴  MongoDB Atlas connection failed:", err.message);
    process.exit(1);
  }
};
