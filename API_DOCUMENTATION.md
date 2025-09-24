# Saarthi EV - API Documentation

## Overview

This document provides comprehensive information about the Saarthi EV backend API endpoints, request/response formats, and usage examples.

**Base URL**: `http://your-server:4000/api`

## Authentication

The API supports both registered users and guest bookings:
- **Registered Users**: Use `user_id` after OTP verification
- **Guest Bookings**: Use `customer_name` and `customer_phone`

## API Endpoints

### 🔐 Authentication Endpoints

#### 1. Register User
**POST** `/api/signup`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone_number": "9876543210"
}
```

**Response:**
```json
{
  "message": "Registration successful. Now call /generate-otp to receive an OTP.",
  "user_details": {
    "_id": "user_id_here",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "9876543210",
    "verified": false
  }
}
```

#### 2. Generate OTP
**POST** `/api/generate-otp`

Generate OTP for user verification or login.

**Request Body:**
```json
{
  "phone_number": "9876543210"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "otp": "123456"
}
```

#### 3. Verify OTP
**POST** `/api/verify`

Verify OTP and mark user as verified.

**Request Body:**
```json
{
  "phone_number": "9876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "User verified successfully",
  "user": {
    "_id": "user_id_here",
    "name": "John Doe",
    "verified": true
  }
}
```

#### 4. Login with OTP
**POST** `/api/login`

Login user with OTP verification.

**Request Body:**
```json
{
  "phone_number": "9876543210",
  "otp": "123456"
}
```

#### 5. Update Profile
**POST** `/api/user/update-profile`

Update user profile information.

**Request Body:**
```json
{
  "user_id": "user_id_here",
  "name": "John Smith"
}
```

---

### 🚗 Ride Management Endpoints

#### 1. Check Fare & Create Ride
**POST** `/api/fare/check`

This is the main endpoint for fare calculation and ride creation. It supports all ride types and both registered users and guest bookings.

##### Airport Transfer Example:
```json
{
  "customer_name": "John Doe",
  "customer_phone": "9876543210",
  "ride_type": "airport-transfer",
  "pickup_location": "Bodh Gaya, Bihar, India",
  "drop_location": "Gaya Airport, Bihar, India",
  "pickup_lat": 24.6961343,
  "pickup_lng": 84.9869547,
  "drop_lat": 24.7471,
  "drop_lng": 84.9511,
  "pickup_datetime": "2024-12-25T10:30:00Z",
  "airport_direction": "drop",
  "airport_terminal": "T1",
  "selected_car_id": "citron_c3"
}
```

##### Hourly Rental Example:
```json
{
  "customer_name": "John Doe",
  "customer_phone": "9876543210",
  "ride_type": "hourly",
  "hours": 4,
  "pickup_location": "Bodh Gaya, Bihar, India",
  "pickup_lat": 24.6961343,
  "pickup_lng": 84.9869547,
  "pickup_datetime": "2024-12-25T10:30:00Z",
  "selected_car_id": "citron_c3"
}
```

##### Outstation Example:
```json
{
  "customer_name": "John Doe",
  "customer_phone": "9876543210",
  "ride_type": "outstation",
  "pickup_location": "Bodh Gaya, Bihar, India",
  "drop_location": "Patna, Bihar, India",
  "pickup_lat": 24.6961343,
  "pickup_lng": 84.9869547,
  "drop_lat": 25.5941,
  "drop_lng": 85.1376,
  "pickup_datetime": "2024-12-25T10:30:00Z",
  "selected_car_id": "citron_c3"
}
```

##### Using User ID (for registered users):
```json
{
  "user_id": "user_id_here",
  "ride_type": "airport-transfer",
  "pickup_location": "Bodh Gaya, Bihar, India",
  "drop_location": "Gaya Airport, Bihar, India",
  "pickup_lat": 24.6961343,
  "pickup_lng": 84.9869547,
  "drop_lat": 24.7471,
  "drop_lng": 84.9511,
  "pickup_datetime": "2024-12-25T10:30:00Z",
  "selected_car_id": "citron_c3"
}
```

**Response:**
```json
{
  "message": "Ride created with pending status",
  "ride_id": "ride_id_here",
  "ride_type": "airport-transfer",
  "distance": 15.2,
  "car_options": [
    {
      "id": "citron_c3",
      "name": "Citroën C3",
      "image": "citron.png",
      "type": "hatchback",
      "capacity": 4,
      "luggage": 2,
      "fareMultiplier": 1,
      "available": true,
      "features": ["AC", "Music System", "GPS"],
      "fare": 528,
      "breakdown": {
        "distance": "15.2 km",
        "total": "₹528",
        "baseFare": "₹300 (Base fare)",
        "distanceFare": "₹228 (15.2 km × ₹15/km)",
        "formula": "Base Fare + Distance Fare = ₹300 + ₹228"
      }
    }
  ],
  "selected_car": {
    "id": "citron_c3",
    "name": "Citroën C3",
    "fare": 528
  }
}
```

#### 2. Confirm Booking
**POST** `/api/booking/confirm`

Confirm a pending ride booking.

**Request Body:**
```json
{
  "ride_id": "ride_id_here"
}
```

**Response:**
```json
{
  "message": "Booking confirmed successfully",
  "ride": {
    "_id": "ride_id_here",
    "status": "confirmed",
    "fare": 528
  }
}
```

#### 3. List User Rides
**GET** `/api/rides?phone_number=9876543210`

Get all rides for a user by phone number.

**Response:**
```json
{
  "rides": [
    {
      "_id": "ride_id_here",
      "rideType": "airport-transfer",
      "status": "confirmed",
      "fare": 528,
      "pickupLocation": "Bodh Gaya, Bihar, India",
      "dropLocation": "Gaya Airport, Bihar, India",
      "pickupDateTime": "2024-12-25T10:30:00Z",
      "createdAt": "2024-09-24T06:30:00Z"
    }
  ]
}
```

#### 4. Cancel Ride
**POST** `/api/ride/cancel`

Cancel an existing ride.

**Request Body:**
```json
{
  "ride_id": "ride_id_here",
  "reason": "Change of plans"
}
```

---

### 💰 Pricing Endpoints

#### 1. Calculate Pricing
**POST** `/api/pricing/calculate`

Calculate pricing without creating a ride.

**Airport Transfer Example:**
```json
{
  "ride_type": "airport-transfer",
  "pickup_location": "Bodh Gaya, Bihar, India",
  "drop_location": "Gaya Airport, Bihar, India",
  "pickup_lat": 24.6961343,
  "pickup_lng": 84.9869547,
  "drop_lat": 24.7471,
  "drop_lng": 84.9511,
  "selected_airport": "gaya"
}
```

**Hourly Rental Example:**
```json
{
  "ride_type": "hourly",
  "pickup_location": "Bodh Gaya, Bihar, India",
  "pickup_lat": 24.6961343,
  "pickup_lng": 84.9869547,
  "hours": 4
}
```

**Response:**
```json
{
  "ride_type": "airport-transfer",
  "distance": 15.2,
  "fare": 528,
  "breakdown": {
    "baseFare": "₹300 (Base fare)",
    "distanceFare": "₹228 (15.2 km × ₹15/km)",
    "total": "₹528",
    "formula": "Base Fare + Distance Fare = ₹300 + ₹228"
  }
}
```

#### 2. Get Pricing Configuration
**GET** `/api/pricing/config`

Get current pricing configuration and rates.

**Response:**
```json
{
  "airport": {
    "baseFare": 300,
    "perKmRate": 15
  },
  "hourly": {
    "perHourRate": 300,
    "perKmRate": 15
  },
  "outstation": {
    "perKmRate": 15,
    "multiplier": 2.0
  }
}
```

---

### 🧾 Invoice Endpoints

#### 1. Generate Invoice
**POST** `/api/invoice`

Generate invoice for a completed ride.

**Request Body:**
```json
{
  "ride_id": "ride_id_here"
}
```

---

### 💬 Testimonials Endpoints

#### 1. Get All Testimonials
**GET** `/api/testimonials`

Get all public testimonials.

**Response:**
```json
{
  "testimonials": [
    {
      "name": "Customer Name",
      "rating": 5,
      "comment": "Excellent service!",
      "date": "2024-09-20"
    }
  ]
}
```

---

### 🏥 Health Check Endpoints

#### 1. Health Check
**GET** `/health`

Check if the API server is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-09-24T06:30:00Z"
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "error": "Detailed error information",
  "status": 400
}
```

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict (duplicate registration)
- `500` - Internal Server Error

