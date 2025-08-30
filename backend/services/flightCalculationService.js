const turf = require('@turf/turf');
const suncalc = require('suncalc');

class FlightCalculationService {
  /**
   * Calculate great circle distance between two points in kilometers
   */
  calculateDistance(fromCoords, toCoords) {
    const from = turf.point([fromCoords.longitude, fromCoords.latitude]);
    const to = turf.point([toCoords.longitude, toCoords.latitude]);
    return turf.distance(from, to, { units: 'kilometers' });
  }

  /**
   * Generate flight route points in [lat, lng] format for map visualization
   */
  generateFlightRoute(fromCoords, toCoords, numPoints = 50) {
    const from = turf.point([fromCoords.longitude, fromCoords.latitude]);
    const to = turf.point([toCoords.longitude, toCoords.latitude]);
    const greatCircle = turf.greatCircle(from, to, { npoints: numPoints });
    const coordinates = greatCircle.geometry.coordinates;
    return coordinates.map(coord => [coord[1], coord[0]]);
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
   * Estimate flight time based on distance (avgSpeed: 900 km/h)
   */
  estimateFlightTime(distanceKm, avgSpeed = 900) {
    const hours = distanceKm / avgSpeed;
    return {
      hours: Math.floor(hours),
      minutes: Math.round((hours % 1) * 60),
      totalMinutes: Math.round(hours * 60)
    };
  }

  /**
   * Calculate sun position in degrees for a specific location and time
   */
  calculateSunPosition(latitude, longitude, dateTime) {
    const sunPos = suncalc.getPosition(dateTime, latitude, longitude);
    const azimuthDegrees = (sunPos.azimuth * 180) / Math.PI + 180;
    const altitudeDegrees = (sunPos.altitude * 180) / Math.PI;
    return {
      azimuth: Math.round(azimuthDegrees * 100) / 100,
      altitude: Math.round(altitudeDegrees * 100) / 100,
      visible: altitudeDegrees > 0,
      time: dateTime,
      coordinates: { latitude, longitude }
    };
  }

  /**
   * Calculate sun position and get AI analysis for each point along flight route
   */
  async calculateSunAlongRouteWithAI(route, departureTime, flightDurationMinutes, aiService, fromCoords, toCoords) {
    const allPointData = [];
    for (let i = 0; i < route.length; i++) {
      const point = route[i];
      const progress = i / (route.length - 1);
      const currentTime = new Date(departureTime.getTime() + (progress * flightDurationMinutes * 60000));
      const sunPos = this.calculateSunPosition(point[0], point[1], currentTime);
      const flightBearing = this.calculateBearing(
        { latitude: point[0], longitude: point[1] },
        toCoords
      );
      allPointData.push({
        progressPercent: Math.round(progress * 100),
        time: currentTime,
        coordinates: point,
        flightBearing: Math.round(flightBearing),
        sun: {
          azimuth: sunPos.azimuth,
          altitude: sunPos.altitude,
          visible: sunPos.altitude > 0
        }
      });
    }

    const flightData = {
      fromCoords,
      toCoords,
      departureTime,
      flightTime: this.estimateFlightTime(this.calculateDistance(fromCoords, toCoords))
    };
    
    const analysis = await aiService.analyzeFlightAndGetRecommendation(allPointData, flightData);
    const sunPositions = allPointData.map((pointData, index) => {
      const aiRecommendation = analysis.pointAnalyses && analysis.pointAnalyses[index] 
        ? analysis.pointAnalyses[index] 
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
          specialCondition: aiRecommendation.specialCondition,
          location: aiRecommendation.location
        }
      };
    });
    
    sunPositions.finalRecommendation = analysis.finalRecommendation;
    return sunPositions;
  }

  /**
   * Get final seat recommendation using AI analysis
   */
  async getOptimalSeatSideWithAI(flightData, aiService) {
    const { fromCoords, toCoords, departureTime } = flightData;
    const distance = this.calculateDistance(fromCoords, toCoords);
    const flightTime = this.estimateFlightTime(distance);
    const route = this.generateFlightRoute(fromCoords, toCoords, 100);
    const sunPositionsWithAI = await this.calculateSunAlongRouteWithAI(
      route, departureTime, flightTime.totalMinutes, aiService, fromCoords, toCoords
    );
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
