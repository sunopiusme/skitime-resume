import type { SupportedLanguage } from "@/lib/code/highlight";

export type DiffMarker = "add" | "remove" | null;

export const thinkingModelSnippet: {
  code: string;
  lang: SupportedLanguage;
  path: string;
  diff?: DiffMarker[];
} = {
  path: "src/features/projects/composer/live/thinking-model/useThinkingTimeline.ts",
  lang: "typescript",
  diff: [
    // 1: type Frame...
    null,
    // 2: (empty)
    null,
    // 3: export function...
    null,
    // 4: const {
    null,
    // 5: steps, autoplay...
    null,
    // 6: scenario = "normal"
    null,
    // 7: thoughtDelay = ...
    null,
    // 8: } = options;
    null,
    // 9: (empty)
    null,
    // 10: const [state, setState]...
    null,
    // 11: (empty)
    null,
    // 12: useEffect(() => {
    null,
    // 13: if (reducedMotion || !autoplay) {
    null,
    // 14: setState(getInitialState({ steps, ... }));
    "remove",
    // 15: setState(getInitialState(options));
    "add",
    // 16: return;
    null,
    // 17: }
    null,
    // 18: (empty)
    null,
    // 19: const frames = buildFrames(...)
    null,
    // 20: const totalDuration = frames[frames.length - 1]?.at ?? 0;
    "remove",
    // 21: const lastFrame = frames.at(-1);
    "add",
    // 22: const totalDuration = lastFrame?.at ?? 0;
    "add",
    // 23: const timers: ...
    null,
    // 24: (empty)
    null,
    // 25: const run = () => {
    null,
    // 26: for (const frame of frames) {
    null,
    // 27: timers.push(setTimeout(...))
    null,
    // 28: }
    null,
    // 29: (empty)
    null,
    // 30: if (loop && scenario !== "error") {
    "remove",
    // 31: if (loop) {
    "add",
    // 32: timers.push(setTimeout(run, ...))
    null,
    // 33: }
    null,
    // 34: };
    null,
    // 35: (empty)
    null,
    // 36: run();
    null,
    // 37: (empty)
    null,
    // 38: return () => {
    null,
    // 39: for (const timer...) clearTimeout(timer);
    null,
    // 40: };
    null,
    // 41: }, [steps, autoplay, ...]);
    null,
    // 42: (empty)
    null,
    // 43: return state;
    null,
    // 44: }
    null,
  ],
  code: `type Frame = State & { at: number };

export function useThinkingTimeline(options: Options): State {
  const {
    steps, autoplay, loop, reducedMotion,
    scenario = "normal",
    thoughtDelay = DEFAULT_THOUGHT_DELAY,
  } = options;

  const [state, setState] = useState<State>(() => getInitialState(options));

  useEffect(() => {
    if (reducedMotion || !autoplay) {
      setState(getInitialState({ steps, autoplay, loop, reducedMotion, scenario }));
      setState(getInitialState(options));
      return;
    }

    const frames = buildFrames(steps, scenario, thoughtDelay);
    const totalDuration = frames[frames.length - 1]?.at ?? 0;
    const lastFrame = frames.at(-1);
    const totalDuration = lastFrame?.at ?? 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const run = () => {
      for (const frame of frames) {
        timers.push(setTimeout(() => setState(frame), frame.at));
      }

      if (loop && scenario !== "error") {
      if (loop) {
        timers.push(setTimeout(run, totalDuration + PAUSE_BEFORE_LOOP_MS));
      }
    };

    run();

    return () => {
      for (const timer of timers) clearTimeout(timer);
    };
  }, [steps, autoplay, loop, reducedMotion, scenario, thoughtDelay]);

  return state;
}`,
};
