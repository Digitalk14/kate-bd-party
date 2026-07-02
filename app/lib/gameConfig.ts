// ─── GAME CONFIGURATION ────────────────────────────────────────────────────
// Edit this file to change the 5 answers, their hints, and the prize code phrase.
// Answers are checked case-insensitively and extra spaces are ignored.

export interface Clue {
  answer: string;
  hint: string;
}

export const CLUES: Clue[] = [
  { answer: 'ANSWER_1', hint: 'Hint #1 — where or how to find this word' },
  { answer: 'ANSWER_2', hint: 'Hint #2 — where or how to find this word' },
  { answer: 'ANSWER_3', hint: 'Hint #3 — where or how to find this word' },
  { answer: 'ANSWER_4', hint: 'Hint #4 — where or how to find this word' },
  { answer: 'ANSWER_5', hint: 'Hint #5 — where or how to find this word' },
];

// Shown in the winning message
export const CODE_PHRASE = 'your secret code phrase here';

export const MAX_TRIES = 3;
