export const rateLimit = {
  window: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 requests per window
  maxRequestsPerApiKey: 1000, // limit each API key to 1000 requests per window
};