require("dotenv").config({ path: require('path').join(__dirname, '../.env') });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const apiRoutes = require("./routes/api.routes");
const errorHandler = require("./middlewares/errorHandler");

// Validate required environment variables on startup
const validateEnvironmentVariables = () => {
  const requiredVars = [
    'AIRPORT_BASE_FARE',
    'AIRPORT_PER_KM_RATE', 
    'HOURLY_PER_HOUR_RATE',
    'HOURLY_PER_KM_RATE',
    'OUTSTATION_PER_KM_RATE',
    'OUTSTATION_MULTIPLIER',
    'MONGODB_URI'
  ];
  
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    console.error('❌ STARTUP ERROR: Missing required environment variables:');
    console.error('   ', missingVars.join(', '));
    console.error('   Please create a .env file in the project root with these variables.');
    console.error('   You can copy from env.production.example');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are loaded');
};

(async () => {
  // Validate environment variables first
  validateEnvironmentVariables();
  
  await connectDB();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/api", apiRoutes);
  app.use(errorHandler);        // centralised error middleware

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
})();
