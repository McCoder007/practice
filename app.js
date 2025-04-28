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
let currentVocabularyDay = "day1"; // Track current vocabulary day
let currentDayIndex = 0; // Track current day index for sliding navigation
let availableDays = []; // Store available vocabulary days
let touchStartX = 0; // Track touch start position for swipe
let touchEndX = 0; // Track touch end position for swipe
let vocabularyStartTime = null;
let currentDayStartTime = null;
let wordInteractions = {};
let currentVerbListStage = "stage1"; // Track current verb list stage

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
const vocabularyContainer = document.getElementById('vocabularyContainer');
const daysSlider = document.getElementById('daysSlider');
const currentDayDisplay = document.getElementById('currentDayDisplay');
const prevDayBtn = document.getElementById('prevDayBtn');
const nextDayBtn = document.getElementById('nextDayBtn');
const restartBtn = document.getElementById('restartBtn');
const backToMainMenuBtn = document.getElementById('backToMainMenuBtn');
const quizBackBtn = document.getElementById('quizBackBtn');
const playLineABtn = document.getElementById('playLineA');
const playLineBBtn = document.getElementById('playLineB');
const level1Btn = document.getElementById('level1Btn');
const level2Btn = document.getElementById('level2Btn');
const prepositionsBtn = document.getElementById('prepositionsBtn');
const verbTensesBtn = document.getElementById('verbTensesBtn');
const irregularVerbsBtn = document.getElementById('irregularVerbsBtn');
const vocabularyBtn = document.getElementById('vocabularyBtn');
const progressBarContainer = document.getElementById('progressBarContainer');
const confirmModal = document.getElementById('confirmModal');
const confirmExitBtn = document.getElementById('confirmExitBtn');
const cancelExitBtn = document.getElementById('cancelExitBtn');

// Irregular Verb Stage Buttons (Added)
const irregularVerbStage1Btn = document.getElementById('irregularVerbStage1Btn');
const irregularVerbStage2Btn = document.getElementById('irregularVerbStage2Btn');
const irregularVerbStage3Btn = document.getElementById('irregularVerbStage3Btn');
const irregularVerbStage4Btn = document.getElementById('irregularVerbStage4Btn');
const irregularVerbStage5Btn = document.getElementById('irregularVerbStage5Btn');

