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