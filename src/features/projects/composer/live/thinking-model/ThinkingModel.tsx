"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

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
  /**
   * Раскрывающийся блок размышлений (как в Codex/ChatGPT):
   * заголовок-фаза становится кнопкой, поток мыслей и колонка
   * инструментов сворачиваются. По умолчанию выключено в hero,
   * включено в inline.
   */
  collapsible?: boolean;
  defaultOpen?: boolean;
};

const DEFAULT_STEPS: readonly ThinkingStep[] = [
  { id: "list", op: "list", target: "src/features/projects/composer/live", durationMs: 400 },
  { id: "read-ui", op: "read", target: "live/thinking-model/ThinkingModel.tsx", durationMs: 700 },
  { id: "grep", op: "grep", target: '"useThinkingTimeline"', durationMs: 500 },
  { id: "read-hook", op: "read", target: "live/thinking-model/useThinkingTimeline.ts", durationMs: 700 },
  { id: "read-case", op: "read", target: "content/projects/composer/case.tsx", durationMs: 600 },
  { id: "edit", op: "edit", target: "live/thinking-model/ThinkingModel.tsx", durationMs: 2400 },
  { id: "run", op: "run", target: "npm run build", durationMs: 1800 },
];

const DEFAULT_THOUGHTS: readonly ThoughtSegment[] = [
  {
    text: "Сначала смотрю папку live: важно понять, какие фрагменты уже собраны и где между ними связь. ",
    revealToolAtStart: 0,
  },
  {
    text: "Открываю ThinkingModel. Проверяю жизненный цикл: фазы, пропсы, запуск анимации. ",
    revealToolAtStart: 1,
  },
  {
    text: "Ищу, кто ещё использует useThinkingTimeline. Если хук общий, контракт нужно сохранить. ",
    revealToolAtStart: 2,
  },
  {
    text: "Читаю хук. Фреймы идут линейно, паузы вынесены в константы. Эту логику можно расширять без лишней магии. ",
    revealToolAtStart: 3,
  },
  {
    text: "Сверяю case.tsx. На первом экране нужен цикл, внутри статьи — один спокойный прогон при скролле. ",
    revealToolAtStart: 4,
  },
  {
    text: "Собираю новый layout: поток наблюдений слева, инструменты справа. Синхронизация держится на таймингах фреймов. ",
    revealToolAtStart: 5,
  },
  {
    text: "Запускаю сборку. Если она проходит чисто, значит типы и импорты остались на месте.",
    revealToolAtStart: 6,
  },
];

