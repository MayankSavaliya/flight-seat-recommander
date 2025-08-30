const express = require('express');
const flightCalculationService = require('../services/flightCalculationService');
const aiService = require('../services/aiService');

const fs = require('fs');
const path = require('path');

const router = express.Router();

// Test AI service endpoint
router.get('/test-ai', async (req, res) => {
  try {
    const testPrompt = "Say 'AI is working!' in exactly 3 words.";
    console.log(process.env.GEMINI_API_KEY)
    const response = await aiService.genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: testPrompt
    });
    
    res.json({
      success: true,
      message: "AI service is working!",
      aiResponse: response.text,
      model: "gemini-2.5-pro"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "AI service failed",
      details: error.message,
      apiKeyStatus: process.env.GEMINI_API_KEY ? "Present" : "Missing"
    });
  }
});

// Get AI-powered seat recommendation
router.post('/recommendation', async (req, res) => {
  try {
    
    const dataPath = path.join(__dirname, '../data/data.json');
    const staticData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    res.json(staticData);
    // const { fromAirport, toAirport, departureDate, departureTime } = req.body;
    
    // if (!fromAirport || !toAirport || !departureDate || !departureTime) {
    //   return res.status(400).json({ error: 'Missing required fields' });
    // }
    
    // const departureDateTime = new Date(`${departureDate}T${departureTime}`);
    // const flightData = {
    //   fromCoords: fromAirport.coordinates,
    //   toCoords: toAirport.coordinates,
    //   departureTime: departureDateTime
    // };
    
    // // Get AI-powered seat recommendation with 100-point analysis
    // const seatRecommendation = await flightCalculationService.getOptimalSeatSideWithAI(flightData, aiService);
    
    // res.json({
    //   success: true,
    //   // Final recommendation
    //   finalRecommendation: {
    //     side: seatRecommendation.side,
    //     reason: seatRecommendation.reason,
    //     confidence: seatRecommendation.confidence,
    //     overallScore: seatRecommendation.aiAnalysis.overallScore,
    //     bestViewingPeriods: seatRecommendation.aiAnalysis.bestViewingPeriods,
    //     specialHighlights: seatRecommendation.aiAnalysis.specialHighlights
    //   },
    //   // Flight details
    //   flightDetails: {
    //     fromCoords: fromAirport.coordinates,
    //     toCoords: toAirport.coordinates,
    //     departureTime: departureDateTime,
    //     flightDuration: seatRecommendation.flightDuration,
    //     distance: seatRecommendation.distance,
    //     route: seatRecommendation.aiAnalysis.pointAnalyses.map(point => point.coordinates)
    //   },
    //   // All 100 points with recommendations for interactive map
    //   flightPoints: seatRecommendation.aiAnalysis.pointAnalyses.map((point, index) => ({
    //     pointIndex: index,
    //     progressPercent: point.progressPercent,
    //     coordinates: point.coordinates,
    //     time: point.time,
    //     flightBearing: point.flightBearing,
    //     sun: point.sun,
    //     recommendation: {
    //       seatSide: point.aiRecommendation.seatSide,
    //       reason: point.aiRecommendation.reason,
    //       viewScore: point.aiRecommendation.viewScore,
    //       specialCondition: point.aiRecommendation.specialCondition
    //     }
    //   })),
    //   // Metadata
    //   metadata: {
    //     analysisMethod: 'AI-powered 100-point analysis',
    //     totalPointsAnalyzed: seatRecommendation.aiAnalysis.totalPointsAnalyzed,
    //     overallScore: seatRecommendation.aiAnalysis.overallScore
      // }
    // });
  } catch (error) {
    console.error('AI recommendation error:', error);
    res.status(500).json({ error: 'Failed to calculate AI recommendation' });
  }
});

module.exports = router;
