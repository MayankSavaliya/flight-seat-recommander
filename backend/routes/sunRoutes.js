const express = require('express');
const flightCalculationService = require('../services/flightCalculationService');

const router = express.Router();

// Get sun position
router.post('/position', async (req, res) => {
  try {
    const { latitude, longitude, date } = req.body;
    
    if (!latitude || !longitude || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const sunPosition = flightCalculationService.calculateSunPosition(latitude, longitude, new Date(date));
    
    res.json({
      success: true,
      sunPosition
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate sun position' });
  }
});

module.exports = router;
