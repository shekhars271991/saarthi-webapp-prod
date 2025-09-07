import axios from 'axios';
import { toast } from 'react-hot-toast';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const handleError = (error: any) => {

  throw error;
};

export const signup = async (name: string, email: string, phone_number: string) => {
  try {
    const response = await api.post('/signup', { name, email, phone_number });
    // toast.success('Signup successful');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const verifyOtp = async (phone_number: string, otp: string) => {
  try {
    const response = await api.post('/verify', { phone_number, otp });
    // toast.success('OTP verified, account activated');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};


export const generateOTP = async (phone_number: string) => {
  try {
    const response = await api.post('/generate-otp', { phone_number });
    // toast.success('OTP sent to your mobile phone');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
export const loginOtp = async (phone_number: string, otp: string) => {
  try {
    const response = await api.post('/login', { phone_number, otp });
    // toast.success('Login successful');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const calculateFareHourly = async (user_id: string, hours: number, pickup_location: string, pickup_lat: number, pickup_lng: number, pickup_datetime: string) => {
  try {
    const response = await api.post('/fare/check', {
      user_id,
      ride_type: 'hourly',
      hours,
      pickup_location,
      pickup_lat,
      pickup_lng,
      pickup_datetime,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const calculateFareOutstation = async (user_id: string, pickup_location: string, pickup_lat: number, pickup_lng: number, pickup_datetime: string) => {
  try {
    const response = await api.post('/fare/check', {
      user_id,
      ride_type: 'outstation',
      pickup_location,
      pickup_lat,
      pickup_lng,
      pickup_datetime,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const calculateFareAirTransfer = async (user_id: string, pickup_location: string, pickup_lat: number, pickup_lng: number, pickup_datetime: string) => {
  try {
    const response = await api.post('/fare/check', {
      user_id,
      ride_type: 'airport-transfer',
      pickup_location,
      pickup_lat,
      pickup_lng,
      pickup_datetime,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const listRides = async (phone_number: string) => {
  try {
    const response = await api.get('/rides', { params: { phone_number } });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const generateInvoice = async (ride_id: string) => {
  try {
    const response = await api.post('/invoice', { ride_id });
    toast.success('Invoice generated');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getTestimonials = async () => {
  try {
    const response = await api.get('/testimonials');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const confirmBooking = async (ride_id: string) => {
  try {
    const response = await api.post('/booking/confirm', { ride_id });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const cancelRide = async (ride_id: string, cancel_reason: string) => {
  try {
    const response = await api.post('/ride/cancel', { ride_id, cancel_reason });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};


export const updateUserProfile = async (userId:any, name:any) => {
  try {
    const response = await api.post('/user/update-profile', {user_id :userId, name });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