export default function ThinkingModel({
  mode = "inline",
  scenario = "normal",
  steps = DEFAULT_STEPS,
  thoughts = DEFAULT_THOUGHTS,
  loop,
  className,
  collapsible,
  defaultOpen = true,
}: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const streamRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const isStatic = mode === "inline";
  const autoplay = true;
  const effectiveLoop = loop ?? mode === "hero";
  const isCollapsible = collapsible ?? mode === "inline";
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  const { phase, revealed, typedChars, fullThoughtText, elapsedMs } = useThinkingTimeline({
    steps,
    thoughts,
    autoplay,
    loop: effectiveLoop,
    reducedMotion: reducedMotion || isStatic,
    scenario,
  });

  const visibleText = fullThoughtText.slice(0, typedChars);

  // Tail-window optimization: only the last N chars are individual animated
  // spans. Older chars collapse into a single text node so React/the browser
  // don't reconcile or repaint hundreds of inline boxes per frame.
  const TAIL_SIZE = 32;
  const tailStart = Math.max(0, visibleText.length - TAIL_SIZE);
  const settledText = visibleText.slice(0, tailStart);
  const tailText = visibleText.slice(tailStart);

  // Smooth scroll via transform (GPU, sub-pixel precision)
  const offsetRef = useRef(0); // current rendered offset (negative = scrolled down)
  const targetOffsetRef = useRef(0);
  const followBottomRef = useRef(true);
  const rafRef = useRef<number>(0);

  const updateThumb = useCallback((offset: number, contentH: number, viewportH: number) => {
    const thumb = thumbRef.current;
    if (!thumb) return;
    if (contentH <= viewportH) {
      thumb.style.opacity = "0";
      return;
    }
    const scrollTop = -offset;
    const maxScroll = contentH - viewportH;
    const thumbHeight = Math.max(12, (viewportH / contentH) * viewportH);
    const thumbTop = (scrollTop / maxScroll) * (viewportH - thumbHeight);
    thumb.style.opacity = "1";
    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${thumbTop}px)`;
  }, []);

  // Continuous smooth scroll loop — uses cached dimensions updated via
  // ResizeObserver to avoid forced sync layout on every frame.
  useEffect(() => {
    const viewport = streamRef.current;
    if (!viewport) return;
    const content = viewport.firstElementChild as HTMLElement | null;
    if (!content) return;

    let running = true;
    let contentH = content.scrollHeight;
    let viewportH = viewport.clientHeight;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === content) contentH = content.scrollHeight;
        if (entry.target === viewport) viewportH = viewport.clientHeight;
      }
    });
    ro.observe(content);
    ro.observe(viewport);

    const loop = () => {
      if (!running) return;
      const maxOffset = Math.min(0, viewportH - contentH);

      if (followBottomRef.current) {
        targetOffsetRef.current = maxOffset;
      } else {
        targetOffsetRef.current = Math.max(maxOffset, Math.min(0, targetOffsetRef.current));
      }

      const current = offsetRef.current;
      const target = targetOffsetRef.current;
      const diff = target - current;
      // Skip work entirely when settled
      if (Math.abs(diff) < 0.05) {
        offsetRef.current = target;
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      // Snappier lerp — feels closer to native macOS inertia
      const next = current + diff * 0.2;
      offsetRef.current = next;

      content.style.transform = `translate3d(0, ${next}px, 0)`;
      updateThumb(next, contentH, viewportH);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateThumb]);

  // Manual wheel scroll
  useEffect(() => {
    const viewport = streamRef.current;
    if (!viewport) return;
    const content = viewport.firstElementChild as HTMLElement | null;
    if (!content) return;

    const onWheel = (e: WheelEvent) => {
      const contentH = content.scrollHeight;
      const viewportH = viewport.clientHeight;
      if (contentH <= viewportH) return;

      e.preventDefault();
      const maxOffset = viewportH - contentH;
      const next = Math.max(maxOffset, Math.min(0, targetOffsetRef.current - e.deltaY));
      targetOffsetRef.current = next;
      // Resume auto-follow when user reaches the bottom
      followBottomRef.current = next <= maxOffset + 2;
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, []);

  // Drag support for the thumb
  useEffect(() => {
    const thumb = thumbRef.current;
    const viewport = streamRef.current;
    if (!thumb || !viewport) return;
    const content = viewport.firstElementChild as HTMLElement | null;
    if (!content) return;

    let startY = 0;
    let startOffset = 0;

    const onMouseMove = (e: MouseEvent) => {
      const contentH = content.scrollHeight;
      const viewportH = viewport.clientHeight;
      const maxOffset = viewportH - contentH;
      // Dragging thumb down moves content up (more negative offset)
      const delta = e.clientY - startY;
      const offsetDelta = -(delta / viewportH) * contentH;
      const next = Math.max(maxOffset, Math.min(0, startOffset + offsetDelta));
      targetOffsetRef.current = next;
      offsetRef.current = next; // 1:1 during drag, no lerp lag
      followBottomRef.current = next <= maxOffset + 2;
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      startY = e.clientY;
      startOffset = targetOffsetRef.current;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    thumb.addEventListener("mousedown", onMouseDown);
    return () => {
      thumb.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const elapsedLabel = useMemo(() => {
    const seconds = Math.max(0, Math.round(elapsedMs / 100) / 10);
    return `${seconds.toFixed(1)}s`;
  }, [elapsedMs]);

  const phaseLabel =
    phase === "error"
      ? "Модель не ответила"
      : phase === "done"
        ? `Размышляла ${elapsedLabel}, ${steps.length} шагов`
        : phase === "expanded"
          ? "Готовит ответ"
          : phase === "waiting"
            ? "Читает"
            : phase === "streaming"
              ? "Размышляет"
              : "Готова";

  const isThinking = phase === "streaming" || phase === "expanded" || phase === "waiting";
  const phaseClassName = `${styles.phaseLabel} ${isThinking ? styles.phaseLabelShimmer : ""}`.trim();

  return (
    <section
      ref={ref}
      className={`${styles.root} ${styles[mode]} ${className ?? ""}`}
      data-phase={phase}
      aria-label="Демонстрация состояния thinking model"
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
        </header>
      ) : (
        <header className={styles.header}>
          <span className={phaseClassName} aria-live="polite">
            {phaseLabel}
          </span>
          {phase === "error" ? (
            <button type="button" className={styles.retry} tabIndex={-1} aria-hidden="true">
              попробовать снова
            </button>
          ) : null}
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
        <div className={isCollapsible ? styles.collapseInner : undefined}>
          <div className={styles.columns}>
            <div className={styles.thoughtStream} aria-label="Мысли модели">
              <div ref={streamRef} className={styles.thoughtStreamInner}>
                <div className={styles.thoughtStreamContent}>
                  <p className={styles.thoughtText}>
                    <span className={styles.srOnly}>{visibleText}</span>
                    <span aria-hidden="true" className={styles.thoughtTextVisual}>
                      {settledText}
                      {Array.from(tailText).map((ch, i) => (
                        <span key={tailStart + i} className={styles.thoughtChar}>
                          {ch}
                        </span>
                      ))}
                    </span>
                  </p>
                </div>
              </div>
              <div className={styles.scrollTrack} aria-hidden="true">
                <div ref={thumbRef} className={styles.scrollThumb} />
              </div>
            </div>

            <ol
              className={styles.steps}
              aria-label="Инструменты"
            >
              {steps.map((step, index) => {
                const isRevealed = index < revealed;
                return (
                  <li
                    key={step.id}
                    className={styles.step}
                    data-revealed={isRevealed}
                    data-last={index === revealed - 1 && phase === "streaming"}
                  >
                    <span className={styles.stepBody}>
                      <span className={styles.stepOp}>{step.op}</span>
                      <span className={styles.stepTarget}>{step.target}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
