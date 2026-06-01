import type { DiffMarker, SupportedLanguage } from "@/lib/code/highlight";

/* ─────────────────────────────────────────
   Sidebar как рабочий архив, а не панель тревоги.

   Изменения показывают переход от обычного чата
   к структуре, где каждый проект держит историю
   проверяемой работы: сессии с явным статусом,
   временем и связью с pull request.

   Ключевые отличия от чат-интерфейса:
   • проекты группируют сессии, а не беседы,
   • каждая сессия привязана к ветке и задаче,
   • статус показывает этап работы (выполнение,
     проверка, ревью), а не просто «активно»,
   • footer держит системные действия: настройки,
     обновления, доступ к логам и diff.
   ───────────────────────────────────────── */

export const projectSidebarSnippet: {
  code: string;
  lang: SupportedLanguage;
  path: string;
  diff?: DiffMarker[];
} = {
  path: "src/features/projects/composer/live/project-sidebar/ProjectSidebar.tsx",
  lang: "tsx",
  diff: [
    null, // 1: "use client"
    null, // 2: empty
    null, // 3: import styles
    null, // 4: empty
    "remove", // 5: type ChatItem (старое название)
    "add", // 6: type SessionItem (новое)
    "remove", // 7: type ProjectGroup с chats
    "add", // 8: type ProjectGroup с sessions
    null, // 9: empty
    null, // 10: const NAV_ITEMS
    null, // 11: { icon: "edit"
    null, // 12: { icon: "search"
    null, // 13: { icon: "grid"
    null, // 14: { icon: "clock"
    null, // 15: ] as const
    null, // 16: empty
    null, // 17: const PROJECTS
    "remove", // 18: ZenPulse с chats
    "add", // 19: ZenPulse с sessions и статусами
    "remove", // 20: horizon-sprint с chats
    "add", // 21: horizon-sprint с sessions
    "remove", // 22: cmux empty: true
    "add", // 23: cmux с одной сессией
    null, // 24: Glim
    null, // 25: ]
    null, // 26: empty
    null, // 27: function SidebarBody
    null, // 28: return
    null, // 29: <>
    null, // 30: chrome
    null, // 31: <ul nav>
    null, // 32: NAV_ITEMS.map
    null, // 33: <li navItem>
    null, // 34: navIcon
    null, // 35: navLabel
    "add", // 36: shortcut hint
    null, // 37: </li>
    null, // 38: ))}
    null, // 39: </ul>
    null, // 40: empty
    "remove", // 41: <p sectionTitle>Projects</p>
    "add", // 42: <div sectionTitle> с actions
    null, // 43: empty
    "remove", // 44: <ul projects> без структуры
    "add", // 45: <ul projects> с session status
    null, // 46: empty
    null, // 47: footer
    null, // 48: </>
    null, // 49: }
    null, // 50: empty
    null, // 51: export default
    null, // 52: return root
    null, // 53: split
    null, // 54: paneTop
    null, // 55: paneBottom
    null, // 56: closing
    null, // 57: }
    null, // 58: empty
    null, // 59: comment mask
  ],
  code: `"use client";

import styles from "./ProjectSidebar.module.css";

type ChatItem = { title: string; age: string };
type SessionItem = { title: string; age: string; status?: "running" | "review" | "done" };
type ProjectGroup = { name: string; chats: ChatItem[]; more?: boolean; empty?: boolean };
type ProjectGroup = { name: string; sessions: SessionItem[]; more?: boolean; empty?: boolean };

const NAV_ITEMS = [
  { icon: "edit", label: "Новый чат", shortcut: ["⌘", "N"] },
  { icon: "search", label: "Поиск", shortcut: ["⌘", "G"] },
  { icon: "grid", label: "Плагины" },
  { icon: "clock", label: "Автоматизации" },
] as const;

const PROJECTS: readonly ProjectGroup[] = [
  { name: "ZenPulse", chats: [{ title: "Быстрая настройка...", age: "2мес" }], more: true },
  { name: "ZenPulse", sessions: [{ title: "Быстрая настройка...", age: "2мес", status: "done" }], more: true },
  { name: "horizon-sprint", chats: [{ title: "Найти физику бега...", age: "2мес" }], more: true },
  { name: "horizon-sprint", sessions: [{ title: "Найти физику бега...", age: "2мес", status: "review" }], more: true },
  { name: "cmux", chats: [], empty: true },
  { name: "cmux", sessions: [{ title: "Рефакторинг auth flow", age: "1д", status: "running" }] },
  { name: "Glim", sessions: [] },
];

function SidebarBody() {
  return (
    <>
      <div className={styles.chrome}>{/* dots + system buttons + update pill */}</div>
      <ul className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <li key={item.label} className={styles.navItem}>
            <span className={styles.navIcon}><NavIcon kind={item.icon} /></span>
            <span className={styles.navLabel}>{item.label}</span>
            {item.shortcut && <span className={styles.shortcut}>{item.shortcut.join("")}</span>}
          </li>
        ))}
      </ul>

      <p className={styles.sectionTitle}>Проекты</p>
      <div className={styles.sectionTitle}>
        <span>Проекты</span>
        <span className={styles.sectionActions}>{/* collapse · more · new folder */}</span>
      </div>

      <ul className={styles.projects}>{/* список проектов и чатов */}</ul>
      <ul className={styles.projects}>
        {PROJECTS.map(project => (
          <li key={project.name}>
            <div className={styles.projectHead}>{project.name}</div>
            {project.sessions.map(session => (
              <div key={session.title} className={styles.sessionRow} data-status={session.status}>
                <span>{session.title}</span>
                <span>{session.age}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>

      <div className={styles.footer}>{/* Настройки · Улучшить */}</div>
    </>
  );
}

export default function ProjectSidebar() {
  return (
    <div className={styles.root}>
      <div className={styles.split}>
        <div className={\`\${styles.pane} \${styles.paneTop}\`}><SidebarBody /></div>
        <div className={\`\${styles.pane} \${styles.paneBottom}\`} aria-hidden="true"><SidebarBody /></div>
      </div>
    </div>
  );
}

// Разрез сайдбара: верхняя половина показывает навигацию и начало проектов,
// нижняя — хвост списка и футер. Между ними пустота страницы, потому что
// в ADE пауза важнее декоративного разделителя.`,
};
