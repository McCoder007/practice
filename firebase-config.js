// Firebase configuration
// Replace these values with your actual Firebase project configuration
// You can find these values in your Firebase console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics();

// Helper function to log events
function logEvent(eventName, eventParams = {}) {
  analytics.logEvent(eventName, eventParams);
  console.log(`Logged event: ${eventName}`, eventParams);
} 