// Application state
let currentQuestionIndex = 0;
let score = 0;
let selectedOption = null;
let firstAttempts = []; // Track first attempts for each question
let quizStartTime = null; // Track when the quiz started
let totalCorrectAnswers = 0; // Track total correct answers
let totalQuestionsAnswered = 0; // Track total questions answered
let currentLevel = "level1"; // Track current level

// DOM elements
const lineAElement = document.getElementById('lineA');
const lineBElement = document.getElementById('lineB');
const optionsContainer = document.getElementById('optionsContainer');
const nextBtn = document.getElementById('nextBtn');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const finalScoreElement = document.getElementById('finalScore');
const questionContainer = document.getElementById('questionContainer');
const completionContainer = document.getElementById('completionContainer');
const levelSelectionContainer = document.getElementById('levelSelectionContainer');
const restartBtn = document.getElementById('restartBtn');
const backToLevelsBtn = document.getElementById('backToLevelsBtn');
const playLineABtn = document.getElementById('playLineA');
const playLineBBtn = document.getElementById('playLineB');
const level1Btn = document.getElementById('level1Btn');
const level2Btn = document.getElementById('level2Btn');
const progressBarContainer = document.getElementById('progressBarContainer');

// Initialize the application
function initApp() {
    console.log("Initializing app...");
    
    // Show level selection screen
    showLevelSelection();
    
    // Event listeners for level buttons
    level1Btn.addEventListener('click', function() {
        console.log("Level 1 button clicked");
        startLevel('level1');
    });
    
    level2Btn.addEventListener('click', function() {
        console.log("Level 2 button clicked");
        startLevel('level2');
    });
    
    // Event listeners
    nextBtn.addEventListener('click', goToNextQuestion);
    restartBtn.addEventListener('click', restartPractice);
    backToLevelsBtn.addEventListener('click', showLevelSelection);
    
    // TTS play buttons
    playLineABtn.addEventListener('click', () => {
        const text = practiceData[currentQuestionIndex].lineA.replace(/{{blank}}/g, '___');
        googleTTS.speakLine(text);
    });
    
    playLineBBtn.addEventListener('click', () => {
        const text = practiceData[currentQuestionIndex].lineB.replace(/{{blank}}/g, '___');
        googleTTS.speakLine(text);
    });
    
    console.log("App initialization complete");
}

// Show level selection screen
function showLevelSelection() {
    console.log("Showing level selection screen");
    
    // Hide other containers
    questionContainer.classList.remove('active');
    completionContainer.classList.remove('active');
    progressBarContainer.style.display = 'none';
    
    // Show level selection
    levelSelectionContainer.classList.add('active');
    
    // Update header
    document.querySelector('header h1').textContent = 'Preposition Practice';
    
    console.log("Level selection container display:", getComputedStyle(levelSelectionContainer).display);
}

// Start a specific level
function startLevel(level) {
    console.log("Starting level:", level);
    currentLevel = level;
    
    // Set the level title
    let levelTitle = level === 'level1' ? 'Level 1 - Basic' : 'Level 2 - Intermediate';
    document.querySelector('header h1').textContent = 'Preposition Practice - ' + levelTitle;
    
    // Initialize the practice data for this level
    practiceData = setLevel(level, 10);
    console.log("Practice data loaded:", practiceData.length, "questions");
    
    // Reset state
    currentQuestionIndex = 0;
    score = 0;
    totalCorrectAnswers = 0;
    totalQuestionsAnswered = 0;
    quizStartTime = new Date();
    firstAttempts = new Array(practiceData.length).fill(null);
    
    // Log quiz start event
    logEvent('quiz_started', {
        quiz_type: 'preposition_practice',
        quiz_level: level,
        total_questions: practiceData.length
    });
    
    // Hide level selection, show question container
    levelSelectionContainer.classList.remove('active');
    questionContainer.classList.add('active');
    progressBarContainer.style.display = 'flex';
    
    console.log("Question container display:", getComputedStyle(questionContainer).display);
    
    // Load first question
    loadQuestion(currentQuestionIndex);
    updateProgress();
}

