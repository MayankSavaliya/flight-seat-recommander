import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Play, Pause, RotateCcw, Home, Globe, Eye, Sun, MapPin, Clock, Star } from 'lucide-react';

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
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-cyan-100 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mr-3">
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
                  ? 'bg-cyan-500 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-cyan-100'
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
          <span className="font-bold text-cyan-600">{Math.round(progress)}% Complete</span>
          <span className="font-medium">100%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
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
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200">
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
                {currentPointData.coordinates[0].toFixed(2)}°, {currentPointData.coordinates[1].toFixed(2)}°
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
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-semibold text-white mb-4">Point Recommendation</h3>
      
      {/* Recommendation */}
      <div className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 rounded-xl p-4 mb-4 text-center">
        <div className="text-blue-200 text-sm mb-2">Recommended Seat Side</div>
        <div className="text-3xl font-bold text-white mb-2">
          {recommendation.seatSide.toUpperCase()} SIDE
        </div>
        <div className="text-blue-100">View Score: <span className={scoreColor}>{viewScore}/10</span></div>
      </div>

      {/* Details */}
      <div className="space-y-4">
        <div>
          <div className="text-blue-300 text-sm mb-1">Reason</div>
          <div className="text-white">{recommendation.reason}</div>
        </div>
        
        {recommendation.specialCondition && (
          <div>
            <div className="text-blue-300 text-sm mb-1">Special Conditions</div>
            <div className="text-white">{recommendation.specialCondition}</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div>
            <div className="text-blue-300 text-sm">Sun Azimuth</div>
            <div className="text-white font-medium">{sun.azimuth}°</div>
          </div>
          <div>
            <div className="text-blue-300 text-sm">Sun Altitude</div>
            <div className="text-white font-medium">{sun.altitude}°</div>
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-cyan-200/20 to-blue-300/15 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-teal-200/20 to-green-300/15 rounded-full blur-2xl"></div>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <button 
            className="flex items-center text-slate-600 hover:text-cyan-600 font-medium transition-colors group" 
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Results
          </button>
          <button 
            onClick={onReturnHome}
            className="flex items-center text-slate-600 hover:text-cyan-600 font-medium transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Start Over
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <div className="w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center ring-1 ring-cyan-100">
              <Globe className="w-8 h-8 text-cyan-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            <span className="text-slate-800">Interactive</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 bg-clip-text text-transparent">
              Flight Map
            </span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            <strong className="text-slate-800">{flightDetails.fromCoords.latitude.toFixed(2)}°, {flightDetails.fromCoords.longitude.toFixed(2)}°</strong>
            {' '} → {' '}
            <strong className="text-slate-800">{flightDetails.toCoords.latitude.toFixed(2)}°, {flightDetails.toCoords.longitude.toFixed(2)}°</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 h-96">
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
                  color="#3B82F6"
                  weight={3}
                  opacity={0.7}
                />
                
                {/* Start Marker */}
                <Marker position={[flightDetails.fromCoords.latitude, flightDetails.fromCoords.longitude]}>
                  <Popup>
                    <div className="text-center">
                      <div className="font-bold text-green-600">Departure</div>
                      <div className="text-sm">Start of journey</div>
                    </div>
                  </Popup>
                </Marker>
                
                {/* End Marker */}
                <Marker position={[flightDetails.toCoords.latitude, flightDetails.toCoords.longitude]}>
                  <Popup>
                    <div className="text-center">
                      <div className="font-bold text-red-600">Arrival</div>
                      <div className="text-sm">End of journey</div>
                    </div>
                  </Popup>
                </Marker>
                
                {/* Current Position Marker */}
                {currentPointData && (
                  <Marker position={[currentPointData.coordinates[0], currentPointData.coordinates[1]]}>
                    <Popup>
                      <div className="text-center">
                        <div className="font-bold text-blue-600">Current Position</div>
                        <div className="text-sm">{currentPointData.progressPercent}% Complete</div>
                        <div className="text-sm">{new Date(currentPointData.time).toLocaleTimeString()}</div>
                      </div>
                    </Popup>
                  </Marker>
                )}
                
                <MapUpdater flightPoints={flightPoints} currentPoint={currentPoint} />
              </MapContainer>
            </div>
          </div>

          {/* Controls and Info */}
          <div className="space-y-6">
            {/* Flight Progress */}
            <FlightProgress 
              flightPoints={flightPoints}
              currentPoint={currentPoint}
              onPointChange={setCurrentPoint}
            />

            {/* Point Recommendation */}
            <PointRecommendation pointData={currentPointData} />

            {/* Final Recommendation Toggle */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <button
                onClick={() => setShowFinalRecommendation(!showFinalRecommendation)}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                {showFinalRecommendation ? 'Hide' : 'Show'} Final Recommendation
              </button>
            </div>

            {/* Final Recommendation */}
            {showFinalRecommendation && finalRecommendation && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">Final Recommendation</h3>
                
                <div className="bg-gradient-to-r from-green-600/80 to-blue-600/80 rounded-xl p-4 mb-4 text-center">
                  <div className="text-green-200 text-sm mb-2">Overall Recommendation</div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {finalRecommendation.side.toUpperCase()} SIDE
                  </div>
                  <div className="text-green-100">Confidence: {finalRecommendation.confidence}</div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-blue-300 text-sm">Reasoning</div>
                    <div className="text-white text-sm">{finalRecommendation.reason}</div>
                  </div>
                  
                  {finalRecommendation.bestViewingPeriods && finalRecommendation.bestViewingPeriods.length > 0 && (
                    <div>
                      <div className="text-blue-300 text-sm mb-2">Best Viewing Periods</div>
                      <div className="space-y-2">
                        {finalRecommendation.bestViewingPeriods.map((period, index) => (
                          <div key={index} className="bg-white/5 rounded p-2">
                            <div className="text-white text-sm font-medium">
                              {period.startPercent}% - {period.endPercent}%
                            </div>
                            <div className="text-blue-200 text-xs">{period.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {finalRecommendation.specialHighlights && finalRecommendation.specialHighlights.length > 0 && (
                    <div>
                      <div className="text-blue-300 text-sm mb-2">Special Highlights</div>
                      <div className="space-y-1">
                        {finalRecommendation.specialHighlights.map((highlight, index) => (
                          <div key={index} className="text-white text-sm">• {highlight}</div>
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
  );
}

export default InteractiveFlightMap;
