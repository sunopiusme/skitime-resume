import type { SupportedLanguage } from "@/lib/code/highlight";

export const agenticWorkflowLabSnippet: {
  code: string;
  lang: SupportedLanguage;
  path: string;
} = {
  path: "src/features/projects/composer/live/agentic-workflow-lab/AgenticWorkflowLab.tsx",
  lang: "tsx",
  code: `"use client";

import styles from "./AgenticWorkflowLab.module.css";

type ChatItem = { title: string; age: string };
type ProjectGroup = { name: string; chats: ChatItem[]; more?: boolean; empty?: boolean };

const NAV_ITEMS = [
  { icon: "edit", label: "New chat" },
  { icon: "search", label: "Search" },
  { icon: "grid", label: "Plugins" },
  { icon: "clock", label: "Automations" },
] as const;

const PROJECTS: readonly ProjectGroup[] = [
  { name: "ZenPulse", chats: [/* ... */], more: true },
  { name: "horizon-sprint", chats: [/* ... */], more: true },
  { name: "cmux", chats: [], empty: true },
  { name: "Glim", chats: [] },
];

function SidebarBody() {
  return (
    <>
      <div className={styles.chrome} aria-hidden="true">{/* dots + tab + arrows */}</div>
      <ul className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <li key={item.label} className={styles.navItem}>
            <span className={styles.navIcon}><NavIcon kind={item.icon} /></span>
            <span className={styles.navLabel}>{item.label}</span>
          </li>
        ))}
      </ul>
      <p className={styles.sectionTitle}>Projects</p>
      <ul className={styles.projects}>{/* проекты и чаты */}</ul>
      <div className={styles.footer}>{/* Settings · Upgrade */}</div>
    </>
  );
}

export default function AgenticWorkflowLab() {
  return (
    <div className={styles.root}>
      <div className={styles.split}>
        <div className={\`\${styles.pane} \${styles.paneTop}\`}>
          <div className={styles.sidebar}><SidebarBody /></div>
          <div className={styles.fadeBottom} aria-hidden="true" />
        </div>
        <div className={\`\${styles.pane} \${styles.paneBottom}\`} aria-hidden="true">
          <div className={styles.sidebar}><SidebarBody /></div>
          <div className={styles.fadeTop} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}`,
};
