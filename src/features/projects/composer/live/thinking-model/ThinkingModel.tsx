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
  /* Цели сделаны самодостаточными: имя файла или короткий идентификатор,
     без длинного префикса пути. Это позволяет фазе вида «Читает X»
     читаться без обрезаний и многоточий. Длительности подобраны
     так, чтобы каждый шаг можно было успеть прочитать целиком —
     быстрее ~1.8s глаз не успевает осознать смену статуса. */
  { id: "list", op: "list", target: "thinking-model/", durationMs: 1800 },
  { id: "read-ui", op: "read", target: "ThinkingModel.tsx", durationMs: 2400 },
  { id: "grep", op: "grep", target: "useThinkingTimeline", durationMs: 2000 },
  { id: "read-hook", op: "read", target: "useThinkingTimeline.ts", durationMs: 2400 },
  { id: "read-case", op: "read", target: "case.tsx", durationMs: 2200 },
  { id: "edit", op: "edit", target: "ThinkingModel.tsx", durationMs: 4200 },
  { id: "run", op: "run", target: "npm run build", durationMs: 3600 },
];

const DEFAULT_THOUGHTS: readonly ThoughtSegment[] = [
  {
    text: "Сначала смотрю папку live. Нужно понять, что уже собрано и где компоненты держатся друг за друга. ",
    revealToolAtStart: 0,
  },
  {
    text: "Открываю ThinkingModel. Проверяю фазы, пропсы и запуск анимации. ",
    revealToolAtStart: 1,
  },
  {
    text: "Ищу другие вызовы useThinkingTimeline. Если хук общий, контракт трогать нельзя. ",
    revealToolAtStart: 2,
  },
  {
    text: "Читаю хук. Фреймы идут линейно, паузы вынесены в константы. Хорошо: поведение можно менять без скрытой магии. ",
    revealToolAtStart: 3,
  },
  {
    text: "Сверяю case.tsx. В hero нужен цикл. Внутри статьи нужен один спокойный прогон при скролле. ",
    revealToolAtStart: 4,
  },
  {
    text: "Собираю layout: наблюдения слева, инструменты справа. Синхронизация держится на таймингах фреймов. ",
    revealToolAtStart: 5,
  },
  {
    text: "Запускаю сборку. Если она чистая, типы и импорты пережили правку.",
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
  const contentId = useId();

  const { phase, revealed, typedChars, fullThoughtText, elapsedMs } = useThinkingTimeline({
    steps,
    thoughts,
    autoplay,
    loop: effectiveLoop,
    reducedMotion: reducedMotion || isStatic,
    scenario,
  });

  /* open вычисляется в рендере: автозакрытие на done без useEffect
     убирает «вспышку» высоты, которую давал двойной commit (сначала
     рендер с phase=done + open=true, потом setOpen(false)).
     userToggleState — явный override от пользователя; если он есть,
     перекрывает автологику. */
  const [userToggleState, setUserToggleState] = useState<boolean | null>(null);
  const autoOpen = phase === "done" ? false : defaultOpen;
  const open = userToggleState !== null ? userToggleState : autoOpen;
  const setOpen = useCallback(
    (next: boolean | ((v: boolean) => boolean)) => {
      setUserToggleState((prev) => {
        const current = prev !== null ? prev : autoOpen;
        return typeof next === "function" ? next(current) : next;
      });
    },
    [autoOpen],
  );

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

  /* Активный инструмент имеет смысл только во время waiting:
     именно тогда инструмент действительно «работает». В streaming
     модель уже думает над прочитанным, новая сноска про read/grep
     выглядела бы как двойная подпись. */
  const activeStep =
    phase === "waiting" && revealed > 0
      ? steps[Math.min(revealed - 1, steps.length - 1)]
      : null;

  const phaseLabel = (() => {
    if (phase === "error") return "Не ответила";
    if (phase === "done") return `Размышляла ${elapsedLabel} · ${steps.length} шагов`;
    if (phase === "expanded") return "Готовит ответ";
    if (phase === "waiting" && activeStep) {
      const verb =
        activeStep.op === "read"
          ? "Читает"
          : activeStep.op === "grep"
            ? "Ищет"
            : activeStep.op === "list"
              ? "Открывает"
              : activeStep.op === "edit"
                ? "Правит"
                : activeStep.op === "run"
                  ? "Запускает"
                  : "Работает";
      return `${verb} ${activeStep.target}`;
    }
    if (phase === "streaming") return "Размышляет";
    return "Готова";
  })();

  /* Past-tense verb для итогового лога. Активный инструмент во
     время выполнения живёт в шапке («Читает foo»), а здесь —
     застывший след того, что уже сделано. */
  const pastVerb = (op: ThinkingStep["op"]) => {
    switch (op) {
      case "read":
        return "Прочитала";
      case "grep":
        return "Нашла";
      case "list":
        return "Открыла";
      case "edit":
        return "Изменила";
      case "run":
        return "Запустила";
      default:
        return "Использовала";
    }
  };

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
          {/* Лог инструментов — всегда в DOM (slot со своим grid-rows),
              открыт только когда `open && phase === "done"`. Эта связка
              критична: на момент перехода streaming→done outer collapse
              закрывается (open auto→false) И slot одновременно остаётся
              data-open=false → natural height container'а не растёт
              на toolList, transition стартует с прежней высоты thoughts.
              Никакой «вспышки» высоты. */}
          <div
            className={styles.toolListSlot}
            data-open={open && phase === "done"}
            aria-hidden={!(open && phase === "done")}
          >
            <ol className={styles.toolList} aria-label="Инструменты">
              {steps.map((step) => (
                <li key={step.id} className={styles.toolItem}>
                  <span className={styles.toolVerb}>{pastVerb(step.op)}</span>
                  <span className={styles.toolTarget}>{step.target}</span>
                </li>
              ))}
            </ol>
          </div>

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
            className={styles.stepsSrOnly}
            aria-label="Инструменты"
            aria-hidden={phase === "done"}
          >
            {steps.map((step, index) => {
              const isRevealed = index < revealed;
              return (
                <li key={step.id} data-revealed={isRevealed}>
                  {step.op} {step.target}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
