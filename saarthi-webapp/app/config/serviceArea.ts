// Service area configuration for frontend validation
export const serviceAreaConfig = {
  // Serviceable states
  serviceableStates: [
    'Bihar',
    'Jharkhand', 
    'Uttar Pradesh',
    'UP'
  ],

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
   * Check if a city name is likely in serviceable area (basic check)
   * @param cityName - Name of the city
   * @returns True if city is likely serviceable
   */
  isCityLikelyServiceable: function(cityName: string): boolean {
    if (!cityName) return false;
    
    const normalizedCity = cityName.toLowerCase().trim();
    return this.serviceableCities.some(city => 
      city.toLowerCase().includes(normalizedCity) || 
      normalizedCity.includes(city.toLowerCase())
    );
  },

  /**
   * Check if a state is serviceable
   * @param stateName - Name of the state
   * @returns True if state is serviceable
   */
  isStateServiceable: function(stateName: string): boolean {
    if (!stateName) return false;
    
    const normalizedState = stateName.toLowerCase().trim();
    return this.serviceableStates.some(state => 
      state.toLowerCase() === normalizedState ||
      normalizedState.includes(state.toLowerCase())
    );
  },

  /**
   * Get serviceable area description
   * @returns Description of serviceable area
   */
  getServiceAreaDescription: function(): string {
    return `We currently serve ${this.serviceableStates.join(', ')}. Service outside these areas is not available.`;
  },

  /**
   * Basic location validation (client-side check)
   * @param location - Location string
   * @returns Basic validation result
   */
  basicLocationValidation: function(location: string): { isLikelyServiceable: boolean; reason: string } {
    if (!location) {
      return { isLikelyServiceable: false, reason: 'No location provided' };
    }

    const locationLower = location.toLowerCase();
    
    // Check for serviceable cities
    if (this.isCityLikelyServiceable(location)) {
      return { isLikelyServiceable: true, reason: 'City appears to be in service area' };
    }

    // Check for serviceable states
    const foundState = this.serviceableStates.find(state => 
      locationLower.includes(state.toLowerCase())
    );
    
    if (foundState) {
      return { isLikelyServiceable: true, reason: `Location in ${foundState}` };
    }

    // Check for common non-serviceable indicators
    const nonServiceableIndicators = [
      'delhi', 'mumbai', 'bangalore', 'chennai', 'hyderabad', 'pune', 'kolkata',
      'ahmedabad', 'surat', 'jaipur', 'kochi', 'coimbatore', 'indore', 'bhopal',
      'nagpur', 'visakhapatnam', 'vadodara', 'rajkot', 'madurai', 'mysore',
      'kerala', 'karnataka', 'tamil nadu', 'maharashtra', 'gujarat', 'rajasthan',
      'punjab', 'haryana', 'himachal pradesh', 'uttarakhand', 'odisha', 'assam',
      'west bengal', 'andhra pradesh', 'telangana', 'madhya pradesh', 'goa'
    ];

    const hasNonServiceableIndicator = nonServiceableIndicators.some(indicator => 
      locationLower.includes(indicator)
    );

    if (hasNonServiceableIndicator) {
      return { isLikelyServiceable: false, reason: 'Location appears to be outside service area' };
    }

    // If we can't determine, assume it might be serviceable (server will validate)
    return { isLikelyServiceable: true, reason: 'Location validation pending server check' };
  }
};

export type ServiceAreaValidation = {
  isLikelyServiceable: boolean;
  reason: string;
};
