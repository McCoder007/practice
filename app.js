// Application state
let currentQuestionIndex = 0;
let score = 0;
let selectedOption = null;
let firstAttempts = []; // Track first attempts for each question
let quizStartTime = null; // Track when the quiz started
let totalCorrectAnswers = 0; // Track total correct answers
let totalQuestionsAnswered = 0; // Track total questions answered
let currentLevel = "level1"; // Track current level
let currentPracticeType = "prepositions"; // Track current practice type

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
const mainMenuContainer = document.getElementById('mainMenuContainer');
const restartBtn = document.getElementById('restartBtn');
const backToMainMenuBtn = document.getElementById('backToMainMenuBtn');
const backToMainBtn = document.getElementById('backToMainBtn');
const quizBackBtn = document.getElementById('quizBackBtn');
const playLineABtn = document.getElementById('playLineA');
const playLineBBtn = document.getElementById('playLineB');
const level1Btn = document.getElementById('level1Btn');
const level2Btn = document.getElementById('level2Btn');
const prepositionsBtn = document.getElementById('prepositionsBtn');
const verbTensesBtn = document.getElementById('verbTensesBtn');
const progressBarContainer = document.getElementById('progressBarContainer');
const confirmModal = document.getElementById('confirmModal');
const confirmExitBtn = document.getElementById('confirmExitBtn');
const cancelExitBtn = document.getElementById('cancelExitBtn');

// Initialize the application
function initApp() {
    console.log("Initializing app...");
    
    // Test log for device information
    const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        devicePixelRatio: window.devicePixelRatio,
        isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    };
    console.log("Device Information:", deviceInfo);
    
    // Show main menu screen
    showMainMenu();
    
    // Event listeners for practice type buttons
    prepositionsBtn.addEventListener('click', function() {
        console.log("Prepositions button clicked");
        currentPracticeType = "prepositions";
        // Test event log
        logEvent('test_button_click', { button_type: 'prepositions' });
        showLevelSelection();
    });
    
    verbTensesBtn.addEventListener('click', function() {
        console.log("Verb Tenses button clicked");
        currentPracticeType = "verbTenses";
        // Test event log
        logEvent('test_button_click', { button_type: 'verb_tenses' });
        startLevel('verbTenses1');
    });
    
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
    backToMainMenuBtn.addEventListener('click', showMainMenu);
    backToMainBtn.addEventListener('click', showMainMenu);
    quizBackBtn.addEventListener('click', handleQuizBackButton);
    
    // Modal event listeners
    confirmExitBtn.addEventListener('click', confirmExit);
    cancelExitBtn.addEventListener('click', cancelExit);
    
    // Close modal when clicking outside
    confirmModal.addEventListener('click', function(e) {
        if (e.target === confirmModal) {
            hideModal();
        }
    });
    
    // TTS play buttons
    playLineABtn.addEventListener('click', () => {
        if (practiceData && practiceData[currentQuestionIndex]) {
            googleTTS.speakLine(practiceData[currentQuestionIndex].lineA);
        }
    });
    
    playLineBBtn.addEventListener('click', () => {
        if (practiceData && practiceData[currentQuestionIndex]) {
            googleTTS.speakLine(practiceData[currentQuestionIndex].lineB);
        }
    });
    
    console.log("App initialization complete");
}

// Show main menu screen
function showMainMenu() {
    console.log("Showing main menu screen");
    
    // Hide other containers
    questionContainer.classList.remove('active');
    completionContainer.classList.remove('active');
    levelSelectionContainer.classList.remove('active');
    progressBarContainer.style.display = 'none';
    
    // Show main menu
    mainMenuContainer.classList.add('active');
    
    // Update header
    document.querySelector('header h1').textContent = 'ESL Practice';
    
    // Hide back button in header
    quizBackBtn.style.display = 'none';
    
    console.log("Main menu container display:", getComputedStyle(mainMenuContainer).display);
}

