const { GoogleGenAI } = require('@google/genai');

class AIService {
  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'your-api-key-here' });
  }

  async analyzeFlightAndGetRecommendation(allPointData, flightData) {
    try {
      const prompt = `
        You are an aviation seat advisor AI. Analyze the full flight path using provided points, sun data, and flight metadata. 
        Use strict mathematical reasoning, domain knowledge, and geographic context. 
        Output ONLY JSON in the schema provided, no extra commentary, no backticks.

        ================================================================================
        ANALYSIS RULES (MUST FOLLOW STRICTLY):

        1. SEAT SIDE CALCULATION (per point):
          - Compute relativeAngle = normalize(sunAzimuth - flightBearing) into range (-180, +180].
          - If relativeAngle > 0 → "right".
          - If relativeAngle < 0 → "left".
          - If |relativeAngle| ≤ 30° OR ≥ 150° → mark as "ahead/behind".
          - If sunAltitude ≤ 0 → seatSide = "none" because sun is not visible.

        2. SUNLIGHT VISIBILITY & SPECIAL CONDITIONS:
          - If sunAltitude ≤ 0 → "Not visible".
          - If -6° ≤ sunAltitude ≤ +6° → "Sunrise/Sunset".
          - If 5° ≤ sunAltitude ≤ 25° → "Golden Hour".
          - Else if sunAltitude > 25° → "Normal daylight".
          - If very high altitude > 60° → "Overhead Sun (harsh light)".
          - Always include one of these labels for "specialCondition".

        3. VIEW SCORE (1-10 scale, integer):
          - 9-10: Golden Hour or long uninterrupted visible period on correct side, horizon views optimal.
          - 7-8: Visible with good altitude but not golden hour.
          - 4-6: Visible but overhead or intermittent.
          - 1-3: Poor visibility or sun not visible at all.

        4. LOCATION CONTEXT:
          - For each point, add "location" = nearest major city, state, country, or notable geographic feature (mountain range, ocean, desert, coastline).
          - If over sea with no city nearby → "Over ocean".
          - If over sparsely populated area → "Remote area (Region, Country)".

        5. FLIGHT DURATION WEIGHTING:
          - Assume each point represents a segment proportional to its progressPercent difference.
          - Weight visibility and seat-side decisions by minutes, not just raw point counts.
          - Flight Duration = ${flightData.flightTime.hours}h ${flightData.flightTime.minutes}m, Distance ≈ ${Math.round(flightData.distance)} km.

        6. CONFIDENCE CALCULATION (final recommendation):
          - HIGH: One side has ≥30% more total visible minutes AND at least one contiguous block ≥20 minutes.
          - MEDIUM: Difference between sides ≥10% OR one side has ≥10 continuous visible minutes.
          - LOW: Sun mostly not visible (<10 minutes total) OR frequent side flips (≥3).

        7. FINAL SEAT SIDE:
          - Use weighted minutes (not raw counts).
          - If left vs right ratio ≥ 1.3 → choose stronger side.
          - If ratio < 1.3, check mid-flight (≈50% progress point) for bias.
          - If still equal → return "none" with LOW confidence.

        8. BEST VIEWING PERIODS:
          - Identify continuous ranges of progressPercent where sun is visible and within special conditions ("Sunrise/Sunset" or "Golden Hour").
          - Return 1-3 periods with startPercent, endPercent, description ("Sunrise glow", "Long golden stretch", etc.).

        9. SPECIAL HIGHLIGHTS:
          - Include any notable moments (e.g., "Sunset crossing Atlantic Ocean", "Golden Hour over Alps").
          - Mention if sun switches sides mid-flight.
          - Mention if large contiguous viewing occurs.

        10. FINAL OUTPUT FORMAT:
          - Strict JSON.
          - No prose outside JSON.
          - No backticks.
          - Must exactly match schema.

        ================================================================================
        FLIGHT OVERVIEW:
        - Route: ${flightData.fromCoords.latitude}, ${flightData.fromCoords.longitude} → ${flightData.toCoords.latitude}, ${flightData.toCoords.longitude}
        - Departure Time: ${flightData.departureTime}
        - Duration: ${flightData.flightTime.hours}h ${flightData.flightTime.minutes}m
        - Distance: ${Math.round(flightData.distance)} km
        - Total Points: ${allPointData.length}

        ================================================================================
        FLIGHT POINTS DATA:
        ${allPointData.map((point, index) => `
        Point ${index + 1} (${point.progressPercent}%):
        - Time: ${point.time}
        - Coordinates: ${point.coordinates[1]}, ${point.coordinates[0]}
        - Flight Bearing: ${point.flightBearing}°
        - Sun Azimuth: ${point.sun.azimuth}°
        - Sun Altitude: ${point.sun.altitude}°
        - Sun Visible: ${point.sun.visible ? 'Yes' : 'No'}
        `).join('\n')}

        ================================================================================
        OUTPUT JSON SCHEMA:
        {
          "pointAnalyses": [
            {
              "pointIndex": 0,
              "seatSide": "left/right/none",
              "reason": "Math-based justification (relative angle, visibility)",
              "viewScore": 1-10,
              "specialCondition": "Sunrise/Sunset/Golden Hour/Normal daylight/Overhead Sun/Not visible",
              "location": "Nearest city, region, or landmark .Must add"
            }
          ],
          "finalRecommendation": {
            "finalSeatSide": "left/right/none",
            "confidence": "high/medium/low",
            "reasoning": "Detailed explanation with weighted minutes, contiguous windows, side flips",
            "bestViewingPeriods": [
              {
                "startPercent": 0-100,
                "endPercent": 0-100,
                "description": "e.g., Golden Hour over Mediterranean Sea"
              }
            ],
            "overallScore": 1-10,
            "specialHighlights": ["list of key scenic or lighting moments"],
            "recommendation": "Final seat recommendation with human-friendly reasoning"
          }
        }


        Important: Ensure the final recommendation takes into account all flight points and provides a thorough analysis 
        of viewing opportunities throughout the entire flight duration.
      `;
      

      console.log(prompt);
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt
      });
      const text = response.text;
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('AI analysis error:', error);
      throw error;
    }
  }
}

module.exports = new AIService();
