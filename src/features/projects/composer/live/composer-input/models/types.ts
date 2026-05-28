/* ─────────────────────────────────────────
   Типы для model picker.

   Provider — agentic-инструмент (Claude Code,
   Codex). Внутри каждого — несколько моделей
   и набор уровней reasoning. Уровни могут
   отличаться: у Claude — max, у Codex — xhigh.
   Selection хранит обе вершины: какую модель
   выбрали и на каком уровне reasoning.
   ───────────────────────────────────────── */

export type ProviderId = "claude-code" | "codex";

export type ReasoningLevel = {
  id: string;
  label: string;
};

export type ModelEntry = {
  id: string;
  label: string;
};

export type Provider = {
  id: ProviderId;
  label: string;
  models: ModelEntry[];
  levels: ReasoningLevel[];
  defaultLevelId: string;
};

export type ModelSelection = {
  providerId: ProviderId;
  modelId: string;
  levelId: string;
};