---

## Car Options

Available cars in the system:

```json
{
  "id": "citron_c3",
  "name": "Citroën C3",
  "image": "citron.png",
  "type": "hatchback",
  "capacity": 4,
  "luggage": 2,
  "fareMultiplier": 1,
  "available": true,
  "features": ["AC", "Music System", "GPS"]
}
```

---

## Fare Calculation Logic

### Airport Transfer:
```
Fare = Base Fare + (Distance × Per KM Rate)
Fare = ₹300 + (Distance × ₹15)
```

### Hourly Rental:
```
Fare = (Hours × Per Hour Rate) + (Distance × Per KM Rate)
Fare = (Hours × ₹300) + (Distance × ₹15)
```

### Outstation:
```
Fare = Distance × Per KM Rate × Multiplier
Fare = Distance × ₹15 × 2.0
```

---

## Environment Variables

Required environment variables for the backend:

```env
# Database
MONGODB_URI=mongodb+srv://...

# Server
PORT=4000
NODE_ENV=production

# Fare Calculation
AIRPORT_BASE_FARE=300
AIRPORT_PER_KM_RATE=15
HOURLY_PER_HOUR_RATE=300
HOURLY_PER_KM_RATE=15
OUTSTATION_PER_KM_RATE=15
OUTSTATION_MULTIPLIER=2.0
```

---

## Testing with Postman

1. **Import Collection**: Import `Saarthi_API_Collection.postman_collection.json`
2. **Import Environment**: Import `Saarthi_Environments.postman_environment.json`
3. **Set Base URL**: Update `base_url` variable to your server URL
4. **Test Endpoints**: Start with health check, then authentication, then ride booking

### Typical Testing Flow:
1. Health Check → Verify API is running
2. Register User → Create test user
3. Generate OTP → Get OTP for verification
4. Verify OTP → Verify user account
5. Check Fare → Create a ride and get fare
6. Confirm Booking → Confirm the ride
7. List Rides → View user's rides

---

## Support

For API support and questions, check the logs on your server:
```bash
pm2 logs saarthi-backend
```
