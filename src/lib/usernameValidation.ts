import { Filter } from 'bad-words';

const filter = new Filter();

filter.addWords('b1tch', 'sh1t', 'f@ck', 'c0ck');

const reservedWords = [
  'admin',
  'administrator',
  'mod',
  'moderator',
  'support',
  'official',
  'system',
  'root',
  'superuser',
  'null',
  'undefined',
];

const customProfanities = [
  'poop',
  'crap',
  'damn',
  'hell',
  'fuk',
  'fuc',
  'shit',
  'bitch',
  'ass',
  'bastard',
];

const leetSpeakMap: Record<string, string[]> = {
  'a': ['4', '@', 'а'],
  'e': ['3', '€', 'е'],
  'i': ['1', '!', '|', 'і'],
  'o': ['0', 'о'],
  's': ['5', '$', 'ѕ'],
  't': ['7', '+'],
  'l': ['1', '|'],
  'g': ['9'],
  'b': ['8'],
};

function normalizeLeetSpeak(text: string): string {
  let normalized = text.toLowerCase();

  for (const [letter, substitutes] of Object.entries(leetSpeakMap)) {
    for (const substitute of substitutes) {
      normalized = normalized.split(substitute).join(letter);
    }
  }

  normalized = normalized.replace(/[^a-z0-9 ]/g, '');

  return normalized;
}

function containsInappropriateWords(username: string): boolean {
  const normalized = normalizeLeetSpeak(username);

  // 1. Standard bad-words check (whole-word)
  if (filter.isProfane(normalized)) {
    return true;
  }

  // 2. Partial match scan using the filter's own list
  for (const bad of filter.list) {
    if (normalized.includes(bad)) {
      return true;
    }
  }

  // 3. Reserved system words
  for (const word of reservedWords) {
    if (normalized.includes(word)) {
      return true;
    }
  }

  return false;
}



function hasExcessiveSpecialChars(username: string): boolean {
  const specialCharCount = (username.match(/[^a-zA-Z0-9]/g) || []).length;
  return specialCharCount > username.length * 0.4;
}

function isOnlyNumbersOrSpecialChars(username: string): boolean {
  return !/[a-zA-Z]/.test(username);
}

function hasRepeatingPatterns(username: string): boolean {
  const pattern = /(.)\1{4,}/;
  return pattern.test(username);
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateUsername(username: string): ValidationResult {
  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }

  if (trimmed.length > 20) {
    return { isValid: false, error: 'Username must be 20 characters or less' };
  }

  if (isOnlyNumbersOrSpecialChars(trimmed)) {
    return { isValid: false, error: 'Username must contain at least one letter' };
  }

  if (hasExcessiveSpecialChars(trimmed)) {
    return { isValid: false, error: 'Username has too many special characters' };
  }

  if (hasRepeatingPatterns(trimmed)) {
    return { isValid: false, error: 'Username has excessive repeating characters' };
  }

  if (containsInappropriateWords(trimmed)) {
    return { isValid: false, error: 'Username is prohibited' };
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, dots, dashes, and underscores' };
  }

  return { isValid: true };
}
