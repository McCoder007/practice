// Google Text-to-Speech API implementation
class GoogleTTSManager {
    constructor() {
        this.apiKey = ''; // Will be set by user
        this.voice = 'en-US-Neural2-D'; // Default to male neural voice
        this.audioCache = {}; // Cache for audio responses
        this.isPlaying = false;
        this.isInitialized = false; // Track initialization state

        // Detect iOS and Android devices
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        this.isAndroid = /Android/.test(navigator.userAgent);
        this.isMobile = this.isIOS || this.isAndroid;

        // Initialize browser TTS as fallback
        this.browserTTS = {
            isSpeechSupported: 'speechSynthesis' in window,
            voices: [],
            defaultVoice: null,

            init: function () {
                if (this.isSpeechSupported) {
                    this.loadVoices();

                    if (speechSynthesis.onvoiceschanged !== undefined) {
                        speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
                    }
                } else {
                    console.warn('Speech synthesis is not supported in this browser.');
                }
            },

            loadVoices: function () {
                this.voices = speechSynthesis.getVoices();
                this.defaultVoice = this.voices.find(voice =>
                    voice.lang.includes('en') && voice.localService
                ) || this.voices[0];
            },

            speak: function (text, rate = 0.9) {
                if (!this.isSpeechSupported) return;

                // REMOVED: Aggressive cancel removed to prevent stuttering
                // window.speechSynthesis.cancel();

                const utterance = new SpeechSynthesisUtterance(text);
                utterance.voice = this.defaultVoice;
                utterance.rate = rate;
                utterance.volume = 1;

                // Track utterance for potential cancellation
                // Assuming 'this' context here refers to the GoogleTTSManager instance
                // when this method is called, or that 'window.googleTTS' is the instance.
                // Given the class structure, 'this.browserUtterance' is more appropriate
                // if 'browserTTS' is a property of GoogleTTSManager.
                // However, following the instruction to use 'window.googleTTS.browserUtterance'.
                if (window.googleTTS && typeof window.googleTTS === 'object') {
                    window.googleTTS.browserUtterance = utterance;
                } else {
                    // Fallback if window.googleTTS is not set up as expected
                    // or if this.browserUtterance is intended for this purpose.
                    // This part is not in the instruction but added for robustness.
                    // If GoogleTTSManager instance is assigned to a global variable like 'googleTTS',
                    // then window.googleTTS.browserUtterance would be correct.
                    // Otherwise, 'this.browserUtterance' (of the GoogleTTSManager instance)
                    // would be the correct place to store it.
                    console.warn("window.googleTTS not found or not an object. Cannot track browserUtterance globally.");
                }


                window.speechSynthesis.speak(utterance);

                return utterance;
            }
        };

        // Initialize browser TTS as fallback
        this.browserTTS.init();

        // Centralize audio management
        this.currentAudio = null;
        this.browserUtterance = null;

        console.log('Google TTS Manager initialized');
    }

    // Stop any ongoing speech
    stop() {
        console.log('Stopping all speech...');

        // Stop Google TTS
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.src = '';
            this.currentAudio = null;
        }

