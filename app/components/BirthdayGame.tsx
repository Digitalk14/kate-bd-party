'use client';

import { useEffect, useRef, useState } from 'react';
import { CLUES, CODE_PHRASE, MAX_TRIES } from '@/app/lib/gameConfig';

// ─── TYPES ──────────────────────────────────────────────────────────────────

type InputStatus = 'idle' | 'correct' | 'error';
type GamePhase = 'playing' | 'won' | 'lost';

interface GameState {
  values: string[];
  statuses: InputStatus[];
  triesLeft: number;
  gamePhase: GamePhase;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'kate-bd-party';

const normalize = (s: string) =>
  s.trim().toLowerCase().replace(/\s+/g, ' ');

const checkAnswer = (value: string, answer: string): boolean =>
  normalize(value) === normalize(answer);

function buildInitialState(): GameState {
  return {
    values: CLUES.map(() => ''),
    statuses: CLUES.map(() => 'idle'),
    triesLeft: MAX_TRIES,
    gamePhase: 'playing',
  };
}

/**
 * Re-validates saved statuses against the current config.
 * This makes restores consistent even if answers change between page loads.
 */
function revalidateState(saved: GameState): GameState {
  const statuses: InputStatus[] = saved.statuses.map((status, i) => {
    if (status === 'idle') return 'idle';
    // status was 'correct' or 'error' — it was previously submitted; re-check
    return checkAnswer(saved.values[i], CLUES[i].answer) ? 'correct' : 'error';
  });
  return { ...saved, statuses };
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialState();
    const parsed = JSON.parse(raw) as GameState;
    // Sanity-check shape before trusting it
    if (
      Array.isArray(parsed.values) &&
      parsed.values.length === CLUES.length &&
      Array.isArray(parsed.statuses) &&
      parsed.statuses.length === CLUES.length &&
      typeof parsed.triesLeft === 'number' &&
      typeof parsed.gamePhase === 'string'
    ) {
      return revalidateState(parsed);
    }
  } catch {
    // Corrupt data — start fresh
  }
  return buildInitialState();
}

function saveState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

