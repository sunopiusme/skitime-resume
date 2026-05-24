import type { SupportedLanguage } from "@/lib/code/highlight";

export const composerInputSnippet: {
  code: string;
  lang: SupportedLanguage;
  path: string;
} = {
  path: "src/features/projects/composer/live/composer-input/ComposerInput.tsx",
  lang: "tsx",
  code: `export default function ComposerInput() {
  return (
    <div className={styles.root}>
      <div className={styles.warning} role="status">
        <WarningIcon />
        <span className={styles.warningText}>
          Перед запуском нужно проверить 3 хука
        </span>
        <span className={styles.warningAction}>Проверить хуки</span>
      </div>

      <div className={styles.card}>
        <p className={styles.placeholder}>
          Опишите задачу. @ — файлы, плагины и контекст проекта
        </p>

        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <IconBtn><PlusIcon /></IconBtn>
            <Permission label="Стандартный доступ" />
          </div>
          <div className={styles.toolbarRight}>
            <ModelChip value="5.5" label="Высокий" />
            <IconBtn><MicIcon /></IconBtn>
            <SendBtn />
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <Chip icon={<RepoIcon />}>skitime-resume</Chip>
        <Chip icon={<MonitorIcon />}>Локально</Chip>
        <Chip icon={<BranchIcon />}>main</Chip>
      </div>
    </div>
  );
}`,
};
