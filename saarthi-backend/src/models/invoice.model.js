const { Schema, model, Types } = require("mongoose");

const invoiceSchema = new Schema(
  {
    ride:   { type: Types.ObjectId, ref: "Ride", required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = model("Invoice", invoiceSchema);
