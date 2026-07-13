import type { DiffMarker, SupportedLanguage } from "@/lib/code/highlight";

/* ─────────────────────────────────────────
   Sidebar как рабочий архив, а не панель тревоги.

   Снимок сжат до сути диффа: чаты становятся
   сессиями с явным статусом, веткой и
   evidence-сигналом. Данные PROJECTS, SVG-спиннер
   и футер вынесены за кадр — они не несут
   архитектурного решения и раздували блок
   до сотни строк.
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
    // 1: ChatItem — удалён
    "remove",
    // 2: SessionStatus
    "add",
    // 3: SessionItem {
    "add",
    // 4: title
    "add",
    // 5: branch
    "add",
    // 6: evidence
    "add",
    // 7: status
    "add",
    // 8: }
    "add",
    // 9: ProjectGroup (chats) — удалён
    "remove",
    // 10: ProjectGroup (sessions)
    "add",
    // 11: empty
    null,
    // 12: SessionState fn
    "add",
    // 13: running → spinner
    "add",
    // 14: return (
    "add",
    // 15: span state
    "add",
    // 16: review | done
    "add",
    // 17: </span>
    "add",
    // 18: );
    "add",
    // 19: }
    "add",
    // 20: empty
    null,
    // 21: SidebarBody
    null,
    // 22: return
    null,
    // 23: ul projects
    null,
    // 24: PROJECTS.map
    null,
    // 25: li project
    null,
    // 26: projectHead
    null,
    // 27: ul sessions
    null,
    // 28: chats.map — удалён
    "remove",
    // 29: chatRow — удалён
    "remove",
    // 30: sessions.map
    "add",
    // 31: sessionRow
    "add",
    // 32: sessionMain
    "add",
    // 33: sessionTitle
    "add",
    // 34: sessionMeta
    "add",
    // 35: branch · evidence
    "add",
    // 36: /sessionMeta
    "add",
    // 37: /sessionMain
    "add",
    // 38: SessionState
    "add",
    // 39: /li
    "add",
    // 40: ))}
    null,
    // 41: /ul
    null,
    // 42: /li
    null,
    // 43: ))}
    null,
    // 44: /ul
    null,
    // 45: );
    null,
    // 46: }
    null,
  ],
  code: `type ChatItem = { title: string; age: string; active?: boolean };
type SessionStatus = "running" | "review" | "done";
type SessionItem = {
  title: string;
  branch: string;
  evidence: string;
  status: SessionStatus;
};
type ProjectGroup = { name: string; chats: ChatItem[] };
type ProjectGroup = { name: string; sessions: SessionItem[] };

function SessionState({ status }: { status: SessionStatus }) {
  if (status === "running") return <Spinner label="Агент выполняет работу" />;
  return (
    <span className={styles.sessionState} data-status={status}>
      {status === "review" ? "Ревью" : "Готово"}
    </span>
  );
}

function SidebarBody() {
  return (
    <ul className={styles.projects}>
      {PROJECTS.map((project) => (
        <li key={project.name} className={styles.project}>
          <div className={styles.projectHead}>{project.name}</div>
          <ul className={styles.sessions}>
            {project.chats.map((chat) => (
              <li className={styles.chatRow}>{chat.title}</li>
            {project.sessions.map((session) => (
              <li className={styles.sessionRow} data-status={session.status}>
                <span className={styles.sessionMain}>
                  <span className={styles.sessionTitle}>{session.title}</span>
                  <span className={styles.sessionMeta}>
                    {session.branch} · {session.evidence}
                  </span>
                </span>
                <SessionState status={session.status} />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}`,
};
