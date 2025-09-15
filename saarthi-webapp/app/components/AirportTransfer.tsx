
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Info, Plane, ArrowLeft, Navigation } from 'lucide-react';
import { cancelRide, calculateFareAirTransfer, confirmBooking } from '../services/apiService';
import { calculatePricing, formatFare, formatDistance, getFareBreakdownText, PricingResponse } from '../services/pricingService';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { listRides } from '../services/apiService';
import ScheduleSelector from './ScheduleSelector';
import AirportSelector from './AirportSelector';
import CarSelector from './CarSelector';
import { useLanguage } from '../contexts/LanguageContext';
import { airportConfig } from '../config/airports';
import { serviceAreaConfig } from '../config/serviceArea';
import RideTypeNavigation from './RideTypeNavigation';

// New fare check API endpoint from Postman collection
const checkFareApi = async (data: any) => {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api'}/fare/check`, data);
    return response.data;
  } catch (error) {
    toast.error('Failed to check fare');
    throw error;
  }
};

// New pricing hook using backend pricing API for airport transfers
const useAirportTransferPricing = () => {
  const [pricingData, setPricingData] = React.useState<PricingResponse['data'] | null>(null);
  const [pricingLoading, setPricingLoading] = React.useState(false);
  const [pricingError, setPricingError] = React.useState<string | null>(null);

  const calculatePrice = async (
    tripType: 'drop' | 'pickup',
    locationFrom: string,
    locationTo: string,
    fromCoords: { lat: number, lng: number } | null,
    toCoords: { lat: number, lng: number } | null,
    selectedAirport: string
  ) => {
    setPricingLoading(true);
    setPricingError(null);
    setPricingData(null);
    
    try {
      const response = await calculatePricing({
        ride_type: 'airport-transfer',
        pickup_location: tripType === 'drop' ? locationFrom : undefined,
        drop_location: tripType === 'pickup' ? locationTo : undefined,
        pickup_lat: tripType === 'drop' ? fromCoords?.lat : undefined,
        pickup_lng: tripType === 'drop' ? fromCoords?.lng : undefined,
        drop_lat: tripType === 'pickup' ? toCoords?.lat : undefined,
        drop_lng: tripType === 'pickup' ? toCoords?.lng : undefined,
        selected_airport: selectedAirport
      });

      if (response.success && response.data) {
        setPricingData(response.data);
      } else {
        setPricingError(response.message || 'Could not calculate pricing');
        if (response.error === 'OUTSIDE_SERVICE_AREA') {
          toast.error('Service not available in this area', {
            duration: 4000,
            position: 'top-center',
          });
        }
      }
    } catch (error: any) {
      setPricingError(error.message || 'Could not calculate pricing');
      toast.error('Failed to calculate pricing', {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setPricingLoading(false);
    }
  };

  return { 
    pricingData, 
    pricingLoading, 
    pricingError, 
    calculatePrice,
    distance: pricingData?.distance || null,
    carOptions: pricingData?.car_options || []
  };
};

// Declare Google Maps types
declare global {
  interface Window {
    google: typeof google;
  }
}

const AirportTransfer: React.FC = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const mode = process.env.NEXT_PUBLIC_MODE || 'prod';

  const [bookingStep, setBookingStep] = useState<'form' | 'complete'>('form');
  const [tripType, setTripType] = useState<'drop' | 'pickup'>('drop');
  const [locationFrom, setLocationFrom] = useState<string>('');
  const [locationTo, setLocationTo] = useState<string>('');
  const [schedule, setSchedule] = useState<string>('');
  const [passengers, setPassengers] = useState<number>(2);
  const [suitcases, setSuitcases] = useState<number>(2);
  const [flightNumber, setFlightNumber] = useState<string>('132');
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const [mapSelectionMode, setMapSelectionMode] = useState<'from' | 'to' | null>(null);
  const [fromCoords, setFromCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [toCoords, setToCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [showFromDropdown, setShowFromDropdown] = useState<boolean>(false);
  const [showToDropdown, setShowToDropdown] = useState<boolean>(false);
  const [fromSuggestions, setFromSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [toSuggestions, setToSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  const [locationWarnings, setLocationWarnings] = useState<{pickup?: string, drop?: string}>({});

  const [bookingStatus, setBookingStatus] = useState<'confirmed' | 'completed' | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [apiCarOptions, setApiCarOptions] = useState<any[]>([]);
  const [apiFare, setApiFare] = useState<number | null>(null);
  const [apiFareLoading, setApiFareLoading] = useState(false);
  const [apiFareError, setApiFareError] = useState<string | null>(null);
  const [rideId, setRideId] = useState<string | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);
  const modalMapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  // Use pricing hook
  const { pricingData, pricingLoading, pricingError, calculatePrice, distance: calculatedDistance, carOptions } = useAirportTransferPricing();

  // Calculate selected car fare - prioritize API car options
  const currentCarOptions = apiCarOptions.length > 0 ? apiCarOptions : carOptions;
  const selectedCarFare = selectedCarId && currentCarOptions.length > 0 
    ? currentCarOptions.find(car => car.id === selectedCarId)?.fare || currentCarOptions[0]?.fare || 0
    : currentCarOptions[0]?.fare || 0;



  // Load Google Maps scripts
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (typeof window.google === 'undefined') {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeAutocomplete;
        script.onerror = () => console.error('Failed to load Google Maps script');
        document.head.appendChild(script);
      } else {
        initializeAutocomplete();
      }
    };

    loadGoogleMapsScript();
  }, []);

  // Restore pendingAirportTransfer after login
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      const pending = localStorage.getItem('pendingAirportTransfer');
      if (user && pending) {
        try {
          const data = JSON.parse(pending);
          setTripType(data.tripType || 'drop');
          setLocationFrom(data.locationFrom || '');
          setLocationTo(data.locationTo || '');
          setSchedule(data.schedule || '');
          setPassengers(data.passengers || 2);
          setSuitcases(data.suitcases || 2);
          setFlightNumber(data.flightNumber || '132');
          setFromCoords(data.fromCoords || null);
          setToCoords(data.toCoords || null);
          
          // Call check fare API with restored data using the same logic as handleCheckFare
          (async () => {
            if (!data.locationFrom || !data.locationTo || !data.schedule) {
              localStorage.removeItem('pendingAirportTransfer');
              return;
            }

            setApiFareLoading(true);
            setApiFareError(null);
            
            let phoneNumber = '';
            let userId = '';
            try {
              const parsedUser = JSON.parse(user);
              phoneNumber = parsedUser.phoneNumber || '';
              userId = parsedUser._id || '';
            } catch {}
            
            try {
              // Prepare data for new fare check API with airport_direction and airport_terminal
              const fareRequestData = {
                user_id: userId,
                ride_type: 'airport-transfer',
                hours: 0,
                pickup_location: data.tripType === 'drop' ? data.locationFrom : '',
                drop_location: data.tripType === 'pickup' ? data.locationTo : '',
                pickup_lat: data.tripType === 'drop' ? data.fromCoords?.lat || 0 : 0,
                pickup_lng: data.tripType === 'drop' ? data.fromCoords?.lng || 0 : 0,
                drop_lat: data.tripType === 'pickup' ? data.toCoords?.lat || 0 : 0,
                drop_lng: data.tripType === 'pickup' ? data.toCoords?.lng || 0 : 0,
                pickup_datetime: data.schedule,
                airport_direction: data.tripType === 'drop' ? 'to' : 'from',
                airport_terminal: data.tripType === 'drop' ? data.locationTo : data.locationFrom,
              };

              const fareData = await checkFareApi(fareRequestData);
              
              // Handle the new API response format with car_options
              if (fareData && fareData.car_options && Array.isArray(fareData.car_options)) {
                setApiCarOptions(fareData.car_options);
                setRideId(fareData?.ride_id);
                
                // Set the fare based on first car by default
                if (fareData.car_options.length > 0) {
                  setApiFare(fareData.car_options[0].fare);
                }
              } else if (fareData && fareData.fare_details) {
                setApiFare(fareData.fare_details.fare);
                setRideId(fareData?.ride_id);
              } else if (fareData && typeof fareData.fare === 'number') {
                setApiFare(fareData.fare);
                setRideId(fareData?.ride_id || null);
              } else if (typeof fareData === 'number') {
                setApiFare(fareData);
              } else {
                setApiFareError('Could not fetch fare from server.');
              }
              setBookingStep('complete');
            } catch {
              setApiFareError('Could not fetch fare from server.');
            } finally {
              setApiFareLoading(false);
              localStorage.removeItem('pendingAirportTransfer');
            }
          })();
        } catch {
          localStorage.removeItem('pendingAirportTransfer');
        }
      }
    }
  }, []);

  // Auto-select first car option when car options are loaded
  useEffect(() => {
    const currentCarOptions = apiCarOptions.length > 0 ? apiCarOptions : carOptions;
    if (currentCarOptions && currentCarOptions.length > 0 && !selectedCarId) {
      setSelectedCarId(currentCarOptions[0].id);
    }
  }, [carOptions, apiCarOptions, selectedCarId]);

  // Initialize autocomplete with custom dropdown
  const initializeAutocomplete = () => {
    if (!window.google) return;

    autocompleteServiceRef.current = new google.maps.places.AutocompleteService();

    const dummyMap = new google.maps.Map(document.createElement('div'));
    placesServiceRef.current = new google.maps.places.PlacesService(dummyMap);
  };

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  // Auto-rotate quotes every 5 seconds (for step 1)

  // Handle input changes and show suggestions
  const handleFromInputChange = (value: string) => {
    setLocationFrom(value);
    if (value.length > 2 && autocompleteServiceRef.current) {
      autocompleteServiceRef.current.getPlacePredictions(
        { input: value },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setFromSuggestions(predictions);
            setShowFromDropdown(true);
          }
        }
      );
    } else {
      setShowFromDropdown(value.length === 0);
    }
  };

  const handleToInputChange = (value: string) => {
    setLocationTo(value);
    if (value.length > 2 && autocompleteServiceRef.current) {
      autocompleteServiceRef.current.getPlacePredictions(
        { input: value },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setToSuggestions(predictions);
            setShowToDropdown(true);
          }
        }
      );
    } else {
      setShowToDropdown(value.length === 0);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (prediction: google.maps.places.AutocompletePrediction, type: 'from' | 'to') => {
    if (!placesServiceRef.current) return;

    placesServiceRef.current.getDetails(
      { placeId: prediction.place_id },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
          const coords = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };

          if (type === 'from') {
            setLocationFrom(place.formatted_address || prediction.description);
            setFromCoords(coords);
            setShowFromDropdown(false);
            validateLocationServiceArea(place.formatted_address || prediction.description, 'pickup');
          } else {
            setLocationTo(place.formatted_address || prediction.description);
            setToCoords(coords);
            setShowToDropdown(false);
            validateLocationServiceArea(place.formatted_address || prediction.description, 'drop');
          }
        }
      }
    );
  };

  // Handle map selection option
  const handleMapSelectionOption = (type: 'from' | 'to') => {
    setMapSelectionMode(type);
    setShowMapModal(true);
    setShowFromDropdown(false);
    setShowToDropdown(false);
  };

  // Validate location for service area
  const validateLocationServiceArea = (location: string, field: 'pickup' | 'drop') => {
    if (!location) {
      setLocationWarnings(prev => ({ ...prev, [field]: undefined }));
      return;
    }

    const validation = serviceAreaConfig.basicLocationValidation(location);
    
    if (!validation.isLikelyServiceable) {
      setLocationWarnings(prev => ({ 
        ...prev, 
        [field]: `⚠️ ${validation.reason}. ${serviceAreaConfig.getServiceAreaDescription()}` 
      }));
    } else {
      setLocationWarnings(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Get current location
  const getCurrentLocation = (type: 'from' | 'to') => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Use Google Maps Geocoding API to get address from coordinates
        if (window.google && window.google.maps) {
          const geocoder = new google.maps.Geocoder();
          const latlng = { lat: latitude, lng: longitude };
          
          geocoder.geocode({ location: latlng }, (results, status) => {
            setIsGettingLocation(false);
            
            if (status === 'OK' && results && results[0]) {
              const address = results[0].formatted_address;
              const coords = { lat: latitude, lng: longitude };
              
              if (type === 'from') {
                setLocationFrom(address);
                setFromCoords(coords);
                setShowFromDropdown(false);
              } else {
                setLocationTo(address);
                setToCoords(coords);
                setShowToDropdown(false);
              }
              
              toast.success('Current location detected successfully');
            } else {
              toast.error('Unable to get address for current location');
            }
          });
        } else {
          // Fallback: just use coordinates
          const coords = { lat: latitude, lng: longitude };
          const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          if (type === 'from') {
            setLocationFrom(address);
            setFromCoords(coords);
            setShowFromDropdown(false);
          } else {
            setLocationTo(address);
            setToCoords(coords);
            setShowToDropdown(false);
          }
          
          setIsGettingLocation(false);
          toast.success('Current location detected');
        }
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = 'Unable to get current location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Initialize modal map
  useEffect(() => {
    if (showMapModal && modalMapRef.current && window.google) {
      const map = new google.maps.Map(modalMapRef.current, {
        center: { lat: 28.6139, lng: 77.2090 }, // Delhi coordinates
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
      });
      googleMapRef.current = map;

      markerRef.current = new google.maps.Marker({
        map: map,
        draggable: true,
      });

      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng && markerRef.current) {
          markerRef.current.setPosition(e.latLng);
        }
      });
    }
  }, [showMapModal]);

  const handleMapSelection = () => {
    if (markerRef.current && mapSelectionMode) {
      const position = markerRef.current.getPosition();
      if (position) {
        const coords = {
          lat: position.lat(),
          lng: position.lng(),
        };

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: coords }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const address = results[0].formatted_address;
            if (mapSelectionMode === 'from') {
              setLocationFrom(address);
              setFromCoords(coords);
            } else {
              setLocationTo(address);
              setToCoords(coords);
            }
          }
        });
      }
    }
    setShowMapModal(false);
    setMapSelectionMode(null);
  };

  const incrementPassengers = () => setPassengers((p) => Math.min(p + 1, 10));
  const decrementPassengers = () => setPassengers((p) => Math.max(p - 1, 1));
  const incrementSuitcases = () => setSuitcases((s) => Math.min(s + 1, 10));
  const decrementSuitcases = () => setSuitcases((s) => Math.max(s - 1, 0));

  const [coupon, setCoupon] = useState<string>('');
  const [isTooltipVisible, setTooltipVisible] = useState(false);
  const [discount, setDiscount] = useState<number>(0);

  // Calculate total amount - use API fare when available
  const currentFare = apiFare !== null ? apiFare : selectedCarFare;
  const totalAmount = currentFare - discount;

  const handleApplyCoupon = () => {
    if (coupon.toLowerCase() === 'save200') {
      setDiscount(200);
    } else {
      alert('Invalid coupon code');
    }
  };

  // Handle car selection and update fare
  const handleCarSelect = (carId: string) => {
    setSelectedCarId(carId);
    
    // Update fare based on selected car from API options
    if (apiCarOptions.length > 0) {
      const selectedCar = apiCarOptions.find(car => car.id === carId);
      if (selectedCar) {
        setApiFare(selectedCar.fare);
      }
    }
  };

  const handleCheckFare = async () => {
    if (!locationFrom || !locationTo || !schedule) {
      alert('Please fill in all required fields.');
      return;
    }
    let user = null;
    if (typeof window !== 'undefined') {
      user = localStorage.getItem('user');
    }
    if (!user) {
      // Store form data in localStorage and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'pendingAirportTransfer',
          JSON.stringify({
            tripType,
            locationFrom,
            locationTo,
            schedule,
            passengers,
            suitcases,
            flightNumber,
            fromCoords,
            toCoords,
          })
        );
        window.location.href = '/login?redirect=airport-transfer';
      }
      return;
    }
    setApiFareLoading(true);
    setApiFareError(null);
    try {
      let phoneNumber = '';
      let userId = '';
      if (user) {
        const parsedUser = JSON.parse(user);
        phoneNumber = parsedUser.phoneNumber || '';
        userId = parsedUser._id || '';
      }
      // Prepare data for new fare check API with airport_direction and airport_terminal
      const finalSelectedCarId = selectedCarId || (carOptions.length > 0 ? carOptions[0].id : undefined);
      const data = {
        user_id: userId,
        ride_type: 'airport-transfer',
        hours: 0,
        pickup_location: tripType === 'drop' ? locationFrom : '',
        drop_location: tripType === 'pickup' ? locationTo : '',
        pickup_lat: tripType === 'drop' ? fromCoords?.lat || 0 : 0,
        pickup_lng: tripType === 'drop' ? fromCoords?.lng || 0 : 0,
        drop_lat: tripType === 'pickup' ? toCoords?.lat || 0 : 0,
        drop_lng: tripType === 'pickup' ? toCoords?.lng || 0 : 0,
        pickup_datetime: schedule,
        airport_direction: tripType === 'drop' ? 'to' : 'from',
        airport_terminal: tripType === 'drop' ? locationTo : locationFrom,
        selected_car_id: finalSelectedCarId
      };
      const fareData = await checkFareApi(data);
      
      // Handle the new API response format with car_options
      if (fareData && fareData.car_options && Array.isArray(fareData.car_options)) {
        setApiCarOptions(fareData.car_options);
        setRideId(fareData?.ride_id);
        
        // Set the fare based on selected car or first car
        const selectedCar = fareData.car_options.find((car: any) => car.id === selectedCarId) || fareData.car_options[0];
        if (selectedCar) {
          setApiFare(selectedCar.fare);
        }
      } else if (fareData && fareData.fare_details) {
        setApiFare(fareData.fare_details.fare);
        setRideId(fareData?.ride_id);
      } else if (fareData && typeof fareData.fare === 'number') {
        setApiFare(fareData.fare);
        setRideId(fareData?.ride_id || null);
      } else if (typeof fareData === 'number') {
        setApiFare(fareData);
      } else {
        setApiFareError('Could not fetch fare from server.');
      }
      setBookingStep('complete');
    } catch {
      setApiFareError('Could not fetch fare from server.');
    } finally {
      setApiFareLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowBookingDialog(false);
  };

  const [username, setUsername] = useState<string>('');
  const [editingUsername, setEditingUsername] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [cancelReason, setCancelReason] = useState<string>('');
  const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false);

  // Load user info on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUsername(user.name || '');
          setPhoneNumber(user.phoneNumber || '');
        } catch {}
      }
    }
  }, []);

  const handleUsernameSave = async () => {
    if (username.length > 30) {
      alert('Username must be 30 characters or less.');
      return;
    }
    // Call API to update username
    try {
      // Assuming an API exists to update user info, e.g., /user/update
      // For now, just update localStorage
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.name = username;
          localStorage.setItem('user', JSON.stringify(user));
          setEditingUsername(false);
        }
      }
    } catch {
      alert('Failed to update username.');
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation.');
      return;
    }
    if (!rideId) {
      alert('No ride to cancel.');
      return;
    }
    try {
      await cancelRide(rideId, cancelReason);
      setShowCancelDialog(false);
      setShowBookingDialog(false);
      alert('Booking cancelled successfully.');
      // Optionally redirect or update UI
    } catch {
      alert('Failed to cancel booking.');
    }
  };

  // Check if pickup time is within 3 hours (env variable)
  const isPickupWithin3Hours = () => {
    if (!schedule) return false;
    const pickupTime = new Date(schedule).getTime();
    const now = Date.now();
    const threeHoursMs = (parseInt(process.env.NEXT_PUBLIC_PICKUP_CANCEL_HOURS || '3', 10)) * 60 * 60 * 1000;
    return pickupTime - now <= threeHoursMs;
  };

  const handleBookingConfirmed = async () => {
    if (!rideId) {
      alert('No ride to confirm.');
      return;
    }
    try {
      await confirmBooking(rideId);
      setShowBookingDialog(true);
    } catch {
      alert('Failed to confirm booking.');
    }
  };

  const handleCopyRideId = () => {
    if (rideId) {
      navigator.clipboard.writeText(rideId);
    }
  };

 const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    return `${time} - ${formattedDate}`;
  };
  const baseFare = apiFare !== null ? apiFare : 0; // Prefer API fare, fallback 0

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Left Section - Buddha Image */}
      {bookingStep === 'form' && (
        <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/bodh-gaya3.jpeg)' }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-10" />
        </div>
      )}

      {/* Right Section */}
      <div className={`${bookingStep === 'form' ? 'flex-1 md:w-1/2 p-6 md:p-12' : 'w-full  p-4 md:p-12 flex flex-col'}`}>
        {bookingStep === 'form' ? (
          <div className="w-full max-w-md mx-auto">
            {/* Ride Type Navigation */}
            <div className="mb-6">
              <RideTypeNavigation currentType="airport-transfer" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">{t('airportTransfers')}</h2>

            <div className="flex mb-4 md:mb-6">
              <button
                className={`flex-1 px-3 py-2 md:px-4 md:py-3 rounded-l-full border border-gray-300 text-sm md:text-base ${
                  tripType === 'drop' ? 'bg-orange-200 text-orange-800' : 'bg-white text-gray-700'
                }`}
                onClick={() => setTripType('drop')}
              >
                {t('dropToAirport')}
              </button>
              <button
                className={`flex-1 px-3 py-2 md:px-4 md:py-3 rounded-r-full border border-gray-300 text-sm md:text-base ${
                  tripType === 'pickup' ? 'bg-orange-200 text-orange-800' : 'bg-white text-gray-700'
                }`}
                onClick={() => setTripType('pickup')}
              >
                {t('pickUpFromAirport')}
              </button>
            </div>

            <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
              {tripType === 'drop' ? (
                <>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    {mode === 'test' ? (
                      <input
                        type="text"
                        placeholder={t('pickupLocation')}
                        value={locationFrom}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setLocationFrom(e.target.value);
                          validateLocationServiceArea(e.target.value, 'pickup');
                        }}
                        className="w-full border border-gray-300 rounded-md pl-10 pr-12 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    ) : (
                      <>
                        <input
                          ref={fromInputRef}
                          type="text"
                          placeholder={t('pickupLocation')}
                          value={locationFrom}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFromInputChange(e.target.value)}
                          onFocus={() => setShowFromDropdown(true)}
                          onBlur={() => setTimeout(() => setShowFromDropdown(false), 200)}
                          className="w-full border border-gray-300 rounded-md pl-10 pr-12 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                    <button
                      type="button"
                      onClick={() => getCurrentLocation('from')}
                      disabled={isGettingLocation}
                      className="absolute right-3 top-3 text-gray-400 hover:text-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Use current location"
                    >
                      <Navigation 
                        className={`w-5 h-5 ${isGettingLocation ? 'animate-spin' : ''}`} 
                      />
                    </button>
                        {showFromDropdown && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                            {/* <div
                              onClick={() => handleMapSelectionOption('from')}
                              className="p-3 hover:bg-gray-100 cursor-pointer border-b flex items-center"
                            >
                              <svg className="w-4 h-4 mr-2 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                              </svg>
                              Select location on map
                            </div> */}
                            {fromSuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                onClick={() => handleSuggestionSelect(suggestion, 'from')}
                                className="p-3 hover:bg-gray-100 cursor-pointer"
                              >
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                  <div>
                                    <div className="font-medium text-sm md:text-base">{suggestion.structured_formatting?.main_text}</div>
                                    <div className="text-xs md:text-sm text-gray-500">{suggestion.structured_formatting?.secondary_text}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Service Area Warning for Pickup Location */}
                  {locationWarnings.pickup && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">{locationWarnings.pickup}</p>
                    </div>
                  )}

                  <AirportSelector
                    value={locationTo}
                    onChange={setLocationTo}
                    tripType="drop"
                  />
                </>
              ) : (
                <>
                  <AirportSelector
                    value={locationFrom}
                    onChange={setLocationFrom}
                    tripType="pickup"
                  />

                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    {mode === 'test' ? (
                      <input
                        type="text"
                        placeholder="Drop Location"
                        value={locationTo}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setLocationTo(e.target.value);
                          validateLocationServiceArea(e.target.value, 'drop');
                        }}
                        className="w-full border border-gray-300 rounded-md pl-10 pr-12 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    ) : (
                      <>
                        <input
                          ref={toInputRef}
                          type="text"
                          placeholder="Drop Location"
                          value={locationTo}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleToInputChange(e.target.value)}
                          onFocus={() => setShowToDropdown(true)}
                          onBlur={() => setTimeout(() => setShowToDropdown(false), 200)}
                          className="w-full border border-gray-300 rounded-md pl-10 pr-12 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                    <button
                      type="button"
                      onClick={() => getCurrentLocation('to')}
                      disabled={isGettingLocation}
                      className="absolute right-3 top-3 text-gray-400 hover:text-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Use current location"
                    >
                      <Navigation 
                        className={`w-5 h-5 ${isGettingLocation ? 'animate-spin' : ''}`} 
                      />
                    </button>
                        {showToDropdown && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                            <div
                              onClick={() => handleMapSelectionOption('to')}
                              className="p-3 hover:bg-gray-100 cursor-pointer border-b flex items-center"
                            >
                              <svg className="w-4 h-4 mr-2 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                              </svg>
                              Select location on map
                            </div>
                            {toSuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                onClick={() => handleSuggestionSelect(suggestion, 'to')}
                                className="p-3 hover:bg-gray-100 cursor-pointer"
                              >
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                  <div>
                                    <div className="font-medium text-sm md:text-base">{suggestion.structured_formatting?.main_text}</div>
                                    <div className="text-xs md:text-sm text-gray-500">{suggestion.structured_formatting?.secondary_text}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Service Area Warning for Drop Location */}
                  {locationWarnings.drop && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">{locationWarnings.drop}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mb-4 md:mb-6">
              <ScheduleSelector
                value={schedule}
                onChange={setSchedule}
                label={t('schedule')}
              />
            </div>

  {/* Removed distance display as per new requirement */}
  {/* {distance && (
    <div className="mb-4 md:mb-6 p-3 bg-blue-50 rounded-md">
      <div className="flex items-center justify-between">
        <span className="text-blue-800 font-medium text-sm md:text-base">Distance:</span>
        <span className="text-blue-900 font-semibold text-sm md:text-base">{distance} km</span>
      </div>
    </div>
  )} */}

            {/* <div className="bg-[#E7F5F3] p-4 rounded-md mb-4 md:mb-6">
           <div className="flex items-center mb-3 relative">
                      <span className="text-gray-700 font-medium text-sm md:text-base">{t('guestInfo')}</span>
      <div
        className="relative ml-2"
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
      >
        <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
        {isTooltipVisible && (
          <div className="absolute left-6 top-0 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
            We need this information to allocate the right car
          </div>
        )}
      </div>
    </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-700 text-sm md:text-base">{t('passengers')}</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={decrementPassengers}
                    className="border border-gray-300 rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-gray-700 bg-white hover:bg-gray-50 text-sm md:text-base"
                  >
                    −
                  </button>
                  <span className="text-gray-700 font-medium w-6 md:w-8 text-center text-sm md:text-base">{passengers}</span>
                  <button
                    onClick={incrementPassengers}
                    className="border border-gray-300 rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-gray-700 bg-white hover:bg-gray-50 text-sm md:text-base"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-700 text-sm md:text-base">{t('suitcase')}</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={decrementSuitcases}
                    className="border border-gray-300 rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-gray-700 bg-white hover:bg-gray-50 text-sm md:text-base"
                  >
                    −
                  </button>
                  <span className="text-gray-700 font-medium w-6 md:w-8 text-center text-sm md:text-base">{suitcases}</span>
                  <button
                    onClick={incrementSuitcases}
                    className="border border-gray-300 rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-gray-700 bg-white hover:bg-gray-50 text-sm md:text-base"
                  >
                    +
                  </button>
                </div>
              </div>
             
            </div> */}

            <button
              onClick={handleCheckFare}
              className={`w-full bg-[#016B5D] text-white py-3 rounded-full hover:bg-[#014D40] transition-colors font-medium text-sm md:text-base flex items-center justify-center ${apiFareLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={apiFareLoading}
            >
              {apiFareLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                    ></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                t('checkFare')
              )}
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <button
                style={{width:"fit-content",alignItems:"center",display:"flex"}}
                onClick={()=>setBookingStep("form")}
                className="px-6 py-2 rounded-full font-medium"
              >
                <ArrowLeft className='mr-1' /> Back
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel & Go Home
              </button>
            </div>
            <h2 className=" text-2xl font-semibold mb-6">Complete Booking</h2>
            <div className="flex flex-col md:flex-row justify-between flex-1 gap-6">
              {/* Trip Summary and Booking Policy */}
              <div className="flex-1">
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Trip Summary</h3>
                  <div className="space-y-3">
                    <div className="flex items-center bg-[#F5F5F5] p-4 rounded-lg">
                      <MapPin className="w-6 h-6 text-gray-500 mr-4 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Pickup</p>
                        <p className="text-base font-medium text-gray-800">{tripType === 'pickup' ? locationTo : locationFrom || 'Janakpuri'}</p>
                      </div>
                    </div>
                    <div className="flex items-center bg-[#F5F5F5] p-4 rounded-lg">
                      <MapPin className="w-6 h-6 text-gray-500 mr-4 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Drop</p>
                        <p className="text-base font-medium text-gray-800">{tripType === 'pickup' ? locationFrom : locationTo || 'Airport'}</p>
                      </div>
                    </div>
                    <div className="flex items-center bg-[#F5F5F5] p-4 rounded-lg">
                      <Calendar className="w-6 h-6 text-gray-500 mr-4 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Pickup time</p>
                        <p className="text-base font-medium text-gray-800">{schedule ? formatDateTime(schedule) : '11:40 pm - 13th May'}</p>
                      </div>
                    </div>
                   
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Booking policy</h3>
                  <ul className="list-disc pl-5 space-y-3 text-gray-600 text-sm">
                    <li>We do not charge any cancellation fee at the moment.</li>
                    <li>You can cancel your trip anytime, though we would appreciate you giving 2 hours prior notice.</li>
                    <li>Reach out at +91-7204323223 for any help.</li>
                    <li>Rentals are available within city limits.</li>
                  </ul>
                </div>

                {/* Car Selection */}
                {currentCarOptions && currentCarOptions.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Select Your Car</h3>
                    <CarSelector
                      carOptions={currentCarOptions}
                      selectedCarId={selectedCarId || currentCarOptions[0]?.id}
                      onCarSelect={handleCarSelect}
                    />
                  </div>
                )}
              </div>

              {/* Fare Summary */}
              <div className="md:w-[380px] h-[fit-content] bg-[#E7F5F3] p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Fare Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base fare</span>
                    <span className="font-medium text-gray-800">
                      {pricingLoading || apiFareLoading
                        ? 'Loading...'
                        : formatFare(apiFare !== null ? apiFare : selectedCarFare)}
                    </span>
                  </div>
                  {/* Removed distance display as per new requirement */}
                  {/* <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Distance ({distance} km)</span>
                    <span className="font-medium text-gray-800">{distance} km</span>
                  </div> */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">-{discount}</span>
                  </div>
                  {apiFareError && (
                    <div className="text-red-600 text-xs">{apiFareError}</div>
                  )}
                  <div className="flex items-center mt-4">
                    <input
                      type="text"
                      placeholder="Apply coupon"
                      value={coupon}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoupon(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="ml-2 bg-[#016B5D] text-white px-4 py-2 rounded-lg hover:bg-[#014D40] text-sm"
                    >
                      Apply
                    </button>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-gray-300 mt-4 text-base font-medium">
                    <span>Total Amount</span>
                    <span>
                      {pricingLoading || apiFareLoading
                        ? 'Loading...'
                        : formatFare(totalAmount)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6 gap-3">
                  <button
                    onClick={handleCheckFare}
                    className="bg-[#016B5D] text-white px-6 py-2 rounded-full hover:bg-[#014D40] text-sm font-medium flex-1"
                  >
                    Confirm Booking
                  </button>

                  
                </div>
                <br/>
                <h6 className='text-xs'>You can make the payment directly to the driver via UPI after completion of the trip</h6>
              </div>
            </div>
          </div>
        )}
      </div>

      {showMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg md:text-xl font-semibold">
                Select {mapSelectionMode === 'from' ? 'pickup' : 'destination'} location
              </h3>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div ref={modalMapRef} className="w-full h-80 md:h-96 rounded-md bg-gray-200 mb-4"></div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowMapModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleMapSelection}
                className="px-4 py-2 bg-[#016B5D] text-white rounded-md hover:bg-[#014D40] text-sm md:text-base"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    {/* Booking Confirmation Dialog */}
    {showBookingDialog && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full flex flex-col items-center relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
            onClick={handleCloseDialog}
          >
            ×
          </button>
          <div className="flex flex-col items-center">
            {/* Green tick or driver icon */}
            <div className="mb-4">
              <svg
                className="mx-auto"
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="32" cy="32" r="32" fill="#10B981" />
                <path
                  d="M20 34L29 43L44 28"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-green-700 mb-2 text-center">Booking Confirmed!</h2>
            <p className="text-gray-700 mb-4 text-center">Your ride has been booked successfully.</p>
            {rideId && (
              <div className="flex flex-col items-center mb-2 w-full">
                <span className="text-gray-600 text-sm mb-1">Ride ID:</span>
                <div className="flex items-center justify-center w-full">
                  <span className="font-mono text-base bg-gray-100 px-2 py-1 rounded select-all break-all">{rideId}</span>
                  <button
                    onClick={handleCopyRideId}
                    className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
            <a
             href="/my-trips"
              className="mt-6 bg-[#016B5D] text-white px-6 py-2 rounded-full hover:bg-[#014D40] text-sm font-medium"
            >
              Your Profile
            </a>
          </div>
        </div>
      </div>
    )}
    </div>
  );
  };

export default AirportTransfer;
