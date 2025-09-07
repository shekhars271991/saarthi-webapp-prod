# Saarthi - Complete Transportation Solution

A comprehensive transportation platform with backend API and modern web frontend.

## 🏗️ Project Structure

This is a monorepo containing two main projects:

- **`saarthi-backend/`** - Node.js/Express backend API
- **`saarthi-webapp/`** - Next.js frontend application

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (for backend)

### Backend Setup

```bash
cd saarthi-backend
npm install
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd saarthi-webapp
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📁 Project Details

### Backend (`saarthi-backend/`)

- **Framework**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Features**:
  - User authentication and authorization
  - Ride management
  - Fare calculation
  - Invoice generation
  - Testimonial management

#### API Endpoints

- `/api/auth` - Authentication routes
- `/api/rides` - Ride management
- `/api/fares` - Fare calculation
- `/api/invoices` - Invoice management
- `/api/testimonials` - Testimonial management

### Frontend (`saarthi-webapp/`)

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with modern design
- **Features**:
  - Responsive design
  - User authentication
  - Service booking
  - Trip management
  - Modern UI/UX

#### Pages

- Home page with service overview
- Airport transfer booking
- Outstation trips
- Hourly rental
- User profile and trips
- About us and FAQ

## 🛠️ Development

### Running Both Projects

You can run both projects simultaneously using separate terminals:

**Terminal 1 (Backend):**
```bash
cd saarthi-backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd saarthi-webapp
npm run dev
```

### Environment Variables

#### Backend
Create `.env` file in `saarthi-backend/`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

#### Frontend
Create `.env.local` file in `saarthi-webapp/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📦 Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Configuration

Both projects have their own configuration files:

- **Backend**: `saarthi-backend/src/config/`
- **Frontend**: `saarthi-webapp/next.config.js`, `saarthi-webapp/tailwind.config.js`

## 📚 Dependencies

### Backend Dependencies
- Express.js
- Mongoose
- JWT authentication
- CORS
- Helmet security

### Frontend Dependencies
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Various UI components

## 🚀 Deployment

### Backend Deployment
- Can be deployed to platforms like Heroku, Railway, or AWS
- Ensure MongoDB connection string is properly configured
- Set environment variables for production

### Frontend Deployment
- Can be deployed to Vercel, Netlify, or any static hosting
- Build command: `npm run build`
- Output directory: `.next`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both backend and frontend
5. Submit a pull request

## 📄 License

This project is proprietary software.

## 📞 Support

For support and questions, please contact the development team.

---

**Note**: This is a monorepo setup. Each project maintains its own dependencies and can be developed independently while sharing common configuration and documentation.
