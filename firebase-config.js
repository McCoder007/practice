// Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA52dIm2y8-D9tuzScz5UxAy1-ljfiQPtw",
  authDomain: "feedback-board-b5889.firebaseapp.com",
  projectId: "feedback-board-b5889",
  storageBucket: "feedback-board-b5889.firebasestorage.app",
  messagingSenderId: "356107718217",
  appId: "1:356107718217:web:8df97696c77b97db63f998",
  measurementId: "G-5W0NTND2S8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics();

// Helper function to log events
function logEvent(eventName, eventParams = {}) {
  analytics.logEvent(eventName, eventParams);
  console.log(`Logged event: ${eventName}`, eventParams);
} 