const RULES_LIST = [
  "Five words <b>OR</b> phrases are hidden somewhere around the party.",
  "Everything is connected to Katya - something she loves, something meaningful to her, or something that simply feels a little out of place.",
  "Look for things that stand out from the usual picture… or things that are so smoothly integrated that they almost disappear.",
  "Use the <b>hints</b> below each field to guide your search.",
  "If your subconscious catches on to something, you may be on the right track. Trust that feeling.",
  "Type your answers and press <strong>Submit</strong>. You have 3 attempts total.",
  "Correct answers turn <span class='text-emerald-600 font-medium'>green</span> and are saved. Wrong ones turn <span class='text-red-500 font-medium'>red</span> - fix them and try again.",
  "Don't rush to test every guess. The others are watching closely 👀",
  "Find all <b>5</b> to unlock the prize! 🎁",
] as const;

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function BirthdayGame() {
  const [state, setState] = useState<GameState>(buildInitialState);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore from localStorage on first render (client-only)
  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  // Debounced save: 500ms after any state change
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveState(state), 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, hydrated]);

  const { values, statuses, triesLeft, gamePhase } = state;

  // ── Derived ──────────────────────────────────────────────────────────────

  const isSubmitDisabled =
    gamePhase !== 'playing' ||
    statuses.some((s, i) => s !== 'correct' && values[i].trim() === '') ||
    statuses.some((s) => s === 'error');

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleChange(index: number, value: string) {
    setState((prev) => {
      const newValues = [...prev.values];
      newValues[index] = value;
      const newStatuses = [...prev.statuses] as InputStatus[];
      // Clear red border as soon as the user edits a wrong input
      if (newStatuses[index] === 'error') newStatuses[index] = 'idle';
      return { ...prev, values: newValues, statuses: newStatuses };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitDisabled) return;

    setState((prev) => {
      const newStatuses = prev.statuses.map((status, i) => {
        if (status === 'correct') return 'correct' as InputStatus;
        return checkAnswer(prev.values[i], CLUES[i].answer)
          ? ('correct' as InputStatus)
          : ('error' as InputStatus);
      });

      const newTriesLeft = prev.triesLeft - 1;
      const allCorrect = newStatuses.every((s) => s === 'correct');
      const noTriesLeft = newTriesLeft <= 0;

      let newPhase: GamePhase = 'playing';
      if (allCorrect) newPhase = 'won';
      else if (noTriesLeft) newPhase = 'lost';

      return {
        ...prev,
        statuses: newStatuses,
        triesLeft: newTriesLeft,
        gamePhase: newPhase,
      };
    });
  }

  // ── Render ───────────────────────────────────────────────────────────────

  // Avoid hydration mismatch: render a skeleton until localStorage is loaded
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-rose-300 border-t-rose-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-100 px-4 py-10">
      <div className="mx-auto max-w-lg w-full space-y-6">

        {/* ── Header ── */}
        <header className="text-center space-y-1">
          <p className="text-3xl">🎂</p>
          <h1 className="text-2xl font-bold text-rose-700 tracking-tight">
            Kate&apos;s Birthday Quest
          </h1>
          <p className="text-sm text-rose-400 font-medium uppercase tracking-widest">
            Find five things that tell Katya’s story.
          </p>
        </header>

        {/* ── Rules ── */}
        {
          gamePhase === 'playing' &&
          <section className="bg-white rounded-2xl shadow-sm p-5 border border-rose-100">
            <h2 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wider">
              How to play
            </h2>
            <ul className="space-y-1.5 text-sm text-gray-600">
              {RULES_LIST.map((rule, i) => (
                <li key={rule} className="flex gap-2">
                  <span className="text-rose-400 shrink-0">{i + 1}.</span>
                  <span dangerouslySetInnerHTML={{ __html: rule }} />
                </li>
              ))}
            </ul>
          </section>
        }

        {/* ── Attempts counter ── */}
        <div className="flex items-center justify-center">
          <div
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm shadow-sm border ${triesLeft > 1
              ? 'bg-white border-rose-200 text-rose-600'
              : triesLeft === 1
                ? 'bg-orange-50 border-orange-300 text-orange-600'
                : 'bg-red-50 border-red-300 text-red-600'
              }`}
          >
            <span
              className={`text-lg ${triesLeft > 1 ? '💖' : triesLeft === 1 ? '💛' : '🖤'
                }`}
            >
              {triesLeft > 1 ? '💖' : triesLeft === 1 ? '💛' : '🖤'}
            </span>
            Tries left: {Math.max(triesLeft, 0)}
          </div>
        </div>

        {/* ── Game Over messages ── */}
        {gamePhase === 'won' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center shadow-sm">
            <p className="text-2xl mb-2">🏆</p>
            <p className="text-emerald-800 font-bold text-lg mb-1">
              Congratulations, you won!
            </p>
            <p className="text-emerald-700 text-sm">
              To get your prize, come to Katya and say the code phrase:
            </p>
            <p className="mt-3 text-emerald-900 font-bold text-base bg-emerald-100 rounded-xl px-4 py-2 inline-block">
              &ldquo;{CODE_PHRASE}&rdquo;
            </p>
          </div>
        )}

        {gamePhase === 'lost' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center shadow-sm">
            <p className="text-2xl mb-2">😔</p>
            <p className="text-red-700 font-bold text-lg mb-1">
              No tries left!
            </p>
            <p className="text-red-600 text-sm">
              So sorry, you lost. Better luck next time!
            </p>
          </div>
        )}
        {
          gamePhase === 'playing' && (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {CLUES.map((clue, i) => {
                const status = statuses[i];
                const isCorrect = status === 'correct';
                const isError = status === 'error';

                return (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border border-rose-100 p-4 space-y-2">
                    {/* Label row */}
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={`clue-${i}`}
                        className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        Clue {i + 1}
                      </label>
                      {isCorrect && (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          ✓ Correct
                        </span>
                      )}
                    </div>

                    {/* Hint */}
                    <p className="text-sm text-gray-600">{clue.hint}</p>

                    {/* Input */}
                    <input
                      id={`clue-${i}`}
                      type="text"
                      value={values[i]}
                      disabled={isCorrect || gamePhase !== 'playing'}
                      onChange={(e) => handleChange(i, e.target.value)}
                      placeholder="Your answer…"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-150 border-2 ${isCorrect
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-800 cursor-not-allowed'
                        : isError
                          ? 'border-red-400 bg-red-50 text-gray-800 focus:border-red-500'
                          : gamePhase !== 'playing'
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-200 bg-gray-50 text-gray-800 focus:border-rose-400 focus:bg-white'
                        }`}
                    />
                  </div>
                );
              })}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-150 shadow-sm ${isSubmitDisabled
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-rose-500 text-white hover:bg-rose-600 active:scale-95 shadow-rose-200 shadow-md'
                  }`}
              >
                Submit Answers
              </button>
            </form>
          )
        }
        {/* ── Form ── */}


        <p className="text-center text-xs text-rose-300 pb-4">
          Your progress is saved automatically ✨
        </p>
      </div>
    </div>
  );
}
