// src/controllers/auth.controller.js
const User   = require("../models/user.model");
const crypto = require("crypto");


exports.register = async (req, res, next) => {
  try {
    const { name, email, phone_number } = req.body;

    // Prevent duplicate registrations
    const existing = await User.findOne({ phoneNumber: phone_number });
    if (existing) {
      return res.status(409).json({ message: "User already exists. Generate an OTP to verify." });
    }

    // Create user in unverified state
    const user = await User.create({
      name,
      email,
      phoneNumber: phone_number,
      verified: false,
    });

    return res
      .status(201)
      .json({
        message: "Registration successful. Now call /generate-otp to receive an OTP.",
        user_details: user,
      });
  } catch (err) {
    next(err);
  }
};


exports.generateOTP = async (req, res, next) => {
  try {
    const { phone_number } = req.body;
    if (!phone_number) {
      return res.status(400).json({ message: "Phone number is required" });
    }
    // nameProvided = true;
    // if(!rawName){
    //   nameProvided = false;
    // }
    // displayName = rawName?.trim() || "User";
    // displayName = displayName.length > 30 ? displayName.slice(0, 30) : displayName;

    // Either fetch or bootstrap-create the user
    let user = await User.findOne({ phoneNumber: phone_number });
    if (!user) {
      user = await User.create({
           name: "User", 
        // nameProvided,               
        // email,
        phoneNumber: phone_number,
        verified: false,
      });
    }

    // Generate fresh OTP
    user.otp        = crypto.randomInt(100000, 999999).toString();
    user.otp        = "111111";

    user.otpExpires = new Date(Date.now() + process.env.OTP_EXPIRES_MIN * 60_000);
    await user.save();

    // 🚀 Hook up SMS / e-mail service here
    console.log(`OTP for ${phone_number}: ${user.otp}`);

    return res.json({
      message: "OTP generated successfully",
      user_id: user._id,
      verified: user.verified,
    });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------------------------------------------------- */
/* Verify OTP – mark user as verified                                     */
/* ---------------------------------------------------------------------- */
exports.verify = async (req, res, next) => {
  try {
    const { phone_number, otp } = req.body;

    const user = await User.findOne({ phoneNumber: phone_number });
    if (
      !user ||
      !user.otp ||
      user.otp !== otp ||
      user.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.verified   = true;
    user.otp        = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.json({ user_details: user, verified: true });
  } catch (err) {
    next(err);
  }
};


/* -------------------------------------------------------------------------- */
/* 4️⃣  Login – still OTP based (optional)                                      */
/* -------------------------------------------------------------------------- */
exports.login = async (req, res, next) => {
  try {
    const { phone_number, otp } = req.body;
    const user = await User.findOne({ phoneNumber: phone_number, verified: true });

    if (!user)           return res.status(400).json({ message: "User not found or not verified" });
    if (!user.otp)       return res.status(400).json({ message: "Generate an OTP first" });
    if (user.otp !== otp) return res.status(400).json({ message: "Incorrect OTP" });

    // Stateless login: clear OTP after use
    user.otp = undefined;
    await user.save();

    return res.json({ user_details: user, verified: true });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { user_id, name } = req.body;

    if (!user_id || !name?.trim()) {
      return res
        .status(400)
        .json({ message: "Both user_id and a non-empty name are required" });
    }

    const displayName   = name.trim().slice(0, 30); // 30-char limit
    const nameProvided  = true;

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name         = displayName;
    user.nameProvided = nameProvided;     // if you keep that flag in the schema
    await user.save();

    return res.json({ message: "Profile updated", user_details: user });
  } catch (err) {
    next(err);
  }
};