// Irregular Verb Lists Stage Buttons (Added)
const irregularVerbListsStage1Btn = document.getElementById('irregularVerbListsStage1Btn');
const irregularVerbListsStage2Btn = document.getElementById('irregularVerbListsStage2Btn');
const irregularVerbListsStage3Btn = document.getElementById('irregularVerbListsStage3Btn');
const irregularVerbListsStage4Btn = document.getElementById('irregularVerbListsStage4Btn');
const irregularVerbListsStage5Btn = document.getElementById('irregularVerbListsStage5Btn');
const verbListContainer = document.getElementById('verbListContainer');
const verbListContent = document.getElementById('verbListContent');
const verbListTitle = document.getElementById('verbListTitle');

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
    
    // Add new "Irregular Verb Lists" button to main menu
    const irregularVerbListsBtn = document.createElement('button');
    irregularVerbListsBtn.id = 'irregularVerbListsBtn';
    irregularVerbListsBtn.className = 'practice-type-btn irregular-verbs';
    irregularVerbListsBtn.innerHTML = `
        <div class="btn-content">
            <span class="practice-type">Irregular Verb Lists</span>
            <span class="practice-description">View lists of irregular verbs by level</span>
        </div>
        <i class="fa-solid fa-chevron-right btn-icon"></i>
    `;
    
    irregularVerbListsBtn.addEventListener('click', function() {
        console.log("Irregular Verb Lists button clicked");
        currentPracticeType = "irregularVerbLists";
        logEvent('test_button_click', { button_type: 'irregular_verb_lists' });
        showIrregularVerbLists();
    });
    
    // Show main menu screen
    showMainMenu();
    
    // Add the new button to the practice-type-buttons container
    const practiceTypeButtons = document.querySelector('.practice-type-buttons');
    if (practiceTypeButtons) {
        practiceTypeButtons.insertBefore(irregularVerbListsBtn, vocabularyBtn);
    }
    
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
    
    irregularVerbsBtn.addEventListener('click', function() {
        console.log("Irregular Verbs button clicked");
        currentPracticeType = "irregularVerbs";
        logEvent('test_button_click', { button_type: 'irregular_verbs' });
        showIrregularVerbStages();
    });
    
    vocabularyBtn.addEventListener('click', function() {
        console.log("Vocabulary button clicked");
        currentPracticeType = "vocabulary";
        // Test event log
        logEvent('test_button_click', { button_type: 'vocabulary' });
        showVocabularyPractice();
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
    
    // Event listeners for Irregular Verb Stage buttons (Added)
    if (irregularVerbStage1Btn) irregularVerbStage1Btn.addEventListener('click', () => startLevel('irregularVerbStage1'));
    if (irregularVerbStage2Btn) irregularVerbStage2Btn.addEventListener('click', () => startLevel('irregularVerbStage2'));
    if (irregularVerbStage3Btn) irregularVerbStage3Btn.addEventListener('click', () => {
        startLevel('irregularVerbStage3');
    });
    if (irregularVerbStage4Btn) irregularVerbStage4Btn.addEventListener('click', () => { 
        startLevel('irregularVerbStage4');
    });
    if (irregularVerbStage5Btn) irregularVerbStage5Btn.addEventListener('click', () => { 
        startLevel('irregularVerbStage5');
    });
    
    // Event listeners for Irregular Verb Lists Stage buttons (Added)
    if (irregularVerbListsStage1Btn) irregularVerbListsStage1Btn.addEventListener('click', () => showVerbList('stage1'));
    if (irregularVerbListsStage2Btn) irregularVerbListsStage2Btn.addEventListener('click', () => showVerbList('stage2'));
    if (irregularVerbListsStage3Btn) irregularVerbListsStage3Btn.addEventListener('click', () => showVerbList('stage3'));
    if (irregularVerbListsStage4Btn) irregularVerbListsStage4Btn.addEventListener('click', () => showVerbList('stage4'));
    if (irregularVerbListsStage5Btn) irregularVerbListsStage5Btn.addEventListener('click', () => showVerbList('stage5'));
    
    // Event listeners
    nextBtn.addEventListener('click', goToNextQuestion);
    restartBtn.addEventListener('click', restartPractice);
    backToMainMenuBtn.addEventListener('click', showMainMenu);
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
        const question = practiceData ? practiceData[currentQuestionIndex] : null;
        if (question) {
            // Determine which text to speak based on practice type
            const textToSpeak = (currentPracticeType === 'irregularVerbs') 
                                ? question.sentence 
                                : question.lineB;
            if (textToSpeak) {
                googleTTS.speakLine(textToSpeak);
            } else {
                console.warn("Missing text for line B/sentence for question:", currentQuestionIndex);
            }
        }
    });
    
    console.log("App initialization complete");
}

// Show main menu screen
function showMainMenu() {
    console.log("Showing main menu screen");
    
    // Clean up any event listeners from vocabulary practice
    window.removeEventListener('resize', handleVocabularyResize);
    
    // Hide other containers
    questionContainer.classList.remove('active');
    completionContainer.classList.remove('active');
    levelSelectionContainer.classList.remove('active');
    vocabularyContainer.classList.remove('active');
    
    // Hide the irregular verbs stages container
    const irregularVerbStagesContainer = document.getElementById('irregularVerbStagesContainer');
    if (irregularVerbStagesContainer) {
        irregularVerbStagesContainer.classList.remove('active');
    }
    
    // Hide the irregular verb lists container
    const irregularVerbListsContainer = document.getElementById('irregularVerbListsContainer');
    if (irregularVerbListsContainer) {
        irregularVerbListsContainer.classList.remove('active');
    }
    
    // Hide the verb list container
    if (verbListContainer) {
        verbListContainer.classList.remove('active');
    }
    
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
    
    // Show back button in header and set its event handler
    quizBackBtn.style.display = 'block';
    quizBackBtn.onclick = showMainMenu; // Return to main menu when clicked
    
    console.log("Level selection container display:", getComputedStyle(levelSelectionContainer).display);
}

