// Type definitions for the window.googleTTS object
interface GoogleTTS {
  setApiKey: (key: string) => void;
  speak: (text: string) => Promise<boolean>;
  /** Same voice, asked to speak slowly (Google speakingRate, default 0.6). */
  speakSlow?: (text: string, speakingRate?: number) => Promise<boolean>;
  speakLine: (text: string) => Promise<any>;
  preInit: () => Promise<boolean>;
  setVoice: (voice: string) => void;
  synthesizeSpeech: (text: string, isPreInit?: boolean, speakingRate?: number) => Promise<boolean>;
  audioCache: Record<string, string>;
  stop: () => void;
  warmAudioSession: () => void;
  persistentAudio: HTMLAudioElement | null;
  browserUtterance: SpeechSynthesisUtterance | null;
  currentAudio: HTMLAudioElement | null;
}

// Augment the window interface
interface Window {
  googleTTS?: GoogleTTS;
} 