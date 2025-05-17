// Firebase configuration for vocabulary-next
// Reusing the existing Firebase project from the parent directory

// Import the mock implementation for static builds
import * as firebaseMock from './firebase.mock';

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

// Analytics singleton
let analytics: any = null;
let firebaseInitialized = false;

// Initialize analytics
export const initializeAnalytics = async () => {
  if (firebaseInitialized) return true;
  
  // Only run Firebase in the browser
  if (typeof window === 'undefined') {
    console.log('Running in SSR/build environment, using mock Firebase');
    return firebaseMock.initializeAnalytics();
  }
  
  try {
    // Dynamically import Firebase modules
    const [{ initializeApp }, { getAnalytics, isSupported }] = await Promise.all([
      import('firebase/app'),
      import('firebase/analytics'),
    ]);
    
    // Check if analytics is supported
    if (await isSupported()) {
      const app = initializeApp(firebaseConfig);
      analytics = getAnalytics(app);
      firebaseInitialized = true;
      console.log('Firebase Analytics initialized successfully');
      return true;
    } else {
      console.log('Firebase Analytics is not supported in this environment');
      return firebaseMock.initializeAnalytics();
    }
  } catch (error) {
    console.error('Error initializing Firebase Analytics, using mock:', error);
    return firebaseMock.initializeAnalytics();
  }
};

// Generate a semi-persistent anonymous user ID if one doesn't exist
export const ensureUserId = () => {
  if (typeof window === 'undefined') return firebaseMock.ensureUserId();
  
  let userId = localStorage.getItem('vocab_user_id');
  if (!userId) {
    userId = 'anon_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('vocab_user_id', userId);
  }
  
  if (analytics && firebaseInitialized) {
    // Dynamically import to set the user ID
    import('firebase/analytics').then(({ setUserId }) => {
      setUserId(analytics, userId);
    }).catch(err => {
      console.error('Error importing setUserId:', err);
    });
  }
  
  return userId;
};

// Log an event to Firebase Analytics
export const logAnalyticsEvent = (eventName: string, eventParams = {}) => {
  if (typeof window === 'undefined') {
    return firebaseMock.logAnalyticsEvent(eventName, eventParams);
  }
  
  if (!analytics || !firebaseInitialized) {
    console.warn('Firebase Analytics not initialized. Event not logged:', eventName);
    return firebaseMock.logAnalyticsEvent(eventName, eventParams);
  }
  
  try {
    // Add common parameters to all events
    const commonParams = {
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      platform: navigator.platform,
      screen_size: `${window.innerWidth}x${window.innerHeight}`,
    };
    
    // Dynamically import to log the event
    import('firebase/analytics').then(({ logEvent }) => {
      logEvent(analytics, eventName, { ...commonParams, ...eventParams });
      console.log(`Logged event: ${eventName}`, eventParams);
    }).catch(err => {
      console.error(`Error importing logEvent:`, err);
    });
    
    return true;
  } catch (error) {
    console.error(`Error logging event ${eventName}:`, error);
    return firebaseMock.logAnalyticsEvent(eventName, eventParams);
  }
};

// Set user properties for segmentation
export const setUserProperty = (propertyName: string, value: string) => {
  if (typeof window === 'undefined') {
    return firebaseMock.setUserProperty(propertyName, value);
  }
  
  if (!analytics || !firebaseInitialized) {
    console.warn('Firebase Analytics not initialized. User property not set:', propertyName);
    return firebaseMock.setUserProperty(propertyName, value);
  }
  
  try {
    // Dynamically import to set user properties
    import('firebase/analytics').then(({ setUserProperties }) => {
      setUserProperties(analytics, { [propertyName]: value });
      console.log(`Set user property: ${propertyName} = ${value}`);
    }).catch(err => {
      console.error(`Error importing setUserProperties:`, err);
    });
    
    return true;
  } catch (error) {
    console.error(`Error setting user property ${propertyName}:`, error);
    return firebaseMock.setUserProperty(propertyName, value);
  }
}; 