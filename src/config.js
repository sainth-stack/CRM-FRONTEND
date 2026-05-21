const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (import.meta.env.PROD && !configuredApiBaseUrl) {
  throw new Error("VITE_API_BASE_URL must be configured for production builds.");
}

const API_BASE_URL = configuredApiBaseUrl || "http://localhost:8000";

export default API_BASE_URL;
export { API_BASE_URL };
