const { calcFareWithDistance } = require('../utils/fare');
const { validateRideServiceArea } = require('../utils/locationValidator');
const airportConfig = require('../config/airports');
const carInventory = require('../config/carInventory');

/**
 * Calculate pricing for a ride without creating the ride
 * POST /api/pricing/calculate
 */
exports.calculatePricing = async (req, res) => {
  try {
    const {
      ride_type,
      pickup_location,
      drop_location,
      pickup_lat,
      pickup_lng,
      drop_lat,
      drop_lng,
      selected_airport,
      hours
    } = req.body;

    // Validate required fields
    if (!ride_type) {
      return res.status(400).json({
        success: false,
        message: 'Ride type is required'
      });
    }

    // Validate ride type
    const validRideTypes = ['airport-transfer', 'hourly', 'outstation'];
    if (!validRideTypes.includes(ride_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ride type. Must be one of: airport-transfer, hourly, outstation'
      });
    }

    // Validate location data based on ride type
    if (ride_type === 'airport-transfer') {
      if (!selected_airport || !airportConfig.isValidAirport(selected_airport)) {
        return res.status(400).json({
          success: false,
          message: 'Valid airport selection is required for airport transfers'
        });
      }
      
      // For airport transfers, we need either pickup or drop location (the other is the airport)
      if (!pickup_location && !drop_location) {
        return res.status(400).json({
          success: false,
          message: 'Either pickup or drop location is required for airport transfers'
        });
      }
    } else {
      // For hourly and outstation, we need both locations
      if (!pickup_location || !drop_location) {
        return res.status(400).json({
          success: false,
          message: 'Both pickup and drop locations are required'
        });
      }
    }

    // For hourly rides, validate hours
    if (ride_type === 'hourly') {
      if (!hours || hours < 1) {
        return res.status(400).json({
          success: false,
          message: 'Hours must be specified and greater than 0 for hourly rides'
        });
      }
    }

    // Validate service area
    const serviceAreaValidation = await validateRideServiceArea({
      pickup_location,
      drop_location,
      pickup_lat,
      pickup_lng,
      drop_lat,
      drop_lng
    });

    if (!serviceAreaValidation.isRideServiceable) {
      return res.status(400).json({
        success: false,
        message: 'Service not available in this area',
        error: 'OUTSIDE_SERVICE_AREA',
        details: serviceAreaValidation
      });
    }

    // Determine origin and destination based on ride type
    let origin, destination;

    if (ride_type === 'airport-transfer') {
      const airportCoords = airportConfig.getAirportCoordinates(selected_airport);
      
      if (pickup_location && pickup_location.toLowerCase().includes('airport')) {
        // Airport to destination
        origin = airportCoords;
        destination = drop_location || { lat: drop_lat, lng: drop_lng };
      } else {
        // Pickup to airport
        origin = pickup_location || { lat: pickup_lat, lng: pickup_lng };
        destination = airportCoords;
      }
    } else {
      // For hourly and outstation
      origin = pickup_location || { lat: pickup_lat, lng: pickup_lng };
      destination = drop_location || { lat: drop_lat, lng: drop_lng };
    }

    // Calculate fare with distance
    const fareResult = await calcFareWithDistance({
      type: ride_type,
      origin,
      destination,
      hours: hours || 0
    });

    // Get available car options with calculated fares
    const carOptions = carInventory.getCarOptions(fareResult.fare);

    // Return pricing information with car options
    res.json({
      success: true,
      data: {
        ride_type,
        distance: fareResult.distance,
        car_options: carOptions.map(car => ({
          ...car,
          breakdown: {
            ...fareResult.breakdown,
            total: `₹${car.fare}`,
            formula: fareResult.breakdown.formula.replace(/₹\d+/, `₹${car.fare}`)
          }
        })),
        service_area_validation: serviceAreaValidation,
        pricing_details: {
          calculated_at: new Date().toISOString(),
          origin_formatted: typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`,
          destination_formatted: typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`,
          hours: hours || 0
        }
      }
    });

  } catch (error) {
    console.error('Error calculating pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate pricing',
      error: error.message
    });
  }
};

/**
 * Get pricing configuration (rates, base fares, etc.)
 * GET /api/pricing/config
 */
exports.getPricingConfig = async (req, res) => {
  try {
    const config = {
      airport_transfer: {
        base_fare: parseInt(process.env.AIRPORT_BASE_FARE) || 300,
        per_km_rate: parseInt(process.env.AIRPORT_PER_KM_RATE) || 15,
        description: 'Base fare + distance-based pricing'
      },
      hourly: {
        per_hour_rate: parseInt(process.env.HOURLY_PER_HOUR_RATE) || 300,
        per_km_rate: parseInt(process.env.HOURLY_PER_KM_RATE) || 15,
        description: 'Hourly rate + distance-based pricing'
      },
      outstation: {
        per_km_rate: parseInt(process.env.OUTSTATION_PER_KM_RATE) || 15,
        description: 'Round-trip distance-based pricing (2x distance)'
      }
    };

    res.json({
      success: true,
      data: {
        pricing_config: config,
        currency: 'INR',
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching pricing config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pricing configuration',
      error: error.message
    });
  }
};
