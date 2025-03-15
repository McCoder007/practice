// Import level data from separate files
// These will be loaded via script tags in the HTML

// Randomly select questions from a specific level
function getRandomQuestions(level, totalQuestions) {
    // Get the appropriate data array based on the level
    let allQuestions;
    
    if (level === 'level1') {
        allQuestions = [...level1Data];
    } else if (level === 'level2') {
        allQuestions = [...level2Data];
    } else if (level === 'verbTenses1') {
        allQuestions = [...verbTensesData];
    } else {
        console.error('Invalid level:', level);
        return [];
    }
    
    // Shuffle the array
    for (let i = allQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }
    
    // Return the first n questions
    return allQuestions.slice(0, totalQuestions);
}

// Initialize with level 1 by default
let practiceData = [];

// This will be set by the app.js when a level is selected
function setLevel(level, questionsCount = 10) {
    // Use the currentLevel from app.js
    window.currentLevel = level;
    practiceData = getRandomQuestions(level, questionsCount);
    return practiceData;
}