const Airport = require('../models/Airport');
const fs = require('fs').promises;
const path = require('path');

class MongoAirportService {
  constructor() {
    this.isInitialized = false;
  }

  async initializeDatabase() {
    if (this.isInitialized) return;

    try {
      const count = await Airport.countDocuments();
      
      if (count === 0) {
        console.log('Loading airport data from local file...');
        await this.loadAirportData();
      } else {
        console.log(`Found ${count} airports in MongoDB`);
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  async loadAirportData() {
    try {
      console.log('Loading airport data from airports.json...');
      const filePath = path.join(__dirname, '../data/airports.json');
      const fileContent = await fs.readFile(filePath, 'utf8');
      const airports = JSON.parse(fileContent);

      console.log(`Found ${airports.length} airports in JSON file`);
      
      // Save to MongoDB using the exact format from the JSON file
      await Airport.insertMany(airports);
      console.log(`Loaded ${airports.length} airports to MongoDB`);
    } catch (error) {
      console.error('Failed to load airport data:', error);
      throw error;
    }
  }

  async searchAirports(query) {
    try {
      const results = await Airport.searchAirports(query, { limit: 10 });
      return results;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }
}

module.exports = new MongoAirportService();
