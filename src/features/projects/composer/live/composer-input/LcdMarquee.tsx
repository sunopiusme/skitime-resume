"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";

import styles from "./ComposerInput.module.css";
import { getGlyph, GLYPH_H, GLYPH_W } from "./lcdFont";

/* ─────────────────────────────────────────
   LCD dot-matrix статусная панель + питомец.

   • Показывает ОДИН статус, центрированный в зоне справа
     от питомца. Смена статуса → dissolve «осыпание точек».
   • Слева живёт dot-matrix питомец: моргает, водит глазами,
     иногда подпрыгивает.
   • Хроматическая аберрация: активные точки рисуются тремя
     проходами (красный сдвиг влево, циан вправо, белый по
     центру, аддитивно) — RGB-кайма по краям, но центр
     остаётся белым и читаемым.

   Точки — целочисленные fillRect в device-px (с DPR), без
   субпиксельного блюра.
   ───────────────────────────────────────── */

const DOT = 2;
const GAP = 1;
const CELL = DOT + GAP; // 3px
const CHAR_ADVANCE = (GLYPH_W + 1) * CELL; // 18px
const CONTENT_H = GLYPH_H * CELL; // 21px

const PET_COLS = 7;
const PET_X = CELL; // отступ слева 3px
const PET_ZONE = (PET_COLS + 2) * CELL; // 27px — зона питомца + зазор
const ALERT_COLS = 9;
const ALERT_ZONE = (ALERT_COLS + 2) * CELL; // 33px — зона LCD-индикатора справа

/* Палитра signal-VFD: не один общий tint, а язык аппаратных
   индикаторов. Recording = настоящий красный REC, decode =
   холодный синий scan, plan = violet mode, access = отдельные
   security-цвета. Glow короткий, но сами core-точки сочные. */
const OFF = "rgba(255, 186, 108, 0.026)";

export type LcdColorMode =
  | "base"
  | "typing"
  | "voice"
  | "decode"
  | "warning"
  | "danger"
  | "access-standard"
  | "access-review"
  | "access-full"
  | "branch"
  | "plan"
  | "files"
  | "success"
  | "model-low"
  | "model-medium"
  | "model-high"
  | "model-max"
  | "model-ultra";

type LampPalette = {
  color: string;
  alpha: number;
  halo: number;
  fringe: number;
  warm: string;
  cool: string;
};

const LCD_PALETTE: Record<LcdColorMode, LampPalette> = {
  base: {
    color: "#ffbd72",
    alpha: 0.98,
    halo: 0.16,
    fringe: 0.074,
    warm: "rgba(255, 218, 146, 1)",
    cool: "rgba(126, 230, 220, 1)",
  },
  typing: {
    color: "#f0d8a8",
    alpha: 0.7,
    halo: 0.1,
    fringe: 0.048,
    warm: "rgba(255, 226, 170, 1)",
    cool: "rgba(144, 220, 214, 1)",
  },
  voice: {
    color: "#ff2f2f",
    alpha: 0.98,
    halo: 0.2,
    fringe: 0.1,
    warm: "rgba(255, 112, 70, 1)",
    cool: "rgba(255, 198, 118, 1)",
  },
  decode: {
    color: "#2ea8ff",
    alpha: 0.96,
    halo: 0.18,
    fringe: 0.09,
    warm: "rgba(140, 210, 255, 1)",
    cool: "rgba(72, 244, 255, 1)",
  },
  warning: {
    color: "#ffbf5f",
    alpha: 0.94,
    halo: 0.15,
    fringe: 0.072,
    warm: "rgba(255, 220, 140, 1)",
    cool: "rgba(126, 224, 214, 1)",
  },
  danger: {
    color: "#ff1f1f",
    alpha: 1,
    halo: 0.22,
    fringe: 0.11,
    warm: "rgba(255, 92, 62, 1)",
    cool: "rgba(255, 190, 116, 1)",
  },
  "access-standard": {
    color: "#49e58f",
    alpha: 0.94,
    halo: 0.13,
    fringe: 0.062,
    warm: "rgba(204, 232, 126, 1)",
    cool: "rgba(88, 232, 218, 1)",
  },
  "access-review": {
    color: "#2ea8ff",
    alpha: 0.95,
    halo: 0.17,
    fringe: 0.086,
    warm: "rgba(142, 212, 255, 1)",
    cool: "rgba(74, 244, 255, 1)",
  },
  "access-full": {
    color: "#ff3b30",
    alpha: 0.98,
    halo: 0.19,
    fringe: 0.096,
    warm: "rgba(255, 128, 78, 1)",
    cool: "rgba(255, 202, 118, 1)",
  },
  branch: {
    color: "#00e676",
    alpha: 0.92,
    halo: 0.14,
    fringe: 0.07,
    warm: "rgba(202, 238, 116, 1)",
    cool: "rgba(64, 234, 220, 1)",
  },
  plan: {
    color: "#a855ff",
    alpha: 0.96,
    halo: 0.18,
    fringe: 0.09,
    warm: "rgba(224, 154, 255, 1)",
    cool: "rgba(98, 218, 255, 1)",
  },
  files: {
    color: "#ffe066",
    alpha: 0.94,
    halo: 0.13,
    fringe: 0.064,
    warm: "rgba(255, 232, 126, 1)",
    cool: "rgba(126, 228, 204, 1)",
  },
  success: {
    color: "#44ff99",
    alpha: 0.94,
    halo: 0.14,
    fringe: 0.07,
    warm: "rgba(202, 244, 126, 1)",
    cool: "rgba(82, 238, 220, 1)",
  },
  "model-low": {
    color: "#9fd6c7",
    alpha: 0.86,
    halo: 0.12,
    fringe: 0.054,
    warm: "rgba(224, 218, 170, 1)",
    cool: "rgba(126, 218, 224, 1)",
  },
  "model-medium": {
    color: "#51e6e0",
    alpha: 0.92,
    halo: 0.14,
    fringe: 0.064,
    warm: "rgba(230, 214, 154, 1)",
    cool: "rgba(112, 226, 238, 1)",
  },
  "model-high": {
    color: "#2ea8ff",
    alpha: 0.95,
    halo: 0.17,
    fringe: 0.078,
    warm: "rgba(246, 206, 132, 1)",
    cool: "rgba(92, 232, 255, 1)",
  },
  "model-max": {
    color: "#a855ff",
    alpha: 0.96,
    halo: 0.18,
    fringe: 0.09,
    warm: "rgba(224, 154, 255, 1)",
    cool: "rgba(98, 218, 255, 1)",
  },
  "model-ultra": {
    color: "#fff2a8",
    alpha: 1,
    halo: 0.21,
    fringe: 0.1,
    warm: "rgba(255, 232, 132, 1)",
    cool: "rgba(102, 232, 255, 1)",
  },
};

