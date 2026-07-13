"use client";

import { useCallback, useRef } from "react";

export type TypingPulse = {
  lastKeyAt: number;
  interval: number;
};

const INITIAL_INTERVAL_MS = 300;
const MAX_GAP_MS = 800;
const SMOOTHING = 0.3;

export function useTypingPulse() {
  const pulseRef = useRef<TypingPulse>({ lastKeyAt: 0, interval: INITIAL_INTERVAL_MS });

  // Экспоненциальное скользящее среднее интервала между нажатиями;
  // паузы длиннее MAX_GAP_MS не учитываются, чтобы не растягивать ритм.
  const registerKeystroke = useCallback(() => {
    const now = performance.now();
    const pulse = pulseRef.current;
    const gap = now - pulse.lastKeyAt;
    if (gap < MAX_GAP_MS) {
      pulse.interval += (gap - pulse.interval) * SMOOTHING;
    }
    pulse.lastKeyAt = now;
  }, []);

  return { pulseRef, registerKeystroke };
}
