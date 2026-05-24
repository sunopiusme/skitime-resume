import styles from "./ComposerInput.module.css";

/* ─────────────────────────────────────────
   Иконки. Все 1.5 px stroke, currentColor.
   Намеренно простые SVG — без зависимостей.
   ───────────────────────────────────────── */

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function HandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 11V5.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M14 11V4.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M17 11V6.5a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-1a5 5 0 0 1-4-2L6.5 14a1.5 1.5 0 0 1 2.4-1.8L11 14" />
      <path d="M11 11V8" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11v1a7 7 0 0 0 14 0v-1" />
      <path d="M12 19v3" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5" strokeLinecap="round" />
      <circle cx="12" cy="16.25" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function RepoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v14H6.5a2.5 2.5 0 0 0 0 5H19" />
      <path d="M4 5.5V20a2.5 2.5 0 0 0 2.5 2.5" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="4" width="19" height="13" rx="2" />
      <path d="M8.5 21h7M12 17v4" />
    </svg>
  );
}

function BranchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="5" r="2" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="7" r="2" />
      <path d="M6 7v10" />
      <path d="M18 9c0 4-4 4-6 5" />
    </svg>
  );
}

/* ─────────────────────────────────────────
   Композиция. Статичная, читается как
   единый кадр интерфейса — повторяет
   референс Codex 1:1, но в нашей светлой
   монохромной палитре и на русском.
   ───────────────────────────────────────── */

export default function ComposerInput() {
  return (
    <div className={styles.root} aria-label="Демонстрация composer input">
      <div className={styles.stack}>
        <div className={styles.warning} role="status">
          <span className={styles.warningIcon} aria-hidden="true">
            <WarningIcon />
          </span>
          <span className={styles.warningText}>Перед запуском нужно проверить 3 хука</span>
          <span className={styles.warningAction}>Проверить хуки</span>
        </div>

        <div className={styles.card}>
          <p className={styles.placeholder}>
            Опишите задачу. @ — файлы, плагины и контекст проекта
          </p>

          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <span className={styles.iconBtn} aria-hidden="true">
                <PlusIcon />
              </span>
              <span className={styles.permission}>
                <span className={styles.permissionIcon} aria-hidden="true">
                  <HandIcon />
                </span>
                Стандартный доступ
                <span className={styles.chevron} aria-hidden="true">
                  <ChevronIcon />
                </span>
              </span>
            </div>

            <div className={styles.toolbarRight}>
              <span className={styles.modelChip}>
                <span className={styles.modelValue}>5.5</span>
                <span className={styles.modelLabel}>Высокий</span>
                <span className={styles.chevron} aria-hidden="true">
                  <ChevronIcon />
                </span>
              </span>
              <span className={styles.iconBtn} aria-hidden="true">
                <MicIcon />
              </span>
              <span className={styles.sendBtn} aria-label="Отправить">
                <ArrowUpIcon />
              </span>
            </div>
          </div>
        </div>

        <div className={styles.context}>
          <span className={styles.footChip}>
            <span className={styles.footIcon} aria-hidden="true">
              <RepoIcon />
            </span>
            skitime-resume
            <span className={styles.chevron} aria-hidden="true">
              <ChevronIcon />
            </span>
          </span>
          <span className={styles.footChip}>
            <span className={styles.footIcon} aria-hidden="true">
              <MonitorIcon />
            </span>
            Локально
            <span className={styles.chevron} aria-hidden="true">
              <ChevronIcon />
            </span>
          </span>
          <span className={styles.footChip}>
            <span className={styles.footIcon} aria-hidden="true">
              <BranchIcon />
            </span>
            main
            <span className={styles.chevron} aria-hidden="true">
              <ChevronIcon />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
