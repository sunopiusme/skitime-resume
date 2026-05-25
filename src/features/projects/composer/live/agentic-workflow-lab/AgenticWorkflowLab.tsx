"use client";

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

const NAV_ITEMS = [
  { icon: "edit", label: "New chat" },
  { icon: "search", label: "Search" },
  { icon: "grid", label: "Plugins" },
  { icon: "clock", label: "Automations" },
] as const;

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

function NavIcon({ kind }: { kind: (typeof NAV_ITEMS)[number]["icon"] }) {
  const stroke = "currentColor";
  switch (kind) {
    case "edit":
      return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
          <path d="M2.5 13.5h11" stroke={stroke} strokeLinecap="round" />
          <path
            d="M10.5 2.8a1.2 1.2 0 0 1 1.7 1.7l-7 7-2.4.7.7-2.4 7-7Z"
            stroke={stroke}
            strokeLinejoin="round"
          />
        </svg>
      );
    case "search":
      return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="4.2" stroke={stroke} />
          <path d="m10.2 10.2 3 3" stroke={stroke} strokeLinecap="round" />
        </svg>
      );
    case "grid":
      return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
          <rect x="2.5" y="2.5" width="4" height="4" rx="0.6" stroke={stroke} />
          <rect x="9.5" y="2.5" width="4" height="4" rx="0.6" stroke={stroke} />
          <rect x="2.5" y="9.5" width="4" height="4" rx="0.6" stroke={stroke} />
          <rect x="9.5" y="9.5" width="4" height="4" rx="0.6" stroke={stroke} />
        </svg>
      );
    case "clock":
      return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="5.5" stroke={stroke} />
          <path d="M8 5v3l2 1.5" stroke={stroke} strokeLinecap="round" />
        </svg>
      );
  }
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
      <path
        d="M2.5 4.4c0-.5.4-.9.9-.9h2.6l1.3 1.3h5.4c.5 0 .9.4.9.9v6.5c0 .5-.4.9-.9.9H3.4a.9.9 0 0 1-.9-.9V4.4Z"
        stroke="currentColor"
      />
    </svg>
  );
}

function SidebarBody() {
  return (
    <>
      <div className={styles.chrome} aria-hidden="true">
        <span className={`${styles.dot} ${styles.dotRed}`} />
        <span className={`${styles.dot} ${styles.dotYellow}`} />
        <span className={`${styles.dot} ${styles.dotGreen}`} />
        <span className={styles.toggleSidebar}>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
            <rect x="1.6" y="2.8" width="12.8" height="10.4" rx="2" stroke="currentColor" />
            <path d="M6 3v10" stroke="currentColor" />
          </svg>
        </span>
        <span className={styles.chromeArrow}>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
            <path d="M10 3.5 5.5 8l4.5 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.5 8h7" stroke="currentColor" strokeLinecap="round" />
          </svg>
        </span>
        <span className={styles.chromeArrow}>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
            <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.5 8h7" stroke="currentColor" strokeLinecap="round" />
          </svg>
        </span>
      </div>

      <ul className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <li key={item.label} className={styles.navItem}>
            <span className={styles.navIcon}>
              <NavIcon kind={item.icon} />
            </span>
            <span className={styles.navLabel}>{item.label}</span>
          </li>
        ))}
      </ul>

      <p className={styles.sectionTitle}>Projects</p>

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
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="2" stroke="currentColor" />
            <path
              d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4M12.6 12.6l-1.4-1.4M4.8 4.8 3.4 3.4"
              stroke="currentColor"
              strokeLinecap="round"
            />
          </svg>
          <span>Settings</span>
        </span>
        <span className={styles.footerActions}>
          <span className={styles.footerPhone} aria-hidden="true">
            <svg viewBox="0 0 16 16" width="12" height="20" fill="none">
              <rect x="3.5" y="1.5" width="9" height="13" rx="1.6" stroke="currentColor" />
              <path d="M7 12.5h2" stroke="currentColor" strokeLinecap="round" />
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
