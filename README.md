# ESL Preposition Practice App

A mobile web application for ESL students to practice prepositions through interactive exercises.

## Features

- Interactive dialogue-based exercises
- Text-to-speech functionality
- Multiple choice answers
- Progress tracking
- Mobile-friendly design

## Firebase Analytics Integration

This app uses Firebase Analytics to track usage metrics. The following events are tracked:

- Quiz starts
- Questions answered
- Correct answers
- Quiz completions
- Quiz restarts

### Setting Up Firebase

To set up Firebase for this app:

1. **Create a Firebase Project**:
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup steps
   - Enable Google Analytics during setup

2. **Register Your Web App**:
   - In your Firebase project, click on the web icon (</>) to add a web app
   - Enter a nickname for your app (e.g., "ESL Preposition Practice")
   - Check the "Also set up Firebase Hosting" option if you plan to host with Firebase
   - Click "Register app"

3. **Copy Your Firebase Configuration**:
   - Firebase will display configuration code that looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID"
   };
   ```
   - Copy this configuration

4. **Update Your Configuration**:
   - Open the `firebase-config.js` file in this project
   - Replace the placeholder configuration with your actual Firebase configuration

5. **Deploy Your App**:
   - If using Firebase Hosting:
     ```
     npm install -g firebase-tools
     firebase login
     firebase init
     firebase deploy
     ```
   - Or deploy to your preferred hosting service

6. **View Analytics Data**:
   - In the Firebase Console, go to the "Analytics" section
   - You'll see data start to appear as users interact with your app
   - You can create custom reports based on the events being tracked

## Usage

1. Open the app in a mobile browser
2. Read the dialogue and select the correct preposition
3. Tap the play button to hear the sentences spoken
4. Tap "Next Question" to proceed
5. View your final score at the end

## Development

- HTML/CSS/JavaScript
- Web Speech API for text-to-speech
- Firebase Analytics for usage tracking 