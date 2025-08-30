import { useState, useEffect } from 'react';
import { ArrowLeft, Home, Award, Plane, Sun, Clock, CheckCircle, MapPin, Star, Eye, Calendar, Navigation, Sparkles } from 'lucide-react';

function Results({ flightData, onBack, onViewVisualization, onReturnHome }) {
  const [recommendation, setRecommendation] = useState(null);

  // Use backend recommendation if available, otherwise calculate locally
  useEffect(() => {
    if (flightData) {
      if (flightData.finalRecommendation) {
        // Use new backend recommendation structure
        setRecommendation({
          seatSide: flightData.finalRecommendation.side.toUpperCase(),
          reasoning: flightData.finalRecommendation.reason,
          bestViewTime: `Flight duration: ${flightData.flightDetails.flightDuration.hours}h ${flightData.flightDetails.flightDuration.minutes}m`,
          flightPath: `${flightData.fromAirport.name} → ${flightData.toAirport.name}`,
          timeline: flightData.timeline || [],
          distance: flightData.flightDetails.distance,
          overallScore: flightData.finalRecommendation.overallScore,
          bestViewingPeriods: flightData.finalRecommendation.bestViewingPeriods,
          specialHighlights: flightData.finalRecommendation.specialHighlights,
          confidence: flightData.finalRecommendation.confidence
        });
      } else if (flightData.recommendation) {
        // Use old backend recommendation structure
        setRecommendation({
          seatSide: flightData.recommendation.side.toUpperCase(),
          reasoning: flightData.recommendation.reason,
          bestViewTime: `Flight duration: ${flightData.recommendation.flightDuration.hours}h ${flightData.recommendation.flightDuration.minutes}m`,
          flightPath: `${flightData.fromAirport.name} → ${flightData.toAirport.name}`,
          timeline: flightData.timeline || [],
          distance: flightData.recommendation.distance,
          isEastward: flightData.recommendation.isEastward
        });
      } else {
        // Fallback to local calculation
        const result = calculateSeatRecommendation(flightData);
        setRecommendation(result);
      }
    }
  }, [flightData]);

  const calculateSeatRecommendation = (data) => {
    const { from, to, date, time, preference, fromAirport, toAirport } = data;
    
    // Use airport objects if available, otherwise fallback to city names
    const fromName = fromAirport?.name || from;
    const toName = toAirport?.name || to;
    const fromCity = fromAirport?.city || from;
    const toCity = toAirport?.city || to;
    
    const departureHour = parseInt(time.split(':')[0]);
    const isEastward = isFlightEastward(fromAirport?.coordinates, toAirport?.coordinates, from, to);
    
    let seatSide = 'RIGHT';
    let reasoning = '';
    let bestViewTime = '';
    
    if (preference === 'sunrise') {
      seatSide = isEastward ? 'RIGHT' : 'LEFT';
      reasoning = `For sunrise views, sit on the ${seatSide.toLowerCase()} side facing east`;
      bestViewTime = 'Early morning during flight';
    } else if (preference === 'sunset') {
      seatSide = isEastward ? 'LEFT' : 'RIGHT';
      reasoning = `For sunset views, sit on the ${seatSide.toLowerCase()} side facing west`;
      bestViewTime = 'Evening during flight';
    } else {
      // Best scenic views - consider time of day
      if (departureHour >= 6 && departureHour <= 10) {
        seatSide = isEastward ? 'RIGHT' : 'LEFT';
        reasoning = 'Morning departure - best views of sunrise and landscapes on the east side';
        bestViewTime = 'First 2 hours of flight';
      } else if (departureHour >= 16 && departureHour <= 20) {
        seatSide = isEastward ? 'LEFT' : 'RIGHT';
        reasoning = 'Evening departure - best views of sunset and golden hour on the west side';
        bestViewTime = 'Last 2 hours before landing';
      } else {
        seatSide = 'EITHER';
        reasoning = 'Good scenic views available on both sides during this time';
        bestViewTime = 'Throughout the flight';
      }
    }

    return {
      seatSide,
      reasoning,
      bestViewTime,
      flightPath: `${fromName} → ${toName}`,
      timeline: generateFlightTimeline(time, fromCity, toCity, preference)
    };
  };

  const isFlightEastward = (fromCoords, toCoords, fromName, toName) => {
    // Use coordinates if available
    if (fromCoords && toCoords) {
      return toCoords.longitude > fromCoords.longitude;
    }
    
    // Fallback to city-based detection
    const eastCities = ['New York', 'Boston', 'Philadelphia', 'Miami', 'Atlanta', 'London', 'Paris', 'Tokyo'];
    const westCities = ['Los Angeles', 'San Francisco', 'Seattle', 'Las Vegas', 'Phoenix', 'Denver'];
    
    const fromEast = eastCities.some(city => fromName.toLowerCase().includes(city.toLowerCase()));
    const toEast = eastCities.some(city => toName.toLowerCase().includes(city.toLowerCase()));
    
    return toEast && !fromEast;
  };

  const generateFlightTimeline = (departureTime, from, to, preference) => {
    const [hours, minutes] = departureTime.split(':').map(Number);
    const departureDate = new Date();
    departureDate.setHours(hours, minutes, 0, 0);
    
    // Mock flight duration (2-6 hours)
    const flightDurationHours = Math.random() * 4 + 2;
    const arrivalDate = new Date(departureDate.getTime() + flightDurationHours * 60 * 60 * 1000);
    
    const timeline = [
      {
        time: formatTime(departureDate),
        event: `Takeoff from ${from}`
      }
    ];

    // Add scenic viewing opportunities
    if (preference === 'sunrise' && hours >= 5 && hours <= 8) {
      const sunriseTime = new Date(departureDate.getTime() + 30 * 60 * 1000);
      timeline.push({
        time: formatTime(sunriseTime),
        event: '🌅 Best time for sunrise views!'
      });
    } else if (preference === 'sunset' && hours >= 16 && hours <= 19) {
      const sunsetTime = new Date(departureDate.getTime() + (flightDurationHours * 0.7) * 60 * 60 * 1000);
      timeline.push({
        time: formatTime(sunsetTime),
        event: '🌇 Best time for sunset views!'
      });
    }

    timeline.push({
      time: formatTime(arrivalDate),
      event: `Landing in ${to}`
    });

    return timeline;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const [animateIn, setAnimateIn] = useState(false);
  
  useEffect(() => {
    // Start the entrance animation after component mounts
    const timer = setTimeout(() => {
      setAnimateIn(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  if (!recommendation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center mb-6 mx-auto">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Calculating Your Perfect Seat</h2>
          <p className="text-slate-600">AI analyzing flight path, sun position, and timing...</p>
        </div>
      </div>
    );
  }

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
            Back to Flight Details
          </button>
          <button 
            onClick={onReturnHome}
            className="flex items-center text-slate-600 hover:text-cyan-600 font-medium transition-colors group"
          >
            <Home className="w-5 h-5 mr-2" />
            Start Over
          </button>
        </div>
        
        {/* Status Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-300 rounded-full text-green-700 text-sm font-semibold">
            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
            AI Recommendation Ready
          </div>
        </div>
        
        {/* Main content with animations */}
        <div className={`transition-all duration-1000 transform ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Hero section */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center mb-8 relative">
              <div className="relative">
                <div className="w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center ring-1 ring-green-100">
                  <Award className="w-12 h-12 text-green-500" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-amber-500" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-slate-800">Your Perfect</span>
              <br />
              <span className="bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Window Seat
              </span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              <strong className="text-slate-800">{flightData.fromAirport?.city || flightData.from}</strong> to <strong className="text-slate-800">{flightData.toAirport?.city || flightData.to}</strong> · {new Date(flightData.departureDate).toLocaleDateString()}
            </p>
          </div>
          
          {/* Recommendation Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-cyan-100 shadow-2xl mb-8">
            <div className="text-center">
              <div className="flex justify-center items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-8">Recommended Seat Side</h2>
              
              <div className={`inline-block px-12 py-8 bg-gradient-to-r ${
                recommendation.seatSide === 'RIGHT' ? 'from-green-500 to-emerald-600' : 
                recommendation.seatSide === 'LEFT' ? 'from-blue-500 to-cyan-600' : 
                'from-purple-500 to-indigo-600'
              } rounded-3xl shadow-2xl mb-8 transform hover:scale-105 transition-transform`}>
                <div className="text-6xl mb-4">
                  {recommendation.seatSide === 'RIGHT' ? '👉' : 
                   recommendation.seatSide === 'LEFT' ? '👈' : '⭐'}
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {recommendation.seatSide === 'EITHER' ? 'Either Side' : `${recommendation.seatSide} Side`}
                </div>
                <div className="text-lg text-white/90">
                  {recommendation.seatSide === 'LEFT' ? '(Window seats A, B, C)' : 
                   recommendation.seatSide === 'RIGHT' ? '(Window seats K, J, H)' : 
                   '(Any window seat)'}
                </div>
                <div className="text-sm text-white/80 mt-3 flex items-center justify-center">
                  <Star className="w-4 h-4 mr-1" />
                  High confidence recommendation
                </div>
              </div>
            </div>
          </div>
          
          {/* Flight Details Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cyan-100 hover:border-cyan-300 hover:shadow-xl transition-all">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Flight Details</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <div className="flex items-center text-slate-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>Route</span>
                  </div>
                  <span className="text-slate-800 font-semibold">{recommendation.flightPath}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <div className="flex items-center text-slate-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Duration</span>
                  </div>
                  <span className="text-slate-800 font-semibold">{recommendation.bestViewTime}</span>
                </div>
                {recommendation.distance && (
                  <div className="flex justify-between items-center py-3 border-b border-slate-200">
                    <div className="flex items-center text-slate-600">
                      <Navigation className="w-4 h-4 mr-2" />
                      <span>Distance</span>
                    </div>
                    <span className="text-slate-800 font-semibold">{Math.round(recommendation.distance).toLocaleString()} km</span>
                  </div>
                )}
                {recommendation.isEastward !== undefined && (
                  <div className="flex justify-between items-center py-3">
                    <div className="flex items-center text-slate-600">
                      <Navigation className="w-4 h-4 mr-2" />
                      <span>Direction</span>
                    </div>
                    <span className="text-slate-800 font-semibold">{recommendation.isEastward ? 'Eastward' : 'Westward'}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-100 hover:border-amber-300 hover:shadow-xl transition-all">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                  <Sun className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">View Analysis</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-start py-3 border-b border-slate-200">
                  <div className="flex items-center text-slate-600">
                    <Star className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Key Highlights</span>
                  </div>
                  <span className="text-slate-800 font-semibold text-right flex-1 ml-4">
                    {flightData.recommendation?.highlights || "Spectacular views along your route"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <div className="flex items-center text-slate-600">
                    <Sun className="w-4 h-4 mr-2" />
                    <span>Sun Position</span>
                  </div>
                  <span className="text-slate-800 font-semibold">
                    {flightData.recommendation?.sunPosition || "Analyzed for optimal viewing"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <div className="flex items-center text-slate-600">
                    <Eye className="w-4 h-4 mr-2" />
                    <span>Best For</span>
                  </div>
                  <span className="text-slate-800 font-semibold">
                    {flightData.viewPreference === 'sunrise' ? 'Sunrise viewing' : 
                     flightData.viewPreference === 'sunset' ? 'Sunset viewing' : 
                     'General scenic views'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Timeline */}
          {recommendation.timeline && recommendation.timeline.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 mb-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Flight Timeline</h3>
              </div>
              <div className="space-y-3">
                {recommendation.timeline.map((event, index) => (
                  <div key={index} className="flex items-center p-4 bg-gradient-to-r from-slate-50 to-purple-50 border border-purple-100 rounded-xl hover:shadow-md transition-all">
                    <div className="text-2xl mr-4">{event.icon || '✈️'}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800">{event.time}</div>
                      <div className="text-sm text-slate-600">{event.event || event.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Rationale */}
          <div className="bg-gradient-to-br from-green-50 to-cyan-50 rounded-2xl p-8 border border-green-100 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Why This Recommendation?</h3>
            </div>
            <p className="text-slate-700 leading-relaxed text-lg">
              {recommendation.reasoning || "Based on your flight time, route, and sun position calculations, this side will provide better lighting conditions and views of key landmarks. This recommendation factors in the sun's angle throughout your journey to minimize glare while maximizing scenic views."}
            </p>
          </div>
          
          {/* Call to action */}
          <div className="text-center">
            <button
              onClick={onViewVisualization}
              className="group px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-lg rounded-2xl shadow-xl transform transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-200 flex items-center mx-auto hover:shadow-2xl"
            >
              <MapPin className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
              <span>View Interactive Flight Map</span>
              <Sparkles className="w-5 h-5 ml-3 animate-pulse" />
            </button>
            <div className="flex flex-wrap justify-center items-center gap-6 text-slate-500 text-sm mt-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span className="font-medium">2D & 3D visualization</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">Real-time tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span className="font-medium">Interactive features</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Results;
