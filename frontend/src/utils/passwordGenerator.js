const CHARACTER_SETS = {
  uppercase: 'ABCDEFGHJKLMNPQRSTUVWXYZ', // no I or O (they look like 1 and 0)
  lowercase: 'abcdefghijkmnopqrstuvwxyz', // no l
  numbers: '23456789', // no 0 or 1
  symbols: '!@#$%^&*?',
};

export const DEFAULT_PASSWORD_OPTIONS = {
  length: 12,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
};

export const MIN_PASSWORD_LENGTH = 8; // the backend requires at least 8
export const MAX_PASSWORD_LENGTH = 32;

// A secure random whole number from 0 up to max - 1 (no bias towards small numbers).
const randomIndex = (max) => {
  const limit = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return buffer[0] % max;
};

const pickFrom = (characters) => characters[randomIndex(characters.length)];

export const generatePassword = (options = DEFAULT_PASSWORD_OPTIONS) => {
  const { length, ...groups } = { ...DEFAULT_PASSWORD_OPTIONS, ...options };

  const pools = Object.keys(CHARACTER_SETS)
    .filter((name) => groups[name])
    .map((name) => CHARACTER_SETS[name]);

  if (pools.length === 0) return '';

  const size = Math.min(Math.max(length, MIN_PASSWORD_LENGTH), MAX_PASSWORD_LENGTH);
  const allCharacters = pools.join('');

  // One character from every chosen group first, then fill up to the length
  const characters = pools.map(pickFrom);
  while (characters.length < size) characters.push(pickFrom(allCharacters));

  // Shuffle, so the guaranteed characters are not always at the start
  for (let i = characters.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [characters[i], characters[j]] = [characters[j], characters[i]];
  }

  return characters.join('');
};