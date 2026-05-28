"use client";

import { useEffect, useState } from "react";
import styles from "./AgenticWorkflowLab.module.css";

/* ─────────────────────────────────────────
   Sidebar preview, разрезанный пополам.
   Слева — верхняя половина живого сайдбара
   (нав, проекты, чаты), уходящая в туман
   фона. Справа — нижняя половина: хвост
   списка, футер с настройками и апгрейдом.
   Никаких прогресс-баров и анимаций — это
   статичная превью-сцена.
   ───────────────────────────────────────── */

type ChatItem = {
  title: string;
  age: string;
};

type ProjectGroup = {
  name: string;
  chats: ChatItem[];
  more?: boolean;
  empty?: boolean;
};

type NavIconKind = "edit" | "search" | "grid" | "clock";

type NavItem = {
  icon: NavIconKind;
  label: string;
  shortcut?: readonly string[];
};

const NAV_ITEMS: readonly NavItem[] = [
  { icon: "edit", label: "New chat", shortcut: ["⌘", "N"] },
  { icon: "search", label: "Search", shortcut: ["⌘", "G"] },
  { icon: "grid", label: "Plugins" },
  { icon: "clock", label: "Automations" },
];

const PROJECTS: readonly ProjectGroup[] = [
  {
    name: "ZenPulse",
    chats: [
      { title: "Quick setup — if you’ve don…", age: "2mo" },
      { title: "в chatinput в настрой дня е…", age: "2mo" },
      { title: "после ввода в инпут в наст…", age: "2mo" },
      { title: "нужно пересмотреть дизай…", age: "2mo" },
      { title: "[Image #1] на главной стра…", age: "2mo" },
    ],
    more: true,
  },
  {
    name: "horizon-sprint",
    chats: [
      { title: "Найти физику бега персон…", age: "2mo" },
      { title: "Найди практики для TMA и…", age: "2mo" },
      { title: "Fix missing initTelegram mo…", age: "2mo" },
      { title: "Переработать UI 456 Runner", age: "2mo" },
      { title: "Интегрировать Telegram Mi…", age: "2mo" },
    ],
    more: true,
  },
  { name: "cmux", chats: [], empty: true },
  { name: "Glim", chats: [] },
];

function NavIcon({ kind }: { kind: NavIconKind }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 18,
    height: 18,
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  switch (kind) {
    case "edit":
      return (
        <svg {...common}>
          <path d="M4 20h16" />
          <path d="M16.5 4.5a2.12 2.12 0 0 1 3 3L8.5 18.5l-4.5 1 1-4.5L16.5 4.5Z" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
      );
    case "grid":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" />
          <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
          <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" />
          <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7.5V12l3 2" />
        </svg>
      );
  }
}

function FolderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  );
}

/* ─────────────────────────────────────────
   Update pill — state machine, не keyframes.
   Каждая фаза цикла — явное состояние с
   собственной длительностью, переходы между
   состояниями реализуются CSS-transition.
   Это устраняет рассинхрон, неизбежный при
   многоэтапных @keyframes (где opacity и width
   норовят перекрыться).

   Сценарий:
     hidden → enter → idle → exitIdle → shrink →
     loading → exitLoading → grow → done →
     exitDone → hidden → ...
   ───────────────────────────────────────── */

type PillPhase =
  | "hidden"
  | "enter"
  | "idle"
  | "exitIdle"
  | "shrink"
  | "loading"
  | "exitLoading"
  | "grow"
  | "done"
  | "exitDone"
  | "fadeOut";

const PHASE_DURATIONS: Record<PillPhase, number> = {
  hidden: 600,
  enter: 260,
  idle: 1400,
  exitIdle: 200,
  shrink: 280,
  loading: 1800,
  exitLoading: 200,
  grow: 280,
  done: 1200,
  exitDone: 200,
  fadeOut: 240,
};

const NEXT_PHASE: Record<PillPhase, PillPhase> = {
  hidden: "enter",
  enter: "idle",
  idle: "exitIdle",
  exitIdle: "shrink",
  shrink: "loading",
  loading: "exitLoading",
  exitLoading: "grow",
  grow: "done",
  done: "exitDone",
  exitDone: "fadeOut",
  fadeOut: "hidden",
};