// Show irregular verb stage selection screen (New function)
function showIrregularVerbStages() {
    console.log("Showing irregular verb stages screen");
    
    // Hide other containers
    questionContainer.classList.remove('active');
    completionContainer.classList.remove('active');
    mainMenuContainer.classList.remove('active');
    levelSelectionContainer.classList.remove('active'); // Hide preposition level selection
    vocabularyContainer.classList.remove('active');
    progressBarContainer.style.display = 'none';
    
    // Show irregular verb stage selection (We need to add this container to index.html)
    const irregularVerbStagesContainer = document.getElementById('irregularVerbStagesContainer'); 
    if (irregularVerbStagesContainer) {
        irregularVerbStagesContainer.classList.add('active');
    } else {
        console.error("Irregular verb stages container not found!");
        // Fallback to main menu if container doesn't exist yet
        showMainMenu(); 
        return; 
    }
    
    // Update header
    document.querySelector('header h1').textContent = 'Irregular Verbs Quiz';
    
    // Show back button in header and set up its event handler
    quizBackBtn.style.display = 'block';
    quizBackBtn.onclick = showMainMenu; // Return to main menu when clicked
    
    console.log("Irregular verb stages container display:", getComputedStyle(irregularVerbStagesContainer).display);
}

// Show irregular verb lists selection screen (New function)
function showIrregularVerbLists() {
    console.log("Showing irregular verb lists screen");
    
    // Make sure current practice type is properly set
    currentPracticeType = "irregularVerbLists";
    
    // Hide other containers
    questionContainer.classList.remove('active');
    completionContainer.classList.remove('active');
    mainMenuContainer.classList.remove('active');
    levelSelectionContainer.classList.remove('active');
    vocabularyContainer.classList.remove('active');
    
    // Hide irregular verb stage selection if visible
    const irregularVerbStagesContainer = document.getElementById('irregularVerbStagesContainer');
    if (irregularVerbStagesContainer) {
        irregularVerbStagesContainer.classList.remove('active');
    }
    
    // Hide verb list container if visible
    verbListContainer.classList.remove('active');
    
    progressBarContainer.style.display = 'none';
    
    // Show irregular verb lists selection
    const irregularVerbListsContainer = document.getElementById('irregularVerbListsContainer'); 
    if (irregularVerbListsContainer) {
        irregularVerbListsContainer.classList.add('active');
    }
    
    // Update header and show back button
    document.querySelector('header h1').textContent = 'Irregular Verb Lists';
    quizBackBtn.style.display = 'block';
    // We're using the handleQuizBackButton function for back button clicks
    
    console.log("Irregular verb lists container display:", irregularVerbListsContainer ? getComputedStyle(irregularVerbListsContainer).display : "container not found");
}

// Show verb list for a specific stage (New function)
function showVerbList(stage) {
    console.log(`Showing verb list for stage: ${stage}`);
    currentVerbListStage = stage;
    
    // Update the stage title
    let stageTitle = '';
    switch(stage) {
        case 'stage1': stageTitle = 'Stage 1: Core Verbs'; break;
        case 'stage2': stageTitle = 'Stage 2: Everyday Verbs'; break;
        case 'stage3': stageTitle = 'Stage 3: Action Verbs'; break;
        case 'stage4': stageTitle = 'Stage 4: Less Common Verbs'; break;
        case 'stage5': stageTitle = 'Stage 5: Master Level Verbs'; break;
    }
    
    verbListTitle.textContent = stageTitle;
    
    // Hide other containers
    questionContainer.classList.remove('active');
    completionContainer.classList.remove('active');
    mainMenuContainer.classList.remove('active');
    levelSelectionContainer.classList.remove('active');
    vocabularyContainer.classList.remove('active');
    
    // Hide irregular verb stage selection if visible
    const irregularVerbStagesContainer = document.getElementById('irregularVerbStagesContainer');
    if (irregularVerbStagesContainer) {
        irregularVerbStagesContainer.classList.remove('active');
    }
    
    // Hide irregular verb lists container
    const irregularVerbListsContainer = document.getElementById('irregularVerbListsContainer');
    if (irregularVerbListsContainer) {
        irregularVerbListsContainer.classList.remove('active');
    }
    
    // Clear existing verb list content
    verbListContent.innerHTML = '';
    
    // Populate the verb list with data from the stage
    const verbs = irregularVerbListsData[stage];
    if (verbs && verbs.length > 0) {
        verbs.forEach(verb => {
            const verbItem = document.createElement('div');
            verbItem.className = 'verb-item';
            
            // Parse the verb string into parts (base, past, participle)
            const parts = verb.split('–').map(part => part.trim());
            if (parts.length === 3) {
                const baseSpan = document.createElement('span');
                baseSpan.className = 'base';
                baseSpan.textContent = parts[0];
                
                const pastSpan = document.createElement('span');
                pastSpan.className = 'past';
                pastSpan.textContent = parts[1];
                
                const participleSpan = document.createElement('span');
                participleSpan.className = 'participle';
                participleSpan.textContent = parts[2];
                
                // Create a more flexible layout
                verbItem.appendChild(baseSpan);
                
                const dash1 = document.createElement('span');
                dash1.className = 'dash';
                dash1.textContent = '–';
                verbItem.appendChild(dash1);
                
                verbItem.appendChild(pastSpan);
                
                const dash2 = document.createElement('span');
                dash2.className = 'dash';
                dash2.textContent = '–';
                verbItem.appendChild(dash2);
                
                verbItem.appendChild(participleSpan);
            } else {
                // Fallback if parsing fails
                verbItem.textContent = verb;
            }
            
            verbListContent.appendChild(verbItem);
        });
    }
    
    // Show verb list container
    verbListContainer.classList.add('active');
    
    // Update header and show back button
    document.querySelector('header h1').textContent = 'Irregular Verb Lists';
    quizBackBtn.style.display = 'block';
}

