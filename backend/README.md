# FlightView Backend

MongoDB-powered backend for FlightView - AI-powered window seat recommendations.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start MongoDB (make sure MongoDB is running)
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Migrate airport data to MongoDB
npm run migrate

# Start the server
npm start
```

## 📡 API Endpoints

### Airport Endpoints
- `GET /api/airports/search?query=JFK&country=US&limit=10` - Advanced airport search
- `GET /api/airports/iata/JFK` - Get airport by IATA code
- `GET /api/airports/country/United States` - Get airports by country
- `GET /api/airports/nearby?lat=40.7128&lng=-74.0060&distance=50` - Find nearby airports
- `GET /api/airports/popular?limit=20` - Get popular airports
- `GET /api/airports/stats` - Get database statistics

### Flight Endpoints
- `POST /api/flight/recommendation` - Get seat recommendation  
- `POST /api/flight/route` - Get flight route for visualization

### Sun Endpoints
- `POST /api/sun/position` - Calculate sun position

### System
- `GET /health` - Health check

## 📁 Structure

```
backend/
├── server.js                    # Main server file
├── config/
│   └── database.js             # MongoDB connection
├── models/
│   └── Airport.js              # Airport MongoDB model
├── routes/
│   ├── airportRoutes.js        # Airport endpoints
│   ├── flightRoutes.js         # Flight calculation endpoints
│   └── sunRoutes.js            # Sun position endpoints
├── services/
│   ├── airportService.js       # Airport service wrapper
│   ├── mongoAirportService.js  # MongoDB airport service
│   └── flightCalculationService.js  # Flight & sun calculations
└── scripts/
    └── migrateData.js          # Data migration script
```

## 🔧 Dependencies

- **Express** - Web server
- **Mongoose** - MongoDB ODM
- **Turf.js** - Geospatial calculations  
- **SunCalc** - Sun position calculations
- **Axios** - HTTP requests

## 🗄️ MongoDB Features

- **Full-text search** with MongoDB text indexes
- **Geospatial queries** for nearby airport search
- **Advanced filtering** by country, type, etc.
- **Performance optimized** with proper indexing
- **Scalable architecture** for large datasets