function UpdatePill() {
  const [phase, setPhase] = useState<PillPhase>("hidden");

  useEffect(() => {
    const id = window.setTimeout(() => {
      setPhase((p) => NEXT_PHASE[p]);
    }, PHASE_DURATIONS[phase]);
    return () => window.clearTimeout(id);
  }, [phase]);

  // Видимость pill (opacity).
  // hidden, fadeOut → 0; всё остальное → 1.
  const pillVisible = phase !== "hidden" && phase !== "fadeOut";

  // Ширина pill.
  // hidden: 0 (мгновенный сброс перед новым циклом, без визуала — opacity уже 0).
  // shrink/loading/exitLoading: narrow.
  // exitDone/fadeOut: wide — pill растворяется на месте, не схлопывается.
  // остальное: wide.
  const widthMode: "zero" | "wide" | "narrow" =
    phase === "hidden"
      ? "zero"
      : phase === "shrink" || phase === "loading" || phase === "exitLoading"
      ? "narrow"
      : "wide";

  // Какой текст показывать в широкой фазе.
  const wideLabel: "update" | "updated" =
    phase === "grow" || phase === "done" || phase === "exitDone"
      ? "updated"
      : "update";

  // Видимость каждого слоя.
  const idleOpaque = phase === "idle";
  const loadingOpaque = phase === "loading";
  const doneOpaque = phase === "done";

  return (
    <span
      className={styles.updatePill}
      data-visible={pillVisible}
      data-width={widthMode}
      aria-hidden="true"
    >
      <span
        className={styles.updateLayer}
        data-opaque={idleOpaque}
        data-active={wideLabel === "update"}
      >
        <span className={styles.updateLabel}>Update</span>
      </span>
      <span className={styles.updateLayer} data-opaque={loadingOpaque}>
        <span className={styles.spinner}>
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="#5c71ab"
              strokeWidth="1.6"
            />
            <path
              d="M14 8a6 6 0 0 0-6-6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </span>
      <span
        className={styles.updateLayer}
        data-opaque={doneOpaque}
        data-active={wideLabel === "updated"}
      >
        <span className={styles.updateLabel}>Updated</span>
      </span>
    </span>
  );
}

