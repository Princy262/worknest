import crypto from 'crypto';

const SETS = [
  'ABCDEFGHJKLMNPQRSTUVWXYZ', // no I or O
  'abcdefghijkmnopqrstuvwxyz', // no l
  '23456789', // no 0 or 1
  '!@#$%^&*?',
];

// One random character from a string, using a secure random number
const pick = (characters) => characters[crypto.randomInt(characters.length)];

const generateTemporaryPassword = (length = 12) => {
  const all = SETS.join('');

  // One character from every group first, then fill up to the length
  const characters = SETS.map(pick);
  while (characters.length < length) characters.push(pick(all));

  // Shuffle, so the guaranteed characters are not always at the start
  for (let i = characters.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [characters[i], characters[j]] = [characters[j], characters[i]];
  }

  return characters.join('');
};

export default generateTemporaryPassword;