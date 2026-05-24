"use client";

import { useEffect, useState } from "react";

export type WorkflowPhase = "queued" | "planning" | "executing" | "verifying" | "reviewing";

type Options = {
  autoplay: boolean;
  reducedMotion: boolean;
};

type TimelineState = {
  phase: WorkflowPhase;
  stepIndex: number;
};

const PHASES: readonly WorkflowPhase[] = [
  "queued",
  "planning",
  "executing",
  "verifying",
  "reviewing",
];

const STEP_DELAYS_MS: Record<WorkflowPhase, number> = {
  queued: 900,
  planning: 1200,
  executing: 1500,
  verifying: 1300,
  reviewing: 1800,
};

export function useAgenticWorkflowTimeline({
  autoplay,
  reducedMotion,
}: Options): TimelineState {
  const [state, setState] = useState<TimelineState>(() =>
    reducedMotion
      ? { phase: "reviewing", stepIndex: PHASES.length - 1 }
      : { phase: "queued", stepIndex: 0 },
  );

  useEffect(() => {
    if (!autoplay) return;
    if (reducedMotion) {
      const timer = setTimeout(() => {
        setState({ phase: "reviewing", stepIndex: PHASES.length - 1 });
      }, 0);
      return () => clearTimeout(timer);
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    let cursor = 0;

    PHASES.forEach((phase, index) => {
      timers.push(
        setTimeout(() => {
          setState({ phase, stepIndex: index });
        }, cursor),
      );
      cursor += STEP_DELAYS_MS[phase];
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [autoplay, reducedMotion]);

  return state;
}

export const workflowPhases = PHASES;
