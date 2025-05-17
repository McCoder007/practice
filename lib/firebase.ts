// Firebase configuration for vocabulary-next
// Reusing the existing Firebase project from the parent directory

// Use dynamic imports to avoid build-time errors
// This allows the app to work both in local dev and when deployed to GitHub Pages

// Lazy-loaded Firebase modules
let firebaseApp: any = null;
let analyticsInstance: any = null;

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_BV3O4-kx1sLC4KXDsJ2g8D_8WTbe56I",
  authDomain: "esl-preposition-practice.firebaseapp.com",
  projectId: "esl-preposition-practice",
  storageBucket: "esl-preposition-practice.firebasestorage.app",
  messagingSenderId: "23182734978",
  appId: "1:23182734978:web:060de369f972ec36baa69b",
  measurementId: "G-Z3QP99QCWD"
};

// Initialize Firebase
export const initializeFirebase = async () => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Dynamically import Firebase modules
    const { initializeApp } = await import('firebase/app');
    
    // Initialize Firebase only once
    if (!firebaseApp) {
      firebaseApp = initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
    }
    return true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return false;
  }
};

// Initialize analytics
export const initializeAnalytics = async () => {
  if (typeof window === 'undefined') return false;
  
  try {
    await initializeFirebase();
    
    if (!firebaseApp) {
      console.warn('Firebase app not initialized');
      return false;
    }
    
    // Dynamically import Firebase analytics
    const { getAnalytics, isSupported } = await import('firebase/analytics');
    
    // Check if analytics is supported in the current environment
    if (await isSupported()) {
      analyticsInstance = getAnalytics(firebaseApp);
      console.log('Firebase Analytics initialized successfully');
      return true;
    } else {
      console.log('Firebase Analytics is not supported in this environment');
      return false;
    }
  } catch (error) {
    console.error('Error initializing Firebase Analytics:', error);
    return false;
  }
};

// Generate a semi-persistent anonymous user ID if one doesn't exist
export const ensureUserId = () => {
  if (typeof window === 'undefined') return null;
  
  let userId = localStorage.getItem('vocab_user_id');
  if (!userId) {
    userId = 'anon_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('vocab_user_id', userId);
  }
  
  return userId;
};

// Log an event to Firebase Analytics
export const logAnalyticsEvent = async (eventName: string, eventParams = {}) => {
  if (typeof window === 'undefined') return false;
  
  try {
    if (!analyticsInstance) {
      console.warn('Firebase Analytics not initialized. Event not logged:', eventName);
      return false;
    }
    
    // Dynamically import Firebase analytics
    const { logEvent } = await import('firebase/analytics');
    
    // Add common parameters to all events
    const commonParams = {
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      platform: navigator.platform,
      screen_size: `${window.innerWidth}x${window.innerHeight}`,
    };
    
    logEvent(analyticsInstance, eventName, { ...commonParams, ...eventParams });
    console.log(`Logged event: ${eventName}`, eventParams);
    return true;
  } catch (error) {
    console.error(`Error logging event ${eventName}:`, error);
    return false;
  }
};

// Set user properties for segmentation
export const setUserProperty = async (propertyName: string, value: string) => {
  if (typeof window === 'undefined') return false;
  
  try {
    if (!analyticsInstance) {
      console.warn('Firebase Analytics not initialized. User property not set:', propertyName);
      return false;
    }
    
    // Dynamically import Firebase analytics
    const { setUserProperties } = await import('firebase/analytics');
    
    setUserProperties(analyticsInstance, { [propertyName]: value });
    console.log(`Set user property: ${propertyName} = ${value}`);
    return true;
  } catch (error) {
    console.error(`Error setting user property ${propertyName}:`, error);
    return false;
  }
}; 