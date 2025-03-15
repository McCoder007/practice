// Application state
let currentQuestionIndex = 0;
let score = 0;
let selectedOption = null;
let firstAttempts = []; // Track first attempts for each question
let quizStartTime = null; // Track when the quiz started
let totalCorrectAnswers = 0; // Track total correct answers
let totalQuestionsAnswered = 0; // Track total questions answered

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
const restartBtn = document.getElementById('restartBtn');
const playLineABtn = document.getElementById('playLineA');
const playLineBBtn = document.getElementById('playLineB');

// Initialize the application
function initApp() {
    currentQuestionIndex = 0;
    score = 0;
    totalCorrectAnswers = 0;
    totalQuestionsAnswered = 0;
    quizStartTime = new Date();
    firstAttempts = new Array(practiceData.length).fill(null); // Initialize first attempts array
    
    // Log quiz start event
    logEvent('quiz_started', {
        quiz_type: 'preposition_practice',
        quiz_level: 'beginner',
        total_questions: practiceData.length
    });
    
    loadQuestion(currentQuestionIndex);
    updateProgress();
    
    // Event listeners
    nextBtn.addEventListener('click', goToNextQuestion);
    restartBtn.addEventListener('click', restartPractice);
    
    // TTS play buttons
    playLineABtn.addEventListener('click', () => {
        const text = practiceData[currentQuestionIndex].lineA;
        googleTTS.speakLine(text);
    });
    
    playLineBBtn.addEventListener('click', () => {
        const text = practiceData[currentQuestionIndex].lineB;
        googleTTS.speakLine(text);
    });
}

// Load a question based on index
function loadQuestion(index) {
    const question = practiceData[index];
    
    // Reset state
    selectedOption = null;
    nextBtn.classList.remove('visible');
    
    // Clear existing options
    optionsContainer.innerHTML = '';
    
    // Process line A
    if (question.lineA.includes('{{blank}}')) {
        lineAElement.innerHTML = googleTTS.processLineWithBlank(question.lineA);
    } else {
        lineAElement.innerHTML = googleTTS.processTextToInteractive(question.lineA);
    }
    
    // Process line B
    if (question.lineB.includes('{{blank}}')) {
        lineBElement.innerHTML = googleTTS.processLineWithBlank(question.lineB);
    } else {
        lineBElement.innerHTML = googleTTS.processTextToInteractive(question.lineB);
    }
    
    // Create option buttons
    question.options.forEach(option => {
        const optionBtn = document.createElement('button');
        optionBtn.classList.add('option-btn');
        optionBtn.textContent = option;
        optionBtn.addEventListener('click', () => selectOption(option));
        
        // Add TTS functionality to option buttons
        optionBtn.addEventListener('mouseover', () => {
            optionBtn.setAttribute('title', `Listen to "${option}"`);
        });
        optionBtn.addEventListener('dblclick', () => {
            googleTTS.speak(option);
        });
        
        optionsContainer.appendChild(optionBtn);
    });
}

// Handle option selection
function selectOption(option) {
    const question = practiceData[currentQuestionIndex];
    const answerBlank = document.getElementById('answerBlank');
    
    // Store selected option for TTS playback
    selectedOption = option;
    
    // Track question answered
    totalQuestionsAnswered++;
    
    // Log question answered event
    logEvent('question_answered', {
        question_index: currentQuestionIndex,
        question_text: question.lineB,
        selected_answer: option,
        correct_answer: question.correct,
        is_correct: option === question.correct
    });
    
    // If this is the first selection for this question, record it
    if (firstAttempts[currentQuestionIndex] === null) {
        firstAttempts[currentQuestionIndex] = option;
        
        // If the first attempt is correct, update score
        if (option === question.correct) {
            score++;
            totalCorrectAnswers++;
            
            // Log correct answer event
            logEvent('correct_answer', {
                question_index: currentQuestionIndex,
                question_text: question.lineB,
                selected_answer: option
            });
        }
    }
    
    // Clear previous selection
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => btn.classList.remove('selected'));
    
    // Set new selection
    const selectedBtn = Array.from(optionBtns).find(btn => btn.textContent === option);
    selectedBtn.classList.add('selected');
    
    // Update blank with selected option
    answerBlank.textContent = option;
    answerBlank.onclick = () => googleTTS.speak(option);
    
    // Check if correct
    if (option === question.correct) {
        answerBlank.className = 'answer-blank correct';
        nextBtn.classList.add('visible');
    } else {
        answerBlank.className = 'answer-blank incorrect';
        // No audio feedback for incorrect answers
    }
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

// Update progress indicators
function updateProgress() {
    const progress = ((currentQuestionIndex) / practiceData.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${currentQuestionIndex + 1}/${practiceData.length}`;
}

// Show completion screen
function showCompletion() {
    questionContainer.style.display = 'none';
    nextBtn.classList.remove('visible');
    document.querySelector('.action-container').style.display = 'none';
    completionContainer.style.display = 'block';
    finalScoreElement.textContent = score;
    
    // Calculate quiz duration in seconds
    const quizDuration = Math.round((new Date() - quizStartTime) / 1000);
    
    // Log quiz completion event
    logEvent('quiz_completed', {
        quiz_type: 'preposition_practice',
        quiz_level: 'beginner',
        total_questions: practiceData.length,
        correct_answers: score,
        total_answered: totalQuestionsAnswered,
        accuracy_percentage: Math.round((score / practiceData.length) * 100),
        quiz_duration_seconds: quizDuration
    });
    
    // Speak congratulations
    googleTTS.speak(`Congratulations! Your score is ${score} out of ${practiceData.length}.`);
}

// Restart practice
function restartPractice() {
    // Log restart event
    logEvent('quiz_restarted', {
        previous_score: score,
        previous_questions_answered: totalQuestionsAnswered
    });
    
    // Generate new random questions when restarting
    window.location.reload();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initApp);