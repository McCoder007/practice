
// Google Text-to-Speech API implementation
class GoogleTTSManager {
    constructor() {
        this.apiKey = ''; // Will be set by user
        this.voice = 'en-US-Neural2-D'; // Default to male neural voice
        this.audioCache = {}; // Cache for audio responses
        this.isPlaying = false;
        
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
        
        console.log('Google TTS Manager initialized');
    }
    
    // Set API key
    setApiKey(key) {
        this.apiKey = key;
        console.log('Google TTS API key set.');
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
    
    // Call Google Text-to-Speech API using direct Audio approach
    async synthesizeSpeech(text) {
        console.log(`Attempting Google TTS for text: "${text}"`);
        
        // Check if API key is set
        if (!this.apiKey) {
            console.warn('Google TTS API key not set. Using browser TTS fallback.');
            return this.browserTTS.speak(text);
        }
        
        // Check cache first
        if (this.audioCache[text]) {
            console.log('Using cached audio for:', text);
            try {
                await this.playAudioFromBase64(this.audioCache[text]);
                return true;
            } catch (error) {
                console.error('Error playing cached audio:', error);
                // Continue to try fetching fresh audio
            }
        }
        
        try {
            console.log('Sending request to Google TTS API...');
            const requestBody = {
                input: { text },
                voice: { languageCode: 'en-US', name: this.voice },
                audioConfig: { 
                    audioEncoding: 'MP3',
                    speakingRate: 0.9  // Slightly slower for ESL learners
                }
            };
            
            const response = await fetch(
                `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`,
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
            console.log('Received response from Google TTS API');
            
            if (!data.audioContent) {
                console.error('No audio content in response:', data);
                throw new Error('No audio content received');
            }
            
            // Cache the audio content
            this.audioCache[text] = data.audioContent;
            
            // Play the audio
            await this.playAudioFromBase64(data.audioContent);
            return true;
            
        } catch (error) {
            console.error('Error with Google TTS:', error);
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
        // Check if there's a filled-in answer for the blank
        const answerElement = document.getElementById('answerBlank');
        const selectedWord = answerElement ? answerElement.textContent : null;
        
        // If there's a blank in the text
        if (text.includes('{{blank}}')) {
            const parts = text.split('{{blank}}');
            const beforeBlank = parts[0];
            const afterBlank = parts[1];
            
            // If we have a selected word, use it
            if (selectedWord) {
                const fullText = beforeBlank + selectedWord + afterBlank;
                return this.speak(fullText);
            } else {
                // Speak the first part
                await this.speak(beforeBlank);
                
                // Add a pause
                await new Promise(resolve => setTimeout(resolve, 50));
                
                // Speak the second part
                return this.speak(afterBlank);
            }
        } else {
            // If there's no blank, just speak normally
            return this.speak(text);
        }
    }
}

// Initialize Google TTS
const googleTTS = new GoogleTTSManager();
