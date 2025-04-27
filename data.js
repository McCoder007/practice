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
    } else if (level === 'vocabulary') {
        // For vocabulary, we don't randomize, return the full dataset
        return vocabularyData;
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
function setLevel(level, totalQuestions) {
    console.log(`Setting level: ${level}, totalQuestions: ${totalQuestions}`);
    
    // Get the appropriate data array based on the level
    let allQuestions;
    
    if (level === 'level1' && typeof level1Data !== 'undefined') {
        allQuestions = [...level1Data];
    } else if (level === 'level2' && typeof level2Data !== 'undefined') {
        allQuestions = [...level2Data];
    } else if (level === 'verbTenses1' && typeof verbTensesData !== 'undefined') {
        allQuestions = [...verbTensesData];
    } else if (level.startsWith('irregularVerbStage')) {
        // Handle irregular verb stages directly from window variables
        console.log('Accessing irregular verb stage directly:', level);
        
        if (level === 'irregularVerbStage1' && window.irregularVerbStage1) {
            allQuestions = [...window.irregularVerbStage1];
            console.log(`Found ${allQuestions.length} questions for irregularVerbStage1 directly`);
        } 
        else if (level === 'irregularVerbStage2' && window.irregularVerbStage2) {
            allQuestions = [...window.irregularVerbStage2];
            console.log(`Found ${allQuestions.length} questions for irregularVerbStage2 directly`);
        }
        else if (level === 'irregularVerbStage3' && window.irregularVerbStage3) {
            allQuestions = [...window.irregularVerbStage3];
            console.log(`Found ${allQuestions.length} questions for irregularVerbStage3 directly`);
        }
        else if (level === 'irregularVerbStage4' && window.irregularVerbStage4) {
            allQuestions = [...window.irregularVerbStage4];
            console.log(`Found ${allQuestions.length} questions for irregularVerbStage4 directly`);
        }
        else if (level === 'irregularVerbStage5' && window.irregularVerbStage5) {
            allQuestions = [...window.irregularVerbStage5];
            console.log(`Found ${allQuestions.length} questions for irregularVerbStage5 directly`);
        }
        else {
            console.error('Invalid irregular verb stage or data not loaded:', level);
            return [];
        }
    } else if (level === 'vocabulary' && typeof vocabularyData !== 'undefined') {
        // For vocabulary, we don't randomize here, return the full dataset structure
        console.log("Vocabulary level selected, returning structure.");
        return vocabularyData; // Return the whole object for vocabulary handling in app.js
    } else {
        console.error('Invalid level or data not loaded:', level);
        return [];
    }
    
    // For quiz types (non-vocabulary), shuffle the array
    console.log(`Shuffling ${allQuestions.length} questions for level ${level}`);
    for (let i = allQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }
    
    // Return the first n questions (or all if fewer than n)
    const numToReturn = Math.min(totalQuestions, allQuestions.length);
    console.log(`Returning ${numToReturn} questions.`);
    return allQuestions.slice(0, numToReturn);
}