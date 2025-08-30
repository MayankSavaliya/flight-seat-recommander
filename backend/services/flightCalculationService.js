const turf = require('@turf/turf');
const suncalc = require('suncalc');

class FlightCalculationService {
  constructor() {
    this.earthRadius = 6371; // Earth radius in kilometers
  }

  /**
   * Calculate great circle distance between two points
   */
  calculateDistance(fromCoords, toCoords) {
    const from = turf.point([fromCoords.longitude, fromCoords.latitude]);
    const to = turf.point([toCoords.longitude, toCoords.latitude]);
    
    return turf.distance(from, to, { units: 'kilometers' });
  }

  /**
   * Generate great circle route between two airports
   */
  generateFlightRoute(fromCoords, toCoords, numPoints = 50) {
    const from = turf.point([fromCoords.longitude, fromCoords.latitude]);
    const to = turf.point([toCoords.longitude, toCoords.latitude]);
    
    // Create great circle line
    const greatCircle = turf.greatCircle(from, to, { npoints: numPoints });
    
    // Extract coordinates and return as [lat, lng] for Leaflet
    const coordinates = greatCircle.geometry.coordinates;
    
    return coordinates.map(coord => [coord[1], coord[0]]); // [lat, lng] format
  }

  /**
   * Calculate bearing between two points
   */
  calculateBearing(fromCoords, toCoords) {
    const from = turf.point([fromCoords.longitude, fromCoords.latitude]);
    const to = turf.point([toCoords.longitude, toCoords.latitude]);
    
    return turf.bearing(from, to);
  }





  /**
   * Calculate flight duration based on distance
   */
  estimateFlightTime(distanceKm, avgSpeed = 900) {
    // Average commercial flight speed: ~900 km/h (default)
    const hours = distanceKm / avgSpeed;
    
    return {
      hours: Math.floor(hours),
      minutes: Math.round((hours % 1) * 60),
      totalMinutes: Math.round(hours * 60)
    };
  }

  /**
   * Calculate sun position at specific location and time
   */
  calculateSunPosition(latitude, longitude, dateTime) {
    const sunPos = suncalc.getPosition(dateTime, latitude, longitude);
    
    // Convert radians to degrees
    const azimuthDegrees = (sunPos.azimuth * 180) / Math.PI + 180; // Convert to 0-360
    const altitudeDegrees = (sunPos.altitude * 180) / Math.PI;
    
    return {
      azimuth: Math.round(azimuthDegrees * 100) / 100, // Round to 2 decimal places
      altitude: Math.round(altitudeDegrees * 100) / 100,
      visible: altitudeDegrees > 0,
      time: dateTime,
      coordinates: { latitude, longitude }
    };
  }





  /**
   * Calculate sun position along flight route with AI analysis (batch processing)
   */
  async calculateSunAlongRouteWithAI(route, departureTime, flightDurationMinutes, aiService, fromCoords, toCoords) {
    const allPointData = [];
    
    // Prepare all point data first
    for (let i = 0; i < route.length; i++) {
      const point = route[i];
      const progress = i / (route.length - 1);
      const currentTime = new Date(departureTime.getTime() + (progress * flightDurationMinutes * 60000));
      
      const sunPos = this.calculateSunPosition(point[0], point[1], currentTime);
      
      // Calculate flight bearing at this point (direction of travel)
      const flightBearing = this.calculateBearing(
        { latitude: point[0], longitude: point[1] },
        toCoords
      );
      
      const pointData = {
        progressPercent: Math.round(progress * 100),
        time: currentTime,
        coordinates: point,
        flightBearing: Math.round(flightBearing),
        sun: {
          azimuth: sunPos.azimuth,
          altitude: sunPos.altitude,
          visible: sunPos.altitude > 0
        }
      };
      
      allPointData.push(pointData);
    }
    
    // Get batch AI analysis for all points in a single request
    const flightData = {
      fromCoords,
      toCoords,
      departureTime,
      flightTime: this.estimateFlightTime(this.calculateDistance(fromCoords, toCoords))
    };
    
    const batchAnalysis = await aiService.analyzeAllFlightPoints(allPointData, flightData);
    console.log('AI Response Structure:', JSON.stringify(batchAnalysis, null, 2));
    
    // Combine point data with AI recommendations
    const sunPositions = allPointData.map((pointData, index) => {
      const aiRecommendation = batchAnalysis.pointAnalyses && batchAnalysis.pointAnalyses[index] 
        ? batchAnalysis.pointAnalyses[index] 
        : {
            seatSide: "left",
            reason: "Default recommendation",
            viewScore: 5,
            specialCondition: "Standard conditions"
          };
      
      return {
        ...pointData,
        aiRecommendation: {
          seatSide: aiRecommendation.seatSide,
          reason: aiRecommendation.reason,
          viewScore: aiRecommendation.viewScore,
          specialCondition: aiRecommendation.specialCondition
        }
      };
    });
    
    // Store the final recommendation for later use
    sunPositions.finalRecommendation = batchAnalysis.finalRecommendation;
    
    return sunPositions;
  }

  /**
   * Determine optimal seat side using AI analysis of all flight points
   */
  async getOptimalSeatSideWithAI(flightData, aiService) {
    const { fromCoords, toCoords, departureTime } = flightData;
    
    const distance = this.calculateDistance(fromCoords, toCoords);
    const flightTime = this.estimateFlightTime(distance);
    const route = this.generateFlightRoute(fromCoords, toCoords, 100); // 100 points for detailed analysis

    
    // Calculate sun positions with AI analysis for all 100 points (now in batch)
    const sunPositionsWithAI = await this.calculateSunAlongRouteWithAI(
      route, 
      departureTime, 
      flightTime.totalMinutes, 
      aiService,
      fromCoords,
      toCoords
    );
    
    // Use the final recommendation from the batch analysis
    const finalRecommendation = sunPositionsWithAI.finalRecommendation;
    
    return {
      side: finalRecommendation.finalSeatSide,
      reason: finalRecommendation.recommendation,
      confidence: finalRecommendation.confidence,
      flightDuration: flightTime,
      distance: distance,
      aiAnalysis: {
        totalPointsAnalyzed: sunPositionsWithAI.length,
        overallScore: finalRecommendation.overallScore,
        bestViewingPeriods: finalRecommendation.bestViewingPeriods,
        specialHighlights: finalRecommendation.specialHighlights,
        pointAnalyses: sunPositionsWithAI
      }
    };
  }


}

module.exports = new FlightCalculationService();