// Show level selection screen
function showLevelSelection() {
    console.log("Showing level selection screen");
    
    // Hide other containers
    questionContainer.classList.remove('active');
    completionContainer.classList.remove('active');
    mainMenuContainer.classList.remove('active');
    progressBarContainer.style.display = 'none';
    
    // Show level selection
    levelSelectionContainer.classList.add('active');
    
    // Update header based on practice type
    if (currentPracticeType === "prepositions") {
        document.querySelector('header h1').textContent = 'Preposition Practice';
    } else {
        document.querySelector('header h1').textContent = 'Verb Tenses Practice';
    }
    
    // Hide back button in header
    quizBackBtn.style.display = 'none';
    
    console.log("Level selection container display:", getComputedStyle(levelSelectionContainer).display);
}

// Start a specific level
function startLevel(level) {
    console.log("Starting level:", level);
    currentLevel = level;
    
    // Set the title based on practice type and level
    let title;
    if (level === 'verbTenses1') {
        title = 'Verb Tenses Practice';
    } else {
        title = level === 'level1' ? 'Level 1 Prepositions' : 'Level 2 Prepositions';
    }
    document.querySelector('header h1').textContent = title;
    
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
    
    // Clear options container explicitly
    optionsContainer.innerHTML = '';
    
    // Reset any selected options and answer blanks
    const selectedButtons = document.querySelectorAll('.option-btn.selected');
    selectedButtons.forEach(button => {
        button.classList.remove('selected');
    });
    
    const answerBlanks = document.querySelectorAll('.answer-blank');
    answerBlanks.forEach(blank => {
        blank.textContent = '';
        blank.classList.remove('correct', 'incorrect');
    });
    
    // Log quiz start event
    logEvent('quiz_started', {
        quiz_type: currentPracticeType,
        quiz_level: level,
        total_questions: practiceData.length
    });
    
    // Hide level selection and main menu, show question container
    levelSelectionContainer.classList.remove('active');
    mainMenuContainer.classList.remove('active');
    completionContainer.classList.remove('active');
    questionContainer.classList.add('active');
    progressBarContainer.style.display = 'flex';
    
    // Show back button in header
    quizBackBtn.style.display = 'block';
    
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
    
    // Process the lines with the Google TTS helper functions
    let lineA, lineB;
    
    if (question.lineA.includes('{{blank}}')) {
        lineA = googleTTS.processLineWithBlank(question.lineA);
    } else {
        lineA = googleTTS.processTextToInteractive(question.lineA);
    }
    
    if (question.lineB.includes('{{blank}}')) {
        lineB = googleTTS.processLineWithBlank(question.lineB);
    } else {
        lineB = googleTTS.processTextToInteractive(question.lineB);
    }
    
    lineAElement.innerHTML = lineA;
    lineBElement.innerHTML = lineB;
    
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
    const question = practiceData[currentQuestionIndex];
    const isCorrect = option === question.correct;
    
    // Record first attempt if not already recorded
    if (firstAttempts[currentQuestionIndex] === null) {
        firstAttempts[currentQuestionIndex] = isCorrect;
        
        // Update score if correct on first try
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
    
    // First, remove 'selected' class from all buttons
    optionBtns.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Then, add 'selected' class only to the current button
    optionBtns.forEach(btn => {
        // If this is the selected button
        if (btn.textContent === option) {
            // Mark it as selected
            btn.classList.add('selected');
            
            // If correct, disable all buttons
            if (isCorrect) {
                optionBtns.forEach(b => b.disabled = true);
            } else {
                // If incorrect, only disable this button
                btn.disabled = true;
            }
        }
    });
    
    // Update the blank with the selected option
    const answerBlank = document.getElementById('answerBlank');
    if (answerBlank) {
        answerBlank.textContent = option;
        answerBlank.className = 'answer-blank ' + (isCorrect ? 'correct' : 'incorrect');
        answerBlank.onclick = () => googleTTS.speak(option);
    }
    
    // Log answer event
    logEvent('question_answered', {
        quiz_type: currentPracticeType,
        quiz_level: currentLevel,
        question_index: currentQuestionIndex,
        selected_option: option,
        correct_option: question.correct,
        is_correct: isCorrect
    });
    
    // Show next button only if correct answer is selected
    if (isCorrect) {
        selectedOption = option; // Lock in the selection only when correct
        nextBtn.classList.add('visible');
    }
}

// Go to next question
function goToNextQuestion() {
    // Hide next button
    nextBtn.classList.remove('visible');
    
    // Clear options container explicitly
    optionsContainer.innerHTML = '';
    
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
    const progress = (currentQuestionIndex / practiceData.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${currentQuestionIndex + 1}/${practiceData.length}`;
}

// Show completion screen
function showCompletion() {
    // Calculate final score
    const finalScore = Math.round((score / practiceData.length) * 100);
    finalScoreElement.textContent = `${finalScore}%`;
    
    // Hide question container and progress bar, show completion
    questionContainer.classList.remove('active');
    progressBarContainer.style.display = 'none';
    completionContainer.classList.add('active');
    
    // Hide back button in header
    quizBackBtn.style.display = 'none';
    
    // Log quiz completion
    const quizEndTime = new Date();
    const quizDuration = Math.round((quizEndTime - quizStartTime) / 1000); // in seconds
    
    logEvent('quiz_completed', {
        quiz_type: currentPracticeType,
        quiz_level: currentLevel,
        score: finalScore,
        duration_seconds: quizDuration,
        total_questions: practiceData.length,
        correct_answers: score
    });
}

// Restart practice
function restartPractice() {
    // Clear options container explicitly
    optionsContainer.innerHTML = '';
    
    // Reset any selected options
    const selectedButtons = document.querySelectorAll('.option-btn.selected');
    selectedButtons.forEach(button => {
        button.classList.remove('selected');
    });
    
    // Clear any answer blanks
    const answerBlanks = document.querySelectorAll('.answer-blank');
    answerBlanks.forEach(blank => {
        blank.textContent = '';
        blank.classList.remove('correct', 'incorrect');
    });
    
    // Hide completion container
    completionContainer.classList.remove('active');
    
    // Start the level again
    startLevel(currentLevel);
}

// Handle quiz back button
function handleQuizBackButton() {
    // Show custom confirmation modal
    showModal();
}

// Show custom confirmation modal
function showModal() {
    confirmModal.classList.add('active');
}

// Hide custom confirmation modal
function hideModal() {
    confirmModal.classList.remove('active');
}

// Confirm exit from quiz
function confirmExit() {
    hideModal();
    
    // Log the exit event
    logEvent('quiz_exited', {
        quiz_type: currentPracticeType,
        quiz_level: currentLevel,
        question_index: currentQuestionIndex,
        questions_answered: totalQuestionsAnswered,
        correct_answers: totalCorrectAnswers
    });
    
    // Return to appropriate screen based on practice type
    if (currentPracticeType === "prepositions") {
        showLevelSelection();
    } else {
        showMainMenu();
    }
}

// Cancel exit from quiz
function cancelExit() {
    hideModal();
}

// Log events to Firebase Analytics
function logEvent(eventName, eventParams) {
    // Get device information
    const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        devicePixelRatio: window.devicePixelRatio,
        isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    };
    
    // Log device info separately for debugging
    console.log("Device Info for logging:", deviceInfo);
    
    // Add device info to event parameters
    const paramsWithDevice = {
        ...eventParams,
        device_info: deviceInfo
    };
    
    if (window.firebase && window.firebase.analytics) {
        window.firebase.analytics().logEvent(eventName, paramsWithDevice);
        console.log('Logged event:', eventName, paramsWithDevice);
    } else {
        console.log('Analytics not available. Event:', eventName, paramsWithDevice);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);