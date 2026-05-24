export type ResearchSourceType = "official" | "community" | "academic" | "category";

export type ResearchSource = {
  id: string;
  name: string;
  type: ResearchSourceType;
  surface: string;
  url: string;
  signal: string;
  coded: readonly ResearchCode[];
};

export type ResearchCode =
  | "orchestration"
  | "permissions"
  | "context"
  | "verification"
  | "specs"
  | "parallelism"
  | "friction"
  | "trust";

export type Capability = {
  key: ResearchCode;
  label: string;
};

export type FrictionSignal = {
  label: string;
  score: 1 | 2 | 3 | 4 | 5;
  evidence: string;
};

export type WorkflowStep = {
  label: string;
  detail: string;
};

export type EvidenceItem = {
  label: string;
  detail: string;
  strength: 1 | 2 | 3 | 4 | 5;
};

export const researchSources: readonly ResearchSource[] = [
  {
    id: "addy",
    name: "Addy ADE",
    type: "category",
    surface: "панель управления",
    url: "https://addy.md/",
    signal: "ADE описывается как среда для нескольких агентов, планов, браузера, консоли, MCP и памяти проекта.",
    coded: ["orchestration", "context", "parallelism", "verification"],
  },
  {
    id: "codex",
    name: "OpenAI Codex",
    type: "official",
    surface: "облачная задача",
    url: "https://developers.openai.com/codex/cloud",
    signal: "Фоновые и параллельные задачи, связка с GitHub, AGENTS.md и управляемое окружение.",
    coded: ["parallelism", "context", "verification", "permissions"],
  },
  {
    id: "claude",
    name: "Claude Code",
    type: "official",
    surface: "терминал / IDE",
    url: "https://code.claude.com/docs/en/hooks",
    signal: "Hooks, режимы доступа, пути к transcript, MCP и события задач/сабагентов.",
    coded: ["permissions", "context", "verification", "orchestration"],
  },
  {
    id: "antigravity",
    name: "Google Antigravity",
    type: "official",
    surface: "редактор + менеджер",
    url: "https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/",
    signal: "Editor View и Manager Surface: асинхронные агенты, артефакты и проверка работы через результат, а не через обещания.",
    coded: ["orchestration", "parallelism", "verification", "trust"],
  },
  {
    id: "kiro",
    name: "AWS Kiro",
    type: "official",
    surface: "спеки в IDE",
    url: "https://aws.amazon.com/documentation-overview/kiro/",
    signal: "Спеки, планы реализации, документация, тесты, steering-файлы и agent hooks.",
    coded: ["specs", "context", "verification", "permissions"],
  },
  {
    id: "copilot",
    name: "GitHub Copilot coding agent",
    type: "official",
    surface: "issue / PR",
    url: "https://docs.github.com/en/copilot/using-github-copilot/coding-agent/about-assigning-tasks-to-copilot",
    signal: "Делегирование задачи из GitHub-поверхностей: фоновая работа заканчивается pull request.",
    coded: ["orchestration", "parallelism", "verification", "trust"],
  },
  {
    id: "augment",
    name: "Augment ADE guide",
    type: "category",
    surface: "рамка категории",
    url: "https://www.augmentcode.com/guides/what-is-an-agentic-development-environment",
    signal: "ADE объясняется через оркестрацию, жизненный цикл агентной работы и архитектурный слой управления.",
    coded: ["orchestration", "permissions", "parallelism", "verification"],
  },
  {
    id: "arxiv",
    name: "Claude Code system paper",
    type: "academic",
    surface: "дизайн системы",
    url: "https://arxiv.org/abs/2604.14228",
    signal: "Система прав, сжатие контекста, MCP, плагины, skills, hooks, сабагенты и изоляция worktree.",
    coded: ["permissions", "context", "parallelism", "trust"],
  },
  {
    id: "community",
    name: "Отзывы сообщества",
    type: "community",
    surface: "Product Hunt / Reddit / форумы",
    url: "https://www.producthunt.com/",
    signal: "Повторяющиеся сигналы: стоимость, лимиты, потеря контекста, доверие к diff и нагрузка на ревью.",
    coded: ["friction", "trust", "context", "verification"],
  },
] as const;

export const capabilities: readonly Capability[] = [
  { key: "orchestration", label: "оркестрация" },
  { key: "permissions", label: "права" },
  { key: "context", label: "контекст" },
  { key: "verification", label: "проверка" },
  { key: "specs", label: "спеки" },
  { key: "parallelism", label: "параллельность" },
] as const;

export const frictionSignals: readonly FrictionSignal[] = [
  {
    label: "стоимость / лимиты",
    score: 4,
    evidence: "В отзывах часто обсуждают цену длинных сессий, лимиты и непредсказуемый расход.",
  },
  {
    label: "риск доверия",
    score: 5,
    evidence: "Пользователи хотят видеть diff, тесты, trace и понятную точку человеческой проверки.",
  },
  {
    label: "потеря контекста",
    score: 4,
    evidence: "Повторяется проблема: агент теряет замысел задачи или опирается на устаревший контекст.",
  },
  {
    label: "ошибки доступа",
    score: 3,
    evidence: "Чем шире доступ к инструментам, тем важнее песочница, подтверждения и ясные права на команды.",
  },
  {
    label: "нагрузка ревью",
    score: 5,
    evidence: "Автономность не отменяет проверку, а переносит нагрузку в доказательства и ревью pull request.",
  },
  {
    label: "разрыв процесса",
    score: 3,
    evidence: "Работа разъезжается между IDE, терминалом, браузером, GitHub, облачными сессиями и чатами.",
  },
] as const;

export const workflowSteps: readonly WorkflowStep[] = [
  { label: "намерение", detail: "задача и критерий успеха" },
  { label: "спека / план", detail: "план, декомпозиция, риски" },
  { label: "контекст", detail: "репозиторий, файлы, память" },
  { label: "доступ", detail: "песочница, сеть, подтверждения" },
  { label: "выполнение", detail: "diff, команды, агенты" },
  { label: "проверка", detail: "тесты, логи, снимки" },
  { label: "ревью", detail: "pull request, человек, слияние" },
] as const;

export const evidenceStack: readonly EvidenceItem[] = [
  { label: "лог сессии", detail: "что агент делал и зачем", strength: 3 },
  { label: "команды", detail: "какие команды запускались", strength: 4 },
  { label: "тесты", detail: "какие проверки прошли", strength: 5 },
  { label: "diff", detail: "что реально изменилось", strength: 5 },
  { label: "снимки", detail: "как выглядит результат", strength: 4 },
  { label: "PR", detail: "где человек принимает решение", strength: 5 },
] as const;
