const { calculateDistance } = require('./distance');

/**
 * Calculate fare based on ride type, distance, and other parameters
 * @param {Object} params - Fare calculation parameters
 * @param {string} params.type - Ride type: 'airport-transfer', 'hourly', 'outstation'
 * @param {number} params.distance - Distance in kilometers
 * @param {number} params.hours - Hours for hourly rental (optional)
 * @returns {number} Calculated fare
 */
exports.calcFare = ({ type, distance = 0, hours = 0 }) => {
  // Get pricing from environment variables - NO DEFAULTS, FAIL IF MISSING
  const AIRPORT_BASE_FARE = parseInt(process.env.AIRPORT_BASE_FARE);
  const AIRPORT_PER_KM_RATE = parseInt(process.env.AIRPORT_PER_KM_RATE);
  const HOURLY_PER_HOUR_RATE = parseInt(process.env.HOURLY_PER_HOUR_RATE);
  const HOURLY_PER_KM_RATE = parseInt(process.env.HOURLY_PER_KM_RATE);
  const OUTSTATION_PER_KM_RATE = parseInt(process.env.OUTSTATION_PER_KM_RATE);
  const OUTSTATION_MULTIPLIER = parseFloat(process.env.OUTSTATION_MULTIPLIER);
  
  // Check for missing environment variables
  const missingVars = [];
  if (isNaN(AIRPORT_BASE_FARE)) missingVars.push('AIRPORT_BASE_FARE');
  if (isNaN(AIRPORT_PER_KM_RATE)) missingVars.push('AIRPORT_PER_KM_RATE');
  if (isNaN(HOURLY_PER_HOUR_RATE)) missingVars.push('HOURLY_PER_HOUR_RATE');
  if (isNaN(HOURLY_PER_KM_RATE)) missingVars.push('HOURLY_PER_KM_RATE');
  if (isNaN(OUTSTATION_PER_KM_RATE)) missingVars.push('OUTSTATION_PER_KM_RATE');
  if (isNaN(OUTSTATION_MULTIPLIER)) missingVars.push('OUTSTATION_MULTIPLIER');
  
  if (missingVars.length > 0) {
    const error = `Missing or invalid environment variables: ${missingVars.join(', ')}. Please check your .env file.`;
    console.error('FARE CALCULATION ERROR:', error);
    throw new Error(error);
  }
  
  console.log('Fare calculation environment variables loaded:', {
    AIRPORT_BASE_FARE,
    AIRPORT_PER_KM_RATE,
    HOURLY_PER_HOUR_RATE,
    HOURLY_PER_KM_RATE,
    OUTSTATION_PER_KM_RATE,
    OUTSTATION_MULTIPLIER
  });

  let fare = 0;

  switch (type) {
    case 'airport-transfer':
      // Airport drop fare = distance in km * 15 + 300
      fare = (distance * AIRPORT_PER_KM_RATE) + AIRPORT_BASE_FARE;
      break;
      
    case 'hourly':
      // Hourly = hours * 300 + distance * 15
      fare = (hours * HOURLY_PER_HOUR_RATE) + (distance * HOURLY_PER_KM_RATE);
      break;
      
    case 'outstation':
      // Outstation = distance * OUTSTATION_PER_KM_RATE * OUTSTATION_MULTIPLIER
      fare = distance * OUTSTATION_PER_KM_RATE * OUTSTATION_MULTIPLIER;
      break;
      
    default:
      throw new Error(`Invalid ride type: ${type}`);
  }

  // Round to nearest integer
  return Math.round(fare);
};

/**
 * Calculate fare with distance calculation
 * @param {Object} params - Parameters for fare calculation
 * @param {string} params.type - Ride type
 * @param {Object|string} params.origin - Origin location (coordinates or address)
 * @param {Object|string} params.destination - Destination location (coordinates or address)
 * @param {number} params.hours - Hours for hourly rental (optional)
 * @returns {Promise<Object>} Object containing fare and distance
 */
