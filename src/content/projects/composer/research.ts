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
    signal: "ADE подается как рабочее место для нескольких агентов: планы, браузер, консоль, MCP и память проекта.",
    coded: ["orchestration", "context", "parallelism", "verification"],
  },
  {
    id: "codex",
    name: "OpenAI Codex",
    type: "official",
    surface: "облачная задача",
    url: "https://developers.openai.com/codex/cloud",
    signal: "Фоновые задачи доходят до GitHub через AGENTS.md, управляемое окружение и параллельные сессии.",
    coded: ["parallelism", "context", "verification", "permissions"],
  },
  {
    id: "claude",
    name: "Claude Code",
    type: "official",
    surface: "терминал и IDE",
    url: "https://code.claude.com/docs/en/hooks",
    signal: "Права, hooks, transcript, MCP и события сабагентов делают работу наблюдаемой из терминала.",
    coded: ["permissions", "context", "verification", "orchestration"],
  },
  {
    id: "antigravity",
    name: "Google Antigravity",
    type: "official",
    surface: "редактор + менеджер",
    url: "https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/",
    signal: "Editor View и Manager Surface разводят написание кода, асинхронных агентов, артефакты и проверку результата.",
    coded: ["orchestration", "parallelism", "verification", "trust"],
  },
  {
    id: "kiro",
    name: "AWS Kiro",
    type: "official",
    surface: "спеки в IDE",
    url: "https://aws.amazon.com/documentation-overview/kiro/",
    signal: "Спеки, планы, тесты, документация, файлы steering и hooks превращают промпт в управляемый процесс.",
    coded: ["specs", "context", "verification", "permissions"],
  },
  {
    id: "copilot",
    name: "GitHub Copilot coding agent",
    type: "official",
    surface: "issue и PR",
    url: "https://docs.github.com/en/copilot/using-github-copilot/coding-agent/about-assigning-tasks-to-copilot",
    signal: "Задача стартует из поверхностей GitHub, уходит в фон и возвращается как pull request.",
    coded: ["orchestration", "parallelism", "verification", "trust"],
  },
  {
    id: "augment",
    name: "Augment ADE guide",
    type: "category",
    surface: "рамка категории",
    url: "https://www.augmentcode.com/guides/what-is-an-agentic-development-environment",
    signal: "Категория описана через оркестрацию, жизненный цикл агентной работы и слой управления.",
    coded: ["orchestration", "permissions", "parallelism", "verification"],
  },
  {
    id: "arxiv",
    name: "Claude Code system paper",
    type: "academic",
    surface: "дизайн системы",
    url: "https://arxiv.org/abs/2604.14228",
    signal: "Права, сжатие контекста, MCP, плагины, skills, hooks, сабагенты и изоляция worktree описаны как части системы.",
    coded: ["permissions", "context", "parallelism", "trust"],
  },
  {
    id: "community",
    name: "Отзывы сообщества",
    type: "community",
    surface: "Product Hunt, Reddit, форумы",
    url: "https://www.producthunt.com/",
    signal: "Повторяются одни и те же боли: стоимость, лимиты, потерянный контекст, недоверие к diff и тяжелое ревью.",
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
    label: "стоимость и лимиты",
    score: 4,
    evidence: "Длинная сессия быстро превращается из удобства в счетчик стоимости и лимитов.",
  },
  {
    label: "риск доверия",
    score: 5,
    evidence: "Без diff, тестов, trace и явной точки проверки агент выглядит уверенно, но не заслуживает доверия.",
  },
  {
    label: "потеря контекста",
    score: 4,
    evidence: "Агент может продолжать работу с устаревшим контекстом и все равно звучать убедительно.",
  },
  {
    label: "ошибки доступа",
    score: 3,
    evidence: "Широкие права без песочницы и подтверждений превращают продуктивность в операционный риск.",
  },
  {
    label: "нагрузка ревью",
    score: 5,
    evidence: "Автономность не убирает ревью. Она переносит нагрузку в доказательства и pull request.",
  },
  {
    label: "разрыв процесса",
    score: 3,
    evidence: "Работа расползается между IDE, терминалом, браузером, GitHub, облаком и чатами.",
  },
] as const;

export const workflowSteps: readonly WorkflowStep[] = [
  { label: "намерение", detail: "задача, критерий успеха" },
  { label: "спека и план", detail: "декомпозиция и риски" },
  { label: "контекст", detail: "репозиторий, файлы, память" },
  { label: "доступ", detail: "песочница, сеть, подтверждения" },
  { label: "выполнение", detail: "diff, команды, агенты" },
  { label: "проверка", detail: "тесты, логи, снимки" },
  { label: "ревью", detail: "pull request, решение человека" },
] as const;

export const evidenceStack: readonly EvidenceItem[] = [
  { label: "лог сессии", detail: "что агент делал", strength: 3 },
  { label: "команды", detail: "что запускалось", strength: 4 },
  { label: "тесты", detail: "что прошло проверку", strength: 5 },
  { label: "diff", detail: "что изменилось", strength: 5 },
  { label: "снимки", detail: "как выглядит результат", strength: 4 },
  { label: "PR", detail: "где человек решает", strength: 5 },
] as const;
