"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";

export type ThinkingOp = "list" | "read" | "grep" | "edit" | "run";

export type ThinkingStep = {
  id: string;
  op: ThinkingOp;
  target: string;
  /** How long the tool "runs" — text pauses during this */
  durationMs: number;
};

export type ThinkingPhase = "idle" | "streaming" | "waiting" | "expanded" | "done" | "error";

export type ThoughtSegment = {
  text: string;
  /** Tool step index to reveal when this segment starts typing */
  revealToolAtStart?: number;
};

type Options = {
  steps: readonly ThinkingStep[];
  thoughts: readonly ThoughtSegment[];
  autoplay: boolean;
  loop: boolean;
  reducedMotion: boolean;
  scenario?: "normal" | "error";
  typingSpeed?: number;
};

export type State = {
  phase: ThinkingPhase;
  revealed: number;
  typedChars: number;
  fullThoughtText: string;
  elapsedMs: number;
};

const HOLD_BEFORE_EXPANDED_MS = 900;
const HOLD_BEFORE_DONE_MS = 1800;
const PAUSE_BEFORE_LOOP_MS = 1400;
const DEFAULT_TYPING_SPEED = 70; // base chars per second — calm, deliberate stream

/**
 * Steady streaming cadence.
 * Characters arrive at a constant rate; only punctuation gets a real breath pause.
 * No sine-wave jitter — combined with per-character fade-in on the render side
 * this produces a smooth, professional "model thinking out loud" feel.
 */

/**
 * Build a per-character timing array. Returns cumulative ms for each position.
 */
function buildCharTimings(text: string, baseSpeed: number): number[] {
  const baseMsPerChar = 1000 / baseSpeed;
  const timings: number[] = [];
  let cumMs = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    const prev = i > 0 ? text[i - 1]! : "";

    let factor = 1.0;

    // Breath after sentence-ending punctuation
    if (prev === "." || prev === "!" || prev === "?") {
      factor = 3.0;
    }
    // Smaller pause after a comma
    else if (prev === ",") {
      factor = 1.8;
    }
    // Spaces are slightly faster than letters but not abrupt
    else if (ch === " ") {
      factor = 0.55;
    }
    // Letters flow at a steady pace — no per-index oscillation
    else {
      factor = 1.0;
    }

    cumMs += baseMsPerChar * factor;
    timings.push(cumMs);
  }

  return timings;
}

/**
 * Timeline events — now using smooth continuous typing with organic pacing.
 */

type TimelineEvent =
  | { type: "type"; startChar: number; endChar: number; startMs: number; charTimings: number[] }
  | { type: "wait"; toolIndex: number; startMs: number; endMs: number; charsAtStart: number }
  | { type: "reveal"; toolIndex: number; atMs: number; charsAtReveal: number };

function buildTimeline(
  thoughts: readonly ThoughtSegment[],
  steps: readonly ThinkingStep[],
  typingSpeed: number,
): { events: TimelineEvent[]; totalMs: number; fullText: string } {
  const events: TimelineEvent[] = [];
  let currentMs = 0;
  let currentChar = 0;
  const fullText = thoughts.map((t) => t.text).join("");

  for (let i = 0; i < thoughts.length; i++) {
    const segment = thoughts[i]!;
    const toolIdx = segment.revealToolAtStart;

    // If there's a tool to trigger, pause first (tool is loading)
    if (toolIdx !== undefined && toolIdx < steps.length) {
      const tool = steps[toolIdx]!;

      // Reveal tool at start of pause
      events.push({ type: "reveal", toolIndex: toolIdx, atMs: currentMs, charsAtReveal: currentChar });

      // Wait while tool "runs"
      const waitStart = currentMs;
      currentMs += tool.durationMs;
      events.push({ type: "wait", toolIndex: toolIdx, startMs: waitStart, endMs: currentMs, charsAtStart: currentChar });
    }

    // Build organic per-char timings for this segment
    const charTimings = buildCharTimings(segment.text, typingSpeed);
    const segDuration = charTimings.length > 0 ? charTimings[charTimings.length - 1]! : 0;

    const startChar = currentChar;
    const endChar = currentChar + segment.text.length;

    events.push({ type: "type", startChar, endChar, startMs: currentMs, charTimings });

    currentMs += segDuration;
    currentChar = endChar;
  }

  return { events, totalMs: currentMs, fullText };
}

