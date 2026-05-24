import type { SupportedLanguage } from "@/lib/code/highlight";

export const agenticWorkflowLabSnippet: {
  code: string;
  lang: SupportedLanguage;
  path: string;
} = {
  path: "src/features/projects/composer/live/agentic-workflow-lab/useAgenticWorkflowTimeline.ts",
  lang: "typescript",
  code: `"use client";

export type WorkflowPhase = "queued" | "planning" | "executing" | "verifying" | "reviewing";

const PHASES: readonly WorkflowPhase[] = [
  "queued",
  "planning",
  "executing",
  "verifying",
  "reviewing",
];

export function useAgenticWorkflowTimeline({ autoplay, reducedMotion }: Options): TimelineState {
  const [state, setState] = useState<TimelineState>(() =>
    reducedMotion ? { phase: "reviewing", stepIndex: PHASES.length - 1 } : { phase: "queued", stepIndex: 0 },
  );

  useEffect(() => {
    if (!autoplay) return;
    if (reducedMotion) {
      setState({ phase: "reviewing", stepIndex: PHASES.length - 1 });
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    let cursor = 0;

    PHASES.forEach((phase, index) => {
      timers.push(setTimeout(() => setState({ phase, stepIndex: index }), cursor));
      cursor += STEP_DELAYS_MS[phase];
    });

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [autoplay, reducedMotion]);

  return state;
}`,
};
