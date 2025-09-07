const Ride = require("../models/ride.model");
const { validationResult } = require("express-validator");
const { calcFare } = require("../utils/fare");


exports.checkFare = (type) => async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { phone_number, hours, pickup_location, drop_location } = req.body;
    const fare = calcFare({ type, hours });

    const ride = await Ride.create({
      type,
      hours,
      pickupLocation: pickup_location,
      dropLocation: drop_location,
      fare,
      status: "pending",
    });

    res.json({ fare_details: { fare, ride_id: ride._id } });
  } catch (err) {
    next(err);
  }
};
