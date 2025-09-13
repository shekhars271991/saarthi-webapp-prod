// Service area configuration for location validation
const serviceAreaConfig = {
  // Serviceable states
  serviceableStates: [
    'Bihar',
    'Jharkhand', 
    'Uttar Pradesh',
    'UP' // Alternative name for Uttar Pradesh
  ],

  // State boundaries (approximate bounding boxes)
  stateBoundaries: {
    'Bihar': {
      north: 27.5,
      south: 24.2,
      east: 88.2,
      west: 83.3
    },
    'Jharkhand': {
      north: 24.8,
      south: 21.9,
      east: 87.9,
      west: 83.3
    },
    'Uttar Pradesh': {
      north: 30.4,
      south: 23.9,
      east: 84.6,
      west: 77.3  // Adjusted to exclude Delhi area
    }
  },

  // Major cities in serviceable area for quick validation
  serviceableCities: [
    // Bihar cities
    'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Bihar Sharif', 
    'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Purnia', 'Saharsa',
    'Sasaram', 'Hajipur', 'Dehri', 'Siwan', 'Motihari', 'Nawada', 'Bagaha',
    
    // Jharkhand cities
    'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Phusro', 
    'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar', 'Chirkunda',
    
    // Uttar Pradesh cities (major ones)
    'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Prayagraj',
    'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida',
    'Ghaziabad', 'Faizabad', 'Ayodhya', 'Muzaffarnagar', 'Mathura', 'Rampur',
    'Shahjahanpur', 'Farrukhabad', 'Mau', 'Hapur', 'Etawah', 'Mirzapur',
    'Bulandshahr', 'Sambhal', 'Amroha', 'Hardoi', 'Fatehpur', 'Raebareli',
    'Orai', 'Sitapur', 'Bahraich', 'Modinagar', 'Unnao', 'Jhansi', 'Lakhimpur',
    'Hathras', 'Banda', 'Pilibhit', 'Barabanki', 'Khurja', 'Gonda', 'Mainpuri',
    'Lalitpur', 'Etah', 'Deoria', 'Ujhani', 'Ghazipur', 'Sultanpur', 'Azamgarh',
    'Bijnor', 'Sahaswan', 'Basti', 'Chandausi', 'Akbarpur', 'Ballia', 'Tanda'
  ],

  /**
   * Check if coordinates are within serviceable area
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {boolean} True if within serviceable area
   */
  isWithinServiceArea: function(lat, lng) {
    if (!lat || !lng) return false;

    // Check against each state boundary
    for (const [state, boundary] of Object.entries(this.stateBoundaries)) {
      if (lat >= boundary.south && lat <= boundary.north && 
          lng >= boundary.west && lng <= boundary.east) {
        return true;
      }
    }
    return false;
  },

  /**
   * Check if a city name is in serviceable area
   * @param {string} cityName - Name of the city
   * @returns {boolean} True if city is serviceable
   */
  isCityServiceable: function(cityName) {
    if (!cityName) return false;
    
    const normalizedCity = cityName.toLowerCase().trim();
    return this.serviceableCities.some(city => 
      city.toLowerCase().includes(normalizedCity) || 
      normalizedCity.includes(city.toLowerCase())
    );
  },

  /**
   * Check if a state is serviceable
   * @param {string} stateName - Name of the state
   * @returns {boolean} True if state is serviceable
   */
  isStateServiceable: function(stateName) {
    if (!stateName) return false;
    
    const normalizedState = stateName.toLowerCase().trim();
    return this.serviceableStates.some(state => 
      state.toLowerCase() === normalizedState ||
      normalizedState.includes(state.toLowerCase())
    );
  },

  /**
   * Get serviceable area description
   * @returns {string} Description of serviceable area
   */
  getServiceAreaDescription: function() {
    return `We currently serve ${this.serviceableStates.join(', ')}. Service outside these areas is not available.`;
  }
};

module.exports = serviceAreaConfig;