// Load a question
function loadQuestion(index) {
    console.log("Loading question:", index);
    const question = practiceData[index];
    
    // Reset selected option
    selectedOption = null;
    
    // Replace the blank placeholder with an actual blank element
    const lineA = question.lineA.replace(/{{blank}}/g, '<span class="answer-blank">_____</span>');
    const lineB = question.lineB;
    
    lineAElement.innerHTML = lineA;
    lineBElement.textContent = lineB;
    
    // Clear previous options
    optionsContainer.innerHTML = '';
    
    // Add options
    question.options.forEach(option => {
        const optionBtn = document.createElement('button');
        optionBtn.classList.add('option-btn');
        optionBtn.textContent = option;
        optionBtn.addEventListener('click', () => selectOption(option));
        optionsContainer.appendChild(optionBtn);
    });
    
    // Hide next button initially
    nextBtn.classList.remove('visible');
}

// Handle option selection
function selectOption(option) {
    // If already selected an option, do nothing
    if (selectedOption !== null) return;
    
    selectedOption = option;
    const question = practiceData[currentQuestionIndex];
    const isCorrect = option === question.correct;
    
    // Record first attempt if not already recorded
    if (firstAttempts[currentQuestionIndex] === null) {
        firstAttempts[currentQuestionIndex] = isCorrect;
        
        // Update score if correct
        if (isCorrect) {
            score++;
        }
        
        // Track total questions answered
        totalQuestionsAnswered++;
        
        // Track total correct answers
        if (isCorrect) {
            totalCorrectAnswers++;
        }
    }
    
    // Update UI to show correct/incorrect
    const optionBtns = optionsContainer.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => {
        if (btn.textContent === option) {
            btn.classList.add('selected');
            
            // Add correct/incorrect class to the blank
            const blankElement = document.querySelector('.answer-blank');
            blankElement.textContent = option;
            blankElement.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
        
        // Disable all buttons
        btn.disabled = true;
    });
    
    // Log answer event
    logEvent('question_answered', {
        quiz_type: 'preposition_practice',
        quiz_level: currentLevel,
        question_index: currentQuestionIndex,
        selected_option: option,
        correct_option: question.correct,
        is_correct: isCorrect
    });
    
    // Show next button
    nextBtn.classList.add('visible');
}

// Go to next question
function goToNextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < practiceData.length) {
        loadQuestion(currentQuestionIndex);
        updateProgress();
    } else {
        showCompletion();
    }
}

// Update progress bar
function updateProgress() {
    const progress = ((currentQuestionIndex) / practiceData.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${currentQuestionIndex + 1}/${practiceData.length}`;
}

// Show completion screen
function showCompletion() {
    console.log("Showing completion screen");
    
    // Calculate quiz duration
    const quizEndTime = new Date();
    const quizDurationSeconds = Math.floor((quizEndTime - quizStartTime) / 1000);
    
    // Update final score
    finalScoreElement.textContent = `${score}/${practiceData.length}`;
    
    // Hide question container, show completion
    questionContainer.classList.remove('active');
    completionContainer.classList.add('active');
    
    console.log("Completion container display:", getComputedStyle(completionContainer).display);
    
    // Log quiz completion event
    logEvent('quiz_completed', {
        quiz_type: 'preposition_practice',
        quiz_level: currentLevel,
        total_questions: practiceData.length,
        correct_answers: score,
        accuracy_percentage: Math.round((score / practiceData.length) * 100),
        duration_seconds: quizDurationSeconds,
        first_attempt_accuracy: Math.round((firstAttempts.filter(Boolean).length / firstAttempts.length) * 100)
    });
}

// Restart practice
function restartPractice() {
    // Start the same level again
    startLevel(currentLevel);
}

// Log events to Firebase Analytics if available
function logEvent(eventName, eventParams) {
    if (window.firebase && firebase.analytics) {
        firebase.analytics().logEvent(eventName, eventParams);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);