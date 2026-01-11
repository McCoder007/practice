/**
 * Background gradient utility for Word Reel feature
 * 
 * Provides vibrant CSS gradient backgrounds that never repeat consecutively.
 */

// Curated collection of vibrant CSS gradients
const BACKGROUND_STYLES: string[] = [
  // Purple/Indigo
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  // Pink/Coral
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  // Cyan/Aqua
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  // Sunset Orange
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  // Ocean Blue
  "linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)",
  // Forest Green
  "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  // Royal Purple
  "linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)",
  // Peach
  "linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)",
  // Deep Sea
  "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",
  // Warm Flame
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  // Electric Violet
  "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
  // Tropical
  "linear-gradient(135deg, #f97316 0%, #eab308 100%)",
  // Midnight
  "linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)",
  // Rose Gold
  "linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)",
  // Arctic
  "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
  // Emerald
  "linear-gradient(135deg, #059669 0%, #10b981 100%)",
  // Magenta Dream
  "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
  // Golden Hour
  "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
];

/**
 * Get all available background styles
 */
export function getAvailableBackgrounds(): string[] {
  return BACKGROUND_STYLES;
}

/**
 * Get the total number of available backgrounds
 */
export function getBackgroundCount(): number {
  return BACKGROUND_STYLES.length;
}

/**
 * Get background style by index
 */
export function getBackgroundByIndex(index: number): string {
  const safeIndex = ((index % BACKGROUND_STYLES.length) + BACKGROUND_STYLES.length) % BACKGROUND_STYLES.length;
  return BACKGROUND_STYLES[safeIndex];
}

/**
 * Get a random background index that is different from the current one
 * Ensures backgrounds never repeat consecutively
 * 
 * @param currentIndex - The index of the current background (-1 if none)
 * @returns A new background index guaranteed to be different from current
 */
export function getNextBackgroundIndex(currentIndex: number): number {
  if (BACKGROUND_STYLES.length <= 1) {
    return 0;
  }
  
  let next = Math.floor(Math.random() * BACKGROUND_STYLES.length);
  while (next === currentIndex) {
    next = Math.floor(Math.random() * BACKGROUND_STYLES.length);
  }
  return next;
}

/**
 * Get background style for a specific word (deterministic based on indices)
 * Uses a hash-like approach to ensure variety while being reproducible
 * Also ensures it differs from the previous background
 * 
 * @param wordIndex - Index of the word within the day
 * @param dayIndex - Index of the day (0-based)
 * @param previousIndex - The index of the previous background to avoid
 * @returns CSS gradient string
 */
export function getBackgroundForWord(
  wordIndex: number, 
  dayIndex: number, 
  previousIndex: number = -1
): string {
  // Use a simple hash to get variety
  const baseIndex = (dayIndex * 7 + wordIndex * 13) % BACKGROUND_STYLES.length;
  
  // If it matches the previous, shift by 1
  const finalIndex = baseIndex === previousIndex 
    ? (baseIndex + 1) % BACKGROUND_STYLES.length 
    : baseIndex;
  
  return BACKGROUND_STYLES[finalIndex];
}

/**
 * Get the index for a background based on word/day position
 */
export function getBackgroundIndexForWord(
  wordIndex: number, 
  dayIndex: number, 
  previousIndex: number = -1
): number {
  const baseIndex = (dayIndex * 7 + wordIndex * 13) % BACKGROUND_STYLES.length;
  
  // If it matches the previous, shift by 1
  return baseIndex === previousIndex 
    ? (baseIndex + 1) % BACKGROUND_STYLES.length 
    : baseIndex;
}
