"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { LcdAccessLevel, LcdColorMode, LcdTone, PetMood } from "./LcdMarquee";
import type { ModelSelection } from "./models/types";
import type { PermissionLevel } from "./permissions/types";

export type LcdTransient = {
  text: string;
  mood: PetMood;
  tone?: LcdTone;
  accessLevel?: LcdAccessLevel;
  colorMode?: LcdColorMode;
};

export type TransientController = {
  transient: LcdTransient | null;
  show: (next: LcdTransient, durationMs?: number) => void;
  clear: () => void;
};

export function useTransient(): TransientController {
  const [transient, setTransient] = useState<LcdTransient | null>(null);
  const timerRef = useRef<number | null>(null);

  const cancelTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const show = useCallback(
    (next: LcdTransient, durationMs?: number) => {
      cancelTimer();
      setTransient(next);
      if (durationMs !== undefined) {
        timerRef.current = window.setTimeout(() => setTransient(null), durationMs);
      }
    },
    [cancelTimer],
  );

  const clear = useCallback(() => {
    cancelTimer();
    setTransient(null);
  }, [cancelTimer]);

  useEffect(() => cancelTimer, [cancelTimer]);

  return { transient, show, clear };
}

type LcdInputs = {
  sending: boolean;
  voiceStage: "idle" | "recording" | "processing";
  typing: boolean;
  transient: LcdTransient | null;
};

export type LcdState = {
  status: string;
  mood: PetMood;
  tone: LcdTone;
  colorMode: LcdColorMode;
};

export function deriveLcdState({ sending, voiceStage, typing, transient }: LcdInputs): LcdState {
  if (sending) {
    return { status: "ЗАДАЧА ПРИНЯТА", mood: "accept", tone: "default", colorMode: "success" };
  }
  if (voiceStage === "recording") {
    return { status: "ЗАПИСЫВАЕМ...", mood: "listen", tone: "default", colorMode: "voice" };
  }
  if (voiceStage === "processing") {
    return { status: "РАСПОЗНАЕМ...", mood: "think", tone: "default", colorMode: "decode" };
  }
  if (typing) {
    return { status: "", mood: "type", tone: "default", colorMode: "typing" };
  }
  if (transient) {
    return {
      status: transient.text,
      mood: transient.mood,
      tone: transient.tone ?? "default",
      colorMode: transient.colorMode ?? "base",
    };
  }
  return { status: "ПРОВЕРЬТЕ ХУКИ", mood: "idle", tone: "warning", colorMode: "warning" };
}

const MODEL_COLOR_MODES: Record<string, LcdColorMode> = {
  low: "model-low",
  medium: "model-medium",
  high: "model-high",
  xhigh: "model-high",
  max: "model-max",
  ultracode: "model-ultra",
};

const PERMISSION_TEXTS: Record<PermissionLevel, string> = {
  standard: "ДОСТУП: СТАНДАРТ",
  review: "ДОСТУП: ПРОВЕРКА",
  full: "ДОСТУП: ПОЛНЫЙ",
};

const PERMISSION_COLOR_MODES: Record<PermissionLevel, LcdColorMode> = {
  standard: "access-standard",
  review: "access-review",
  full: "access-full",
};

export function modelTransient(selection: ModelSelection): LcdTransient {
  return {
    text: `СМЕНА МОДЕЛИ ${selection.modelId.toUpperCase()} ${selection.levelId.toUpperCase()}`,
    mood: "model",
    colorMode: MODEL_COLOR_MODES[selection.levelId] ?? "model-high",
  };
}

export function permissionTransient(level: PermissionLevel): LcdTransient {
  return {
    text: PERMISSION_TEXTS[level],
    mood: "access",
    accessLevel: level,
    colorMode: PERMISSION_COLOR_MODES[level],
  };
}

export function planModeTransient(enabled: boolean): LcdTransient {
  return {
    text: enabled ? "ПЛАН: ВКЛ" : "ПЛАН: ВЫКЛ",
    mood: "plan",
    colorMode: "plan",
  };
}

export function attachCountTransient(count: number): LcdTransient {
  return { text: `${count} ${fileNoun(count)}`, mood: "files", colorMode: "files" };
}

export function fileRejectedTransient(): LcdTransient {
  return { text: "ФАЙЛ НЕ ПРИНЯТ", mood: "cancel", tone: "danger", colorMode: "danger" };
}

export function voiceUnavailableTransient(): LcdTransient {
  return { text: "ГОЛОС НЕДОСТУПЕН", mood: "cancel", tone: "danger" };
}

function fileNoun(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "ФАЙЛ";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "ФАЙЛА";
  return "ФАЙЛОВ";
}
