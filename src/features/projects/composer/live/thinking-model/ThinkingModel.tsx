"use client";

import { useCallback, useId, useMemo, useState, type ReactNode } from "react";

import { usePrefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";

import styles from "./ThinkingModel.module.css";
import {
  useThinkingTimeline,
  type ThinkingStep,
  type ThoughtSegment,
} from "./useThinkingTimeline";

type Props = {
  mode?: "hero" | "inline";
  scenario?: "normal" | "error";
  steps?: readonly ThinkingStep[];
  thoughts?: readonly ThoughtSegment[];
  loop?: boolean;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  showPlayButton?: boolean;
};

const DEFAULT_STEPS: readonly ThinkingStep[] = [
  { id: "list", op: "list", target: "thinking-model/", durationMs: 900 },
  { id: "read-ui", op: "read", target: "ThinkingModel.tsx", durationMs: 1200 },
  { id: "grep", op: "grep", target: "useThinkingTimeline", durationMs: 900 },
  { id: "read-hook", op: "read", target: "useThinkingTimeline.ts", durationMs: 1100 },
  { id: "read-case", op: "read", target: "case.tsx", durationMs: 1000 },
  { id: "edit", op: "edit", target: "ThinkingModel.tsx", durationMs: 1600 },
  { id: "run", op: "run", target: "npm run typecheck", durationMs: 1400 },
];

const DEFAULT_THOUGHTS: readonly ThoughtSegment[] = [
  { text: "scan", revealToolAtStart: 0 },
  { text: "read", revealToolAtStart: 1 },
  { text: "find", revealToolAtStart: 2 },
  { text: "trace", revealToolAtStart: 3 },
  { text: "place", revealToolAtStart: 4 },
  { text: "patch", revealToolAtStart: 5 },
  { text: "check", revealToolAtStart: 6 },
];

const OP_VERB: Record<ThinkingStep["op"], string> = {
  list: "Открывает структуру",
  read: "Читает файл",
  grep: "Ищет совпадения",
  edit: "Вносит изменения",
  run: "Запускает проверку",
};

const OP_RESULT: Record<ThinkingStep["op"], string> = {
  list: "контекст найден",
  read: "контракт понятен",
  grep: "связи найдены",
  edit: "diff подготовлен",
  run: "вывод получен",
};

const OP_PAST: Record<ThinkingStep["op"], string> = {
  list: "Открыл",
  read: "Прочитал",
  grep: "Нашёл",
  edit: "Обновил",
  run: "Запустил",
};

const SOURCES: readonly { id: string; label: string; url: string }[] = [
  { id: "youtube", label: "YouTube", url: "https://www.youtube.com/" },
  { id: "reddit", label: "Reddit", url: "https://www.reddit.com/" },
  { id: "docs", label: "OpenAI Docs", url: "https://platform.openai.com/docs" },
  { id: "github", label: "GitHub", url: "https://github.com/" },
];

const GLOBAL_SOURCE = { id: "global", label: "Global" } as const;

function faviconUrl(url: string) {
  return `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(url)}`;
}

function statusFor(index: number, revealed: number, runningIndex: number | null) {
  if (runningIndex === index) return "running";
  if (index < revealed) return "done";
  return "pending";
}

export default function ThinkingModel({
  mode = "inline",
  scenario = "normal",
  steps = DEFAULT_STEPS,
  thoughts = DEFAULT_THOUGHTS,
  loop,
  className,
  collapsible,
  defaultOpen = true,
  showPlayButton = false,
}: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const contentId = useId();
  const [isPlaying, setIsPlaying] = useState(false);
  const [userToggleState, setUserToggleState] = useState<boolean | null>(null);
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);

  const isStatic = mode === "inline";
  const autoplay = showPlayButton ? isPlaying : true;
  const effectiveLoop = loop ?? mode === "hero";
  const isCollapsible = collapsible ?? mode === "inline";

  const { phase, revealed, elapsedMs } = useThinkingTimeline({
    steps,
    thoughts,
    autoplay,
    loop: effectiveLoop,
    reducedMotion: reducedMotion || isStatic || (showPlayButton && !isPlaying),
    scenario,
    typingSpeed: 900,
  });

  const openBase = defaultOpen;
  const open = userToggleState !== null ? userToggleState : openBase;
  const setOpen = useCallback(
    (next: boolean | ((v: boolean) => boolean)) => {
      setUserToggleState((prev) => {
        const current = prev !== null ? prev : openBase;
        return typeof next === "function" ? next(current) : next;
      });
    },
    [openBase],
  );

  const runningIndex =
    phase === "waiting" && revealed > 0
      ? Math.min(revealed - 1, steps.length - 1)
      : null;

  const completed = Math.min(revealed, steps.length);
  const activeStep = runningIndex !== null ? steps[runningIndex] : null;
  const elapsedLabel = useMemo(() => {
    const seconds = Math.max(0, Math.round(elapsedMs / 100) / 10);
    return `${seconds.toFixed(1).replace(".", ",")} сек`;
  }, [elapsedMs]);

  const phaseLabel: ReactNode = (() => {
    if (phase === "error") return "Журнал остановлен";
    if (phase === "done")
      return (
        <>
          Журнал готов
          <span className={styles.phaseDivider} aria-hidden="true" />
          {steps.length} действий
          <span className={styles.phaseDivider} aria-hidden="true" />
          {elapsedLabel}
        </>
      );
    if (activeStep) return `${OP_VERB[activeStep.op]} · ${activeStep.target}`;
    if (completed > 0) return "Собирает рабочий журнал";
    return "Готовит контекст";
  })();

  const handlePlayClick = useCallback(() => {
    setIsPlaying((current) => !current || phase === "done");
    setUserToggleState(null);
  }, [phase]);

  const isReplay = showPlayButton && phase === "done";
  const isActive = phase === "waiting" || phase === "streaming" || phase === "expanded";
  const phaseClassName = `${styles.phaseLabel} ${isActive ? styles.phaseLabelShimmer : ""}`.trim();
  const visibleSteps = steps.slice(0, Math.max(completed, runningIndex !== null ? runningIndex + 1 : 0));

  const body = (
    <div className={styles.traceBody}>
      <ol className={styles.traceList} aria-label="Наблюдаемые действия агента">
        {visibleSteps.map((step, index) => {
          const status = statusFor(index, revealed, runningIndex);
          return (
            <li key={step.id} className={styles.traceItem} data-status={status}>
              <span className={styles.traceLine}>
                <span>{OP_PAST[step.op]}</span>
                <span className={styles.traceTarget}>{step.target}</span>
                <span className={styles.traceResult}>
                  {OP_RESULT[step.op]}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      <div
        className={styles.sources}
        aria-label={`Источники: ${[...SOURCES.map((source) => source.label), GLOBAL_SOURCE.label].join(", ")}`}
      >
        <span className={styles.sourcesLabel}>Источники</span>
        <span
          className={styles.sourceList}
          onPointerLeave={() => setActiveSourceId(null)}
          onPointerCancel={() => setActiveSourceId(null)}
        >
          {SOURCES.map((source, index) => (
            <span
              key={source.id}
              className={styles.sourceStackItem}
              data-active={activeSourceId === source.id}
              style={{ zIndex: SOURCES.length - index }}
              onPointerEnter={() => setActiveSourceId(source.id)}
              onPointerMove={() => setActiveSourceId(source.id)}
            >
              <span className={styles.sourceItem} aria-hidden="true">
                <span
                  className={styles.sourceIcon}
                  style={{ backgroundImage: `url("${faviconUrl(source.url)}")` }}
                />
              </span>
              <span className={styles.sourceTooltip} role="tooltip">
                <span className={styles.sourceTooltipLabel}>{source.label}</span>
              </span>
            </span>
          ))}
        </span>
        <span className={styles.sourceGlobal}>
          <span className={styles.sourceGlobalTrigger} aria-hidden="true">
            <svg
              className={styles.sourceGlobalIcon}
              viewBox="0 0 24 24"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <g className={styles.sourceGlobalBase}>
                <circle cx="12" cy="12" r="8.25" />
                <path d="M3.75 12h16.5" />
                <path d="M12 3.75c2.05 2.25 3.08 5 3.08 8.25S14.05 18 12 20.25" />
                <path d="M12 3.75C9.95 6 8.92 8.75 8.92 12S9.95 18 12 20.25" />
              </g>
              <g className={styles.sourceGlobalShimmer} aria-hidden="true">
                <circle cx="12" cy="12" r="8.25" />
                <path d="M3.75 12h16.5" />
                <path d="M12 3.75c2.05 2.25 3.08 5 3.08 8.25S14.05 18 12 20.25" />
                <path d="M12 3.75C9.95 6 8.92 8.75 8.92 12S9.95 18 12 20.25" />
              </g>
            </svg>
          </span>
        </span>
      </div>
    </div>
  );

  return (
    <section
      className={`${styles.root} ${styles[mode]} ${className ?? ""}`}
      data-phase={phase}
      aria-label="Наблюдаемый журнал работы агента"
    >
      {isCollapsible ? (
        <header className={styles.header}>
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={contentId}
          >
            <span
              className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
            <span className={phaseClassName} aria-live="polite">
              {phaseLabel}
            </span>
          </button>
          {phase === "error" ? (
            <button type="button" className={styles.retry} tabIndex={-1} aria-hidden="true">
              попробовать снова
            </button>
          ) : null}
          {showPlayButton && (!isPlaying || isReplay) ? (
            <button
              type="button"
              className={styles.playButton}
              onClick={handlePlayClick}
              aria-label={isReplay ? "Повторить журнал" : "Запустить журнал"}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                {isReplay ? (
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                ) : (
                  <path d="M8 5v14l11-7z" />
                )}
              </svg>
            </button>
          ) : null}
        </header>
      ) : (
        <header className={styles.header}>
          <span className={phaseClassName} aria-live="polite">
            {phaseLabel}
          </span>
        </header>
      )}

      <div
        id={isCollapsible ? contentId : undefined}
        className={
          isCollapsible
            ? `${styles.collapse} ${open ? styles.collapseOpen : ""}`
            : undefined
        }
      >
        <div className={isCollapsible ? styles.collapseInner : undefined}>{body}</div>
      </div>
    </section>
  );
}
