import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to shuffle an array in place (Fisher-Yates algorithm)
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]; // Create a shallow copy to avoid modifying the original array directly
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
  }
  return shuffled;
}

/**
 * Checks if two sorted arrays are equal
 */
export function arraysEqual(arr1: number[], arr2: number[]): boolean {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((val, index) => val === arr2[index]);
}

/**
 * Checks if the user's answer is correct
 */
export function isAnswerCorrect(
  selectedIndexes: number[],
  correctIndexes: number[]
): boolean {
  const sortedSelected = [...selectedIndexes].sort((a, b) => a - b);
  const sortedCorrect = [...correctIndexes].sort((a, b) => a - b);
  return arraysEqual(sortedSelected, sortedCorrect);
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalizeFirstLetter(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
