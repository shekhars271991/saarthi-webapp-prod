const axios = require('axios');
const airportConfig = require('../config/airports');

/**
 * Calculate distance between two locations using Google Maps Distance Matrix API
 * @param {Object} origin - Origin coordinates {lat, lng} or address string
 * @param {Object} destination - Destination coordinates {lat, lng} or address string
 * @returns {Promise<number>} Distance in kilometers
 */
const calculateDistance = async (origin, destination) => {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      console.warn('Google Maps API key not configured, using fallback distance calculation');
      return calculateFallbackDistance(origin, destination);
    }

    // Format origin and destination for API
    const formatLocation = (location) => {
      if (typeof location === 'string') {
        // Check if it's an airport name and get coordinates
        const airportCoords = airportConfig.getAirportCoordinates(location);
        if (airportCoords) {
          return `${airportCoords.lat},${airportCoords.lng}`;
        }
        return encodeURIComponent(location);
      }
      if (location.lat && location.lng) {
        return `${location.lat},${location.lng}`;
      }
      throw new Error('Invalid location format');
    };

    const originStr = formatLocation(origin);
    const destinationStr = formatLocation(destination);

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destinationStr}&units=metric&key=${apiKey}`;

    const response = await axios.get(url);
    
    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${response.data.status}`);
    }

    const element = response.data.rows[0]?.elements[0];
    
    if (!element || element.status !== 'OK') {
      throw new Error(`Distance calculation failed: ${element?.status || 'Unknown error'}`);
    }

    // Convert meters to kilometers
    const distanceInKm = element.distance.value / 1000;
    
    console.log(`Distance calculated: ${distanceInKm} km between ${originStr} and ${destinationStr}`);
    
    return Math.round(distanceInKm * 100) / 100; // Round to 2 decimal places
    
  } catch (error) {
    console.error('Error calculating distance:', error.message);
    
    // Fallback to approximate distance calculation
    console.log('Using fallback distance calculation');
    return calculateFallbackDistance(origin, destination);
  }
};

/**
 * Fallback distance calculation using Haversine formula
 * @param {Object} origin - Origin coordinates {lat, lng} or airport name
 * @param {Object} destination - Destination coordinates {lat, lng} or airport name
 * @returns {number} Distance in kilometers
 */
const calculateFallbackDistance = (origin, destination) => {
  // Convert airport names to coordinates if needed
  let originCoords = origin;
  let destinationCoords = destination;
  
  if (typeof origin === 'string') {
    originCoords = airportConfig.getAirportCoordinates(origin);
    if (!originCoords) {
      console.warn(`Airport coordinates not found for: ${origin}, using default distance: 10 km`);
      return 10;
    }
  }
  
  if (typeof destination === 'string') {
    destinationCoords = airportConfig.getAirportCoordinates(destination);
    if (!destinationCoords) {
      console.warn(`Airport coordinates not found for: ${destination}, using default distance: 10 km`);
      return 10;
    }
  }

  // If coordinates are not available, return a default distance
  if (!originCoords.lat || !originCoords.lng || !destinationCoords.lat || !destinationCoords.lng) {
    console.warn('Coordinates not available for fallback calculation, using default distance: 10 km');
    return 10; // Default 10 km
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(destinationCoords.lat - originCoords.lat);
  const dLng = toRadians(destinationCoords.lng - originCoords.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(originCoords.lat)) * Math.cos(toRadians(destinationCoords.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Convert degrees to radians
 * @param {number} degrees 
 * @returns {number} radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

module.exports = {
  calculateDistance,
  calculateFallbackDistance
};
