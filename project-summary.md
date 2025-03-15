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
   - The key is securely stored as a GitHub Secret and injected during the build process
   - The key is set in `index.html` using `googleTTS.setApiKey()`

2. **Voice Selection**: 
   - Default voice: `en-US-Neural2-D` (male neural voice)
   - Set in `index.html` using `googleTTS.setVoice('en-US-Neural2-D')`

### Secure API Key Handling
- The API key is stored as a GitHub Secret to keep it secure
- During the build process, a Node.js script (`build.js`) replaces a placeholder in the code with the actual API key
- This allows the repository to remain public while keeping the API key private
- The GitHub Actions workflow automatically handles this replacement during deployment

### GitHub Actions Deployment
- The application is automatically deployed to GitHub Pages using GitHub Actions
- The workflow is defined in `.github/workflows/deploy.yml`
- The workflow runs whenever changes are pushed to the main branch
- The deployment process includes:
  1. Checking out the code
  2. Setting up Node.js
  3. Replacing the API key placeholder with the actual key from GitHub Secrets
  4. Deploying the updated code to the gh-pages branch

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
  1. Checking out the code
  2. Setting up Node.js
  3. Replacing the API key placeholder with the actual key from GitHub Secrets
  4. Deploying the updated code to the gh-pages branch

### Implementation Details
- The TTS functionality is implemented in `