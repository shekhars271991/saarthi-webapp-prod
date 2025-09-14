const express = require("express");
const { body, query } = require("express-validator");

const auth = require("../controllers/auth.controller");
const fare = require("../controllers/fare.controller");
const ride = require("../controllers/ride.controller");
const invoice = require("../controllers/invoice.controller");
const testimonial = require("../controllers/testimonial.controller");
const pricingRoutes = require("./pricing.routes");

const router = express.Router();

/* -------------------------- Auth & OTP Routes -------------------------- */

// Register new user (no OTP generated here)
router.post("/signup", [
  body("name").notEmpty(),
  body("email").isEmail(),
  body("phone_number").isMobilePhone(),
], auth.register);

// Generate OTP for existing user
router.post("/generate-otp", [
  body("phone_number").isMobilePhone(),
], auth.generateOTP);

// Verify OTP
router.post("/verify", [
  body("phone_number").isMobilePhone(),
  body("otp").isLength({ min: 6, max: 6 }),
], auth.verify);

// Login with OTP (optional)
router.post("/login", [
  body("phone_number").isMobilePhone(),
  body("otp").isLength({ min: 6, max: 6 }),
], auth.login);


// Unified fare check and ride creation
router.post("/fare/check", [
  body("user_id").isMongoId(),
  body("ride_type").isIn(["hourly", "outstation", "airport-transfer"]),
], ride.checkFareAndCreateRide);

router.post("/booking/confirm", [
  body("ride_id").isMongoId(),
], ride.confirmBooking);


// Get all rides for a user
router.get("/rides", [
  query("phone_number").isMobilePhone(),
], ride.listRides);

// Generate invoice
router.post("/invoice", [
  body("ride_id").isMongoId(),
], invoice.generateInvoice);

router.post(
  "/user/update-profile",
  [
    body("user_id").isMongoId(),
    body("name").isString().notEmpty(),
  ],
  auth.updateProfile
);
router.post("/ride/cancel", ride.cancelRide);

/* -------------------------- Testimonials -------------------------- */

// Public: Get testimonials
router.get("/testimonials", testimonial.getAll);

/* -------------------------- Pricing -------------------------- */

// Pricing routes
router.use("/pricing", pricingRoutes);

module.exports = router;
