const axios = require('axios');
const serviceAreaConfig = require('../config/serviceArea');

/**
 * Validate if a location is within the serviceable area
 * @param {string|Object} location - Location string or coordinates {lat, lng}
 * @returns {Promise<Object>} Validation result with details
 */
const validateServiceArea = async (location) => {
  try {
    // If location is coordinates, validate directly
    if (typeof location === 'object' && location.lat && location.lng) {
      const isServiceable = serviceAreaConfig.isWithinServiceArea(location.lat, location.lng);
      return {
        isServiceable,
        location: `${location.lat}, ${location.lng}`,
        reason: isServiceable ? 'Within service area' : 'Outside service area coordinates',
        coordinates: location
      };
    }

    // If location is a string, use geocoding to get details
    if (typeof location === 'string') {
      const locationDetails = await getLocationDetails(location);
      
      if (!locationDetails) {
        return {
          isServiceable: false,
          location,
          reason: 'Unable to determine location details',
          coordinates: null
        };
      }

      // Check multiple validation methods
      const validationResults = {
        coordinates: serviceAreaConfig.isWithinServiceArea(locationDetails.lat, locationDetails.lng),
        city: serviceAreaConfig.isCityServiceable(locationDetails.city),
        state: serviceAreaConfig.isStateServiceable(locationDetails.state)
      };

      // Location is serviceable if any validation method passes
      const isServiceable = validationResults.coordinates || validationResults.city || validationResults.state;

      return {
        isServiceable,
        location,
        reason: isServiceable ? 
          `Location in ${locationDetails.state || locationDetails.city}` : 
          `Location outside service area (${locationDetails.state || 'Unknown state'})`,
        coordinates: { lat: locationDetails.lat, lng: locationDetails.lng },
        details: locationDetails,
        validationMethods: validationResults
      };
    }

    return {
      isServiceable: false,
      location,
      reason: 'Invalid location format',
      coordinates: null
    };

  } catch (error) {
    console.error('Error validating service area:', error.message);
    return {
      isServiceable: false,
      location,
      reason: `Validation error: ${error.message}`,
      coordinates: null
    };
  }
};

/**
 * Get detailed location information using Google Maps Geocoding API
 * @param {string} address - Address string
 * @returns {Promise<Object|null>} Location details or null
 */
const getLocationDetails = async (address) => {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      console.warn('Google Maps API key not configured, using fallback validation');
      return getFallbackLocationDetails(address);
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const response = await axios.get(url);

    if (response.data.status !== 'OK' || !response.data.results.length) {
      console.warn(`Geocoding failed for address: ${address}`);
      return getFallbackLocationDetails(address);
    }

    const result = response.data.results[0];
    const location = result.geometry.location;
    
    // Extract address components
    const addressComponents = result.address_components;
    let city = '';
    let state = '';
    let country = '';

    addressComponents.forEach(component => {
      const types = component.types;
      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      }
      if (types.includes('country')) {
        country = component.long_name;
      }
    });

    return {
      lat: location.lat,
      lng: location.lng,
      city,
      state,
      country,
      formattedAddress: result.formatted_address
    };

  } catch (error) {
    console.error('Geocoding API error:', error.message);
    return getFallbackLocationDetails(address);
  }
};

/**
 * Fallback location validation when API is not available
 * @param {string} address - Address string
 * @returns {Object|null} Basic location details or null
 */
const getFallbackLocationDetails = (address) => {
  if (!address || typeof address !== 'string') return null;

  const addressLower = address.toLowerCase();
  
  // Check if address contains serviceable city names
  const foundCity = serviceAreaConfig.serviceableCities.find(city => 
    addressLower.includes(city.toLowerCase())
  );

  // Check if address contains serviceable state names
  const foundState = serviceAreaConfig.serviceableStates.find(state => 
    addressLower.includes(state.toLowerCase())
  );

  if (foundCity || foundState) {
    return {
      lat: null,
      lng: null,
      city: foundCity || '',
      state: foundState || '',
      country: 'India',
      formattedAddress: address
    };
  }

  return null;
};

/**
 * Validate multiple locations for service area
 * @param {Array} locations - Array of location strings or coordinates
 * @returns {Promise<Array>} Array of validation results
 */
const validateMultipleLocations = async (locations) => {
  if (!Array.isArray(locations)) return [];
  
  const validationPromises = locations.map(location => validateServiceArea(location));
  return await Promise.all(validationPromises);
};

/**
 * Check if ride is within service area (validates pickup and drop locations)
 * @param {Object} rideData - Ride data with pickup and drop locations
 * @returns {Promise<Object>} Validation result for the ride
 */
const validateRideServiceArea = async (rideData) => {
  const { pickup_location, drop_location, pickup_lat, pickup_lng, drop_lat, drop_lng } = rideData;
  
  const locationsToValidate = [];
  
  // Add pickup location
  if (pickup_lat && pickup_lng) {
    locationsToValidate.push({ lat: pickup_lat, lng: pickup_lng, type: 'pickup' });
  } else if (pickup_location) {
    locationsToValidate.push({ location: pickup_location, type: 'pickup' });
  }
  
  // Add drop location
  if (drop_lat && drop_lng) {
    locationsToValidate.push({ lat: drop_lat, lng: drop_lng, type: 'drop' });
  } else if (drop_location) {
    locationsToValidate.push({ location: drop_location, type: 'drop' });
  }

  const validationResults = [];
  
  for (const loc of locationsToValidate) {
    const locationToValidate = loc.lat && loc.lng ? { lat: loc.lat, lng: loc.lng } : loc.location;
    const result = await validateServiceArea(locationToValidate);
    result.locationType = loc.type;
    validationResults.push(result);
  }

  // Check if all locations are serviceable
  const allServiceable = validationResults.every(result => result.isServiceable);
  const nonServiceableLocations = validationResults.filter(result => !result.isServiceable);

  return {
    isRideServiceable: allServiceable,
    validationResults,
    nonServiceableLocations,
    message: allServiceable ? 
      'All locations are within service area' : 
      `Some locations are outside service area: ${nonServiceableLocations.map(loc => `${loc.locationType} (${loc.reason})`).join(', ')}`,
    serviceAreaDescription: serviceAreaConfig.getServiceAreaDescription()
  };
};

module.exports = {
  validateServiceArea,
  getLocationDetails,
  validateMultipleLocations,
  validateRideServiceArea,
  serviceAreaConfig
};