const TRANSITION_MS = 620;

/* Питомец 7×7. Ряд 2 — глаза (тёмные «дырки» в светящемся
   теле), переопределяется кадром анимации. */
const PET_BASE = [
  "0011100",
  "0111110",
  "1101011",
  "1111111",
  "1111111",
  "0111110",
  "0100010",
];
const EYE_CENTER = "1101011";
const EYE_LEFT = "1010111";
const EYE_RIGHT = "1110101";
const EYE_BLINK = "1111111";
const ALERT_MARK = [
  "000111000",
  "000111000",
  "000111000",
  "000111000",
  "000000000",
  "000111000",
  "000111000",
];
const LOCK_MARK = [
  "000111000",
  "001000100",
  "001000100",
  "011111110",
  "011010110",
  "011111110",
  "001111100",
];
const UNLOCK_MARK = [
  "001110000",
  "010001000",
  "010000000",
  "011111110",
  "011010110",
  "011111110",
  "001111100",
];
const SHIELD_MARK = [
  "000101000",
  "001111100",
  "011111110",
  "010110110",
  "001101100",
  "000111000",
  "000010000",
];
/* Знак ошибки для правого слота — жирный крест ✕. При tone=danger
   слот переходит с «!» на этот крест тем же dissolve («осыпание
   точек»), что и центральный статус. Ширина 9 = ALERT_COLS. */
const CROSS_MARK = [
  "110000011",
  "011000110",
  "001101100",
  "000111000",
  "001101100",
  "011000110",
  "110000011",
];
/* Правый слот при печати «дышит»: диск из точек медленно расширяется
   и сжимается (~4 с цикл), задавая спокойный ритм вместо мелькающих
   букв — глазу нечего расшифровывать, фон скорее успокаивает. В покое
   слот по-прежнему показывает знак «!» (ALERT_MARK). */
const BREATH_CX = (ALERT_COLS - 1) / 2; // 4 — центр зоны по горизонтали
const BREATH_CY = (GLYPH_H - 1) / 2; // 3 — центр по вертикали
const BREATH_MIN_R = 1.2;
const BREATH_MAX_R = 2.3;
const BREATH_PERIOD_MS = 4000;

/** Настроение питомца — уникальная реакция на каждое действие.
   Непрерывные: idle/type/listen/think. One-shot (transient):
   model/access/branch/plan/files/cancel. */
export type PetMood =
  | "idle"
  | "type"
  | "listen"
  | "think"
  | "model"
  | "access"
  | "branch"
  | "plan"
  | "files"
  | "cancel";

export type LcdTone = "default" | "warning" | "danger";
export type LcdAccessLevel = "standard" | "review" | "full";

type Props = {
  /** Текущий статус (UPPERCASE, кириллица/латиница + цифры). */
  status: string;
  /** Настроение питомца — реакция на действия в инпуте. */
  mood?: PetMood;
  /** Цветовой режим LCD: обычный или warning/error. */
  tone?: LcdTone;
  /** Контекстный glyph правого слота при смене уровня доступа. */
  accessLevel?: LcdAccessLevel | undefined;
  /** Персональность света: модель, запись, доступ, успех и т.д. */
  colorMode?: LcdColorMode;
};

/* Детерминированный порог [0,1) для точки текста — стабилен
   между кадрами, поэтому осыпание не дёргается. */
function dotThreshold(ci: number, row: number, col: number): number {
  let h = (ci * 73856093) ^ (row * 19349663) ^ (col * 83492791);
  h = (h ^ (h >>> 13)) >>> 0;
  h = (h * 1274126177) >>> 0;
  return (h % 1000) / 1000;
}

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

