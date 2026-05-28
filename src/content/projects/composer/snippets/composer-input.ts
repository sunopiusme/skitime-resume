import type { DiffMarker, SupportedLanguage } from "@/lib/code/highlight";

/* ─────────────────────────────────────────
   Composer input — diff фрагмент.

   Снимок описывает рефакторинг toolbar'а:
   из плоского набора статичных chip'ов
   композер собрался в композицию из
   независимых picker-модулей. Каждый
   picker — отдельный файл с собственным
   state (open / search / selection),
   геометрия унифицирована токенами
   --c-card-radius / --c-row-radius.
   ───────────────────────────────────────── */

export const composerInputSnippet: {
  code: string;
  lang: SupportedLanguage;
  path: string;
  diff?: DiffMarker[];
} = {
  path: "src/features/projects/composer/live/composer-input/ComposerInput.tsx",
  lang: "tsx",
  diff: [
    // 1: import header
    null,
    // 2: useState
    null,
    // 3: empty
    null,
    // 4: import styles
    null,
    // 5: pickers imports
    "add",
    // 6: pickers imports
    "add",
    // 7: pickers imports
    "add",
    // 8: pickers imports
    "add",
    // 9: empty
    null,
    // 10: export default function
    null,
    // 11: state planMode
    null,
    // 12: state permission removed (старая static)
    "remove",
    // 13: state permission added (новый picker)
    "add",
    // 14: state model
    "add",
    // 15: state project
    "add",
    // 16: state environment
    "add",
    // 17: state branch
    "add",
    // 18: empty
    null,
    // 19: return
    null,
    // 20: card div open
    null,
    // 21: PromptInput
    null,
    // 22: empty
    null,
    // 23: toolbar open
    null,
    // 24: toolbarLeft
    null,
    // 25: PlusDropdown — заменён static span
    "remove",
    // 26: PlusDropdown — компонент
    "add",
    // 27: permission static — заменён
    "remove",
    // 28: PermissionPicker
    "add",
    // 29: empty
    null,
    // 30: toolbarRight
    null,
    // 31: ModelChip static — заменён
    "remove",
    // 32: ModelPicker
    "add",
    // 33: send button
    null,
    // 34: closing toolbar
    null,
    // 35: closing card
    null,
    // 36: empty
    null,
    // 37: context start
    null,
    // 38: ProjectChip static — удалён
    "remove",
    // 39: ProjectPicker
    "add",
    // 40: EnvChip static — удалён
    "remove",
    // 41: EnvironmentPicker
    "add",
    // 42: BranchChip static — удалён
    "remove",
    // 43: BranchPicker
    "add",
    // 44: closing context
    null,
    // 45: closing return
    null,
    // 46: closing function
    null,
  ],
  code: `"use client";

import { useState } from "react";

import styles from "./ComposerInput.module.css";
import { PermissionPicker } from "./permissions/PermissionPicker";
import { ModelPicker } from "./models/ModelPicker";
import { ProjectPicker } from "./projects/ProjectPicker";
import { EnvironmentPicker } from "./environment/EnvironmentPicker";
import { BranchPicker } from "./branches/BranchPicker";

export default function ComposerInput() {
  const [planMode, setPlanMode] = useState(false);
  const [permission, setPermission] = useState("standard");
  const [permission, setPermission] = useState<PermissionLevel>("standard");
  const [selection, setSelection] = useState(DEFAULT_SELECTION);
  const [project, setProject] = useState(DEFAULT_PROJECT);
  const [environment, setEnvironment] = useState("local");
  const [branch, setBranch] = useState(DEFAULT_BRANCH);

  return (
    <div className={styles.card}>
      <PromptInput />

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.iconBtn}><PlusIcon /></span>
          <PlusDropdown planMode={planMode} onPlanModeChange={setPlanMode} />
          <span className={styles.permission}>Стандартный доступ</span>
          <PermissionPicker level={permission} onChange={setPermission} />
        </div>

        <div className={styles.toolbarRight}>
          <span className={styles.modelChip}>5.5 Высокий</span>
          <ModelPicker selection={selection} onChange={setSelection} />
          <span className={styles.sendBtn}><ArrowUpIcon /></span>
        </div>
      </div>
    </div>

    <div className={styles.context}>
      <span className={styles.footChip}>skitime-resume</span>
      <ProjectPicker selection={project} onChange={setProject} />
      <span className={styles.footChip}>Локально</span>
      <EnvironmentPicker mode={environment} onChange={setEnvironment} />
      <span className={styles.footChip}>main</span>
      <BranchPicker branch={branch} onChange={setBranch} />
    </div>
  );
}`,
};
