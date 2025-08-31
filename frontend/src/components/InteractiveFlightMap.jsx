import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Play, Pause, RotateCcw, Home, Globe, Eye, Sun, MapPin, Clock, Star, Plane } from 'lucide-react';

// Custom CSS for the map
const mapStyles = `
  .plane-icon {
    background: transparent;
    border: none;
    filter: drop-shadow(0 0 2px rgba(0,0,0,0.3));
  }
  .leaflet-popup-content-wrapper {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  .leaflet-popup-tip {
    background: rgba(255, 255, 255, 0.95);
  }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = mapStyles;
document.head.appendChild(styleSheet);

// Custom airplane marker icon - Larger and better colored
const createPlaneIcon = (rotation) => L.divIcon({
  html: `<div style="transform: rotate(${rotation}deg); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" 
        fill="#3B82F6" stroke="#1F2937" stroke-width="0.8"/>
    </svg>
  </div>`,
  className: 'plane-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Custom departure marker - using location icon
const createDepartureIcon = () => L.divIcon({
  html: `<div style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#10B981" stroke="#047857" stroke-width="2"/>
      <path d="M20 8C16.1 8 13 11.1 13 15C13 20.2 20 30 20 30S27 20.2 27 15C27 11.1 23.9 8 20 8Z" fill="white"/>
      <circle cx="20" cy="15" r="3" fill="#10B981"/>
      <text x="20" y="35" text-anchor="middle" fill="#047857" font-size="6" font-weight="bold">SOURCE</text>
    </svg>
  </div>`,
  className: 'departure-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Custom arrival marker - using location icon
const createArrivalIcon = () => L.divIcon({
  html: `<div style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#EF4444" stroke="#DC2626" stroke-width="2"/>
      <path d="M20 8C16.1 8 13 11.1 13 15C13 20.2 20 30 20 30S27 20.2 27 15C27 11.1 23.9 8 20 8Z" fill="white"/>
      <circle cx="20" cy="15" r="3" fill="#EF4444"/>
      <text x="20" y="35" text-anchor="middle" fill="#DC2626" font-size="6" font-weight="bold">DESTINATION</text>
    </svg>
  </div>`,
  className: 'arrival-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Helper function to format airport name from airport object
const formatAirportName = (airport) => {
  if (!airport) return 'Unknown Airport';
  
  const parts = [];
  if (airport.name) parts.push(airport.name);
  if (airport.iata) parts.push(`(${airport.iata})`);
  if (airport.city) parts.push(airport.city);
  if (airport.country) parts.push(airport.country);
  
  return parts.join(' - ');
};

// Helper function to format seat side recommendation
const formatSeatSide = (seatSide) => {
  const sideMap = {
    'left': 'Left Side',
    'right': 'Right Side', 
    'window': 'Window Seats',
    'aisle': 'Aisle Seats'
  };
  
  return sideMap[seatSide.toLowerCase()] || `${seatSide.toUpperCase()} SIDE`;
};

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function FlightProgress({ flightPoints, currentPoint, onPointChange }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 4x speed
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isPlaying && currentPoint < flightPoints.length - 1) {
      intervalRef.current = setInterval(() => {
        onPointChange(prev => {
          if (prev < flightPoints.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 1000 / speed); // Adjust speed
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, currentPoint, flightPoints.length, speed, onPointChange]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    onPointChange(0);
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
  };

  const currentPointData = flightPoints[currentPoint];
  const progress = ((currentPoint + 1) / flightPoints.length) * 100;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-3">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Flight Progress</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600 font-medium">Speed:</span>
          {[1, 2, 4].map(s => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                speed === s 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-100'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-600 mb-3">
          <span className="font-medium">0%</span>
          <span className="font-bold text-emerald-600">{Math.round(progress)}% Complete</span>
          <span className="font-medium">100%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={handleReset}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-slate-500 to-gray-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </button>
        <button
          onClick={handlePlayPause}
          className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all shadow-md transform hover:scale-105 ${
            isPlaying 
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg' 
              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Play
            </>
          )}
        </button>
      </div>

      {/* Current Point Info */}
      {currentPointData && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600 font-medium">Time:</span>
              <div className="text-slate-800 font-bold">
                {new Date(currentPointData.time).toLocaleTimeString()}
              </div>
            </div>
            <div>
              <span className="text-slate-600 font-medium">Location:</span>
              <div className="text-slate-800 font-bold">
                {currentPointData.recommendation?.location || `${currentPointData.coordinates[0].toFixed(2)}°, ${currentPointData.coordinates[1].toFixed(2)}°`}
                <div className="text-sm text-slate-600 mt-1">
                  {currentPointData.coordinates[0].toFixed(2)}°, {currentPointData.coordinates[1].toFixed(2)}°
                </div>
              </div>
            </div>
            <div>
              <span className="text-slate-600 font-medium">Sun Position:</span>
              <div className={`font-bold ${currentPointData.sun.visible ? 'text-amber-600' : 'text-slate-600'}`}>
                {currentPointData.sun.visible ? (
                  <span className="flex items-center">
                    <Sun className="w-4 h-4 mr-1" />
                    Visible
                  </span>
                ) : (
                  'Not Visible'
                )}
              </div>
            </div>
            <div>
              <span className="text-slate-600 font-medium">Flight Bearing:</span>
              <div className="text-slate-800 font-bold">
                {currentPointData.flightBearing}°
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PointRecommendation({ pointData }) {
  if (!pointData) return null;

  const { recommendation, sun, progressPercent } = pointData;
  const viewScore = recommendation.viewScore;
  const scoreColor = viewScore >= 8 ? 'text-green-400' : viewScore >= 6 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 rounded-2xl p-8 shadow-xl border border-orange-200">
      <h3 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-3">
        <Eye className="w-7 h-7 text-orange-600" />
        Current Seat Recommendation
      </h3>
      
      {/* Recommendation */}
      <div className="bg-gradient-to-r from-orange-400 to-red-400 rounded-xl p-6 mb-6 text-center shadow-lg">
        <div className="text-white/90 text-base mb-3">Best Seat Choice</div>
        <div className="text-3xl font-bold text-white mb-3 tracking-wider">
          {formatSeatSide(recommendation.seatSide)}
        </div>
        <div className="text-white/90 text-lg">View Score: <span className={`text-yellow-200 font-bold text-xl`}>{viewScore}/10</span></div>
      </div>

      {/* Details */}
      <div className="space-y-5">
        <div>
          <div className="text-slate-600 text-base font-medium mb-2">Reason</div>
          <div className="text-slate-700 bg-white/80 rounded-lg p-4 text-base leading-relaxed">{recommendation.reason}</div>
        </div>
        
        {recommendation.specialCondition && (
          <div>
            <div className="text-slate-600 text-base font-medium mb-2">Special Conditions</div>
            <div className="text-slate-700 bg-white/80 rounded-lg p-4 text-base leading-relaxed font-semibold text-orange-700">{recommendation.specialCondition}</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-orange-200">
          <div className="bg-white/80 rounded-lg p-4 text-center shadow-sm">
            <div className="text-slate-600 text-base font-medium">Sun Azimuth</div>
            <div className="text-slate-800 font-bold text-xl mt-1">{sun.azimuth}°</div>
          </div>
          <div className="bg-white/80 rounded-lg p-4 text-center shadow-sm">
            <div className="text-slate-600 text-base font-medium">Sun Altitude</div>
            <div className="text-slate-800 font-bold text-xl mt-1">{sun.altitude}°</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapUpdater({ flightPoints, currentPoint }) {
  const map = useMap();
  
  useEffect(() => {
    if (flightPoints && flightPoints[currentPoint]) {
      const currentPointData = flightPoints[currentPoint];
      map.setView([currentPointData.coordinates[0], currentPointData.coordinates[1]], 6);
    }
  }, [currentPoint, flightPoints, map]);

  return null;
}

function InteractiveFlightMap({ flightData, onBack, onReturnHome }) {
  const [currentPoint, setCurrentPoint] = useState(0);
  const [showFinalRecommendation, setShowFinalRecommendation] = useState(false);

  // Check if flightData exists before destructuring
  if (!flightData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4 text-slate-800">No flight data available</div>
          <div className="text-slate-600">Please go back and submit your flight details</div>
          <button 
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { flightDetails, flightPoints, finalRecommendation } = flightData;

  if (!flightDetails || !flightPoints) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4 text-slate-800">Incomplete flight data</div>
          <div className="text-slate-600">Please go back and submit your flight details</div>
          <button 
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Additional safety checks
  if (!Array.isArray(flightPoints) || flightPoints.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4 text-slate-800">No flight points available</div>
          <div className="text-slate-600">Flight data seems incomplete</div>
          <button 
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const routeCoordinates = flightPoints
    .filter(point => point && point.coordinates && Array.isArray(point.coordinates) && point.coordinates.length >= 2)
    .map(point => [point.coordinates[0], point.coordinates[1]]);
  
  const currentPointData = flightPoints[currentPoint] || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-teal-300/15 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-cyan-200/20 to-blue-300/15 rounded-full blur-2xl"></div>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <button 
            className="flex items-center text-slate-600 hover:text-emerald-600 font-medium transition-colors group" 
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Results
          </button>
          <button 
            onClick={onReturnHome}
            className="flex items-center text-slate-600 hover:text-emerald-600 font-medium transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Start Over
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <div className="w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center ring-1 ring-emerald-100">
              <Globe className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            <span className="text-slate-800">Interactive</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Flight Map
            </span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            <strong className="text-slate-800">{formatAirportName(flightDetails.fromAirport)}</strong>
            {' '} → {' '}
            <strong className="text-slate-800">{formatAirportName(flightDetails.toAirport)}</strong>
          </p>
        </div>

        {/* Main Map Container - Full Width */}
        <div className="mb-6">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-emerald-100 shadow-xl">
            <div className="h-[500px]">  {/* Increased map height */}
              <MapContainer
                center={[flightDetails.fromCoords.latitude, flightDetails.fromCoords.longitude]}
                zoom={4}
                style={{ height: '100%', width: '100%' }}
                className="rounded-lg"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Flight Route */}
                <Polyline
                  positions={routeCoordinates}
                  color="#FF6B35"
                  weight={4}
                  opacity={0.8}
                />
                
                {/* Start Marker */}
                <Marker 
                  position={[flightDetails.fromCoords.latitude, flightDetails.fromCoords.longitude]}
                  icon={createDepartureIcon()}
                >
                  <Popup>
                    <div className="text-center p-2">
                      <div className="font-bold text-green-600 mb-1">🛫 SOURCE - DEPARTURE</div>
                      <div className="text-sm font-medium text-slate-700">{formatAirportName(flightDetails.fromAirport)}</div>
                      <div className="text-xs text-slate-500 mt-2">Flight Starting Point</div>
                      <div className="text-xs text-green-600 font-medium mt-1">Green Marker = Source</div>
                    </div>
                  </Popup>
                </Marker>
                
                {/* End Marker */}
                <Marker 
                  position={[flightDetails.toCoords.latitude, flightDetails.toCoords.longitude]}
                  icon={createArrivalIcon()}
                >
                  <Popup>
                    <div className="text-center p-2">
                      <div className="font-bold text-red-600 mb-1">🛬 DESTINATION - ARRIVAL</div>
                      <div className="text-sm font-medium text-slate-700">{formatAirportName(flightDetails.toAirport)}</div>
                      <div className="text-xs text-slate-500 mt-2">Flight Ending Point</div>
                      <div className="text-xs text-red-600 font-medium mt-1">Red Marker = Destination</div>
                    </div>
                  </Popup>
                </Marker>
                
                {/* Current Position Marker with Airplane */}
                {currentPointData && currentPointData.coordinates && Array.isArray(currentPointData.coordinates) && currentPointData.coordinates.length >= 2 && (
                  <Marker 
                    position={[currentPointData.coordinates[0], currentPointData.coordinates[1]]}
                    icon={createPlaneIcon(currentPointData.flightBearing || 0)}
                    zIndexOffset={1000}
                  >
                    <Popup className="custom-popup">
                      <div className="text-center p-2 min-w-[200px]">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Plane className="w-5 h-5 text-orange-600" />
                          <div className="font-bold text-orange-600">Current Position</div>
                        </div>
                        <div className="font-medium text-slate-700 mt-1">
                          {currentPointData.recommendation?.location || `${currentPointData.coordinates[0].toFixed(2)}°, ${currentPointData.coordinates[1].toFixed(2)}°`}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">Progress: {currentPointData.progressPercent || '0'}%</div>
                        <div className="text-sm text-slate-600">Time: {currentPointData.time ? new Date(currentPointData.time).toLocaleTimeString() : 'N/A'}</div>
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <div className="text-sm font-medium flex items-center justify-center gap-1">
                            Recommended: 
                            <span className="text-emerald-600 flex items-center">
                              {formatSeatSide(currentPointData.recommendation?.seatSide)}
                              <Eye className="w-4 h-4 ml-1" />
                            </span>
                          </div>
                          {currentPointData.recommendation?.specialCondition && (
                            <div className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
                              <Sun className="w-3 h-3" />
                              {currentPointData.recommendation.specialCondition}
                            </div>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )}
                
                <MapUpdater flightPoints={flightPoints} currentPoint={currentPoint} />
              </MapContainer>
            </div>
          </div>

          {/* Controls and Info - Custom Layout */}
          <div className="mt-6 space-y-6">
            {/* Top Row: Flight Progress (left, smaller) and Current Seat Recommendation (right, wider) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Flight Progress - Left Side (2/5 width) */}
              <div className="lg:col-span-2">
                <FlightProgress 
                  flightPoints={flightPoints}
                  currentPoint={currentPoint}
                  onPointChange={setCurrentPoint}
                />
              </div>

              {/* Current Seat Recommendation - Right Side (3/5 width) */}
              <div className="lg:col-span-3">
                <PointRecommendation pointData={currentPointData} />
              </div>
            </div>

            {/* Bottom Row: Final Recommendation Section (Full Width) */}
            <div className="space-y-6">
              {/* Final Recommendation Section */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Final Recommendation</h3>
                </div>
                
                <button
                  onClick={() => setShowFinalRecommendation(!showFinalRecommendation)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-colors font-medium shadow-md"
                >
                  {showFinalRecommendation ? 'Hide' : 'Show'} Detailed Analysis
                </button>
              </div>

            {/* Final Recommendation Details */}
            {showFinalRecommendation && finalRecommendation && (
              <div className="bg-gradient-to-br from-purple-200 via-indigo-200 to-blue-200 rounded-2xl p-8 shadow-xl border border-purple-300">
                <h3 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-3">
                  <Star className="w-8 h-8 text-purple-600" />
                  Detailed Analysis</h3>
                
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-6 mb-6 text-center shadow-lg">
                  <div className="text-white/90 text-base mb-3">Overall Best Choice</div>
                  <div className="text-3xl font-bold text-white mb-3">
                    {formatSeatSide(finalRecommendation.side)}
                  </div>
                  <div className="text-white/90 text-lg">Confidence: {finalRecommendation.confidence}</div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left Column - Reasoning */}
                  <div className="space-y-5">
                    <div>
                      <div className="text-slate-600 text-base font-medium mb-3">Reasoning</div>
                      <div className="text-slate-700 text-base bg-white/80 rounded-lg p-4 leading-relaxed">{finalRecommendation.reason}</div>
                    </div>
                    
                    {finalRecommendation.specialHighlights && finalRecommendation.specialHighlights.length > 0 && (
                      <div>
                        <div className="text-slate-600 text-base font-medium mb-3">Special Highlights</div>
                        <div className="bg-white/80 rounded-lg p-4 border border-purple-200 space-y-2">
                          {finalRecommendation.specialHighlights.map((highlight, index) => (
                            <div key={index} className="text-slate-700 text-base">• {highlight}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Viewing Periods */}
                  {finalRecommendation.bestViewingPeriods && finalRecommendation.bestViewingPeriods.length > 0 && (
                    <div>
                      <div className="text-slate-600 text-base font-medium mb-3">Best Viewing Periods</div>
                      <div className="space-y-3">
                        {finalRecommendation.bestViewingPeriods.map((period, index) => (
                          <div key={index} className="bg-white/80 rounded-lg p-4 border border-purple-200 shadow-sm">
                            <div className="text-slate-800 text-base font-medium mb-2">
                              {period.startPercent}% - {period.endPercent}%
                            </div>
                            <div className="text-slate-600 text-sm">{period.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractiveFlightMap;
