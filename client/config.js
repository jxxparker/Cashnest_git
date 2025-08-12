// Configuration for API endpoints
const API_CONFIG = {
  // For local development
  development: {
    baseURL: "http://localhost:4000",
    apiURL: "http://localhost:4000/api",
  },
  // For production
  production: {
    baseURL: "http://3.229.166.20:4000",
    apiURL: "http://3.229.166.20:4000/api",
  },
};

// Determine current environment (default to development for localhost)
const currentEnv =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "development"
    : "production";

// Export the current configuration
const API_BASE_URL = API_CONFIG[currentEnv].baseURL;
const API_URL = API_CONFIG[currentEnv].apiURL;
