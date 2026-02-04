// Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "__FIREBASE_API_KEY__",
  authDomain: "esl-preposition-practice.firebaseapp.com",
  projectId: "esl-preposition-practice",
  storageBucket: "esl-preposition-practice.firebasestorage.app",
  messagingSenderId: "23182734978",
  appId: "1:23182734978:web:060de369f972ec36baa69b",
  measurementId: "G-Z3QP99QCWD"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics();

// Helper function to log events
function logEvent(eventName, eventParams = {}) {
  analytics.logEvent(eventName, eventParams);
  console.log(`Logged event: ${eventName}`, eventParams);
} 