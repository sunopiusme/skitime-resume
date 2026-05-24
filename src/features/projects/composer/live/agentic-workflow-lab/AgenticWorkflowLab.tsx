"use client";

import { useMemo } from "react";

import { useInView } from "@/lib/motion/useInView";
import { usePrefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";

import styles from "./AgenticWorkflowLab.module.css";
import {
  useAgenticWorkflowTimeline,
  workflowPhases,
  type WorkflowPhase,
} from "./useAgenticWorkflowTimeline";

/* ─────────────────────────────────────────
   Метафора: лабораторный осциллограф процесса.
   Одна обведённая рамка, hairline-разметка,
   горизонтальные дорожки с заливкой, сплошная
   шкала фаз. Никаких "выдвинутых ящиков" — это
   язык Composer Input, и мы намеренно от него
   отстраиваемся.
   ───────────────────────────────────────── */

type LaneStatus =
  | "idle"
  | "active"
  | "complete";

type LabLane = {
  id: string;
  role: string;
  workspace: string;
  observation: string;
  /** В какой фазе линия становится активной (первая работа) */
  startsAt: WorkflowPhase;
  /** В какой фазе линия завершает свою работу */
  endsAt: WorkflowPhase;
  /** Целевое заполнение дорожки в процентах после endsAt */
  target: number;
};

const LANES: readonly LabLane[] = [
  {
    id: "spec",
    role: "спека",
    workspace: "kiro-style/spec",
    observation: "переводит задачу в план, допущения и критерии готовности",
    startsAt: "planning",
    endsAt: "planning",
    target: 100,
  },
  {
    id: "implementation",
    role: "реализация",
    workspace: "worktree/feature-slice",
    observation: "вносит diff в изолированной рабочей копии",
    startsAt: "executing",
    endsAt: "verifying",
    target: 100,
  },
  {
    id: "verification",
    role: "проверка",
    workspace: "sandbox/tests-browser",
    observation: "собирает команды, тесты, снимки и артефакты ревью",
    startsAt: "executing",
    endsAt: "reviewing",
    target: 100,
  },
];

const EVIDENCE = [
  { label: "команды", value: "lint · typecheck · build" },
  { label: "diff", value: "срез функции и схемы" },
  { label: "снимки", value: "desktop и mobile" },
  { label: "ревью", value: "человек принимает или возвращает" },
] as const;

const GUARDRAILS = [
  { label: "песочница", value: "workspace-write" },
  { label: "доступ", value: "сеть — по запросу" },
  { label: "контекст", value: "репо · источники · инструкции" },
  { label: "память", value: "явные заметки исследования" },
] as const;

const PHASE_LABELS: Record<WorkflowPhase, string> = {
  queued: "очередь",
  planning: "план",
  executing: "исполнение",
  verifying: "проверка",
  reviewing: "ревью",
};

const PHASE_INDEX: Record<WorkflowPhase, number> = {
  queued: 0,
  planning: 1,
  executing: 2,
  verifying: 3,
  reviewing: 4,
};

function laneFill(lane: LabLane, phase: WorkflowPhase): number {
  const current = PHASE_INDEX[phase];
  const start = PHASE_INDEX[lane.startsAt];
  const end = PHASE_INDEX[lane.endsAt];
  if (current < start) return 0;
  if (current >= end) return lane.target;
  // Линейная интерполяция между start и end
  const span = end - start;
  if (span === 0) return lane.target;
  const t = (current - start) / span;
  return Math.round(lane.target * t);
}

function laneStatus(lane: LabLane, phase: WorkflowPhase): LaneStatus {
  const current = PHASE_INDEX[phase];
  if (current < PHASE_INDEX[lane.startsAt]) return "idle";
  if (current >= PHASE_INDEX[lane.endsAt] && phase === "reviewing") return "complete";
  if (current > PHASE_INDEX[lane.endsAt]) return "complete";
  return "active";
}

const STATUS_LABELS: Record<LaneStatus, string> = {
  idle: "ожидает",
  active: "работает",
  complete: "готово",
};

function completedEvidenceCount(phase: WorkflowPhase) {
  if (phase === "reviewing") return EVIDENCE.length;
  if (phase === "verifying") return 3;
  if (phase === "executing") return 1;
  return 0;
}

export default function AgenticWorkflowLab() {
  const reducedMotion = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ once: true });
  const { phase } = useAgenticWorkflowTimeline({ autoplay: inView, reducedMotion });

  const phaseProgress = useMemo(() => {
    const idx = PHASE_INDEX[phase];
    return (idx / (workflowPhases.length - 1)) * 100;
  }, [phase]);

  const evidenceCount = useMemo(() => completedEvidenceCount(phase), [phase]);

  return (
    <div
      ref={ref}
      className={styles.root}
      data-phase={phase}
      aria-label="Agentic Workflow Lab"
      aria-live="polite"
    >
      {/* ── Прибор: рамка, единая поверхность ── */}
      <div className={styles.frame}>
        {/* верхний "шильдик" прибора */}
        <div className={styles.bezel}>
          <span className={styles.bezelMark} aria-hidden="true">
            ◐
          </span>
          <span className={styles.bezelTitle}>Agentic Workflow Lab</span>
          <span className={styles.bezelTrace}>trace · live</span>
          <span className={styles.bezelClock} aria-hidden="true">
            {String(PHASE_INDEX[phase] + 1).padStart(2, "0")}
            /{workflowPhases.length}
          </span>
        </div>

        {/* шкала фаз — сплошная линия с заливкой */}
        <div className={styles.scaleRow}>
          <div className={styles.scaleTrack} aria-hidden="true">
            <div
              className={styles.scaleFill}
              style={{ width: `${phaseProgress}%` }}
            />
            <ol className={styles.scaleTicks}>
              {workflowPhases.map((item, index) => {
                const state =
                  index < PHASE_INDEX[phase]
                    ? "done"
                    : index === PHASE_INDEX[phase]
                      ? "active"
                      : "idle";
                return (
                  <li
                    key={item}
                    className={styles.tick}
                    data-state={state}
                    style={{
                      left: `${(index / (workflowPhases.length - 1)) * 100}%`,
                    }}
                  >
                    <span className={styles.tickMark} aria-hidden="true" />
                    <span className={styles.tickLabel}>{PHASE_LABELS[item]}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* линии работы — горизонтальные дорожки */}
        <ul className={styles.lanes}>
          {LANES.map((lane) => {
            const fill = laneFill(lane, phase);
            const status = laneStatus(lane, phase);
            return (
              <li key={lane.id} className={styles.lane} data-status={status}>
                <div className={styles.laneMeta}>
                  <span className={styles.laneRole}>{lane.role}</span>
                  <span className={styles.laneWorkspace}>{lane.workspace}</span>
                </div>
                <div className={styles.laneTrack} aria-hidden="true">
                  <div
                    className={styles.laneFill}
                    style={{ width: `${fill}%` }}
                  />
                </div>
                <div className={styles.laneSide}>
                  <span className={styles.laneStatus}>{STATUS_LABELS[status]}</span>
                  <span className={styles.lanePct}>
                    {String(fill).padStart(3, " ")}%
                  </span>
                </div>
                <p className={styles.laneObservation}>{lane.observation}</p>
              </li>
            );
          })}
        </ul>

        {/* подвал прибора: доказательства и ограничения в одной рамке */}
        <div className={styles.foot}>
          <section className={styles.footColumn}>
            <p className={styles.footTitle}>Доказательная база</p>
            <ul className={styles.footList}>
              {EVIDENCE.map((item, index) => (
                <li
                  key={item.label}
                  className={styles.footRow}
                  data-state={index < evidenceCount ? "complete" : "pending"}
                >
                  <span className={styles.footMark} aria-hidden="true" />
                  <span className={styles.footLabel}>{item.label}</span>
                  <span className={styles.footValue}>{item.value}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.footColumn}>
            <p className={styles.footTitle}>Ограничения</p>
            <ul className={styles.footList}>
              {GUARDRAILS.map((item) => (
                <li key={item.label} className={styles.footRow} data-state="static">
                  <span className={styles.footMark} aria-hidden="true" />
                  <span className={styles.footLabel}>{item.label}</span>
                  <span className={styles.footValue}>{item.value}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
