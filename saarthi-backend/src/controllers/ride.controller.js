const Ride = require("../models/ride.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const { calcFareWithDistance } = require("../utils/fare");


exports.checkFareAndCreateRide = async (req, res, next) => {
  try {
    const {
      user_id,
      ride_type,
      hours,
      pickup_location,
      drop_location,
      pickup_lat,
      pickup_lng,
      drop_lat,
      drop_lng,
      pickup_datetime,
      airport_direction,
      airport_terminal
    } = req.body;


    // Validate common required fields
    if (!user_id || !ride_type  || !pickup_datetime) {
      return res.status(400).json({
        message: "user_id, ride_type, and pickup_datetime are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(user_id) || !(await User.exists({ _id: user_id }))) {
      return res.status(404).json({ message: "User not found" });
    }
   
    const parsedPickupDT = new Date(pickup_datetime);
    if (isNaN(parsedPickupDT.getTime())) {
      return res.status(400).json({ message: "pickup_datetime must be a valid ISO date-time" });
    }

    // Ride type-specific validations
    switch (ride_type) {
      case "hourly":
        if (!hours) {
          return res.status(400).json({ message: "hours is required for hourly ride" });
        }
        if (!pickup_location) {
          return res.status(400).json({ message: "pickup_location is required for hourly ride" });
        }
        break;

      case "outstation":
        if (!pickup_location || !drop_location) {
          return res.status(400).json({ message: "pickup_location and drop_location are required for outstation ride" });
        }
        break;

      case "airport-transfer":
        if (!airport_direction || !["to", "from"].includes(airport_direction)) {
          return res.status(400).json({ message: "airport_direction must be 'to' or 'from'" });
        }

        if (airport_direction === "to" && (!pickup_location)) {
          return res.status(400).json({ message: "pickup_location is required for airport ride TO airport" });
        }

        if (airport_direction === "from" && (!drop_location)) {
          return res.status(400).json({ message: "drop_location is required for airport ride FROM airport" });
        }
        if (!airport_terminal) {
          return res.status(400).json({ message: "airport_terminal is required" });
        }

        break;

      default:
        return res.status(400).json({ message: "Invalid ride_type" });
    }

    // Prepare location data for distance calculation
    let origin, destination;

    switch (ride_type) {
      case "hourly":
        // For hourly, we need pickup location and assume a default destination or use pickup as both
        origin = pickup_lat && pickup_lng ? { lat: pickup_lat, lng: pickup_lng } : pickup_location;
        destination = origin; // For hourly, distance is estimated based on typical usage
        break;
        
      case "outstation":
        origin = pickup_lat && pickup_lng ? { lat: pickup_lat, lng: pickup_lng } : pickup_location;
        destination = drop_lat && drop_lng ? { lat: drop_lat, lng: drop_lng } : drop_location;
        break;
        
      case "airport-transfer":
        if (airport_direction === "to") {
          // Going to airport
          origin = pickup_lat && pickup_lng ? { lat: pickup_lat, lng: pickup_lng } : pickup_location;
          destination = "Kempegowda International Airport, Bengaluru"; // Default airport
        } else {
          // Coming from airport
          origin = "Kempegowda International Airport, Bengaluru"; // Default airport
          destination = drop_lat && drop_lng ? { lat: drop_lat, lng: drop_lng } : drop_location;
        }
        break;
    }

    // Calculate fare with distance
    const fareData = await calcFareWithDistance({
      type: ride_type,
      origin,
      destination,
      hours: hours || 0
    });

    const { fare, distance, breakdown } = fareData;

    // Ride creation
   const rideData = {
  user: user_id,
  type: ride_type,
  hours: ride_type === "hourly" ? hours : null,

  pickupLocation: pickup_location || null,
  pickupLat: pickup_lat ?? null,
  pickupLng: pickup_lng ?? null,
  pickupDatetime: parsedPickupDT,
  dropLocation: drop_location || null,
  dropLat: drop_lat ?? null,
  dropLng: drop_lng ?? null,

  fare,
  distance: distance,
  status: "pending"
};

// Add airport-only fields
if (ride_type === "airport-transfer") {
  rideData.airportDirection = airport_direction;   // always defined by validation
  rideData.airportTerminal  = airport_terminal;    // always defined by validation
}

const ride = await Ride.create(rideData);

    res.json({
      message: "Ride created with pending status",
      ride_id: ride._id,
      fare_details: { 
        fare, 
        ride_type,
        distance,
        breakdown 
      }
    });

  } catch (err) {
    next(err);
  }
};



exports.confirmBooking = async (req, res, next) => {
  try {
    const { ride_id } = req.body;
    if (!ride_id) return res.status(400).json({ message: "ride_id is required" });

    const ride = await Ride.findById(ride_id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    ride.status = "confirmed";
    await ride.save();

    res.json({ message: "Booking confirmed", ride_details: ride });
  } catch (err) {
    next(err);
  }
};


/**
 * GET /rides?user_id=<id>&phone_number=<phone>&ride_id=<id>
 */
exports.listRides = async (req, res, next) => {
  try {
    const { user_id, phone_number, ride_id } = req.query;

    /* 1️⃣ Who is the user? -------------------------------------------- */
    let userFilter = {};
    if (user_id) {
      if (!mongoose.Types.ObjectId.isValid(user_id)) {
        return res.status(400).json({ message: "Invalid user_id" });
      }
      userFilter._id = user_id;
    } else if (phone_number) {
      userFilter.phoneNumber = phone_number;
    } else {
      return res.status(400).json({ message: "Send user_id or phone_number" });
    }

    /* 2️⃣ Resolve user’s _id (needed to filter rides) ------------------ */
    const user = await User.findOne(userFilter).select("_id");
    if (!user) return res.status(404).json({ message: "User not found" });

    const rideQuery = {
      user: user._id,
      status: { $ne: "pending" }   // ← always exclude pending
    };
   
    if (ride_id) {
      if (!mongoose.Types.ObjectId.isValid(ride_id)) {
        return res.status(400).json({ message: "Invalid ride_id" });
      }
      rideQuery._id = ride_id;
    }

    /* 4️⃣ Fetch rides -------------------------------------------------- */
    const rides = await Ride.find(rideQuery).sort({ createdAt: -1 });

    return res.json({ rides });
  } catch (err) {
    next(err);
  }
};

exports.cancelRide = async (req, res, next) => {
  try {
    const { ride_id, cancel_reason } = req.body;

    if (!ride_id || !cancel_reason) {
      return res.status(400).json({ message: "ride_id and cancel_reason are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(ride_id)) {
      return res.status(400).json({ message: "Invalid ride_id" });
    }

    const ride = await Ride.findById(ride_id);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status === "cancelled") {
      return res.status(400).json({ message: "Ride already cancelled" });
    }

    ride.status = "cancelled";
    ride.cancelReason = cancel_reason;
    ride.cancelledAt = new Date();

    await ride.save();

    return res.json({ message: "Ride cancelled", ride_details: ride });
  } catch (err) {
    next(err);
  }
};



