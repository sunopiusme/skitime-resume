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
  shortLabel: string;
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

/* Порядок повторяет нарратив кейса: официальные документы →
   категорийные тексты → академический разбор → живые отзывы.
   Внутри официальных — по узнаваемости продукта, от гигантов
   к нишевым: Copilot, Codex, Claude Code, Antigravity, Kiro. */
export const researchSources: readonly ResearchSource[] = [
  {
    id: "copilot",
    name: "GitHub Copilot coding agent",
    type: "official",
    surface: "issue и PR",
    url: "https://docs.github.com/en/copilot/using-github-copilot/coding-agent/about-assigning-tasks-to-copilot",
    signal: "Issue уходит в фоновую работу и возвращается как pull request, а не как ответ в чате.",
    coded: ["orchestration", "parallelism", "verification", "trust"],
  },
  {
    id: "codex",
    name: "OpenAI Codex",
    type: "official",
    surface: "облачная задача",
    url: "https://developers.openai.com/codex/cloud",
    signal: "Фоновая задача доходит до GitHub через AGENTS.md, управляемое окружение и параллельные сессии.",
    coded: ["parallelism", "context", "verification", "permissions"],
  },
  {
    id: "claude",
    name: "Claude Code",
    type: "official",
    surface: "терминал и IDE",
    url: "https://code.claude.com/docs/en/hooks",
    signal: "Права, hooks, transcript, MCP и события сабагентов оставляют рабочий след прямо в терминале.",
    coded: ["permissions", "context", "verification", "orchestration"],
  },
  {
    id: "antigravity",
    name: "Google Antigravity",
    type: "official",
    surface: "редактор + менеджер",
    url: "https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/",
    signal: "Editor View и Manager Surface разводят код, асинхронных агентов, артефакты и проверку результата.",
    coded: ["orchestration", "parallelism", "verification", "trust"],
  },
  {
    id: "kiro",
    name: "AWS Kiro",
    type: "official",
    surface: "спеки в IDE",
    url: "https://aws.amazon.com/documentation-overview/kiro/",
    signal: "Specs, plans, tests, steering и hooks превращают промпт в процесс с правилами.",
    coded: ["specs", "context", "verification", "permissions"],
  },
  {
    id: "augment",
    name: "Augment ADE guide",
    type: "category",
    surface: "рамка категории",
    url: "https://www.augmentcode.com/guides/what-is-an-agentic-development-environment",
    signal: "Категория держится на оркестрации, жизненном цикле агентной работы и слое управления.",
    coded: ["orchestration", "permissions", "parallelism", "verification"],
  },
  {
    id: "addy",
    name: "Addy ADE",
    type: "category",
    surface: "панель управления",
    url: "https://addy.md/",
    signal: "Рабочее место для нескольких агентов: планы, браузер, консоль, MCP и память проекта в одном контуре.",
    coded: ["orchestration", "context", "parallelism", "verification"],
  },
  {
    id: "arxiv",
    name: "Claude Code system paper",
    type: "academic",
    surface: "дизайн системы",
    url: "https://arxiv.org/abs/2604.14228",
    signal: "Права, сжатие контекста, MCP, plugins, skills, hooks, сабагенты и worktree описаны как система.",
    coded: ["permissions", "context", "parallelism", "trust"],
  },
  {
    id: "community",
    name: "Отзывы сообщества",
    type: "community",
    surface: "Product Hunt, Reddit, форумы",
    url: "https://www.producthunt.com/",
    signal: "Повторяются одни и те же боли: цена, лимиты, потерянный контекст, недоверие к diff и тяжелое ревью.",
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
    shortLabel: "лимиты",
    score: 4,
    evidence: "Длинная сессия быстро перестает быть удобством и становится счетчиком стоимости.",
  },
  {
    label: "риск доверия",
    shortLabel: "доверие",
    score: 5,
    evidence: "Без diff, тестов, трейса и явной приемки агент выглядит уверенно, но доверия не получает.",
  },
  {
    label: "потеря контекста",
    shortLabel: "контекст",
    score: 4,
    evidence: "Агент может работать со старым контекстом и звучать так, будто все под контролем.",
  },
  {
    label: "ошибки доступа",
    shortLabel: "доступ",
    score: 3,
    evidence: "Широкие права без песочницы и подтверждений превращают скорость в операционный риск.",
  },
  {
    label: "нагрузка ревью",
    shortLabel: "ревью",
    score: 5,
    evidence: "Автономность не отменяет ревью. Она переносит нагрузку в доказательства и pull request.",
  },
  {
    label: "разрыв процесса",
    shortLabel: "процесс",
    score: 3,
    evidence: "Работа распадается между IDE, терминалом, браузером, GitHub, облаком и чатами.",
  },
] as const;

export const workflowSteps: readonly WorkflowStep[] = [
  { label: "намерение", detail: "задача и критерий приемки" },
  { label: "спека и план", detail: "декомпозиция, риски, порядок" },
  { label: "контекст", detail: "репозиторий, файлы, память проекта" },
  { label: "доступ", detail: "песочница, сеть, подтверждения" },
  { label: "выполнение", detail: "diff, команды, параллельные агенты" },
  { label: "проверка", detail: "тесты, логи, снимки экрана" },
  { label: "ревью", detail: "pull request и решение человека" },
] as const;

export const evidenceStack: readonly EvidenceItem[] = [
  { label: "лог сессии", detail: "что агент делал", strength: 3 },
  { label: "команды", detail: "что реально запускалось", strength: 4 },
  { label: "тесты", detail: "что выдержало проверку", strength: 5 },
  { label: "diff", detail: "какой код изменился", strength: 5 },
  { label: "снимки", detail: "что увидит пользователь", strength: 4 },
  { label: "PR", detail: "где человек принимает", strength: 5 },
] as const;
