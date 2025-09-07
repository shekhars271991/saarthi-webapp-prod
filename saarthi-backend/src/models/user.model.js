const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name:        { type: String, required: true },
    nameProvided: { type: Boolean, default: false }, 
    phoneNumber: { type: String, required: true, unique: true },
    verified:    { type: Boolean, default: false },
    otp:         { type: String },
    otpExpires:  { type: Date },
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
