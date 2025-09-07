// Airport configuration that can be driven from environment variables
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

  // Default airport
  defaultAirport: process.env.NEXT_PUBLIC_DEFAULT_AIRPORT || 'Jay Prakash Narayan Airport (Patna)'
};

export type AvailableAirport = typeof airportConfig.availableAirports[number];
export type AirportDisplayNames = typeof airportConfig.airportDisplayNames;
