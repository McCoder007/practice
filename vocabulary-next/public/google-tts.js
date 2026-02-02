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

        // Persistent Audio element for iOS PWA compatibility.
        // Once "unlocked" by a user gesture .play(), iOS allows subsequent
        // programmatic .play() calls on the same element.
        this.persistentAudio = null;

        // Reference to the resolve callback of the currently pending
        // playAudioFromBase64 promise.  stop() uses this to settle the
        // promise immediately — pause() alone does not fire onended/onerror,
        // which would leave the promise (and the audio queue) hanging.
        this._pendingPlaybackResolve = null;
    }

    /**
     * Warm the iOS audio session by playing a silent MP3 on the persistent
     * Audio element. Must be called from a user gesture (touchstart/click)
     * so iOS "unlocks" the element for subsequent programmatic .play() calls.
     *
     * On iOS PWA, after ~10s of silence the OS suspends the audio session.
     * Because we reuse the same Audio element, re-unlocking it here from a
     * gesture re-activates the session for the queued TTS that follows.
     */
    warmAudioSession() {
        try {
            if (this.isPlaying) return;

            if (!this.persistentAudio) {
                this.persistentAudio = new Audio();
            }

            // Minimal valid silent MP3 frame (~0ms duration).
            // Playing this from a user gesture "unlocks" the element on iOS.
            const silentMp3 = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRBqmAAAAAAD/+1DEAAAHAALX9AAAI0wYt/0QABAABMiAAEBwfBAEP/BDv/woSf8oCAIf/gh38EP/0JN/+UBAEAQdf/Bd/5QEP/lAQ7/6En/ygIAgCH/+D/8EFAQBAEAQBAEAQBA//tQxBAABkADb/AAAAHcAN//oAACAAANIAAAAQAAANIAAAAQAAANIAAAAQAAANIAAAAQAAANIAAAAQAAANIAAAAQAAANIAAAAQAAANIAAAAQAAANIAAAAQAAANIAAAAQ==';
            this.persistentAudio.src = silentMp3;
            const p = this.persistentAudio.play();
            if (p !== undefined) {
                p.catch(() => {
                    // Best-effort unlock — ignore errors
                });
            }
        } catch (e) {
            // Ignore errors — this is a best-effort keep-alive
        }
    }

    // Stop any ongoing speech
    stop() {
        this.isPlaying = false;

        if (this.persistentAudio) {
            // Remove event handlers BEFORE pausing so they don't fire spuriously
            this.persistentAudio.onended = null;
            this.persistentAudio.onerror = null;
            this.persistentAudio.pause();
            this.persistentAudio.currentTime = 0;
            // Do NOT clear src or null the element — it must stay "unlocked" on iOS
        }

        // Settle any pending playAudioFromBase64 promise so the audio queue
        // doesn't hang waiting for onended that will never fire.
        if (this._pendingPlaybackResolve) {
            this._pendingPlaybackResolve();
            this._pendingPlaybackResolve = null;
        }

        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
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

    // Play audio using the persistent Audio element (reused for iOS compatibility).
    // On iOS, reusing the same element that was "unlocked" by a user gesture allows
    // programmatic .play() calls even after the audio session has been suspended.
    playAudioFromBase64(base64Data) {
        return new Promise((resolve, reject) => {
            try {
                // Stop any current playback on the persistent element and resolve pending promises
                this.stop();

                // Ensure persistent element exists (fallback if warmAudioSession
                // was never called, e.g., on desktop or first load)
                if (!this.persistentAudio) {
                    this.persistentAudio = new Audio();
                }

                const audio = this.persistentAudio;
                this.currentAudio = audio;

                // Clear old handlers before attaching new ones
                audio.onended = null;
                audio.onerror = null;

                // Helper that settles this promise exactly once.
                let settled = false;
                const settle = (fn) => {
                    if (settled) return;
                    settled = true;
                    this._pendingPlaybackResolve = null;
                    fn();
                };

                // Allow stop() to resolve this promise externally.
                this._pendingPlaybackResolve = () => settle(resolve);

                const audioSrc = `data:audio/mp3;base64,${base64Data}`;

                audio.onended = () => {
                    this.isPlaying = false;
                    settle(resolve);
                };

                audio.onerror = (error) => {
                    // If isPlaying is already false, this was an intentional stop
                    if (this.isPlaying) {
                        this.isPlaying = false;
                        settle(() => reject(error));
                    } else {
                        settle(resolve);
                    }
                };

                audio.src = audioSrc;
                this.isPlaying = true;

                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        if (this.isPlaying) {
                            this.isPlaying = false;
                            settle(() => reject(error));
                        } else {
                            settle(resolve);
                        }
                    });
                }
            } catch (error) {
                this.isPlaying = false;
                this._pendingPlaybackResolve = null;
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
