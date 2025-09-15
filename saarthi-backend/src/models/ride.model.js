const { Schema, model, Types } = require("mongoose");

const rideSchema = new Schema(
  {
    user:           { type: Types.ObjectId, ref: "User", required: false },
    customerName:   { type: String, required: false },
    customerPhone:  { type: String, required: false },
    type:           { type: String, enum: ["hourly", "outstation", "airport-transfer"], required: true },
    hours:          { type: Number, required: false },
    pickupLocation: String,
    dropLocation:   String,
    pickupLat:     Number,
    pickupLng:     Number,
    dropLat:       Number,
    dropLng:       Number,
    fare:          { type: Number, required: false },
    distance:      { type: Number, required: false }, // Distance in kilometers
    selectedCar:   {
      carId:       { type: String, required: false },
      carName:     { type: String, required: false },
      carImage:    { type: String, required: false },
      carType:     { type: String, required: false },
      carFare:     { type: Number, required: false }
    },
    airportTerminal: { type: String, required: false },
    airportDirection: { type: String, enum: ["to", "from"], required: false },
    pickupDatetime: { type: Date, required: true },
    cancelReason: { type: String, default: null },
    cancelledAt: { type: Date, default: null },
    status:         { type: String, enum: ["pending","confirmed","completed","cancelled"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = model("Ride", rideSchema);
