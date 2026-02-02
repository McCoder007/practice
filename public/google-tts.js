// Google Text-to-Speech API implementation
class GoogleTTSManager {
    constructor() {
        this.apiKey = '';
        this.voice = 'en-US-Neural2-D';
        this.audioCache = {};
        this.isPlaying = false;
        this.isInitialized = false;

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

                // Cancel previous utterance to prevent overlap
                window.speechSynthesis.cancel();

                const utterance = new SpeechSynthesisUtterance(text);
                utterance.voice = this.defaultVoice;
                utterance.rate = rate;
                utterance.volume = 1;

                if (window.googleTTS && typeof window.googleTTS === 'object') {
                    window.googleTTS.browserUtterance = utterance;
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
    }

    // Stop any ongoing speech
    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.src = '';
            this.currentAudio = null;
        }

        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        this.isPlaying = false;
    }

    // Preload and initialize Google TTS
    async preInit() {
        if (this.apiKey && !this.isInitialized) {
            try {
                await this.synthesizeSpeech('hello', true);
                this.isInitialized = true;
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
        this.apiKey = key;

        if (key.startsWith('__GOOGLE_TTS_API_KEY__')) {
            console.error('API key is still the placeholder. Build process did not replace it.');
        } else if (key.startsWith('AIza')) {
            setTimeout(() => this.preInit(), 500);
        } else {
            console.warn('API key format is unusual (does not start with AIza)');
        }
    }

    // Set voice
    setVoice(voice) {
        this.voice = voice;
    }

    // Safely play audio using HTML5 Audio element
    playAudioFromBase64(base64Data) {
        return new Promise((resolve, reject) => {
            try {
                // Stop any previously playing audio to prevent overlap
                if (this.currentAudio) {
                    this.currentAudio.pause();
                    this.currentAudio.src = '';
                    this.currentAudio = null;
                }

                const audioSrc = `data:audio/mp3;base64,${base64Data}`;
                const audio = new Audio(audioSrc);

                this.currentAudio = audio;

                audio.onended = () => {
                    if (this.currentAudio === audio) {
                        this.isPlaying = false;
                        this.currentAudio = null;
                    }
                    resolve();
                };

                audio.onerror = (error) => {
                    if (this.currentAudio === audio) {
                        // Genuine playback error
                        this.isPlaying = false;
                        this.currentAudio = null;
                        console.error('Audio playback error:', error);
                        reject(error);
                    } else {
                        // Audio was intentionally stopped (clear/stop set currentAudio to null)
                        resolve();
                    }
                };

                this.isPlaying = true;
                const playPromise = audio.play();

                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        if (this.currentAudio === audio) {
                            // Genuine play failure
                            console.error('Play promise error:', error);
                            this.isPlaying = false;
                            this.currentAudio = null;
                            reject(error);
                        } else {
                            // Audio was intentionally stopped before play completed
                            resolve();
                        }
                    });
                }
            } catch (error) {
                console.error('Error creating Audio element:', error);
                this.isPlaying = false;
                reject(error);
            }
        });
    }

    // Call Google Text-to-Speech API
    async synthesizeSpeech(text, isPreInit = false) {
        // Check if API key is set
        if (!this.apiKey) {
            console.warn('Google TTS API key not set. Using browser TTS fallback.');
            if (isPreInit) {
                return false;
            }
            return new Promise((resolve, reject) => {
                const utterance = this.browserTTS.speak(text);
                if (utterance) {
                    utterance.onend = () => resolve();
                    utterance.onerror = (event) => reject(new Error(`Browser TTS error: ${event.error}`));
                } else {
                    resolve();
                }
            });
        }

        // Check if API key is the placeholder
        if (this.apiKey.startsWith('__GOOGLE_TTS_API_KEY__')) {
            console.error('API key is still the placeholder. Using browser TTS fallback.');
            if (isPreInit) {
                return false;
            }
            return new Promise((resolve, reject) => {
                const utterance = this.browserTTS.speak(text);
                if (utterance) {
                    utterance.onend = () => resolve();
                    utterance.onerror = (event) => reject(new Error(`Browser TTS error: ${event.error}`));
                } else {
                    resolve();
                }
            });
        }

        // Check cache first (skip for pre-init)
        if (!isPreInit && this.audioCache[text]) {
            try {
                await this.playAudioFromBase64(this.audioCache[text]);
                this.isInitialized = true;
                return true;
            } catch (error) {
                console.error('Error playing cached audio:', error);
                // Continue to try fetching fresh audio
            }
        }

        try {
            const requestBody = {
                input: { text },
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

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Google TTS API error:', errorText);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.audioContent) {
                console.error('No audio content in response');
                throw new Error('No audio content received');
            }

            // Cache the audio content
            this.audioCache[text] = data.audioContent;
            this.isInitialized = true;

            // For pre-init, don't actually play the audio
            if (isPreInit) {
                return true;
            }

            // Play the audio
            await this.playAudioFromBase64(data.audioContent);
            return true;

        } catch (error) {
            console.error('Google TTS error:', error);

            if (isPreInit) {
                return false;
            }

            // Fall back to browser TTS
            return new Promise((resolve, reject) => {
                const utterance = this.browserTTS.speak(text);
                if (utterance) {
                    utterance.onend = () => resolve();
                    utterance.onerror = (event) => reject(new Error(`Browser TTS error: ${event.error}`));
                } else {
                    resolve();
                }
            });
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
        if (text.includes('{{blank}}')) {
            return text;
        }

        const parts = text.split(/(\s+|[,.!?;:])/g).filter(part => part.length > 0);

        let processedHTML = '';

        parts.forEach(part => {
            if (/^\s+$/.test(part) || /^[,.!?;:]$/.test(part)) {
                processedHTML += part;
            } else {
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
        if (!this.isInitialized && this.apiKey) {
            await this.preInit();
        }

        const answerElement = document.getElementById('answerBlank');
        const selectedWord = answerElement ? answerElement.textContent : null;

        if (text.includes('{{blank}}')) {
            const parts = text.split('{{blank}}');
            const beforeBlank = parts[0].trim();
            const afterBlank = parts[1].trim();

            window.speechSynthesis.cancel();

            if (selectedWord) {
                const fullText = beforeBlank + " " + selectedWord + " " + afterBlank;
                return this.speak(fullText);
            } else {
                if (this.isInitialized) {
                    try {
                        await this.synthesizeSpeech(beforeBlank);
                        setTimeout(async () => {
                            await this.synthesizeSpeech(afterBlank);
                        }, 500);
                        return;
                    } catch (error) {
                        console.error("Error speaking parts with Google TTS:", error);
                    }
                }

                const utterance1 = this.browserTTS.speak(beforeBlank);

                if (utterance1) {
                    utterance1.onend = () => {
                        setTimeout(() => {
                            this.browserTTS.speak(afterBlank);
                        }, 500);
                    };
                    utterance1.onerror = (event) => {
                        console.error('SpeechSynthesisUtterance Error (Part 1):', event.error);
                    };
                } else {
                    const fullTextStructure = beforeBlank + " " + afterBlank;
                    return this.speak(fullTextStructure);
                }
                return;
            }
        } else {
            window.speechSynthesis.cancel();
            return this.speak(text);
        }
    }
}

// Initialize Google TTS
const googleTTS = new GoogleTTSManager();
// Assign to window object for global access
window.googleTTS = googleTTS;
