// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  // Flight endpoints
  FLIGHT_RECOMMENDATION: `${API_BASE_URL}/api/flight/recommendation`,
  FLIGHT_TEST_AI: `${API_BASE_URL}/api/flight/test-ai`,
  
  // Airport endpoints
  AIRPORT_SEARCH: `${API_BASE_URL}/api/airports/search`,
  
  // Sun endpoints
  SUN_POSITION: `${API_BASE_URL}/api/sun/position`,
};

export default API_BASE_URL;
