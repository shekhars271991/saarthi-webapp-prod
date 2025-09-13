// Airport configuration with coordinates for distance calculation
export const airportConfig = {
  // Available airports - can be overridden by environment variables
  availableAirports: process.env.NEXT_PUBLIC_AVAILABLE_AIRPORTS 
    ? process.env.NEXT_PUBLIC_AVAILABLE_AIRPORTS.split(',') 
    : [
        'Jay Prakash Narayan Airport (Patna)',
        'Gaya International Airport (Gaya)', 
        'Darbhanga Airport (Darbhanga)',
        'Muzaffarpur Airport (Muzaffarpur)'
      ],

  // Airport display names mapping with proper typing
  airportDisplayNames: {
    'Jay Prakash Narayan Airport (Patna)': 'Jay Prakash Narayan Airport (Patna)',
    'Gaya International Airport (Gaya)': 'Gaya International Airport (Gaya)',
    'Darbhanga Airport (Darbhanga)': 'Darbhanga Airport (Darbhanga)',
    'Muzaffarpur Airport (Muzaffarpur)': 'Muzaffarpur Airport (Muzaffarpur)'
  } as const,

  // Airport coordinates for distance calculation
  airportCoordinates: {
    'Jay Prakash Narayan Airport (Patna)': { lat: 25.5913, lng: 85.0878 },
    'Gaya International Airport (Gaya)': { lat: 24.7444, lng: 84.9511 },
    'Darbhanga Airport (Darbhanga)': { lat: 26.1928, lng: 85.7578 },
    'Muzaffarpur Airport (Muzaffarpur)': { lat: 26.1197, lng: 85.3150 }
  } as const,

  // Default airport
  defaultAirport: process.env.NEXT_PUBLIC_DEFAULT_AIRPORT || 'Jay Prakash Narayan Airport (Patna)'
};

export type AvailableAirport = typeof airportConfig.availableAirports[number];
export type AirportDisplayNames = typeof airportConfig.airportDisplayNames;