// Start a specific level
function startLevel(level) {
    console.log("Starting level:", level);
    currentLevel = level;
    
    // Determine practice type if not already set (e.g., direct start)
    if (!currentPracticeType || currentPracticeType === "") {
        if (level.startsWith('irregularVerb')) {
            currentPracticeType = "irregularVerbs";
        } else if (level.startsWith('level')) {
            currentPracticeType = "prepositions";
        } else if (level.startsWith('verbTenses')) {
            currentPracticeType = "verbTenses";
        } 
    }
    
    // Set the title based on practice type and level
    let title;
    if (currentPracticeType === 'verbTenses') {
        title = 'Verb Tenses Practice';
    } else if (currentPracticeType === 'prepositions') {
        title = level === 'level1' ? 'Level 1 Prepositions' : 'Level 2 Prepositions';
    } else if (currentPracticeType === 'irregularVerbs') {
        // Extract stage number and set title
        const stageMatch = level.match(/irregularVerbStage(\d+)/);
        const stageNumber = stageMatch ? stageMatch[1] : '?';
        // Define stage names (could be moved to a config/data file later)
        const stageNames = {
            '1': 'Quiz Stage 1: Core Verbs',
            '2': 'Quiz Stage 2: Everyday Verbs',
            '3': 'Quiz Stage 3: Action Verbs',
            '4': 'Quiz Stage 4: Less Common Verbs',
            '5': 'Quiz Stage 5: Master Level'
        };
        title = stageNames[stageNumber] || `Irregular Verbs Quiz - Stage ${stageNumber}`;
    } else {
        title = 'Practice'; // Default title
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
    
    // Hide level selection, main menu, completion, and irregular verb stages. Show question container.
    levelSelectionContainer.classList.remove('active');
    mainMenuContainer.classList.remove('active');
    completionContainer.classList.remove('active');
    const irregularVerbStagesContainer = document.getElementById('irregularVerbStagesContainer'); // Get reference
    if (irregularVerbStagesContainer) irregularVerbStagesContainer.classList.remove('active'); // Hide it
    
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
    if (index < 0 || index >= practiceData.length) {
        console.error("Invalid question index:", index);
        showMainMenu(); // Go back to main menu if index is out of bounds
        return;
    }
    
    const question = practiceData[index];
    if (!question) {
        console.error("Question data is missing for index:", index);
        showMainMenu(); // Go back to main menu if data is missing
        return;
    }
    
    // Reset selected option
    selectedOption = null;
    
    // Default visibility
    playLineABtn.style.display = 'inline-block';
    playLineBBtn.style.display = 'inline-block';
    lineAElement.style.display = 'inline'; // Assuming span defaults to inline
    lineBElement.style.display = 'inline';

    // Process the lines based on practice type
    let lineAContent = '';
    let lineBContent = '';

    if (currentPracticeType === 'irregularVerbs') {
        // Irregular verbs use only one sentence line, typically with a blank
        if (question.sentence) {
             if (question.sentence.includes('{{blank}}')) {
                lineBContent = googleTTS.processLineWithBlank(question.sentence);
            } else {
                lineBContent = googleTTS.processTextToInteractive(question.sentence);
            }
        } else {
            console.error("Missing 'sentence' property for irregular verb question:", index, question);
        }
        // Hide Line A elements
        playLineABtn.style.display = 'none';
        lineAElement.innerHTML = ''; // Clear content
        lineAElement.style.display = 'none'; // Hide span

    } else {
        // Existing logic for Prepositions and Verb Tenses (assuming lineA and lineB)
        if (question.lineA) {
            if (question.lineA.includes('{{blank}}')) {
                lineAContent = googleTTS.processLineWithBlank(question.lineA);
            } else {
                lineAContent = googleTTS.processTextToInteractive(question.lineA);
            }
        } else {
            console.warn("Missing 'lineA' property for question:", index, question);
            // Optionally hide Line A elements if lineA is consistently missing for a type
            playLineABtn.style.display = 'none';
            lineAElement.style.display = 'none';
        }
        
        if (question.lineB) {
            if (question.lineB.includes('{{blank}}')) {
                lineBContent = googleTTS.processLineWithBlank(question.lineB);
            } else {
                lineBContent = googleTTS.processTextToInteractive(question.lineB);
            }
        } else {
            console.error("Missing 'lineB' property for question:", index, question);
             // Optionally hide Line B elements if lineB is consistently missing for a type
            playLineBBtn.style.display = 'none';
            lineBElement.style.display = 'none';
        }
    }
    
    // Update the HTML elements
    lineAElement.innerHTML = lineAContent;
    lineBElement.innerHTML = lineBContent;

    // Remove any existing click handlers by clearing the innerHTML and re-adding it
    // This is a safer approach than replacing the entire element
    if (lineAContent) {
        const cachedContent = lineAElement.innerHTML;
        lineAElement.innerHTML = cachedContent;
        
        // Add click handler for the entire sentence to play audio
        lineAElement.addEventListener('click', function() {
            if (question.lineA) {
                googleTTS.speakLine(question.lineA);
            }
        });
    }

    if (lineBContent) {
        const cachedContent = lineBElement.innerHTML;
        lineBElement.innerHTML = cachedContent;
        
        // Add click handler for the entire sentence to play audio
        lineBElement.addEventListener('click', function() {
            if (currentPracticeType === 'irregularVerbs' && question.sentence) {
                googleTTS.speakLine(question.sentence);
            } else if (question.lineB) {
                googleTTS.speakLine(question.lineB);
            }
        });
    }
    
    // Clear previous options and reset layout class
    optionsContainer.innerHTML = '';
    optionsContainer.classList.remove('grid-2x2'); // Remove class if it was added previously

    // Add specific class for grid layout if it's irregular verbs
    if (currentPracticeType === 'irregularVerbs') {
        optionsContainer.classList.add('grid-2x2');
    }
    
    // Add options (Ensure question.options exists)
    if (question.options && Array.isArray(question.options)) {
        // Create a shuffled copy of the options array
        const shuffledOptions = [...question.options];
        // Fisher-Yates shuffle algorithm
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
        
        // Create buttons using the shuffled options
        shuffledOptions.forEach(option => {
            const optionBtn = document.createElement('button');
            optionBtn.classList.add('option-btn');
            optionBtn.textContent = option;
            // Re-enable button before adding listener
            optionBtn.disabled = false; 
            optionBtn.addEventListener('click', () => selectOption(option));
            optionsContainer.appendChild(optionBtn);
        });
    } else {
         console.error("Missing or invalid 'options' array for question:", index, question);
         // Handle missing options, maybe show an error or skip question?
    }
    
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
    
    // First, remove all selection-related classes from all buttons
    optionBtns.forEach(btn => {
        btn.classList.remove('selected', 'correct', 'incorrect');
    });
    
    // Then process the selection
    optionBtns.forEach(btn => {
        // If this is the selected button
        if (btn.textContent === option) {
            // Mark it as selected
            btn.classList.add('selected');
            
            // If correct, highlight it and disable all buttons
            if (isCorrect) {
                btn.classList.add('correct');
                optionBtns.forEach(b => b.disabled = true);
            } else {
                // If incorrect, mark as incorrect and disable only this button
                btn.classList.add('incorrect');
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
    console.log("Back button clicked during practice/quiz");
    
    // If in vocabulary practice, log session data and go back to main menu
    if (vocabularyContainer.classList.contains('active')) {
        const sessionDuration = new Date() - vocabularyStartTime;
        const timeOnCurrentDay = new Date() - currentDayStartTime;
        
        // Remove the resize listener when leaving vocabulary practice
        window.removeEventListener('resize', handleVocabularyResize);
        
        logEvent('vocabulary_session_ended', {
            total_duration_ms: sessionDuration,
            last_day: currentVocabularyDay,
            last_day_duration_ms: timeOnCurrentDay,
            word_interactions: wordInteractions
        });
        
        showMainMenu();
        return;
    }
    
    // If on irregular verb stages selection screen, go back to main menu
    const irregularVerbStagesContainer = document.getElementById('irregularVerbStagesContainer');
    if (irregularVerbStagesContainer && irregularVerbStagesContainer.classList.contains('active')) {
        showMainMenu();
        return;
    }
    
    // If on irregular verb lists selection screen, go back to main menu
    const irregularVerbListsContainer = document.getElementById('irregularVerbListsContainer');
    if (irregularVerbListsContainer && irregularVerbListsContainer.classList.contains('active')) {
        showMainMenu();
        return;
    }
    
    // If on verb list view, go back to irregular verb lists screen
    if (verbListContainer && verbListContainer.classList.contains('active')) {
        showIrregularVerbLists();
        return;
    }
    
    // If on preposition level selection screen, go back to main menu
    if (levelSelectionContainer.classList.contains('active')) {
        showMainMenu();
        return;
    }
    
    // Show confirmation modal for quitting mid-quiz
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
    console.log("Confirming exit from quiz/practice");
    
    // Hide confirmation modal
    hideModal();
    
    // Log quiz ended event
    logEvent('quiz_abandoned', {
        quiz_type: currentPracticeType,
        quiz_level: currentLevel,
        questions_answered: totalQuestionsAnswered,
        correct_answers: totalCorrectAnswers
    });
    
    // Return to appropriate screen
    if (currentPracticeType === "prepositions") {
        // Go back to level selection for prepositions
        showLevelSelection();
    } else if (currentPracticeType === "irregularVerbs") {
        // Go back to irregular verb stage selection
        showIrregularVerbStages();
    } else {
        // Go back to main menu for other practice types (Verb Tenses, Vocabulary)
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

// Show vocabulary practice screen
function showVocabularyPractice() {
    console.log("Showing vocabulary practice screen");
    
    // Start timing the vocabulary session
    vocabularyStartTime = new Date();
    
    // Hide other containers
    questionContainer.classList.remove('active');
    completionContainer.classList.remove('active');
    mainMenuContainer.classList.remove('active');
    levelSelectionContainer.classList.remove('active');
    progressBarContainer.style.display = 'none';
    
    // Show vocabulary container
    vocabularyContainer.classList.add('active');
    
    // Check if we're on mobile and add class if needed
    const isMobile = window.innerWidth <= 600;
    if (isMobile) {
        vocabularyContainer.classList.add('mobile-view');
    } else {
        vocabularyContainer.classList.remove('mobile-view');
    }
    
    // Update header
    document.querySelector('header h1').textContent = 'Vocabulary Practice';
    
    // Show back button in header
    quizBackBtn.style.display = 'block';
    
    // Get available days
    availableDays = Object.keys(vocabularyData);
    
    // Reset current day index and initialize
    currentDayIndex = 0;
    currentVocabularyDay = availableDays[currentDayIndex];
    currentDayStartTime = new Date();
    
    // Initialize day navigation
    initDayNavigation();
    
    // Load day panels
    loadDayPanels();
    
    // Update navigation buttons initial state
    updateNavigationButtons();
    
    // Reset word interactions
    wordInteractions = {};
    
    // Add window resize listener for mobile view
    window.addEventListener('resize', handleVocabularyResize);
    
    // Log event
    logEvent('vocabulary_practice_started', {
        day: currentVocabularyDay,
        total_days: availableDays.length,
        total_words: vocabularyData[currentVocabularyDay].length
    });
}

// Initialize day navigation
function initDayNavigation() {
    console.log("Initializing day navigation");
    
    // Update day display
    updateDayDisplay();
    
    // Remove any existing event listeners
    prevDayBtn.removeEventListener('click', goToPreviousDay);
    nextDayBtn.removeEventListener('click', goToNextDay);
    
    // Set up navigation buttons
    prevDayBtn.addEventListener('click', goToPreviousDay);
    nextDayBtn.addEventListener('click', goToNextDay);
    
    // Set initial slider position
    daysSlider.style.transform = `translateX(0)`;
    
    // Check if we're on mobile
    const isMobile = window.innerWidth <= 600;
    
    // Add mobile-specific class if needed
    if (isMobile) {
        vocabularyContainer.classList.add('mobile-view');
    } else {
        vocabularyContainer.classList.remove('mobile-view');
    }
    
    // Setup swipe detection with improved sensitivity for mobile
    setupSwipeDetection();
}

// Update the day display
function updateDayDisplay() {
    // Update the day display text with a more modern format
    const dayNumber = currentDayIndex + 1;
    
    // Create a visually pleasing day display with icon
    currentDayDisplay.innerHTML = `
        <i class="fa-solid fa-calendar-day"></i>
        <span>Day ${dayNumber}</span>
    `;
}

// Update navigation buttons (disable/enable based on position)
function updateNavigationButtons() {
    prevDayBtn.disabled = currentDayIndex === 0;
    prevDayBtn.style.opacity = currentDayIndex === 0 ? "0.5" : "1";
    
    nextDayBtn.disabled = currentDayIndex === availableDays.length - 1;
    nextDayBtn.style.opacity = currentDayIndex === availableDays.length - 1 ? "0.5" : "1";
}

// Load all day panels
function loadDayPanels() {
    console.log("Loading day panels");
    
    // Clear existing panels
    daysSlider.innerHTML = '';
    
    // Create day panels
    availableDays.forEach((day, index) => {
        // Create panel
        const panel = document.createElement('div');
        panel.className = 'day-panel';
        panel.id = `day-panel-${day}`;
        daysSlider.appendChild(panel);
        
        // Load vocabulary for this day
        loadVocabularyForDay(day, panel);
    });
}

// Load vocabulary items for a specific day into a panel
function loadVocabularyForDay(day, panel) {
    console.log(`Loading vocabulary for ${day}`);
    
    // Get vocabulary data for the day
    const vocabItems = vocabularyData[day];
    
    // Create vocabulary items
    vocabItems.forEach(item => {
        const vocabItem = document.createElement('div');
        vocabItem.classList.add('vocabulary-item');
        
        // English word with play button and type
        const wordElement = document.createElement('div');
        wordElement.classList.add('vocabulary-word');
        
        const playWordBtn = document.createElement('button');
        playWordBtn.classList.add('word-play-btn');
        playWordBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        playWordBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            googleTTS.speakLine(item.word);
            logWordInteraction(item.word, 'word_audio_played');
        });
        
        const wordText = document.createElement('span');
        wordText.textContent = item.word;
        wordText.addEventListener('click', (e) => {
            e.stopPropagation();
            googleTTS.speakLine(item.word);
            logWordInteraction(item.word, 'word_audio_played');
        });

        const wordType = document.createElement('span');
        wordType.classList.add('word-type');
        wordType.textContent = item.type;

        wordElement.appendChild(playWordBtn);
        wordElement.appendChild(wordText);
        wordElement.appendChild(wordType);
        
        // Chinese translation for the word
        const wordTranslation = document.createElement('div');
        wordTranslation.classList.add('vocabulary-word-translation');
        wordTranslation.textContent = item.word_translation || '';
        
        // English sentence with play button
        const sentenceElement = document.createElement('div');
        sentenceElement.classList.add('vocabulary-sentence');
        
        const playSentenceBtn = document.createElement('button');
        playSentenceBtn.classList.add('sentence-play-btn');
        playSentenceBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        playSentenceBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            googleTTS.speakLine(item.sentence);
            logWordInteraction(item.word, 'sentence_audio_played');
        });
        
        // Create sentence content container
        const sentenceContent = document.createElement('div');
        sentenceContent.classList.add('sentence-content');
        
        // Add sentence text
        const sentenceText = document.createElement('div');
        sentenceText.classList.add('sentence-text');
        
        // Process the sentence to make individual words clickable
        const processedSentence = googleTTS.processTextToInteractive(item.sentence);
        sentenceText.innerHTML = processedSentence;
        
        // Chinese translation for the sentence
        const sentenceTranslation = document.createElement('div');
        sentenceTranslation.classList.add('vocabulary-sentence-translation');
        sentenceTranslation.textContent = item.translation;
        
        // Add content to the sentence content container
        sentenceContent.appendChild(sentenceText);
        sentenceContent.appendChild(sentenceTranslation);
        
        // Assemble sentence element
        sentenceElement.appendChild(playSentenceBtn);
        sentenceElement.appendChild(sentenceContent);
        
        // Add elements in the desired order
        vocabItem.appendChild(wordElement);
        vocabItem.appendChild(wordTranslation);
        vocabItem.appendChild(sentenceElement);
        
        panel.appendChild(vocabItem);
    });
}

// Go to the previous day
function goToPreviousDay() {
    console.log("Attempting to go to previous day, current index:", currentDayIndex);
    if (currentDayIndex > 0) {
        currentDayIndex--;
        currentVocabularyDay = availableDays[currentDayIndex];
        updateDay();
        updateNavigationButtons();
    }
}

// Go to the next day
function goToNextDay() {
    console.log("Attempting to go to next day, current index:", currentDayIndex);
    if (currentDayIndex < availableDays.length - 1) {
        currentDayIndex++;
        currentVocabularyDay = availableDays[currentDayIndex];
        updateDay();
        updateNavigationButtons();
    }
}

// Update the day by setting the appropriate transform on the slider
function updateDay() {
    console.log(`Updating to day ${currentDayIndex + 1}`);
    
    // Update day display text
    updateDayDisplay();
    
    // Update the start time for the current day
    currentDayStartTime = new Date();
    
    // Transform the slider to show the selected day
    const translateValue = -100 * currentDayIndex;
    daysSlider.style.transform = `translateX(${translateValue}%)`;
    
    // Check if we're on mobile
    const isMobile = window.innerWidth <= 600;
    
    // For mobile, scroll to the top after day change
    if (isMobile) {
        // Find the current panel and scroll to top
        const currentPanel = document.getElementById(`day-panel-${currentVocabularyDay}`);
        if (currentPanel) {
            currentPanel.scrollTop = 0;
            
            // If in mobile view, also make sure days carousel scrolls to top
            const daysCarousel = document.querySelector('.days-carousel');
            if (daysCarousel) {
                daysCarousel.scrollTop = 0;
            }
        }
    }
    
    // Log day change
    logEvent('vocabulary_day_changed', {
        from_day: availableDays[currentDayIndex - 1] || 'none',
        to_day: currentVocabularyDay,
        day_index: currentDayIndex,
        total_words: vocabularyData[currentVocabularyDay].length
    });
}

// Setup swipe detection for mobile devices
function setupSwipeDetection() {
    // Remove existing listeners first
    daysSlider.removeEventListener('touchstart', handleTouchStart);
    daysSlider.removeEventListener('touchend', handleTouchEnd);
    
    // Add touch event listeners for swipe detection with improved sensitivity
    daysSlider.addEventListener('touchstart', handleTouchStart, { passive: true });
    daysSlider.addEventListener('touchend', handleTouchEnd, { passive: true });
}

// Handle touch start
function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
}

// Handle touch end
function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}

// Handle swipe gesture
function handleSwipe() {
    // Determine if there was a swipe (with reduced threshold for better responsiveness)
    const swipeThreshold = 50; // pixels
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            // Right swipe -> go to previous day
            goToPreviousDay();
        } else {
            // Left swipe -> go to next day  
            goToNextDay();
        }
    }
}

// Add function to log word interactions
function logWordInteraction(word, interactionType) {
    if (!wordInteractions[word]) {
        wordInteractions[word] = {
            audio_plays: 0,
            sentence_plays: 0
        };
    }
    
    if (interactionType === 'word_audio_played') {
        wordInteractions[word].audio_plays++;
    } else if (interactionType === 'sentence_audio_played') {
        wordInteractions[word].sentence_plays++;
    }
    
    logEvent('vocabulary_interaction', {
        word: word,
        interaction_type: interactionType,
        day: currentVocabularyDay,
        total_word_plays: wordInteractions[word].audio_plays,
        total_sentence_plays: wordInteractions[word].sentence_plays
    });
}

// Handle window resize for vocabulary practice
function handleVocabularyResize() {
    // Only apply if vocabulary container is active
    if (!vocabularyContainer.classList.contains('active')) return;
    
    const isMobile = window.innerWidth <= 600;
    if (isMobile) {
        vocabularyContainer.classList.add('mobile-view');
    } else {
        vocabularyContainer.classList.remove('mobile-view');
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);