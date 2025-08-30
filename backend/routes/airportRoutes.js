const express = require('express');
const airportService = require('../services/airportService');

const router = express.Router();

// Search airports by name
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) return res.json({ results: [] });
    
    const results = await airportService.searchAirports(query);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
