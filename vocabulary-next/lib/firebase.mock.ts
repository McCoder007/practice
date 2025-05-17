// Mock implementation of Firebase for builds
// This is used as a fallback when Firebase dependencies are not available

// No-op analytics implementation
const mockAnalytics = {
  logEvent: (eventName: string, params?: any) => {
    console.log(`[Mock Analytics] Event: ${eventName}`, params);
    return true;
  },
  setUserId: (id: string) => {
    console.log(`[Mock Analytics] Set user ID: ${id}`);
    return true;
  },
  setUserProperties: (properties: any) => {
    console.log(`[Mock Analytics] Set properties:`, properties);
    return true;
  }
};

// Mock initialization - always returns success
export const initializeAnalytics = async () => {
  console.log('[Mock Firebase] Analytics initialized');
  return true;
};

// Mock user ID generation
export const ensureUserId = () => {
  const userId = 'mock-user-id';
  console.log(`[Mock Firebase] Using mock user ID: ${userId}`);
  return userId;
};

// Mock event logging
export const logAnalyticsEvent = (eventName: string, eventParams = {}) => {
  console.log(`[Mock Firebase] Logged event: ${eventName}`, eventParams);
  return true;
};

// Mock user property setting
export const setUserProperty = (propertyName: string, value: string) => {
  console.log(`[Mock Firebase] Set user property: ${propertyName} = ${value}`);
  return true;
}; 