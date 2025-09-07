const testimonials = require("../data/testimonials");
exports.getAll = (_, res) => res.json({ testimonials });