/* easeOutBack — оседание с лёгким перелётом (overshoot),
   нужно для «пружинного» возврата, а не линейного. */
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export default function LcdMarquee({
  status,
  mood,
  tone = "default",
  accessLevel,
  colorMode,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const currentRef = useRef(status);
  const prevRef = useRef<string | null>("");
  const transitionStartRef = useRef(0);
  // Для анимации появления текста по буквам
  const typewriterProgressRef = useRef(0);
  const typewriterStartRef = useRef(0);
  // Настроение в ref — меняется без перезапуска RAF-цикла.
  const moodRef = useRef<PetMood>(mood ?? "idle");
  const toneRef = useRef<LcdTone>(tone);
  const accessLevelRef = useRef<LcdAccessLevel>(accessLevel ?? "standard");
  const colorModeRef = useRef<LcdColorMode>(colorMode ?? "base");
  // Момент последнего смены настроения — для реакций «по событию»
  // (радостный подскок при happy, кивок при старте печати).
  const moodStartRef = useRef(0);

  useEffect(() => {
    moodRef.current = mood ?? "idle";
    moodStartRef.current = 0; // переинициализируется в кадре через now
  }, [mood]);

  useEffect(() => {
    toneRef.current = tone;
  }, [tone]);

  useEffect(() => {
    accessLevelRef.current = accessLevel ?? "standard";
  }, [accessLevel]);

  useEffect(() => {
    colorModeRef.current = colorMode ?? "base";
  }, [colorMode]);

  useEffect(() => {
    if (status === currentRef.current) return;

    const hadPrevious = currentRef.current !== "" && currentRef.current !== status;

    // Если есть предыдущий текст - запускаем dissolve
    if (hadPrevious) {
      prevRef.current = currentRef.current;
      transitionStartRef.current = 0;
      // Отключаем typewriter
      typewriterProgressRef.current = status.length;
      typewriterStartRef.current = -1;
    } else {
      // Нет предыдущего - решаем: typewriter или мгновенно
      prevRef.current = "";
      transitionStartRef.current = 0;

      const useTypewriter = status.length > 12;
      if (useTypewriter) {
        typewriterProgressRef.current = 0;
        typewriterStartRef.current = 0;
      } else {
        typewriterProgressRef.current = status.length;
        typewriterStartRef.current = -1;
      }
    }

    currentRef.current = status;
  }, [status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;
    let rafId = 0;
    let cssW = 0;
    let cssH = 0;
    let dpr = 1;

    // Состояние dissolve-перехода правого слота «!» ↔ «✕».
    // slotDanger — текущий знак (null = ещё не инициализирован),
    // slotPrevDanger — уходящий знак во время перехода (null = нет
    // перехода), slotTransStart — момент старта осыпания.
    let slotDanger: boolean | null = null;
    let slotPrevDanger: boolean | null = null;
    let slotTransStart = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssW = Math.max(1, Math.floor(rect.width));
      cssH = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    };

    const resolvePalette = () => {
      const explicit = colorModeRef.current;
      if (explicit !== "base") return LCD_PALETTE[explicit];
      if (moodRef.current === "listen") return LCD_PALETTE.voice;
      if (moodRef.current === "think") return LCD_PALETTE.decode;
      if (moodRef.current === "type") return LCD_PALETTE.typing;
      if (toneRef.current === "danger") return LCD_PALETTE.danger;
      if (toneRef.current === "warning") return LCD_PALETTE.warning;
      return LCD_PALETTE.base;
    };

    // Voice-spectrum записи: вместо party-rainbow экран ведёт себя
    // как REC-индикатор. Холодная VFD-база остаётся, но по лампам
    // проходит тёплая коралловая волна, похожая на аудио-энергию.
    let voiceSpectrum = false;
    let voiceNow = 0;
    let recognitionSweep = false;
    let recognitionNow = 0;
    let activeAlpha = 1;
    let activePalette = LCD_PALETTE.base;

    // Точка: рендеринг с физически корректной симуляцией свечения ламп.
    //
    // Реальный дисплей ведёт себя НЕ как набор независимо мерцающих
    // пикселей (это даёт «кипящий» цифровой шум). Физика такая:
    //  1. Общая пульсация питания (mains ripple): все лампы питаются от
    //     одной шины и слегка дышат СИНХРОННО — доминирующий эффект.
    //  2. Постоянный разброс яркости: часть ламп навсегда чуть тусклее
    //     (производственный допуск). Это НЕ анимируется — даёт «текстуру».
    //  3. Редкое одиночное мерцание: лампа изредка кратко проседает, а не
    //     колеблется постоянно.
    const dot = (xCss: number, yCss: number, dxDev: number, dyDev: number, now: number) => {
      const px = Math.round(xCss * dpr) + dxDev;
      const py = Math.round(yCss * dpr) + dyDev;
      const s = Math.round(DOT * dpr);

      const lampId = px * 7919 + py * 3571; // стабильный ID лампы

      // 1. Общая пульсация питания — одна фаза на весь экран (common-mode).
      //    Медленная, ±2.5%. Это то, что глаз читает как «живое» свечение.
      const ripple = Math.sin(now * 0.0021) * 0.025;

      // 2. Постоянный разброс — детерминирован по lampId, во времени не
      //    меняется. Часть ламп тусклее на 0..6%, навсегда.
      const variance = ((lampId % 23) / 23) * 0.06;

      // 3. Редкое одиночное мерцание — медленная волна со своей фазой,
      //    но эффект только когда она у самого пика (>0.985), т.е. лампа
      //    «проседает» коротко и редко, а не дышит постоянно.
      const slow = Math.sin(now * 0.0006 + lampId * 0.7);
      const flickerDip = slow > 0.985 ? ((slow - 0.985) / 0.015) * 0.12 : 0;

      const brightness = Math.max(0.8, Math.min(1, 1 - variance - flickerDip + ripple));

      let fill: string;
      let alpha: number;

      if (voiceSpectrum) {
        const carrier = Math.sin(voiceNow / 118 + xCss * 0.34);
        const beat = Math.sin(voiceNow / 215) * 0.5 + 0.5;
        const detail = Math.sin(voiceNow / 58 + yCss * 1.1 + xCss * 0.12);
        const envelope = Math.max(0, carrier * 0.62 + detail * 0.24 + beat * 0.14);
        const heat = envelope ** 1.55;
        const hue = 172 - heat * 126; // aged VFD → amber REC flare
        const saturation = 58 + heat * 28;
        const lightness = 57 + heat * 9;
        fill = `hsl(${hue}, ${saturation}%, ${lightness * brightness}%)`;
        alpha = activeAlpha * (0.72 + heat * 0.28);
      } else if (recognitionSweep) {
        const sweep = Math.max(0, Math.sin(recognitionNow / 150 - xCss * 0.18));
        const shimmer = Math.max(0, Math.sin(recognitionNow / 70 + yCss * 0.95));
        const energy = Math.min(1, sweep * 0.82 + shimmer * 0.18);
        const hue = 210 - energy * 28; // muted blue scan → VFD edge
        const lightness = 56 + energy * 8;
        fill = `hsl(${hue}, 66%, ${lightness * brightness}%)`;
        alpha = activeAlpha * (0.62 + energy * 0.34);
      } else {
        fill = ctx.fillStyle as string;
        alpha = brightness * activeAlpha;
      }

      const halo = activePalette.halo;
      const fringe = activePalette.fringe;

      // Локальная физика лампочки: ближний bloom вокруг ячейки
      // + микроскопический тёплый/холодный fringe по краям.
      // Это не декоративный RGB-разъезд, а едва заметная
      // аберрация стекла/фосфора на уровне одной dot-ячейки.
      ctx.fillStyle = fill;
      ctx.globalAlpha = alpha * halo;
      ctx.fillRect(
        px - Math.round(dpr),
        py - Math.round(dpr),
        s + Math.round(2 * dpr),
        s + Math.round(2 * dpr),
      );

      ctx.fillStyle = activePalette.warm;
      ctx.globalAlpha = alpha * fringe;
      ctx.fillRect(px - 1, py, s, s);

      ctx.fillStyle = activePalette.cool;
      ctx.globalAlpha = alpha * fringe;
      ctx.fillRect(px + 1, py, s, s);

      ctx.fillStyle = fill;
      ctx.globalAlpha = alpha;
      ctx.fillRect(px, py, s, s);

      ctx.globalAlpha = 1;
    };

    const yTop = () => Math.round((cssH - CONTENT_H) / 2);

    const textWidth = (text: string) =>
      text.length > 0 ? (text.length - 1) * CHAR_ADVANCE + GLYPH_W * CELL : 0;

    // Один прогон текста: рисует on-точки, прошедшие visibleFn.
    // Добавлена поддержка typewriter эффекта - показываем только N первых символов
    const drawText = (
      text: string,
      dxDev: number,
      visibleFn: (ci: number, row: number, col: number) => boolean,
      now: number,
      maxChars?: number,
    ) => {
      const w = textWidth(text);
      const avail = cssW - PET_ZONE - ALERT_ZONE;
      const startX = PET_ZONE + Math.max(0, Math.round((avail - w) / 2));
      const top = yTop();
      const charsToShow = maxChars !== undefined ? maxChars : text.length;
      for (let i = 0; i < Math.min(text.length, charsToShow); i++) {
        const glyph = getGlyph(text[i]!);
        const charX = startX + i * CHAR_ADVANCE;
        for (let row = 0; row < GLYPH_H; row++) {
          const gr = glyph[row]!;
          for (let col = 0; col < GLYPH_W; col++) {
            if (!gr[col]) continue;
            if (!visibleFn(i, row, col)) continue;
            dot(charX + col * CELL, top + row * CELL, dxDev, 0, now);
          }
        }
      }
    };

    const statusDotsVisible = (text: string, now: number) => {
      if (!text.endsWith("...")) return () => true;
      const visibleDots = Math.floor(now / 260) % 4;
      const dotStart = text.length - 3;
      return (ci: number) => ci < dotStart || ci - dotStart < visibleDots;
    };

    const drawRows = (rows: string[], startX: number, dxDev: number, now: number) => {
      const top = yTop();
      for (let row = 0; row < GLYPH_H; row++) {
        const rowStr = rows[row]!;
        for (let col = 0; col < rowStr.length; col++) {
          if (rowStr[col] !== "1") continue;
          dot(startX + col * CELL, top + row * CELL, dxDev, 0, now);
        }
      }
    };

    // Правый слот при печати «дышит»: диск из точек медленно
    // расширяется и сжимается синусоидой. Радиус ходит между
    // BREATH_MIN_R и BREATH_MAX_R; точка зоны зажигается, если
    // попадает внутрь текущего радиуса. Спокойный ритм без букв.
    const drawBreath = (now: number, startX: number, dxDev: number) => {
      const phase = (Math.sin((now / BREATH_PERIOD_MS) * Math.PI * 2) + 1) / 2;
      const r = BREATH_MIN_R + (BREATH_MAX_R - BREATH_MIN_R) * phase;
      const r2 = r * r;
      const top = yTop();
      for (let row = 0; row < GLYPH_H; row++) {
        for (let col = 0; col < ALERT_COLS; col++) {
          const dx = col - BREATH_CX;
          const dy = row - BREATH_CY;
          if (dx * dx + dy * dy > r2) continue;
          dot(startX + col * CELL, top + row * CELL, dxDev, 0, now);
        }
      }
    };

    const meterLevels = [2, 4, 3, 5];
    const meterPeaks = [2, 4, 3, 5];
    let meterLastNow = 0;

    const drawRecordingMeter = (now: number, startX: number, dxDev: number) => {
      const top = yTop();
      const dt = meterLastNow === 0 ? 16 : Math.min(48, now - meterLastNow);
      meterLastNow = now;

      const pulse = Math.sin(now / 185) * 0.5 + 0.5;
      const recOn = Math.floor(now / 520) % 2 === 0 || pulse > 0.76;

      if (recOn) {
        dot(startX, top + 2 * CELL, dxDev, 0, now);
        dot(startX, top + 3 * CELL, dxDev, 0, now);
      }

      const bars = [2, 4, 6, 8];
      for (let i = 0; i < bars.length; i++) {
        const signal =
          Math.sin(now / (170 + i * 31) + i * 1.35) * 0.42 +
          Math.sin(now / (93 + i * 17) + i * 2.1) * 0.24 +
          Math.sin(now / 420 + i * 0.7) * 0.16 +
          0.5;
        const target = Math.max(1, Math.min(6, Math.round(1 + signal * 5)));
        const smoothing = target > meterLevels[i]! ? 0.42 : 0.18;
        meterLevels[i] = meterLevels[i]! + (target - meterLevels[i]!) * smoothing;

        const height = Math.max(1, Math.min(6, Math.round(meterLevels[i]!)));
        meterPeaks[i] = Math.max(height, meterPeaks[i]! - dt / 520);

        const col = bars[i]!;
        for (let h = 0; h < height; h++) {
          dot(startX + col * CELL, top + (GLYPH_H - 1 - h) * CELL, dxDev, 0, now);
        }

        const peak = Math.max(height, Math.min(6, Math.round(meterPeaks[i]!)));
        if (peak > height) {
          dot(startX + col * CELL, top + (GLYPH_H - 1 - peak) * CELL, dxDev, 0, now);
        }
      }
    };

    const drawRecognitionDecoder = (now: number, startX: number, dxDev: number) => {
      const top = yTop();
      const scan = Math.floor(now / 120) % ALERT_COLS;

      for (let row = 0; row < GLYPH_H; row++) {
        for (let col = 0; col < ALERT_COLS; col++) {
          const checksum = (row * 7 + col * 11 + Math.floor(now / 260)) % 9;
          const inWave = Math.abs(col - scan) <= 1;
          const anchor =
            (row === 1 && (col === 2 || col === 6)) ||
            (row === 3 && (col === 1 || col === 4 || col === 7)) ||
            (row === 5 && (col === 3 || col === 5));
          if (!inWave && !anchor && checksum !== 0) continue;
          dot(startX + col * CELL, top + row * CELL, dxDev, 0, now);
        }
      }

      const cursorCol = Math.floor(now / 90) % ALERT_COLS;
      dot(startX + cursorCol * CELL, top, dxDev, 0, now);
      dot(startX + cursorCol * CELL, top + 6 * CELL, dxDev, 0, now);
    };

    const drawAccessMark = (now: number, startX: number, dxDev: number) => {
      const level = accessLevelRef.current;
      const since = moodStartRef.current === 0 ? 0 : now - moodStartRef.current;

      if (level === "full") {
        drawRows(since < 320 ? LOCK_MARK : UNLOCK_MARK, startX, dxDev, now);
        if (since > 360 && since < 860) {
          const sparkCol = Math.floor((since - 360) / 120) % ALERT_COLS;
          dot(startX + sparkCol * CELL, yTop(), dxDev, 0, now);
        }
        return;
      }

      if (level === "review") {
        drawRows(SHIELD_MARK, startX, dxDev, now);
        if (Math.floor(now / 360) % 2 === 0) {
          dot(startX + 7 * CELL, yTop() + 1 * CELL, dxDev, 0, now);
        }
        return;
      }

      drawRows(LOCK_MARK, startX, dxDev, now);
    };

    // Знак слота: «!» в покое, «✕» при ошибке (tone=danger).
    const markRows = (danger: boolean) => (danger ? CROSS_MARK : ALERT_MARK);

    // Один проход знака слота с фильтром видимости точки — нужен
    // для dissolve-перехода «!» ↔ «✕» (тот же эффект осыпания
    // точек, что у центрального текста). ci=0: знак один.
    const drawMark = (
      rows: string[],
      startX: number,
      dxDev: number,
      now: number,
      visibleFn: (row: number, col: number) => boolean,
    ) => {
      const top = yTop();
      for (let row = 0; row < GLYPH_H; row++) {
        const rowStr = rows[row]!;
        for (let col = 0; col < rowStr.length; col++) {
          if (rowStr[col] !== "1") continue;
          if (!visibleFn(row, col)) continue;
          dot(startX + col * CELL, top + row * CELL, dxDev, 0, now);
        }
      }
    };

    const drawRightSlot = (now: number, dxDev: number, animate: boolean) => {
      if (dxDev !== 0) return;
      const startX = Math.max(PET_ZONE, cssW - ALERT_ZONE + CELL);
      if (moodRef.current === "listen") {
        drawRecordingMeter(now, startX, dxDev);
        slotPrevDanger = null;
        return;
      }

      if (moodRef.current === "think") {
        drawRecognitionDecoder(now, startX, dxDev);
        slotPrevDanger = null;
        return;
      }

      if (moodRef.current === "access") {
        drawAccessMark(now, startX, dxDev);
        slotPrevDanger = null;
        return;
      }

      if (moodRef.current === "type") {
        drawBreath(now, startX, dxDev);
        slotPrevDanger = null; // выход из печати завершает любой переход
        return;
      }

      const danger = toneRef.current === "danger";
      const cur = markRows(danger);

      // Без анимации (reduced motion) — рисуем целевой знак сразу.
      if (!animate) {
        drawRows(cur, startX, dxDev, now);
        return;
      }

      // Смена знака → запускаем dissolve.
      if (slotDanger === null) {
        slotDanger = danger;
      } else if (danger !== slotDanger) {
        slotPrevDanger = slotDanger;
        slotDanger = danger;
        slotTransStart = now;
      }

      if (slotPrevDanger === null) {
        drawRows(cur, startX, dxDev, now);
        return;
      }

      const tt = Math.min(1, (now - slotTransStart) / TRANSITION_MS);
      const prev = markRows(slotPrevDanger);
      drawMark(prev, startX, dxDev, now, (r, c) => tt / 0.7 < dotThreshold(0, r, c));
      drawMark(
        cur,
        startX,
        dxDev,
        now,
        (r, c) => (tt - 0.3) / 0.7 > dotThreshold(0, r, c),
      );
      if (tt >= 1) slotPrevDanger = null;
    };

    type PetDot = readonly [col: number, row: number];

    const decay = (since: number, dur: number) => Math.max(0, 1 - since / dur);
    const wobble = (now: number, ms: number, amp: number) => Math.sin(now / ms) * amp;

    const petEyeRow = (now: number, animate: boolean, since: number) => {
      if (!animate) return EYE_CENTER;
      const mood = moodRef.current;

      if (mood === "type") {
        if (now % 1100 < 90) return EYE_BLINK;
        return EYE_RIGHT; // Смотрит на текст
      }
      if (mood === "listen") {
        if (now % 2100 < 120) return EYE_BLINK;
        return now % 2600 < 520 ? EYE_RIGHT : EYE_CENTER;
      }
      if (mood === "think") {
        // Обработка - глаза быстро переключаются (сканирование данных)
        return Math.floor(now / 170) % 2 === 0 ? EYE_LEFT : EYE_RIGHT;
      }
      if (mood === "model") return since < 180 || since % 260 < 90 ? EYE_BLINK : EYE_CENTER;
      if (mood === "access") return EYE_CENTER; // Прямой взгляд (серьезность)
      if (mood === "branch") return since < 320 ? EYE_RIGHT : EYE_LEFT;
      if (mood === "plan") return since < 260 ? EYE_BLINK : EYE_LEFT;
      if (mood === "files") return since < 240 ? EYE_BLINK : EYE_CENTER;
      if (mood === "cancel") return Math.floor(since / 110) % 2 === 0 ? EYE_LEFT : EYE_RIGHT;

      if (now % 3600 < 130) return EYE_BLINK;
      const dir = Math.floor(now / 1500) % 5;
      return dir === 1 ? EYE_LEFT : dir === 3 ? EYE_RIGHT : EYE_CENTER;
    };

    const petRows = (eyes: string, now: number, since: number): string[] => {
      const mood = moodRef.current;
      const rows = [...PET_BASE];
      rows[2] = eyes;

      if (mood === "listen") {
        // Запись — персонаж не «говорит» и не дублирует VU-meter.
        // Он слушает: плотная голова-капсула, мягкая стойка,
        // закрытый низ без открытого рта.
        rows[0] = "0011100";
        rows[1] = "1111111";
        rows[3] = "1111111";
        rows[4] = "1111111";
        rows[5] = "0111110";
        rows[6] = Math.floor(now / 520) % 2 === 0 ? "0101010" : "0100010";
      } else if (mood === "think") {
        // Обработка - компактная анимация думания
        rows[0] = Math.floor(now / 300) % 2 === 0 ? "0010100" : "0101010"; // Антенны
        rows[5] = "0111110"; // Стабильный низ
        rows[6] = "0100010"; // Ноги
      } else if (mood === "type") {
        // Печать - сфокусированный взгляд вправо (на текст)
        rows[0] = "0011100"; // Обычная голова
        rows[1] = "0111110"; // Сосредоточенность
        rows[3] = "1111111"; // Полное тело
        rows[4] = "1111111"; // Полное тело
        rows[5] = "0111110"; // Стабильный низ
        rows[6] = "0100010"; // Твердая стойка
      } else if (mood === "model") {
        rows[0] = since < 420 ? "1011101" : "0011100";
        rows[3] = "1110111";
        rows[6] = since < 700 ? "1010101" : "0101010";
      } else if (mood === "access") {
        // Доступ - серьезный взгляд (безопасность)
        rows[0] = "0011100"; // Обычная голова
        rows[1] = "0111110"; // Сосредоточенность
        rows[5] = "1111111"; // Широкая стойка
        rows[6] = "1011101"; // Твердая позиция
      } else if (mood === "branch") {
        rows[0] = since < 320 ? "0001110" : "0111000";
        rows[4] = since < 320 ? "1111100" : "0011111";
        rows[6] = since < 320 ? "0010011" : "1100100";
      } else if (mood === "plan") {
        rows[0] = "0001000";
        rows[1] = "0011100";
        rows[5] = "1111111";
        rows[6] = "0100010";
      } else if (mood === "files") {
        rows[0] = "0011100";
        rows[4] = since < 360 ? "1110111" : "1111111";
        rows[6] = "0111110";
      } else if (mood === "cancel") {
        rows[0] = Math.floor(since / 120) % 2 === 0 ? "1000001" : "0100010";
        rows[1] = "0111110";
        rows[5] = "0111110";
        rows[6] = "1000001";
      } else {
        rows[0] = now % 5200 < 420 ? "1011101" : "0011100";
        rows[6] = now % 2800 < 260 ? "0010100" : "0100010";
      }

      return rows;
    };

    const petExtras = (now: number, since: number): PetDot[] => {
      const mood = moodRef.current;

      if (mood === "type") {
        // Печать - анимация клавиш + летящие буквы + курсор
        const phase = Math.floor(now / 140) % 4;
        const keys: PetDot[] = [[7, 6], [8, 6], [9, 6]];

        // Летящие буквы/символы вверх (эффект печати)
        const flyPhase = Math.floor(now / 200) % 4;
        const letters: PetDot[] =
          flyPhase === 0 ? [[8, 5]] :
          flyPhase === 1 ? [[8, 4], [9, 4]] :
          flyPhase === 2 ? [[8, 3], [9, 3]] :
          [[9, 2]];

        // Мигающий курсор справа (далеко от питомца)
        const cursor: PetDot[] = Math.floor(now / 400) % 2 === 0 ? [[10, 3], [10, 4]] : [];

        return phase === 0
          ? [...keys, ...letters, ...cursor, [6, 3], [7, 4]]
          : phase === 1
            ? [...keys, ...letters, ...cursor, [6, 4], [8, 5]]
            : phase === 2
              ? [...keys, ...letters, ...cursor, [6, 3], [7, 4]]
              : [...keys, ...letters, ...cursor, [6, 4], [9, 5]];
      }
      if (mood === "listen") {
        // Запись — headset/attention marks. Никаких аудио-волн:
        // справа уже есть VU-meter, а персонаж должен поддерживать
        // состояние «я внимательно слушаю».
        const cue = Math.floor(now / 620) % 3;
        const earCups: PetDot[] = [[-1, 2], [-1, 3], [7, 2], [7, 3]];
        const bridge: PetDot[] = [[0, 0], [6, 0]];
        const attention: PetDot[] =
          cue === 0
            ? [[8, 1]]
            : cue === 1
              ? [[8, 1], [9, 2]]
              : [[8, 2]];
        const thoughtCatch: PetDot[] = now % 1900 < 260 ? [[-2, 1]] : [];
        return [...earCups, ...bridge, ...attention, ...thoughtCatch];
      }
      if (mood === "think") {
        // Думает - вращающиеся шестеренки + простой индикатор
        const phase = Math.floor(now / 180) % 4;
        const gears: PetDot[] =
          Math.floor(now / 250) % 2 === 0 ? ([[8, 2], [9, 3]] as PetDot[]) : ([[8, 3], [9, 2]] as PetDot[]);
        // Простой индикатор обработки (3 точки)
        const dots = Math.floor(now / 300) % 3;
        const loading: PetDot[] =
          dots === 0
            ? ([[7, 6]] as PetDot[])
            : dots === 1
              ? ([[7, 6], [8, 6]] as PetDot[])
              : ([[7, 6], [8, 6], [9, 6]] as PetDot[]);

        return phase === 0
          ? ([[7, 0], ...gears, ...loading] as PetDot[])
          : phase === 1
            ? ([[6, 0], ...gears, ...loading] as PetDot[])
            : phase === 2
              ? ([[-1, 0], ...gears, ...loading] as PetDot[])
              : ([[-1, 1], ...gears, ...loading] as PetDot[]);
      }
      if (mood === "model") {
        // Смена модели - звездочки и конфетти
        const confetti: PetDot[] = since < 780 ? [[-1, 0], [7, 0], [-1, 6], [7, 6], [8, 1], [9, 3], [-2, 2]] : [[7, 3]];
        return confetti;
      }
      if (mood === "access") {
        // Доступ - замки + ключи + щит безопасности
        const unlock = since < 400;
        // Замки по бокам (открываются/закрываются)
        const locks: PetDot[] = unlock
          ? [[-1, 2], [-1, 3], [7, 2], [7, 3]]
          : [[-1, 1], [-1, 2], [-1, 3], [7, 1], [7, 2], [7, 3]];
        // Ключ в центре (вращается)
        const key: PetDot[] = Math.floor(since / 200) % 2 === 0 ? [[8, 2], [9, 2]] : [[8, 3], [9, 3]];
        // Щит безопасности
        const shield: PetDot[] = since < 600 ? [[8, 4], [9, 4], [8, 5], [9, 5]] : [];
        return [...locks, ...key, ...shield];
      }
      if (mood === "branch") {
        // Ветка - стрелки направления
        const arrows: PetDot[] = since < 320 ? [[7, 1], [7, 3], [6, 5], [8, 0], [9, 1]] : [[-1, 1], [-1, 3], [0, 5], [-2, 0], [-3, 1]];
        return arrows;
      }
      if (mood === "plan") {
        // План - чеклисты и галочки
        const checks: PetDot[] =
          since < 820
            ? ([[6, 0], [7, 0], [7, 1], [8, 3], [9, 4]] as PetDot[])
            : ([[-1, 5], [7, 5], [8, 5]] as PetDot[]);
        return checks;
      }
      if (mood === "files") {
        // Файлы - падающие документы
        const fall = Math.min(5, Math.floor(since / 90));
        return [[7, fall], [6, Math.min(6, fall + 1)], [-1, 6], [8, Math.max(0, fall - 1)], [9, Math.max(0, fall - 2)]];
      }
      if (mood === "cancel") {
        // Отмена - крестики и тряска
        const shake = Math.floor(since / 120) % 2 === 0;
        return shake
          ? [[-1, 2], [7, 4], [-1, 4], [7, 2], [8, 3], [9, 3]]
          : [[-1, 3], [7, 3], [8, 2], [9, 4]];
      }

      // Idle - случайные искорки
      const sparkle = now % 4200 < 520;
      return sparkle ? [[-1, 4], [7, 4], [Math.floor(now / 500) % 2 === 0 ? 8 : -2, 2]] : [];
    };

    const petBody = (now: number, animate: boolean, since: number): [number, number] => {
      if (!animate) return [0, 0];
      const mood = moodRef.current;
      const u = dpr;

      if (mood === "type") {
        // Печать - ритмичное постукивание с отскоком
        const tap = Math.sin((now % 460) / 460 * Math.PI);
        const bounce = tap > 0.7 ? Math.pow((tap - 0.7) / 0.3, 2) * 2 : 0;
        return [0, Math.round((tap * 1.5 - 0.3 - bounce) * u)];
      }
      if (mood === "listen") {
        // Запись — спокойное дыхание и едва заметный кивок.
        // Персонаж не «болтает», а держит фокус для пользователя.
        const breath = Math.sin(now / 720) * 0.75;
        const nod = Math.sin(now / 1180) > 0.86 ? 1.1 : 0;
        return [0, Math.round((breath + nod) * u)];
      }
      if (mood === "think") {
        // Думает - легкое покачивание
        const sway = Math.sin(now / 200) * 1.5;
        return [Math.round(sway * u), 0];
      }
      if (mood === "model") {
        const pop = Math.sin(clamp01(since / 620) * Math.PI);
        return [
          Math.round(wobble(since, 45, 3.2) * u * decay(since, 720)),
          Math.round(-pop * 3 * u),
        ];
      }
      if (mood === "access") {
        // Доступ - кивок головой (подтверждение)
        const nod = Math.sin(clamp01(since / 300) * Math.PI * 2);
        return [0, Math.round(nod * 1.5 * u)];
      }
      if (mood === "branch") {
        const local = since < 360 ? since / 360 : (since - 360) / 360;
        const dir = since < 360 ? 1 : -1;
        return [
          Math.round(dir * Math.sin(clamp01(local) * Math.PI) * 4.2 * u),
          Math.round(-Math.sin(clamp01(local) * Math.PI) * 1.8 * u),
        ];
      }
      if (mood === "plan") {
        const sink = Math.sin(clamp01(since / 700) * Math.PI);
        return [Math.round(-1.8 * u), Math.round(sink * 2 * u)];
      }
      if (mood === "files") {
        const catchArc = Math.sin(clamp01(since / 520) * Math.PI);
        return [Math.round(wobble(since, 85, 1.2) * u), Math.round(catchArc * 3.5 * u)];
      }
      if (mood === "cancel") {
        return [
          Math.round(wobble(since, 48, 4.2) * u * decay(since, 680)),
          Math.round(wobble(since, 72, 1.1) * u * decay(since, 680)),
        ];
      }

      return [Math.round(wobble(now, 1800, 1.1) * u), Math.round(wobble(now, 2400, 0.45) * u)];
    };

    const drawPet = (now: number, dxDev: number, animate: boolean) => {
      const top = yTop();
      if (animate && moodStartRef.current === 0) moodStartRef.current = now;
      const since = animate ? now - moodStartRef.current : 0;
      const [bx, by] = petBody(now, animate, since);
      const eyes = petEyeRow(now, animate, since);
      const rows = petRows(eyes, now, since);
      const drawn = new Set<string>();
      const drawPetDot = (col: number, row: number) => {
        const key = `${col}:${row}`;
        if (drawn.has(key)) return;
        drawn.add(key);
        dot(PET_X + col * CELL, top + row * CELL, dxDev + bx, by, now);
      };

      for (let row = 0; row < PET_COLS; row++) {
        const rowStr = rows[row]!;
        for (let col = 0; col < PET_COLS; col++) {
          if (rowStr[col] !== "1") continue;
          drawPetDot(col, row);
        }
      }

      for (const [col, row] of petExtras(now, since)) {
        drawPetDot(col, row);
      }
    };

    // Все активные точки (текст + питомец) одним цветовым
    // проходом со сдвигом dxDev.
    const drawOn = (
      prev: string | null,
      tt: number,
      now: number,
      animate: boolean,
      dxDev: number,
    ) => {
      const current = currentRef.current;

      // Два режима анимации - НЕ смешиваем их:
      // 1. Dissolve - когда есть prev (переход между текстами)
      // 2. Typewriter - когда нет prev и включен режим печати

      if (prev !== null && prev !== "") {
        // Режим 1: Dissolve переход между двумя текстами
        drawText(prev, dxDev, (ci, r, c) => tt / 0.7 < dotThreshold(ci, r, c), now);
        const dotsVisible = statusDotsVisible(current, now);
        drawText(
          current,
          dxDev,
          (ci, r, c) => dotsVisible(ci) && (tt - 0.3) / 0.7 > dotThreshold(ci, r, c),
          now,
        );
      } else {
        // Режим 2: Typewriter или мгновенное появление
        let typewriterChars: number | undefined;
        if (
          animate &&
          typewriterStartRef.current !== -1 &&
          typewriterProgressRef.current < current.length
        ) {
          if (typewriterStartRef.current === 0) typewriterStartRef.current = now;
          const elapsed = now - typewriterStartRef.current;
          typewriterProgressRef.current = Math.min(current.length, elapsed / 40);
          typewriterChars = Math.floor(typewriterProgressRef.current);
        }

        const dotsVisible = statusDotsVisible(current, now);
        drawText(current, dxDev, (ci) => dotsVisible(ci), now, typewriterChars);
      }

      drawPet(now, dxDev, animate);
      drawRightSlot(now, dxDev, animate);
    };

    const renderOffGrid = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.fillStyle = OFF;
      const top = yTop();
      for (let y = 0; y < GLYPH_H; y++) {
        for (let x = 0; x * CELL < cssW; x++) {
          const px = Math.round(x * CELL * dpr);
          const py = Math.round((top + y * CELL) * dpr);
          const s = Math.round(DOT * dpr);
          ctx.fillRect(px, py, s, s);
        }
      }
    };

    const paint = (now: number, animate: boolean) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      renderOffGrid();

      // Состояние перехода — считаем один раз за кадр.
      const prev = animate ? prevRef.current : null;
      let tt = 1;
      if (prev !== null) {
        if (transitionStartRef.current === 0) transitionStartRef.current = now;
        tt = Math.min(1, (now - transitionStartRef.current) / TRANSITION_MS);
      }

      // Запись → REC-волна: цвет отражает голосовой input,
      // а не декоративный rainbow-mode.
      if (animate && moodRef.current === "listen") {
        voiceSpectrum = true;
        voiceNow = now;
        activePalette = resolvePalette();
        activeAlpha = activePalette.alpha;
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 1;
        drawOn(prev, tt, now, animate, 0);
        voiceSpectrum = false;
        activeAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        if (prev !== null && tt >= 1) prevRef.current = null;
        return;
      }

      if (animate && moodRef.current === "think") {
        recognitionSweep = true;
        recognitionNow = now;
        activePalette = resolvePalette();
        activeAlpha = activePalette.alpha;
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 1;
        drawOn(prev, tt, now, animate, 0);
        recognitionSweep = false;
        activeAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        if (prev !== null && tt >= 1) prevRef.current = null;
        return;
      }

      const palette = resolvePalette();

      // Один проход: рисуем яркие точки, CSS filter добавит bloom
      ctx.globalCompositeOperation = "lighter";
      activePalette = palette;
      activeAlpha = palette.alpha;
      ctx.fillStyle = palette.color;
      drawOn(prev, tt, now, animate, 0);
      activeAlpha = 1;

      ctx.globalCompositeOperation = "source-over";

      if (prev !== null && tt >= 1) prevRef.current = null;
    };

    resize();

    if (reducedMotion) {
      const staticPaint = () => {
        prevRef.current = null;
        paint(0, false);
      };
      staticPaint();
      const ro = new ResizeObserver(staticPaint);
      ro.observe(canvas);
      const id = window.setInterval(staticPaint, 200);
      return () => {
        running = false;
        ro.disconnect();
        window.clearInterval(id);
      };
    }

    const loop = (now: number) => {
      if (!running) return;
      paint(now, true);
      rafId = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
    rafId = requestAnimationFrame(loop);

    return () => {
      running = false;
      ro.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  return (
    <span className={styles.lcd}>
      <canvas
        ref={canvasRef}
        className={styles.lcdCanvas}
        data-tone={tone}
        data-mood={mood}
        data-color={colorMode ?? "base"}
        data-voice={mood === "listen" ? "true" : undefined}
        aria-hidden="true"
      />
      <span className={styles.srOnly}>{status}</span>
    </span>
  );
}
