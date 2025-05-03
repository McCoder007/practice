// Type definitions for the window.googleTTS object (v2 - API Route)
interface GoogleTTS {
  // setApiKey: (key: string) => void; // Removed
  // speak: (text: string) => Promise<boolean>; // Removed/Replaced by playText
  speakLine: (text: string) => Promise<any>; // Keep if still used, check implementation
  // preInit: () => Promise<boolean>; // Removed
  setVoice: (voice: string) => void; // Keep
  playText: (text: string) => Promise<void>; // Added new primary method
  // Add other methods from GoogleTTSManager class if they are intended to be public API
}

// Augment the window interface
interface Window {
  googleTTS?: GoogleTTS;
  GoogleTTSManager?: new () => GoogleTTS; // Also type the constructor if needed
} 