exports.calcFareWithDistance = async ({ type, origin, destination, hours = 0 }) => {
  try {
    // Calculate distance between origin and destination
    const distance = await calculateDistance(origin, destination);
    
    // Calculate fare based on distance
    const fare = exports.calcFare({ type, distance, hours });
    
    return {
      fare,
      distance,
      breakdown: getFareBreakdown({ type, distance, hours, fare })
    };
  } catch (error) {
    console.error('Error calculating fare with distance:', error.message);
    throw error;
  }
};

/**
 * Get fare breakdown for transparency
 * @param {Object} params - Parameters for breakdown
 * @returns {Object} Fare breakdown details
 */
const getFareBreakdown = ({ type, distance, hours, fare }) => {
  // Get pricing from environment variables - NO DEFAULTS, FAIL IF MISSING
  const AIRPORT_BASE_FARE = parseInt(process.env.AIRPORT_BASE_FARE);
  const AIRPORT_PER_KM_RATE = parseInt(process.env.AIRPORT_PER_KM_RATE);
  const HOURLY_PER_HOUR_RATE = parseInt(process.env.HOURLY_PER_HOUR_RATE);
  const HOURLY_PER_KM_RATE = parseInt(process.env.HOURLY_PER_KM_RATE);
  const OUTSTATION_PER_KM_RATE = parseInt(process.env.OUTSTATION_PER_KM_RATE);
  const OUTSTATION_MULTIPLIER = parseFloat(process.env.OUTSTATION_MULTIPLIER);
  
  // Check for missing environment variables
  const missingVars = [];
  if (isNaN(AIRPORT_BASE_FARE)) missingVars.push('AIRPORT_BASE_FARE');
  if (isNaN(AIRPORT_PER_KM_RATE)) missingVars.push('AIRPORT_PER_KM_RATE');
  if (isNaN(HOURLY_PER_HOUR_RATE)) missingVars.push('HOURLY_PER_HOUR_RATE');
  if (isNaN(HOURLY_PER_KM_RATE)) missingVars.push('HOURLY_PER_KM_RATE');
  if (isNaN(OUTSTATION_PER_KM_RATE)) missingVars.push('OUTSTATION_PER_KM_RATE');
  if (isNaN(OUTSTATION_MULTIPLIER)) missingVars.push('OUTSTATION_MULTIPLIER');
  
  if (missingVars.length > 0) {
    const error = `Missing or invalid environment variables in getFareBreakdown: ${missingVars.join(', ')}. Please check your .env file.`;
    console.error('FARE BREAKDOWN ERROR:', error);
    throw new Error(error);
  }

  const breakdown = {
    distance: `${distance} km`,
    total: `₹${fare}`
  };

  switch (type) {
    case 'airport-transfer':
      breakdown.baseFare = `₹${AIRPORT_BASE_FARE}`;
      breakdown.distanceFare = `₹${distance * AIRPORT_PER_KM_RATE} (${distance} km × ₹${AIRPORT_PER_KM_RATE}/km)`;
      breakdown.formula = `Base Fare + Distance Fare = ₹${AIRPORT_BASE_FARE} + ₹${distance * AIRPORT_PER_KM_RATE}`;
      break;
      
    case 'hourly':
      breakdown.hourlyFare = `₹${hours * HOURLY_PER_HOUR_RATE} (${hours} hours × ₹${HOURLY_PER_HOUR_RATE}/hour)`;
      breakdown.distanceFare = `₹${distance * HOURLY_PER_KM_RATE} (${distance} km × ₹${HOURLY_PER_KM_RATE}/km)`;
      breakdown.formula = `Hourly Fare + Distance Fare = ₹${hours * HOURLY_PER_HOUR_RATE} + ₹${distance * HOURLY_PER_KM_RATE}`;
      break;
      
    case 'outstation':
      breakdown.distanceFare = `₹${distance * OUTSTATION_PER_KM_RATE * OUTSTATION_MULTIPLIER} (${distance} km × ₹${OUTSTATION_PER_KM_RATE}/km × ${OUTSTATION_MULTIPLIER})`;
      breakdown.formula = `Outstation Fare = ${distance} km × ₹${OUTSTATION_PER_KM_RATE}/km × ${OUTSTATION_MULTIPLIER}`;
      break;
  }

  return breakdown;
};
