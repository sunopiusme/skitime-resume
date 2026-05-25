"use client";

import type { ReactNode } from "react";

import styles from "./AgenticWorkflowLab.module.css";

/* ─────────────────────────────────────────
   Превью сайдбара ADE. Один длинный сайдбар
   мысленно режется по горизонтали пополам и
   раскладывается в две колонки: слева верх,
   справа низ. На месте реза — мягкий уход
   панели в фон, без рамки и без анимации.
   ───────────────────────────────────────── */

type ChatItem = { id: string; label: string; age: string };

type SidebarFolder =
  | {
      id: string;
      name: string;
      open: true;
      items: readonly ChatItem[];
      showMore?: boolean;
    }
  | {
      id: string;
      name: string;
      open: false;
      empty?: boolean;
    };

const ACTIONS = [
  { id: "new", icon: "pencil", label: "New chat" },
  { id: "search", icon: "search", label: "Search" },
  { id: "plugins", icon: "plugins", label: "Plugins" },
  { id: "automations", icon: "clock", label: "Automations" },
] as const;

const TOP_FOLDERS: readonly SidebarFolder[] = [
  {
    id: "zenpulse",
    name: "ZenPulse",
    open: true,
    items: [
      { id: "z1", label: "Quick setup — if you've don…", age: "2mo" },
      { id: "z2", label: "в chatinput в настрой дня е…", age: "2mo" },
      { id: "z3", label: "после ввода в инпут в наст…", age: "2mo" },
      { id: "z4", label: "нужно пересмотреть дизай…", age: "2mo" },
      { id: "z5", label: "[Image #1] на главной стра…", age: "2mo" },
    ],
    showMore: true,
  },
  { id: "horizon-top", name: "horizon-sprint", open: false },
];

const BOTTOM_FOLDERS: readonly SidebarFolder[] = [
  {
    id: "horizon-bottom",
    name: "horizon-sprint",
    open: true,
    items: [
      { id: "h1", label: "Найди физику бега персон…", age: "2mo" },
      { id: "h2", label: "Найди практики для ТМА и…", age: "2mo" },
      { id: "h3", label: "Fix missing initTelegram mo…", age: "2mo" },
      { id: "h4", label: "Переработать UI 456 Runner…", age: "2mo" },
      { id: "h5", label: "Интегрировать Telegram Mi…", age: "2mo" },
    ],
    showMore: true,
  },
  { id: "cmux", name: "cmux", open: false, empty: true },
  { id: "glim", name: "Glim", open: false },
];

function Icon({ name }: { name: string }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "pencil":
      return (
        <svg {...common}>
          <path d="M11.5 2.5l2 2-8 8H3.5v-2z" />
          <path d="M10 4l2 2" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="7" cy="7" r="4.2" />
          <path d="M10.2 10.2L13.5 13.5" />
        </svg>
      );
    case "plugins":
      return (
        <svg {...common}>
          <rect x="2.5" y="2.5" width="4" height="4" rx="0.8" />
          <rect x="9.5" y="2.5" width="4" height="4" rx="0.8" />
          <rect x="2.5" y="9.5" width="4" height="4" rx="0.8" />
          <rect x="9.5" y="9.5" width="4" height="4" rx="0.8" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="5.5" />
          <path d="M8 5v3l2 1.4" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M2.5 5l2-2h3l1.5 1.5h4.5v7a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1z" />
        </svg>
      );
    case "gear":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="2" />
          <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <rect x="5" y="2" width="6" height="12" rx="1.2" />
          <path d="M7.5 12.5h1" />
        </svg>
      );
    default:
      return null;
  }
}

function Folder({ folder }: { folder: SidebarFolder }) {
  return (
    <div className={styles.folder}>
      <div className={styles.folderHead}>
        <span className={styles.folderIcon} aria-hidden="true">
          <Icon name="folder" />
        </span>
        <span className={styles.folderName}>{folder.name}</span>
      </div>
      {folder.open ? (
        <ul className={styles.chatList}>
          {folder.items.map((item) => (
            <li key={item.id} className={styles.chatItem}>
              <span className={styles.chatLabel}>{item.label}</span>
              <span className={styles.chatAge}>{item.age}</span>
            </li>
          ))}
          {folder.showMore ? (
            <li className={styles.chatMore}>
              <span>Show more</span>
            </li>
          ) : null}
        </ul>
      ) : folder.empty ? (
        <p className={styles.chatEmpty}>No chats</p>
      ) : null}
    </div>
  );
}

function SidebarShell({
  variant,
  showChrome,
  showFooter,
  children,
}: {
  variant: "top" | "bottom";
  showChrome?: boolean;
  showFooter?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={styles.shell} data-variant={variant}>
      {showChrome ? (
        <div className={styles.chrome} aria-hidden="true">
          <span className={`${styles.dot} ${styles.dotRed}`} />
          <span className={`${styles.dot} ${styles.dotYellow}`} />
          <span className={`${styles.dot} ${styles.dotGreen}`} />
          <span className={styles.chromeSpacer} />
          <span className={styles.chromeArrow}>‹</span>
          <span className={styles.chromeArrow}>›</span>
        </div>
      ) : null}
      <div className={styles.body}>{children}</div>
      {showFooter ? (
        <div className={styles.footer}>
          <span className={styles.footerItem}>
            <Icon name="gear" />
            <span>Settings</span>
          </span>
          <span className={styles.footerIcon} aria-hidden="true">
            <Icon name="phone" />
          </span>
          <span className={styles.upgrade}>Upgrade</span>
        </div>
      ) : null}
    </div>
  );
}

export default function AgenticWorkflowLab() {
  return (
    <div className={styles.root} aria-label="Превью сайдбара ADE">
      <SidebarShell variant="top" showChrome>
        <ul className={styles.actions}>
          {ACTIONS.map((action) => (
            <li key={action.id} className={styles.action}>
              <span className={styles.actionIcon} aria-hidden="true">
                <Icon name={action.icon} />
              </span>
              <span className={styles.actionLabel}>{action.label}</span>
            </li>
          ))}
        </ul>

        <p className={styles.sectionLabel}>Projects</p>

        <div className={styles.folderList}>
          {TOP_FOLDERS.map((folder) => (
            <Folder key={folder.id} folder={folder} />
          ))}
        </div>
      </SidebarShell>

      <SidebarShell variant="bottom" showFooter>
        <div className={styles.folderList}>
          {BOTTOM_FOLDERS.map((folder) => (
            <Folder key={folder.id} folder={folder} />
          ))}
        </div>
      </SidebarShell>
    </div>
  );
}
