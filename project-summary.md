# ESL Preposition Practice App - Project Summary

## Overview
This is a mobile web application designed to help ESL (English as a Second Language) students practice prepositions through interactive dialogue-based exercises. The app presents users with sentences containing blanks where prepositions should be placed, and users select the correct option from multiple choices.

## Key Features
- Two difficulty levels (Level 1 and Level 2)
- Interactive dialogue-based exercises with blanks to fill in
- Text-to-speech functionality for listening practice
- Multiple choice answers with immediate feedback
- Progress tracking during exercises
- Score reporting upon completion
- Mobile-friendly responsive design

## Technical Stack
- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Text-to-Speech**: Google TTS API
- **Analytics**: Firebase Analytics
- **Hosting**: GitHub Pages

## File Structure
- `index.html` - Main HTML structure of the application
- `app.js` - Core application logic and event handling
- `styles.css` - Styling for the application
- `level1Data.js` - Dataset for Level 1 (basic preposition practice)
- `level2Data.js` - Dataset for Level 2 (intermediate preposition practice)
- `data.js` - Utility functions for managing and selecting questions
- `google-tts.js` - Implementation of Google Text-to-Speech functionality
- `tts.js` - Additional text-to-speech utilities
- `firebase-config.js` - Firebase configuration for analytics
- `check-analytics.js` - Analytics implementation

## Application Flow
1. User lands on the level selection screen
2. User selects either Level 1 or Level 2
3. App presents a series of 10 randomly selected questions from the chosen level
4. For each question:
   - User reads the dialogue with a blank
   - User can listen to the sentences using TTS
   - User selects an answer from multiple choices
   - App provides immediate feedback
   - User proceeds to the next question
5. After completing all questions, a score summary is displayed
6. User can choose to practice again or return to level selection

## Data Structure
Each question in the dataset follows this format:
```javascript
{
    lineA: "The book is {{blank}} the table.",  // First line of dialogue
    lineB: "Yes, I can see it.",                // Second line of dialogue
    options: ["at", "on", "in"],                // Multiple choice options
    correct: "on"                               // Correct answer
}
```

## Google TTS Setup and Configuration

### API Configuration
The application uses Google's Text-to-Speech API for audio playback. This requires:

1. **API Key**: A valid Google Cloud API key with Text-to-Speech API enabled
   - The key is set in `index.html` using `googleTTS.setApiKey('YOUR_API_KEY')`
   - Current key: `AIzaSyBBe1XfNjodUza5EHDLbs6HTWk8O64b5c8`

2. **Voice Selection**: 
   - Default voice: `en-US-Neural2-D` (male neural voice)
   - Set in `index.html` using `googleTTS.setVoice('en-US-Neural2-D')`

### Implementation Details
- The TTS functionality is implemented in `google-tts.js` as a class called `GoogleTTSManager`
- Audio responses are cached to improve performance and reduce API calls
- The implementation includes a browser-based TTS fallback using the Web Speech API

### Mobile Device Handling
- Special handling for iOS devices to address audio playback restrictions:
  ```javascript
  // Initialize audio on first user interaction for iOS
  document.body.addEventListener('touchstart', function() {
      // Try to initialize audio context
      if (googleTTS.audioContext && googleTTS.audioContext.state === 'suspended') {
          googleTTS.audioContext.resume();
      }
  }, {once: true});
  ```

### Common Issues and Solutions

1. **Audio Not Playing on iOS**
   - **Issue**: iOS requires user interaction before audio can play
   - **Solution**: Initialize audio context on first touch event (implemented in `index.html`)

2. **API Key Quota Exceeded**
   - **Issue**: Google Cloud TTS API has usage limits
   - **Solution**: Monitor usage in Google Cloud Console and increase quotas if needed

3. **Audio Playback Delays**
   - **Issue**: Network latency can cause delays in audio playback
   - **Solution**: Implemented caching system to store previously fetched audio

4. **Cross-Origin Issues**
   - **Issue**: API calls may be blocked by CORS policies
   - **Solution**: Ensure proper API configuration in Google Cloud Console

5. **Browser Compatibility**
   - **Issue**: Some browsers may not support certain audio formats
   - **Solution**: Implemented fallback to browser's native Web Speech API

### Setting Up a New Project
1. Create a Google Cloud project
2. Enable the Text-to-Speech API
3. Create an API key with appropriate restrictions
4. Replace the API key in `index.html`
5. Test on both desktop and mobile devices
6. Ensure first user interaction initializes audio context on mobile

## Recent Changes
- Simplified header titles to just "Level 1" and "Level 2"
- Fixed option selection highlighting to ensure only the currently selected option is highlighted
- Improved level selection page positioning
- Made Level 1 answers more unambiguous by updating question options

## Analytics
The app tracks the following events:
- Quiz starts
- Questions answered (with correctness)
- Quiz completions (with score and duration)
- Quiz restarts

## Development Notes
- The app is designed to be simple and focused on a single learning objective
- TTS functionality requires an API key for Google's Text-to-Speech service
- Firebase Analytics is optional but provides useful insights on user engagement 