// Airport configuration with coordinates for distance calculation
const airportConfig = {
  // Available airports
  availableAirports: [
    'Jay Prakash Narayan Airport (Patna)',
    'Gaya International Airport (Gaya)', 
    'Darbhanga Airport (Darbhanga)',
    'Muzaffarpur Airport (Muzaffarpur)'
  ],

  // Airport display names mapping
  airportDisplayNames: {
    'Jay Prakash Narayan Airport (Patna)': 'Jay Prakash Narayan Airport (Patna)',
    'Gaya International Airport (Gaya)': 'Gaya International Airport (Gaya)',
    'Darbhanga Airport (Darbhanga)': 'Darbhanga Airport (Darbhanga)',
    'Muzaffarpur Airport (Muzaffarpur)': 'Muzaffarpur Airport (Muzaffarpur)'
  },

  // Airport coordinates for distance calculation
  airportCoordinates: {
    'Jay Prakash Narayan Airport (Patna)': { lat: 25.5913, lng: 85.0878 },
    'Gaya International Airport (Gaya)': { lat: 24.7444, lng: 84.9511 },
    'Darbhanga Airport (Darbhanga)': { lat: 26.1928, lng: 85.7578 },
    'Muzaffarpur Airport (Muzaffarpur)': { lat: 26.1197, lng: 85.3150 }
  },

  // Default airport
  defaultAirport: 'Jay Prakash Narayan Airport (Patna)',

  /**
   * Get airport coordinates by airport name
   * @param {string} airportName - Name of the airport
   * @returns {Object|null} Airport coordinates {lat, lng} or null if not found
   */
  getAirportCoordinates: function(airportName) {
    return this.airportCoordinates[airportName] || null;
  },

  /**
   * Check if airport exists in configuration
   * @param {string} airportName - Name of the airport
   * @returns {boolean} True if airport exists
   */
  isValidAirport: function(airportName) {
    return this.availableAirports.includes(airportName);
  },

  /**
   * Get default airport coordinates
   * @returns {Object} Default airport coordinates {lat, lng}
   */
  getDefaultAirportCoordinates: function() {
    return this.airportCoordinates[this.defaultAirport];
  }
};

module.exports = airportConfig;
