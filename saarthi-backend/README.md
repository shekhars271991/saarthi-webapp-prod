# Saarthi Cab Booking API

This is a Node.js + Express + MongoDB backend for a basic cab booking system. It includes endpoints for user registration, OTP verification, fare calculation, ride history, and invoice generation.

## 🚀 Features

- 📱 User Signup with OTP verification
- 🔐 OTP-based Login
- 🚕 Fare calculation (Hourly, Outstation, Airport Transfer)
- 📜 Ride listing
- 🧾 Invoice generation

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- dotenv
- express-validator
- Postman for API testing

---

## 📦 Installation

```bash
# Clone the repo
git clone https://github.com/your-repo/saarthi-backend.git
cd saarthi-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Example `.env` file:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/saarthidb
OTP_EXPIRES_MIN=5
```

---

## 🧪 Run Locally

```bash
# Start MongoDB (if not running already)
docker run -d -p 27017:27017 --name saarthi-mongo mongo

# Start the dev server
npm run dev
```

App should now be running at `http://localhost:4000`

---

## 📬 Postman Collection

### ✅ Import the Collection:
- [`saarthi_cab_api.postman_collection.json`](./saarthi_cab_api.postman_collection.json)

### ✅ Import the Environment:
- [`saarthi_cab_api_environment.postman_environment.json`](./saarthi_cab_api_environment.postman_environment.json)

---

## 🛣️ API Endpoints

| Method | Endpoint              | Description                     |
|--------|------------------------|---------------------------------|
| POST   | `/signup`              | Register a new user             |
| POST   | `/verify`              | Verify OTP                      |
| POST   | `/login`               | Login using phone + OTP         |
| POST   | `/fare/hourly`         | Get fare for hourly ride        |
| POST   | `/fare/outstation`     | Get fare for outstation ride    |
| POST   | `/fare/airport-transfer`   | Get fare for airport transfer   |
| GET    | `/rides`               | List all rides by user          |
| POST   | `/invoice`             | Generate invoice for a ride     |

---

## ✅ Future Enhancements

- JWT-based login & auth middleware
- Admin dashboard for ride management
- Razorpay integration for payments
- Email/SMS integration for OTP and invoices

---

## 📄 License

MIT
