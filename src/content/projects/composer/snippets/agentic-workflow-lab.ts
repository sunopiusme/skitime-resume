import type { SupportedLanguage } from "@/lib/code/highlight";

export const agenticWorkflowLabSnippet: {
  code: string;
  lang: SupportedLanguage;
  path: string;
} = {
  path: "src/features/projects/composer/live/agentic-workflow-lab/AgenticWorkflowLab.tsx",
  lang: "typescript",
  code: `"use client";

// Один сайдбар, мысленно разрезанный пополам и
// разложенный в две колонки. По линии реза каждая
// половина уходит в фон через mask-image — без рамок,
// прогрессов и анимаций.

function SidebarShell({ variant, children }: Props) {
  return (
    <div className={styles.shell} data-variant={variant}>
      {children}
    </div>
  );
}

export default function AgenticWorkflowLab() {
  return (
    <div className={styles.root} aria-label="Превью сайдбара ADE">
      <SidebarShell variant="top">
        <Actions />
        <p className={styles.sectionLabel}>Projects</p>
        <FolderList folders={TOP_FOLDERS} />
      </SidebarShell>

      <SidebarShell variant="bottom">
        <FolderList folders={BOTTOM_FOLDERS} />
        <Footer />
      </SidebarShell>
    </div>
  );
}`,
};