function SidebarBody() {
  return (
    <>
      <div className={styles.chrome}>
        <div className={styles.chromeDots} aria-hidden="true">
          <span className={`${styles.dot} ${styles.dotRed}`} />
          <span className={`${styles.dot} ${styles.dotYellow}`} />
          <span className={`${styles.dot} ${styles.dotGreen}`} />
        </div>
        <div className={styles.chromeSysGroup} aria-hidden="true">
          <span className={styles.chromeSysBtn}>
            <svg viewBox="0 0 16 16" width="18" height="18" fill="none" aria-hidden="true">
              <rect x="1.6" y="2.8" width="12.8" height="10.4" rx="2" stroke="currentColor" />
              <path d="M6 3v10" stroke="currentColor" />
            </svg>
          </span>
          <span className={styles.chromeSysBtn}>
            <svg viewBox="0 0 16 16" width="18" height="18" fill="none" aria-hidden="true">
              <path d="M10 3.5 5.5 8l4.5 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.5 8h7" stroke="currentColor" strokeLinecap="round" />
            </svg>
          </span>
          <span className={styles.chromeSysBtn}>
            <svg viewBox="0 0 16 16" width="18" height="18" fill="none" aria-hidden="true">
              <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3.5 8h7" stroke="currentColor" strokeLinecap="round" />
            </svg>
          </span>
        </div>
        <UpdatePill />
      </div>

      <ul className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <li key={item.label} className={styles.navItem}>
            <span className={styles.navIcon}>
              <NavIcon kind={item.icon} />
            </span>
            <span className={styles.navLabel}>{item.label}</span>
            {item.shortcut ? (
              <span className={styles.shortcut} aria-hidden="true">
                {item.shortcut.join("")}
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <div className={styles.sectionTitle}>
        <span className={styles.sectionTitleText}>
          Projects
          <span className={styles.sectionChevron} aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </span>
        <span className={styles.sectionActions} aria-hidden="true">
          <span className={styles.sectionAction} title="Collapse all">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* двойной chevron — закрыть все группы. */}
              <path d="m6 6 6 6 6-6" />
              <path d="m6 13 6 6 6-6" />
            </svg>
          </span>
          <span className={styles.sectionAction} title="More">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
              <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
              <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <span className={styles.sectionAction} title="New folder">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v3" />
              <path d="M3 8v9a2 2 0 0 0 2 2h7" />
              <path d="M17 14v6M14 17h6" />
            </svg>
          </span>
        </span>
      </div>

      <ul className={styles.projects}>
        {PROJECTS.map((project) => (
          <li key={project.name} className={styles.project}>
            <div className={styles.projectHead}>
              <span className={styles.projectIcon}>
                <FolderIcon />
              </span>
              <span className={styles.projectName}>{project.name}</span>
            </div>
            {project.empty ? (
              <p className={styles.projectEmpty}>No chats</p>
            ) : (
              <ul className={styles.chats}>
                {project.chats.map((chat) => (
                  <li key={chat.title} className={styles.chatRow}>
                    <span className={styles.chatTitle}>{chat.title}</span>
                    <span className={styles.chatAge}>{chat.age}</span>
                  </li>
                ))}
                {project.more ? (
                  <li className={styles.showMore}>Show more</li>
                ) : null}
              </ul>
            )}
          </li>
        ))}
      </ul>

      <div className={styles.footer}>
        <span className={styles.footerSettings}>
          <span className={styles.footerIcon}>
            <svg viewBox="0 0 16 16" width="18" height="18" fill="none" aria-hidden="true">
              {/* Gear: 8 трапециевидных зубцов по кругу,
                  внутренний контур + ось вращения. */}
              <path
                d="M8 1.6c.3 0 .58.21.65.5l.27 1.13c.5.12.97.31 1.4.57l.97-.62a.67.67 0 0 1 .82.1l.61.6c.23.23.27.59.1.82l-.62.98c.26.43.46.9.58 1.4l1.12.27c.3.07.5.36.5.65v.86c0 .3-.21.58-.5.65l-1.12.27c-.12.5-.32.97-.58 1.4l.62.98c.17.23.13.59-.1.82l-.61.6a.67.67 0 0 1-.82.1l-.97-.62c-.43.26-.9.45-1.4.57l-.27 1.13a.67.67 0 0 1-.65.5h-.86a.67.67 0 0 1-.65-.5l-.27-1.13a4.65 4.65 0 0 1-1.4-.57l-.97.62a.67.67 0 0 1-.82-.1l-.61-.6a.67.67 0 0 1-.1-.82l.62-.98a4.66 4.66 0 0 1-.58-1.4l-1.12-.27a.67.67 0 0 1-.5-.65v-.86c0-.3.21-.58.5-.65l1.12-.27c.12-.5.32-.97.58-1.4l-.62-.98a.67.67 0 0 1 .1-.82l.61-.6a.67.67 0 0 1 .82-.1l.97.62c.43-.26.9-.45 1.4-.57l.27-1.13c.07-.29.35-.5.65-.5h.86Z"
                stroke="currentColor"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="8" r="2.2" stroke="currentColor" />
            </svg>
          </span>
          <span>Settings</span>
        </span>
        <span className={styles.footerActions}>
          <span className={styles.footerPhone} aria-hidden="true">
            <svg viewBox="0 0 12 18" width="13" height="18" fill="none">
              <rect x="0.6" y="0.6" width="10.8" height="16.8" rx="1.8" stroke="currentColor" />
              <path d="M4.6 14.6h2.8" stroke="currentColor" strokeLinecap="round" />
            </svg>
          </span>
          <span className={styles.upgrade}>Upgrade</span>
        </span>
      </div>
    </>
  );
}

export default function AgenticWorkflowLab() {
  return (
    <div className={styles.root} aria-label="Agentic Workflow — превью сайдбара">
      <div className={styles.split}>
        <div className={`${styles.pane} ${styles.paneTop}`} aria-hidden="false">
          <div className={styles.sidebar}>
            <SidebarBody />
          </div>
        </div>
        <div className={`${styles.pane} ${styles.paneBottom}`} aria-hidden="true">
          <div className={styles.sidebar}>
            <SidebarBody />
          </div>
        </div>
      </div>
    </div>
  );
}