export function useThinkingTimeline(options: Options): State {
  const {
    steps,
    thoughts,
    autoplay,
    loop,
    reducedMotion,
    scenario = "normal",
    typingSpeed = DEFAULT_TYPING_SPEED,
  } = options;

  const { events, totalMs, fullText } = useMemo(
    () => buildTimeline(thoughts, steps, typingSpeed),
    [thoughts, steps, typingSpeed],
  );

  const totalChars = fullText.length;

  const [state, setState] = useState<State>(() => {
    if (reducedMotion && autoplay) {
      return {
        phase: scenario === "error" ? "error" : "done",
        revealed: steps.length,
        typedChars: totalChars,
        fullThoughtText: fullText,
        elapsedMs: totalMs,
      };
    }
    return {
      phase: autoplay ? "streaming" : "idle",
      revealed: 0,
      typedChars: 0,
      fullThoughtText: fullText,
      elapsedMs: 0,
    };
  });

  const rafRef = useRef<number>(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastStateRef = useRef<State>(state);
  const runCycleRef = useRef<() => void>(() => undefined);

  const clearAll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    for (const t of timeoutsRef.current) clearTimeout(t);
    timeoutsRef.current = [];
  }, []);

  const commit = useCallback((next: State) => {
    const prev = lastStateRef.current;
    if (
      prev.phase === next.phase &&
      prev.revealed === next.revealed &&
      prev.typedChars === next.typedChars &&
      prev.fullThoughtText === next.fullThoughtText
    ) {
      // Same visible state — skip React render. elapsedMs change alone never
      // affects what the user sees during the streaming inner loop.
      lastStateRef.current = next;
      return;
    }
    lastStateRef.current = next;
    setState(next);
  }, []);

  const runCycle = useCallback(() => {
    const startTime = performance.now();

    const tick = () => {
      const elapsed = performance.now() - startTime;

      // Find current state based on elapsed time
      let typedChars = 0;
      let revealed = 0;
      let phase: ThinkingPhase = "streaming";

      for (const event of events) {
        if (event.type === "reveal" && elapsed >= event.atMs) {
          revealed = event.toolIndex + 1;
        }

        if (event.type === "wait") {
          if (elapsed >= event.startMs && elapsed < event.endMs) {
            phase = "waiting";
            typedChars = event.charsAtStart;
            break;
          }
          if (elapsed >= event.endMs) {
            typedChars = event.charsAtStart;
          }
        }

        if (event.type === "type") {
          const localElapsed = elapsed - event.startMs;
          if (localElapsed < 0) {
            // Haven't reached this segment yet
            break;
          }
          // Binary search through charTimings for current position
          const timings = event.charTimings;
          const totalSegDuration = timings.length > 0 ? timings[timings.length - 1]! : 0;
          if (localElapsed >= totalSegDuration) {
            typedChars = event.endChar;
          } else {
            // Find how many chars have been revealed at this elapsed time
            let lo = 0;
            let hi = timings.length - 1;
            while (lo < hi) {
              const mid = (lo + hi + 1) >> 1;
              if (timings[mid]! <= localElapsed) {
                lo = mid;
              } else {
                hi = mid - 1;
              }
            }
            typedChars = event.startChar + lo + (timings[lo]! <= localElapsed ? 1 : 0);
            phase = "streaming";
          }
        }
      }

      if (elapsed < totalMs) {
        commit({
          phase,
          revealed: Math.min(revealed, steps.length),
          typedChars: Math.min(typedChars, totalChars),
          fullThoughtText: fullText,
          elapsedMs: elapsed,
        });
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Typing complete
        commit({
          phase: "streaming",
          revealed: steps.length,
          typedChars: totalChars,
          fullThoughtText: fullText,
          elapsedMs: totalMs,
        });

        // expanded phase
        const t1 = setTimeout(() => {
          const prev = lastStateRef.current;
          commit({ ...prev, phase: "expanded" });
        }, HOLD_BEFORE_EXPANDED_MS);

        // done phase
        const t2 = setTimeout(() => {
          const prev = lastStateRef.current;
          commit({ ...prev, phase: "done" });

          if (loop && scenario !== "error") {
            const t3 = setTimeout(() => {
              commit({
                phase: "streaming",
                revealed: 0,
                typedChars: 0,
                fullThoughtText: fullText,
                elapsedMs: 0,
              });
              runCycleRef.current();
            }, PAUSE_BEFORE_LOOP_MS);
            timeoutsRef.current.push(t3);
          }
        }, HOLD_BEFORE_EXPANDED_MS + HOLD_BEFORE_DONE_MS);

        timeoutsRef.current.push(t1, t2);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [events, totalMs, totalChars, fullText, steps.length, loop, scenario, commit]);

  useEffect(() => {
    runCycleRef.current = runCycle;
  }, [runCycle]);

  useEffect(() => {
    if (reducedMotion || !autoplay) {
      const next = {
        phase: reducedMotion ? (scenario === "error" ? "error" : "done") : "idle",
        revealed: reducedMotion ? steps.length : 0,
        typedChars: reducedMotion ? totalChars : 0,
        fullThoughtText: fullText,
        elapsedMs: reducedMotion ? totalMs : 0,
      } satisfies State;
      const timer = setTimeout(() => {
        lastStateRef.current = next;
        setState(next);
      }, 0);
      return () => clearTimeout(timer);
    }

    runCycle();
    return clearAll;
  }, [steps, thoughts, autoplay, loop, reducedMotion, scenario, typingSpeed, runCycle, clearAll, fullText, totalChars, totalMs]);

  return state;
}
