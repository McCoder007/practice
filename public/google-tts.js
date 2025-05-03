// Google Text-to-Speech API implementation
class GoogleTTSManager {
    constructor() {
        // this.apiKey = ''; // REMOVED: API key handled server-side
        this.voice = 'en-US-Neural2-D'; // Default to male neural voice
        this.audioCache = {}; // Cache for audio responses
        this.isPlaying = false;
        // this.isInitialized = false; // REMOVED: Initialization handled differently now
        this.googleApiAvailable = null; // Track if API route is working (null: unknown, true: ok, false: failed/fallback)
        
        // Detect iOS and Android devices
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        this.isAndroid = /Android/.test(navigator.userAgent);
        this.isMobile = this.isIOS || this.isAndroid;
        
        // Initialize browser TTS as fallback
        this.browserTTS = {
            isSpeechSupported: 'speechSynthesis' in window,
            voices: [],
            defaultVoice: null,
            
            init: function() {
                if (this.isSpeechSupported) {
                    this.loadVoices();
                    
                    if (speechSynthesis.onvoiceschanged !== undefined) {
                        speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
                    }
                } else {
                    console.warn('Speech synthesis is not supported in this browser.');
                }
            },
            
            loadVoices: function() {
                this.voices = speechSynthesis.getVoices();
                this.defaultVoice = this.voices.find(voice => 
                    voice.lang.includes('en') && voice.localService
                ) || this.voices[0];
            },
            
            speak: function(text, rate = 0.9) {
                if (!this.isSpeechSupported) return;
                
                window.speechSynthesis.cancel();
                
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.voice = this.defaultVoice;
                utterance.rate = rate;
                utterance.volume = 1;
                
                window.speechSynthesis.speak(utterance);
                
                return utterance;
            }
        };
        
        // Initialize browser TTS as fallback
        this.browserTTS.init();
        
        console.log('Google TTS Manager initialized (v2 - API Route)');
    }
    
    // Safely play audio using HTML5 Audio element
    playAudioFromBase64(base64Data) {
        return new Promise((resolve, reject) => {
            try {
                // Create the audio source
                const audioSrc = `data:audio/mp3;base64,${base64Data}`;
                const audio = new Audio(audioSrc);
                
                console.log('Created Audio element from base64 data');
                
                // Set up event handlers
                audio.onended = () => {
                    console.log('Audio playback completed');
                    this.isPlaying = false;
                    resolve();
                };
                
                audio.onerror = (error) => {
                    console.error('Audio playback error:', error);
                    this.isPlaying = false;
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
                        this.isPlaying = false;
                        reject(error);
                    });
                }
                
                return audio;
            } catch (error) {
                console.error('Error creating Audio element:', error);
                this.isPlaying = false;
                reject(error);
                return null;
            }
        });
    }
    
    // Call our internal API route to synthesize speech
    async synthesizeSpeechViaApi(text) {
        console.log(`Attempting TTS via API route for text: "${text}"`);

        // Check cache first
        if (this.audioCache[text]) {
            console.log('Using cached audio for:', text);
            try {
                await this.playAudioFromBase64(this.audioCache[text]);
                return { success: true, source: 'cache' };
            } catch (error) {
                console.error('Error playing cached audio:', error);
                // Continue to try fetching fresh audio
            }
        }

        try {
            console.log(`Sending request to /api/tts...`);
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            console.log(`Response status from /api/tts: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); // Try to parse error JSON
                console.error('API Route Error response:', errorData);
                // If the server explicitly tells us to fallback (e.g., key missing)
                if (errorData.fallback) {
                    return { success: false, fallback: true, error: errorData.error || 'API Key not configured' };
                }
                throw new Error(`API route error! Status: ${response.status}. ${errorData.error || ''}`);
            }

            const data = await response.json();

            if (!data.audioBase64) {
                console.error('No audioBase64 content in API route response:', data);
                throw new Error('No audio content received from API route');
            }

            console.log(`Received audioBase64 from /api/tts`);
            // Cache the audio content
            this.audioCache[text] = data.audioBase64;

            // Play the audio
            await this.playAudioFromBase64(data.audioBase64);
            return { success: true, source: 'api' };

        } catch (error) {
            console.error(`Error calling /api/tts:`, error);
            return { success: false, fallback: true, error: error.message }; // Assume fallback on any API error
        }
    }

    // Primary method to speak text - tries API, then falls back
    async playText(text) {
        if (!text) return;
        console.log(`playText called for: "${text}"`);

        // Cancel any ongoing speech (browser or potentially audio element)
        this.browserTTS.isSpeechSupported && window.speechSynthesis.cancel();
        // TODO: Need a way to stop the currently playing Audio element if one exists and `this.isPlaying` is true

        // Determine if we should try the Google API route
        let attemptApi = true;
        if (this.googleApiAvailable === false) {
            console.log("Skipping API route attempt (previously failed).");
            attemptApi = false; // Already know API failed, go straight to fallback
        }

        let result = null;
        if (attemptApi) {
            result = await this.synthesizeSpeechViaApi(text);
            if (result.success) {
                this.googleApiAvailable = true; // Mark API as working
                console.log(`Successfully played TTS via ${result.source}.`);
                return; // Played successfully via API or cache
            } else if (result.fallback) {
                this.googleApiAvailable = false; // Mark API as failed, use fallback next time
                console.warn(`API route failed or indicated fallback needed. Reason: ${result.error}. Using browser TTS.`);
                // Fall through to browser TTS
            } else {
                 this.googleApiAvailable = false; // Mark API as failed
                 console.error(`API route failed unexpectedly. Reason: ${result.error}. Using browser TTS.`);
                 // Fall through to browser TTS
            }
        }

        // Fallback to Browser TTS
        if (this.browserTTS.isSpeechSupported) {
            console.log('Using browser TTS fallback.');
            this.browserTTS.speak(text);
        } else {
            console.error('Browser TTS is not supported.');
            // Handle cases where even browser TTS is unavailable
        }
    }
    
    // Set voice
    setVoice(voice) {
        this.voice = voice;
        console.log(`Google TTS voice set to: ${voice}`);
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
        // Ensure this method uses the primary playText method
        console.log(`speakLine called for: "${text}"`);
        await this.playText(text); // Use the new unified method
    }
    
    // Placeholder for potential future extension or cleanup
    cleanup() {
        console.log("Google TTS Manager cleanup invoked.");
        // Add any necessary cleanup logic here, e.g., stopping audio, clearing caches
        if (this.isPlaying) {
            // Need a way to stop the currently playing audio instance
            // This is tricky with new Audio() approach, might need to store reference
            console.warn("Cleanup cannot stop ongoing audio playback easily.");
        }
        // Clear cache if desired
        // this.audioCache = {};
    }
}

// IMPORTANT: Assign the class constructor to the window object
if (typeof window !== 'undefined') {
    window.GoogleTTSManager = GoogleTTSManager;
    console.log('GoogleTTSManager class assigned to window object.');
} else {
    console.warn('Window object not found, cannot assign GoogleTTSManager globally.');
}
