// ─── GAME CONFIGURATION ────────────────────────────────────────────────────
// Edit this file to change the 5 answers, their hints, and the prize code phrase.
// Answers are checked case-insensitively and extra spaces are ignored.

export interface Clue {
  answer: string;
  hint: string;
}

export const CLUES: Clue[] = [
  { answer: 'Canada', hint: 'Hint: ⭐ Celebrate' },
  { answer: 'About Time', hint: 'Hint: 📷 Remember' },
  { answer: 'Ordinary', hint: 'Hint: 🎵 Listen' },
  { answer: 'Gizma', hint: 'Hint: 🧸 Nice to touch' },
  { answer: 'Catan', hint: 'Hint: 💬 Talk' },
];
// export const CLUES: Clue[] = [
//   { answer: 'Canada', hint: 'Hint: ⭐ Celebrate. Hint #2: Today’s celebration is hiding a clue' },
//   { answer: 'About Time', hint: 'Hint: 📷 Remember. Hint #2: One of her favorite movies is pretending to be one of our memories.' },
//   { answer: 'Ordinary', hint: 'Hint: 🎵 Listen. Hint #2: If something feels repeated, it probably isn’t an accident.' },
//   { answer: 'Gizma', hint: 'Hint: 🧸 Nice to touch. Hint #2: Someone fluffy is carrying a secret.' },
//   { answer: 'Coincedence', hint: 'Hint: 💬 Talk. Hint #2: Someone keeps saying the same unusual English word.' },
// ];

// Shown in the winning message
export const CODE_PHRASE = 'The night is young';

export const MAX_TRIES = 3;
