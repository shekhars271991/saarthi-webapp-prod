const axios = require('axios');

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
 * @param {Object} origin - Origin coordinates {lat, lng}
 * @param {Object} destination - Destination coordinates {lat, lng}
 * @returns {number} Distance in kilometers
 */
const calculateFallbackDistance = (origin, destination) => {
  // If coordinates are not available, return a default distance
  if (!origin.lat || !origin.lng || !destination.lat || !destination.lng) {
    console.warn('Coordinates not available for fallback calculation, using default distance: 10 km');
    return 10; // Default 10 km
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(destination.lat - origin.lat);
  const dLng = toRadians(destination.lng - origin.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(origin.lat)) * Math.cos(toRadians(destination.lat)) *
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
