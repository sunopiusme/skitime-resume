import type { ModelSelection, Provider, ReasoningLevel } from "./types";

/* ─────────────────────────────────────────
   Реестр провайдеров, моделей и уровней
   reasoning. Уровни задаются на уровне
   провайдера, потому что у Claude и Codex
   они называются по-разному:
     Claude — Low / Medium / High / Max,
     Codex  — Low / Medium / High / XHigh.
   ───────────────────────────────────────── */

const CLAUDE_LEVELS: ReasoningLevel[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "max", label: "Max" },
];

const CODEX_LEVELS: ReasoningLevel[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "xhigh", label: "Extra High" },
];

export const PROVIDERS: Provider[] = [
  {
    id: "claude-code",
    label: "Claude Code",
    models: [
      { id: "opus-4.7", label: "Opus 4.7" },
      { id: "opus-4.6", label: "Opus 4.6" },
      { id: "sonnet-4.6", label: "Sonnet 4.6" },
      { id: "haiku-4.6", label: "Haiku 4.6" },
    ],
    levels: CLAUDE_LEVELS,
    defaultLevelId: "high",
  },
  {
    id: "codex",
    label: "Codex",
    models: [
      { id: "gpt-5.5", label: "GPT-5.5" },
      { id: "gpt-5.4", label: "GPT-5.4" },
      { id: "gpt-5.4-mini", label: "GPT-5.4-Mini" },
      { id: "gpt-5.3-codex", label: "GPT-5.3-Codex" },
      { id: "gpt-5.2", label: "GPT-5.2" },
    ],
    levels: CODEX_LEVELS,
    defaultLevelId: "high",
  },
];

export const DEFAULT_SELECTION: ModelSelection = {
  providerId: "claude-code",
  modelId: "opus-4.7",
  levelId: "max",
};

export function findProvider(id: string): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export function findModel(selection: ModelSelection) {
  const provider = findProvider(selection.providerId);
  if (!provider) return null;
  const model = provider.models.find((m) => m.id === selection.modelId);
  if (!model) return null;
  const level =
    provider.levels.find((l) => l.id === selection.levelId) ??
    provider.levels.find((l) => l.id === provider.defaultLevelId) ??
    null;
  return { provider, model, level };
}
