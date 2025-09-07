# Configuration Guide

This directory contains configuration files for the Saarthi application.

## Cities Configuration (`cities.ts`)

Controls which cities and languages are available in the application.

### Environment Variables:
- `NEXT_PUBLIC_AVAILABLE_CITIES`: Comma-separated list of available cities
- `NEXT_PUBLIC_AVAILABLE_LANGUAGES`: Comma-separated list of available languages
- `NEXT_PUBLIC_DEFAULT_LANGUAGE`: Default language for the application

### Example:
```bash
NEXT_PUBLIC_AVAILABLE_CITIES=bihar,delhi,mumbai
NEXT_PUBLIC_AVAILABLE_LANGUAGES=hi,en,kn
NEXT_PUBLIC_DEFAULT_LANGUAGE=hi
```

## Airports Configuration (`airports.ts`)

Controls which airports are available for airport transfer bookings.

### Environment Variables:
- `NEXT_PUBLIC_AVAILABLE_AIRPORTS`: Comma-separated list of available airports
- `NEXT_PUBLIC_DEFAULT_AIRPORT`: Default airport selection

### Example:
```bash
NEXT_PUBLIC_AVAILABLE_AIRPORTS=Jay Prakash Narayan Airport (Patna),Gaya International Airport (Gaya),Darbhanga Airport (Darbhanga),Muzaffarpur Airport (Muzaffarpur)
NEXT_PUBLIC_DEFAULT_AIRPORT=Jay Prakash Narayan Airport (Patna)
```

### Default Airports:
- Jay Prakash Narayan Airport (Patna)
- Gaya International Airport (Gaya)
- Darbhanga Airport (Darbhanga)
- Muzaffarpur Airport (Muzaffarpur)

## How to Use

1. **Create a `.env.local` file** in your project root (this file is gitignored)
2. **Add the environment variables** you want to override
3. **Restart your development server** for changes to take effect

## Benefits

- **Environment-based configuration**: Different airports for different environments
- **Easy maintenance**: Centralized configuration management
- **Type safety**: Full TypeScript support with proper typing
- **Flexibility**: Can be overridden per environment without code changes
