// TTS functionality
class TTSManager {
    constructor() {
        this.isSpeechSupported = 'speechSynthesis' in window;
        this.voices = [];
        this.defaultVoice = null;
        
        if (this.isSpeechSupported) {
            // Load available voices
            this.loadVoices();
            
            // Some browsers need a delay to load voices
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
            }
        } else {
            console.warn('Speech synthesis is not supported in this browser.');
        }
    }
    
    loadVoices() {
        this.voices = speechSynthesis.getVoices();
        
        // Find an English voice
        this.defaultVoice = this.voices.find(voice => 
            voice.lang.includes('en') && voice.localService
        ) || this.voices[0];
        
        console.log('TTS initialized with voice:', this.defaultVoice ? this.defaultVoice.name : 'No voice available');
    }
    
    speak(text, rate = 0.9, pitch = 1) {
        if (!this.isSpeechSupported) return;
        
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.defaultVoice;
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = 1;
        
        window.speechSynthesis.speak(utterance);
        
        return utterance;
    }
    
    // Process a text to make words clickable for TTS
    processTextToInteractive(text, containerId) {
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
                // For words, make them clickable
                processedHTML += `<span class="word" onclick="tts.speak('${part}')">${part}</span>`;
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
    speakLine(text) {
        // Check if there's a filled-in answer for the blank
        const answerElement = document.getElementById('answerBlank');
        const selectedWord = answerElement ? answerElement.textContent : null;
        
        // If there's a blank in the text
        if (text.includes('{{blank}}')) {
            const parts = text.split('{{blank}}');
            const beforeBlank = parts[0];
            const afterBlank = parts[1];
            
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            // If we have a selected word, use it
            if (selectedWord) {
                const fullText = beforeBlank + selectedWord + afterBlank;
                this.speak(fullText);
            } else {
                // No selected word - speak first part
                const utterance1 = new SpeechSynthesisUtterance(beforeBlank);
                utterance1.voice = this.defaultVoice;
                utterance1.rate = 0.9;
                
                // Set up the completion handler for the first part
                utterance1.onend = () => {
                    // Pause 1000ms (1 second) and then speak the second part
                    setTimeout(() => {
                        const utterance3 = new SpeechSynthesisUtterance(afterBlank);
                        utterance3.voice = this.defaultVoice;
                        utterance3.rate = 0.9;
                        window.speechSynthesis.speak(utterance3);
                    }, 1000);
                };
                
                // Start the sequence
                window.speechSynthesis.speak(utterance1);
            }
        } else {
            // If there's no blank, just speak normally
            this.speak(text);
        }
    }
}

// Initialize TTS
const tts = new TTSManager();