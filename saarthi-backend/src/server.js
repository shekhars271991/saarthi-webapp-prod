require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const apiRoutes = require("./routes/api.routes");
const errorHandler = require("./middlewares/errorHandler");

(async () => {
  await connectDB();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/api", apiRoutes);
  app.use(errorHandler);        // centralised error middleware

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
})();
