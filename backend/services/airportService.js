const mongoAirportService = require('./mongoAirportService');

class AirportService {
  constructor() {
    this.isInitialized = false;
  }

  async initializeDatabase() {
    if (this.isInitialized) return;
    await mongoAirportService.initializeDatabase();
    this.isInitialized = true;
  }

  async searchAirports(query) {
    if (!this.isInitialized) {
      await this.initializeDatabase();
    }
    return await mongoAirportService.searchAirports(query);
  }
}

module.exports = new AirportService();
