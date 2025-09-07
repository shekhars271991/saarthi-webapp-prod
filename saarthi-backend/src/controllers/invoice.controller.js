const Ride = require("../models/ride.model");
const Invoice = require("../models/invoice.model");

exports.generateInvoice = async (req, res, next) => {
  try {
    const { ride_id } = req.body;
    const ride = await Ride.findById(ride_id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    ride.status = "completed";
    await ride.save();

    const invoice = await Invoice.create({ ride: ride._id, amount: ride.fare });
    res.json({ invoice_details: invoice });
  } catch (err) {
    next(err);
  }
};
