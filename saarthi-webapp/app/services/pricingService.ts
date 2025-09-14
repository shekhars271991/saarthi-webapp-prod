import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_MODE === 'prod' 
  ? 'https://api.saarthi.founderjp.com/api' 
  : 'http://localhost:4000/api';

export interface PricingRequest {
  ride_type: 'airport-transfer' | 'hourly' | 'outstation';
  pickup_location?: string;
  drop_location?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  drop_lat?: number;
  drop_lng?: number;
  selected_airport?: string; // Required for airport-transfer
  hours?: number; // Required for hourly
}

export interface PricingResponse {
  success: boolean;
  data?: {
    ride_type: string;
    fare: number;
    distance: number;
    breakdown: {
      base_fare?: number;
      distance_fare?: number;
      hourly_fare?: number;
      total_fare: number;
      distance_km: number;
      hours?: number;
    };
    service_area_validation: {
      isRideServiceable: boolean;
      pickupServiceable?: boolean;
      dropServiceable?: boolean;
      message?: string;
    };
    pricing_details: {
      calculated_at: string;
      origin_formatted: string;
      destination_formatted: string;
      hours: number;
    };
  };
  message?: string;
  error?: string;
  details?: any;
}

export interface PricingConfig {
  success: boolean;
  data?: {
    pricing_config: {
      airport_transfer: {
        base_fare: number;
        per_km_rate: number;
        description: string;
      };
      hourly: {
        per_hour_rate: number;
        per_km_rate: number;
        description: string;
      };
      outstation: {
        per_km_rate: number;
        description: string;
      };
    };
    currency: string;
    last_updated: string;
  };
  message?: string;
  error?: string;
}

/**
 * Calculate pricing for a ride
 */
export const calculatePricing = async (request: PricingRequest): Promise<PricingResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/pricing/calculate`, request, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    return response.data;
  } catch (error: any) {
    console.error('Error calculating pricing:', error);
    
    if (error.response?.data) {
      return error.response.data;
    }
    
    return {
      success: false,
      message: error.message || 'Failed to calculate pricing',
      error: 'NETWORK_ERROR'
    };
  }
};

/**
 * Get pricing configuration
 */
export const getPricingConfig = async (): Promise<PricingConfig> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/pricing/config`, {
      timeout: 5000, // 5 second timeout
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching pricing config:', error);
    
    if (error.response?.data) {
      return error.response.data;
    }
    
    return {
      success: false,
      message: error.message || 'Failed to fetch pricing configuration',
      error: 'NETWORK_ERROR'
    };
  }
};

/**
 * Format fare for display
 */
export const formatFare = (fare: number): string => {
  return `₹${fare.toLocaleString('en-IN')}`;
};

/**
 * Format distance for display
 */
export const formatDistance = (distance: number): string => {
  return `${distance.toFixed(1)} km`;
};

/**
 * Get fare breakdown text
 */
export const getFareBreakdownText = (breakdown: PricingResponse['data']['breakdown']): string[] => {
  if (!breakdown) return [];
  
  const lines: string[] = [];
  
  if (breakdown.base_fare && breakdown.base_fare > 0) {
    lines.push(`Base Fare: ${formatFare(breakdown.base_fare)}`);
  }
  
  if (breakdown.distance_fare && breakdown.distance_fare > 0) {
    lines.push(`Distance (${formatDistance(breakdown.distance_km)}): ${formatFare(breakdown.distance_fare)}`);
  }
  
  if (breakdown.hourly_fare && breakdown.hourly_fare > 0 && breakdown.hours) {
    lines.push(`Hourly (${breakdown.hours}h): ${formatFare(breakdown.hourly_fare)}`);
  }
  
  lines.push(`Total: ${formatFare(breakdown.total_fare)}`);
  
  return lines;
};
