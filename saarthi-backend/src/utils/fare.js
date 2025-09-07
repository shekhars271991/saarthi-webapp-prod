exports.calcFare = ({ type, hours = 0 }) => {
  const BASE = { hourly: 150, outstation: 12, "airport-transfer": 20 };
  if (type === "hourly") return hours * BASE.hourly;
  return 3000 * BASE[type]; // placeholder calculation
};
