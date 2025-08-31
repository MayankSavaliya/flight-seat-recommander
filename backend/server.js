require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const airportService = require('./services/airportService');

// Import routes
const airportRoutes = require('./routes/airportRoutes');
const flightRoutes = require('./routes/flightRoutes');
const sunRoutes = require('./routes/sunRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URI || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

// middleware
app.use(cors(corsOptions));
app.use(express.json());

// Use routes
app.use('/api/airports', airportRoutes);
app.use('/api/flight', flightRoutes);
app.use('/api/sun', sunRoutes);

app.get('/',(req,res)=>{
  res.send("Server is running");
});


async function startServer() {
  try {

    //connect to mongodb
    await connectDB();
    
    // Initialize airport service
    await airportService.initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(`MongoDB connected and ready`);
    });
  } catch (error) {
    console.error('Server failed:', error);
  }
}

startServer();
module.exports = app;