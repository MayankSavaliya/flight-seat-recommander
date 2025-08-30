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

// Custom departure marker
const createDepartureIcon = () => L.divIcon({
  html: `<div style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#10B981" stroke="#047857" stroke-width="2"/>
      <path d="M12 6V12L16 16" stroke="white" stroke-width="2" stroke-linecap="round"/>
      <text x="12" y="4" text-anchor="middle" fill="#047857" font-size="10" font-weight="bold">DEP</text>
    </svg>
  </div>`,
  className: 'departure-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Custom arrival marker
const createArrivalIcon = () => L.divIcon({
  html: `<div style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#EF4444" stroke="#DC2626" stroke-width="2"/>
      <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="12" y="4" text-anchor="middle" fill="#DC2626" font-size="10" font-weight="bold">ARR</text>
    </svg>
  </div>`,
  className: 'arrival-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Helper function to get airport name from coordinates
const getAirportName = (lat, lon) => {
  // Common airports mapping for demo - in real app, you'd fetch from your backend
  const airports = {
    // LaGuardia Airport (NYC)
    '40.77,-73.87': 'LaGuardia Airport (LGA) - New York',
    '40.71,-74.01': 'John F. Kennedy International Airport (JFK) - New York', 
    // LAX (Los Angeles)
    '33.94,-118.41': 'Los Angeles International Airport (LAX) - Los Angeles',
    '34.05,-118.24': 'Hollywood Burbank Airport (BUR) - Los Angeles Area',
  };

  // Create a key from coordinates (rounded to 2 decimal places)
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  return airports[key] || `Airport (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;
};

// Helper function to format seat side recommendation
const formatSeatSide = (seatSide) => {
  const sideMap = {
    'left': 'Left Side (A, B, C)',
    'right': 'Right Side (D, E, F)', 
    'window': 'Window Seats (A, F)',
    'aisle': 'Aisle Seats (C, D)'
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
                {currentPointData.recommendation?.location || getAirportName(currentPointData.coordinates[0], currentPointData.coordinates[1])}
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
    <div className="bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 rounded-2xl p-6 shadow-lg border border-orange-200">
      <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center gap-2">
        <Eye className="w-6 h-6 text-orange-600" />
        Current Seat Recommendation
      </h3>
      
      {/* Recommendation */}
      <div className="bg-gradient-to-r from-orange-400 to-red-400 rounded-xl p-4 mb-4 text-center">
        <div className="text-white/90 text-sm mb-2">Best Seat Choice</div>
        <div className="text-2xl font-bold text-white mb-2 tracking-wider">
          {formatSeatSide(recommendation.seatSide)}
        </div>
        <div className="text-white/90">View Score: <span className={`text-yellow-200 font-bold text-lg`}>{viewScore}/10</span></div>
      </div>

      {/* Details */}
      <div className="space-y-4">
        <div>
          <div className="text-slate-600 text-sm mb-1">Reason</div>
          <div className="text-slate-700 bg-white/70 rounded-lg p-3">{recommendation.reason}</div>
        </div>
        
        {recommendation.specialCondition && (
          <div>
            <div className="text-slate-600 text-sm mb-1">Special Conditions</div>
            <div className="text-slate-700 bg-white/70 rounded-lg p-3">{recommendation.specialCondition}</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-orange-200">
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-slate-600 text-sm">Sun Azimuth</div>
            <div className="text-slate-800 font-medium">{sun.azimuth}°</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-slate-600 text-sm">Sun Altitude</div>
            <div className="text-slate-800 font-medium">{sun.altitude}°</div>
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

  const { flightDetails, flightPoints, finalRecommendation } = flightData;

  if (!flightDetails || !flightPoints) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-2xl mb-4">No flight data available</div>
          <div className="text-blue-200">Please go back and submit your flight details</div>
        </div>
      </div>
    );
  }

  const routeCoordinates = flightPoints.map(point => [point.coordinates[0], point.coordinates[1]]);
  const currentPointData = flightPoints[currentPoint];

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
            <strong className="text-slate-800">{getAirportName(flightDetails.fromCoords.latitude, flightDetails.fromCoords.longitude)}</strong>
            {' '} → {' '}
            <strong className="text-slate-800">{getAirportName(flightDetails.toCoords.latitude, flightDetails.toCoords.longitude)}</strong>
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
                    <div className="text-center">
                      <div className="font-bold text-green-600">✈️ Departure</div>
                      <div className="text-sm font-medium">{getAirportName(flightDetails.fromCoords.latitude, flightDetails.fromCoords.longitude)}</div>
                      <div className="text-xs text-slate-500 mt-1">Starting Point</div>
                    </div>
                  </Popup>
                </Marker>
                
                {/* End Marker */}
                <Marker 
                  position={[flightDetails.toCoords.latitude, flightDetails.toCoords.longitude]}
                  icon={createArrivalIcon()}
                >
                  <Popup>
                    <div className="text-center">
                      <div className="font-bold text-red-600">🛬 Arrival</div>
                      <div className="text-sm font-medium">{getAirportName(flightDetails.toCoords.latitude, flightDetails.toCoords.longitude)}</div>
                      <div className="text-xs text-slate-500 mt-1">Destination</div>
                    </div>
                  </Popup>
                </Marker>
                
                {/* Current Position Marker with Airplane */}
                {currentPointData && (
                  <Marker 
                    position={[currentPointData.coordinates[0], currentPointData.coordinates[1]]}
                    icon={createPlaneIcon(currentPointData.flightBearing)}
                    zIndexOffset={1000}
                  >
                    <Popup className="custom-popup">
                      <div className="text-center p-2 min-w-[200px]">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Plane className="w-5 h-5 text-orange-600" />
                          <div className="font-bold text-orange-600">Current Position</div>
                        </div>
                        <div className="font-medium text-slate-700 mt-1">
                          {currentPointData.recommendation?.location || getAirportName(currentPointData.coordinates[0], currentPointData.coordinates[1])}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">Progress: {currentPointData.progressPercent}%</div>
                        <div className="text-sm text-slate-600">Time: {new Date(currentPointData.time).toLocaleTimeString()}</div>
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

          {/* Controls and Info - Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Flight Progress */}
              <FlightProgress 
                flightPoints={flightPoints}
                currentPoint={currentPoint}
                onPointChange={setCurrentPoint}
              />

              {/* Point Recommendation */}
              <PointRecommendation pointData={currentPointData} />
            </div>

            {/* Right Column */}
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
              <div className="bg-gradient-to-br from-purple-200 via-indigo-200 to-blue-200 rounded-2xl p-6 shadow-lg border border-purple-300">
                <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Star className="w-6 h-6 text-purple-600" />
                  Detailed Analysis</h3>
                
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-4 mb-4 text-center">
                  <div className="text-white/90 text-sm mb-2">Overall Best Choice</div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {formatSeatSide(finalRecommendation.side)}
                  </div>
                  <div className="text-white/90">Confidence: {finalRecommendation.confidence}</div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-slate-600 text-sm mb-1">Reasoning</div>
                    <div className="text-slate-700 text-sm bg-white/70 rounded-lg p-3">{finalRecommendation.reason}</div>
                  </div>
                  
                  {finalRecommendation.bestViewingPeriods && finalRecommendation.bestViewingPeriods.length > 0 && (
                    <div>
                      <div className="text-slate-600 text-sm mb-2">Best Viewing Periods</div>
                      <div className="space-y-2">
                        {finalRecommendation.bestViewingPeriods.map((period, index) => (
                          <div key={index} className="bg-white/70 rounded-lg p-3 border border-purple-200">
                            <div className="text-slate-800 text-sm font-medium">
                              {period.startPercent}% - {period.endPercent}%
                            </div>
                            <div className="text-slate-600 text-xs mt-1">{period.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {finalRecommendation.specialHighlights && finalRecommendation.specialHighlights.length > 0 && (
                    <div>
                      <div className="text-slate-600 text-sm mb-2">Special Highlights</div>
                      <div className="bg-white/70 rounded-lg p-3 border border-purple-200">
                        {finalRecommendation.specialHighlights.map((highlight, index) => (
                          <div key={index} className="text-slate-700 text-sm mb-1">• {highlight}</div>
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
