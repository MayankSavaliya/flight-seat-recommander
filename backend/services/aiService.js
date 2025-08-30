const { GoogleGenAI } = require('@google/genai');

class AIService {
  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'your-api-key-here' });
  }

  async analyzeAllFlightPoints(allPointData, flightData) {
    try {
      const prompt = `
        Analyze all flight points and provide recommendations for each point, then give a final seat recommendation.
        
        Flight Overview:
        - Route: ${flightData.fromCoords.latitude}, ${flightData.fromCoords.longitude} to ${flightData.toCoords.latitude}, ${flightData.toCoords.longitude}
        - Departure Time: ${flightData.departureTime}
        - Flight Duration: ${flightData.flightTime.hours}h ${flightData.flightTime.minutes}m
        - Distance: ${Math.round(flightData.distance)} km
        - Total Points to Analyze: ${allPointData.length}
        
        Flight Points Data:
        ${allPointData.map((point, index) => `
        Point ${index + 1} (${point.progressPercent}% of flight):
        - Time: ${point.time}
        - Location: ${point.coordinates[0]}, ${point.coordinates[1]}
        - Flight Bearing: ${point.flightBearing}° (direction of travel)
        - Sun Azimuth: ${point.sun.azimuth}° (sun's direction relative to North)
        - Sun Altitude: ${point.sun.altitude}° (sun's height above horizon)
        - Sun Visible: ${point.sun.visible ? 'Yes' : 'No'}
        `).join('\n')}
        
        Please provide analysis in this JSON format:
        {
          "pointAnalyses": [
            {
              "pointIndex": 0,
              "seatSide": "left/right",
              "reason": "explanation",
              "viewScore": 1-10,
              "specialCondition": "description"
            }
          ],
          "finalRecommendation": {
            "finalSeatSide": "left/right",
            "confidence": "high/medium/low",
            "reasoning": "detailed explanation",
            "bestViewingPeriods": [
              {
                "startPercent": 0-100,
                "endPercent": 0-100,
                "description": "what to expect"
              }
            ],
            "overallScore": 1-10,
            "specialHighlights": ["list of special moments"],
            "recommendation": "final seat recommendation with reasoning"
          } 
        }
      `;

      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt
      });
      const text = response.text;
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Batch AI analysis error:', error);
      throw error;
    }
  }

  async generateFinalSeatRecommendation(allPointAnalyses, flightData) {
    try {
      const prompt = `
        Based on the analysis of all flight points, provide the final seat recommendation:
        
        Flight Overview:
        - Route: ${flightData.fromCoords.latitude}, ${flightData.fromCoords.longitude} to ${flightData.toCoords.latitude}, ${flightData.toCoords.longitude}
        - Departure Time: ${flightData.departureTime}
        - Flight Duration: ${flightData.flightTime.hours}h ${flightData.flightTime.minutes}m
        - Distance: ${Math.round(flightData.distance)} km
        - Total Points Analyzed: ${allPointAnalyses.length}
        
        Point Analysis Summary:
        ${allPointAnalyses.map((point, index) => `
        Point ${index + 1} (${point.progressPercent}%):
        - Flight Bearing: ${point.flightBearing}° (direction of travel)
        - Seat: ${point.aiRecommendation.seatSide}
        - Score: ${point.aiRecommendation.viewScore}/10
        - Reason: ${point.aiRecommendation.reason}
        - Special: ${point.aiRecommendation.specialCondition}
        `).join('\n')}
        
        Please provide a comprehensive final recommendation in JSON format:
        {
          "finalSeatSide": "left/right",
          "confidence": "high/medium/low",
          "reasoning": "detailed explanation",
          "bestViewingPeriods": [
            {
              "startPercent": 0-100,
              "endPercent": 0-100,
              "description": "what to expect"
            }
          ],
          "overallScore": 1-10,
          "specialHighlights": ["list of special moments"],
          "recommendation": "final seat recommendation with reasoning"
        }
      `;
        
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      const text = response.text;
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Final AI analysis error:', error);
      throw error;
    }
  }
}

module.exports = new AIService();