        // Stop Browser TTS
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        this.isPlaying = false;
    }

    // Preload and initialize Google TTS
    async preInit() {
        // Make a dummy request to initialize the TTS service
        if (this.apiKey && !this.isInitialized) {
            console.log('Warming up Google TTS service...');
            try {
                // Make a small request to initialize the service
                await this.synthesizeSpeech('hello', true); // true = isPreInit
                this.isInitialized = true;
                console.log('Google TTS service initialized successfully');
                return true;
            } catch (error) {
                console.warn('Google TTS pre-initialization failed:', error);
                return false;
            }
        }
        return this.isInitialized;
    }

    // Set API key
    setApiKey(key) {
        // Removed DEBUG log
        // console.log(`[google-tts] setApiKey called. Key length: ${key ? key.length : 'undefined/null'}. Key starts with: ${key ? key.substring(0, 4) + '...' : 'N/A'}`);
        this.apiKey = key;
        // Restore original simple log message
        console.log('Google TTS API key set.');

        // Debug: Check if the API key is the placeholder
        if (key.startsWith('__GOOGLE_TTS_API_KEY__')) {
            console.error('ERROR: API key is still the placeholder! This indicates the build process did not replace it correctly.');
        } else if (key.startsWith('AIza')) {
            console.log('API key format looks correct (starts with AIza)');
            // Try to pre-initialize after a short delay
            setTimeout(() => this.preInit(), 500);
        } else {
            console.warn('API key format is unusual (does not start with AIza)');
        }
    }

    // Set voice
    setVoice(voice) {
        this.voice = voice;
        console.log(`Google TTS voice set to: ${voice}`);
    }

    // Safely play audio using HTML5 Audio element
    playAudioFromBase64(base64Data) {
        return new Promise((resolve, reject) => {
            try {
                // REMOVED: Aggressive stopping of current audio to prevent stuttering
                // if (this.currentAudio) {
                //     this.currentAudio.pause();
                //     this.currentAudio.src = '';
                // }

                // Create the audio source
                const audioSrc = `data:audio/mp3;base64,${base64Data}`;
                const audio = new Audio(audioSrc);

                // Track current audio only for reference, not for killing it
                this.currentAudio = audio;

                console.log('Created Audio element from base64 data');

                // Set up event handlers
                audio.onended = () => {
                    console.log('Audio playback completed');
                    if (this.currentAudio === audio) {
                        this.isPlaying = false;
                        this.currentAudio = null;
                    }
                    resolve();
                };

                audio.onerror = (error) => {
                    console.error('Audio playback error:', error);
                    if (this.currentAudio === audio) {
                        this.isPlaying = false;
                        this.currentAudio = null;
                    }
                    reject(error);
                };

                // Play the audio
                console.log('Starting audio playback');
                this.isPlaying = true;
                const playPromise = audio.play();

                // Handle play promise (modern browsers return a promise from play())
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error('Play promise error:', error);
                        if (this.currentAudio === audio) {
                            this.isPlaying = false;
                            this.currentAudio = null;
                        }
                        reject(error);
                    });
                }
            } catch (error) {
                console.error('Error creating Audio element:', error);
                this.isPlaying = false;
                reject(error);
            }
        });
    }

    // Call Google Text-to-Speech API using direct Audio approach
    async synthesizeSpeech(text, isPreInit = false) {
        // Removed DEBUG log
        // console.log(`[google-tts] synthesizeSpeech called for: "${text}". isPreInit: ${isPreInit}. Current internal apiKey length: ${this.apiKey ? this.apiKey.length : '0/unset'}`);
        console.log(`Attempting Google TTS for text: "${text}" ${isPreInit ? '(pre-init)' : ''}`); // Keep original log

        // Check if API key is set
        if (!this.apiKey) {
            console.warn('Google TTS API key not set. Using browser TTS fallback.');
            // REMOVED: this.stop(); // Aggressive stop removed
            return isPreInit ? false : this.browserTTS.speak(text);
        }

        // Check if API key is the placeholder
        if (this.apiKey.startsWith('__GOOGLE_TTS_API_KEY__')) {
            console.error('API key is still the placeholder! Using browser TTS fallback.');
            return isPreInit ? false : this.browserTTS.speak(text);
        }

        // Debug logging
        if (!isPreInit) {
            console.log(`API key length: ${this.apiKey.length}`);
            console.log(`API key first 4 chars: ${this.apiKey.substring(0, 4)}...`);
        }

        // Check cache first (skip for pre-init)
        if (!isPreInit && this.audioCache[text]) {
            console.log('Using cached audio for:', text);
            try {
                await this.playAudioFromBase64(this.audioCache[text]);
                this.isInitialized = true; // Mark as initialized since we successfully played audio
                return true;
            } catch (error) {
                console.error('Error playing cached audio:', error);
                // Continue to try fetching fresh audio
            }
        }

        try {
            console.log(`Sending request to Google TTS API ${isPreInit ? '(pre-init)' : ''}...`);
            const requestBody = {
                input: { text },
                voice: { languageCode: 'en-US', name: this.voice },
                audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate: 0.9  // Slightly slower for ESL learners
                }
            };

            const apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`;
            console.log(`API URL: ${apiUrl.replace(this.apiKey, '***')}`);

            if (!isPreInit) {
                console.log('Request body:', JSON.stringify(requestBody));
            }

            const response = await fetch(
                apiUrl,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                }
            );

            console.log(`Response status: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error response:', errorText);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`Received response from Google TTS API ${isPreInit ? '(pre-init)' : ''}`);

            if (!data.audioContent) {
                console.error('No audio content in response:', data);
                throw new Error('No audio content received');
            }

            // Cache the audio content
            this.audioCache[text] = data.audioContent;
            this.isInitialized = true; // Mark as initialized since we got a response

            // For pre-init, don't actually play the audio
            if (isPreInit) {
                return true;
            }

            // Play the audio
            await this.playAudioFromBase64(data.audioContent);
            return true;

        } catch (error) {
            console.error(`Error with Google TTS ${isPreInit ? '(pre-init)' : ''}:`, error);

            // If this was a pre-initialization request, just return false
            if (isPreInit) {
                return false;
            }

            // If Google TTS failed but we've successfully initialized before, 
            // try again with a slightly modified text to avoid API hiccups
            if (this.isInitialized && !isPreInit) {
                try {
                    console.log('Retrying with modified text...');
                    // Add a space at the end to create a different request
                    const modifiedText = text + ' ';
                    const requestBody = {
                        input: { text: modifiedText },
                        voice: { languageCode: 'en-US', name: this.voice },
                        audioConfig: {
                            audioEncoding: 'MP3',
                            speakingRate: 0.9
                        }
                    };

                    const apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`;
                    const response = await fetch(
                        apiUrl,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(requestBody)
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        if (data.audioContent) {
                            this.audioCache[text] = data.audioContent; // Cache with original text
                            await this.playAudioFromBase64(data.audioContent);
                            return true;
                        }
                    }
                } catch (retryError) {
                    console.error('Retry attempt also failed:', retryError);
                }
            }

            console.log('Falling back to browser TTS');
            return this.browserTTS.speak(text);
        }
    }

    // Public method to speak text
    speak(text) {
        return this.synthesizeSpeech(text);
    }

    // Sanitize text for HTML attributes
    sanitizeForHtml(text) {
        return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
    }

    // Process text to make words clickable for TTS
    processTextToInteractive(text) {
        // Skip if blank placeholder exists
        if (text.includes('{{blank}}')) {
            return text;
        }

        // Split text into words, preserving spaces and punctuation
        const parts = text.split(/(\s+|[,.!?;:])/g).filter(part => part.length > 0);

        let processedHTML = '';

        parts.forEach(part => {
            if (/^\s+$/.test(part) || /^[,.!?;:]$/.test(part)) {
                // If part is whitespace or punctuation, add it directly
                processedHTML += part;
            } else {
                // For words, make them clickable (with sanitized text for the onclick)
                const sanitized = this.sanitizeForHtml(part);
                processedHTML += `<span class="word" onclick="googleTTS.speak('${sanitized}')">${part}</span>`;
            }
        });

        return processedHTML;
    }

    // Process a line with a blank
    processLineWithBlank(line) {
        const parts = line.split('{{blank}}');
        const before = this.processTextToInteractive(parts[0]);
        const after = this.processTextToInteractive(parts[1]);

        return before + '<span class="answer-blank" id="answerBlank"></span>' + after;
    }

    // Speak a full line (with pause for blank if needed)
    async speakLine(text) {
        // Try to ensure we're properly initialized before speaking
        if (!this.isInitialized && this.apiKey) {
            console.log("Google TTS not initialized yet, attempting to initialize before speaking...");
            await this.preInit();
        }

        // Check if there's a filled-in answer for the blank
        const answerElement = document.getElementById('answerBlank');
        const selectedWord = answerElement ? answerElement.textContent : null;

        // If there's a blank in the text
        if (text.includes('{{blank}}')) {
            const parts = text.split('{{blank}}');
            const beforeBlank = parts[0].trim(); // Trim whitespace
            const afterBlank = parts[1].trim(); // Trim whitespace

            // Cancel any ongoing speech first
            window.speechSynthesis.cancel();

            // If we have a selected word, speak the full sentence with the word
            if (selectedWord) {
                const fullText = beforeBlank + " " + selectedWord + " " + afterBlank;
                console.log("Speaking line with selected word:", fullText);
                return this.speak(fullText); // Uses synthesizeSpeech -> potentially fallback
            } else {
                // If blank is empty and we're initialized, try Google TTS for continuous sections
                if (this.isInitialized) {
                    console.log("Speaking parts with Google TTS...");
                    try {
                        // First speak the before part
                        await this.synthesizeSpeech(beforeBlank);

                        // Then after a short pause, speak the after part
                        setTimeout(async () => {
                            await this.synthesizeSpeech(afterBlank);
                        }, 500); // Changed from 700ms to 500ms

                        return;
                    } catch (error) {
                        console.error("Error speaking parts with Google TTS:", error);
                        // Fall through to browser TTS fallback
                    }
                }

                // Browser TTS fallback for parts
                console.log("Speaking line structure with browser TTS fallback...");

                // Speak the first part
                const utterance1 = this.browserTTS.speak(beforeBlank);

                if (utterance1) {
                    // When the first part finishes, wait then speak the second part
                    utterance1.onend = () => {
                        console.log("First part finished, pausing...");
                        setTimeout(() => {
                            console.log("Speaking second part after pause.");
                            this.browserTTS.speak(afterBlank);
                        }, 500); // 500ms pause
                    };
                    // Handle potential errors on the first utterance
                    utterance1.onerror = (event) => {
                        console.error('SpeechSynthesisUtterance Error (Part 1):', event.error);
                    };
                } else {
                    console.error("Could not create utterance for first part.");
                    // Maybe try speaking the whole structure as a last resort?
                    const fullTextStructure = beforeBlank + " " + afterBlank;
                    console.log("(Fallback) Attempting to speak whole structure:", fullTextStructure);
                    return this.speak(fullTextStructure);
                }
                return; // Return after setting up the sequence
            }
        } else {
            // If there's no blank, just speak normally
            console.log("Speaking line without blank:", text);
            // Cancel any ongoing speech first (important for rapid clicks)
            window.speechSynthesis.cancel();
            return this.speak(text); // Uses synthesizeSpeech -> potentially fallback
        }
    }
}

// Initialize Google TTS
const googleTTS = new GoogleTTSManager();
// Assign to window object for global access
window.googleTTS = googleTTS;
