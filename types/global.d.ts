// Type definitions for the window.googleTTS object
interface GoogleTTS {
  setApiKey: (key: string) => void;
  speak: (text: string) => Promise<boolean>;
  speakLine: (text: string) => Promise<any>;
  preInit: () => Promise<boolean>;
  setVoice: (voice: string) => void;
  synthesizeSpeech: (text: string, isPreInit?: boolean) => Promise<boolean>;
  audioCache: Record<string, string>;
  stop: () => void;
  browserUtterance: SpeechSynthesisUtterance | null;
  currentAudio: HTMLAudioElement | null;
}

// Augment the window interface
interface Window {
  googleTTS?: GoogleTTS;
} 