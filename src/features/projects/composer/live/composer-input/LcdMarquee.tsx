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

// Палитра в стиле VFD - приглушенные, не отвлекающие тона
const OFF = "rgba(0, 255, 180, 0.03)";
const GLOW_PRIMARY = "#00d4aa"; // Спокойный циан-зеленый
const GLOW_SECONDARY = "#00c4bb";
const GLOW_CORE = "#d0fff0";

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

type Props = {
  /** Текущий статус (UPPERCASE, кириллица/латиница + цифры). */
  status: string;
  /** Настроение питомца — реакция на действия в инпуте. */
  mood?: PetMood;
  /** Цветовой режим LCD: обычный или warning/error. */
  tone?: LcdTone;
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

    // Радужный режим (запись): точка окрашивается по своей
    // X-координате со сдвигом во времени — горизонтальные полосы,
    // бегущие слева направо. rainbowNow задаётся в paint().
    let rainbow = false;
    let rainbowNow = 0;

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

      if (rainbow) {
        // Радужный режим - полный спектр
        const hue = ((xCss * 4 + rainbowNow / 8) % 360);
        ctx.fillStyle = `hsl(${hue}, 100%, ${60 * brightness}%)`;
      } else {
        // Применяем яркость через globalAlpha
        ctx.globalAlpha = brightness;
      }

      // Рисуем точку
      ctx.fillRect(px, py, s, s);

      // Восстанавливаем alpha
      if (!rainbow) {
        ctx.globalAlpha = 1;
      }
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
        return now % 1800 < 120 ? EYE_BLINK : EYE_CENTER;
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
        // Запись - рот открыт, уши торчат, активное слушание
        rows[0] = now % 900 < 450 ? "0101010" : "1010101"; // Пульсирующие уши
        rows[1] = "1111111"; // Широкая голова
        rows[3] = "1111111"; // Тело
        rows[4] = "1111111"; // Тело
        rows[5] = "0111110"; // Рот открыт
        rows[6] = "0011100"; // Открытый рот (говорит/слушает)
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
        // Запись - звуковые волны + микрофон + пульсирующие индикаторы
        const wave = now % 720 < 360;
        const pulse = Math.floor(now / 200) % 3;
        // Звуковые волны с обеих сторон
        const waves: PetDot[] = wave
          ? [[-1, 1], [-2, 2], [7, 1], [8, 2]]
          : [[-1, 0], [-2, 1], [7, 0], [8, 1]];
        // Индикаторы уровня справа (3 уровня)
        const indicators: PetDot[] =
          pulse === 0 ? [[9, 4], [10, 4]] :
          pulse === 1 ? [[9, 3], [10, 3], [9, 4], [10, 4]] :
          [[9, 2], [10, 2], [9, 3], [10, 3], [9, 4], [10, 4]];
        // Микрофон перед питомцем
        const mic: PetDot[] = [[-3, 5], [-3, 6]];
        return [...waves, ...indicators, ...mic];
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
        // Запись - покачивание + легкая пульсация
        const sway = Math.sin(now / 330) * 1.5;
        const pulse = Math.sin(now / 200) * 0.8;
        return [Math.round(sway * u), Math.round(pulse * u)];
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

      for (let row = 0; row < PET_COLS; row++) {
        const rowStr = rows[row]!;
        for (let col = 0; col < PET_COLS; col++) {
          if (rowStr[col] !== "1") continue;
          dot(PET_X + col * CELL, top + row * CELL, dxDev + bx, by, now);
        }
      }

      for (const [col, row] of petExtras(now, since)) {
        dot(PET_X + col * CELL, top + row * CELL, dxDev + bx, by, now);
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

      // Быстрый рендеринг: bloom делается через CSS filter (GPU-ускорен)
      const tone = toneRef.current;

      // Запись → радужные волны с насыщенными цветами
      if (animate && moodRef.current === "listen") {
        rainbow = true;
        rainbowNow = now;
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 1;
        drawOn(prev, tt, now, animate, 0);
        rainbow = false;
        ctx.globalCompositeOperation = "source-over";
        if (prev !== null && tt >= 1) prevRef.current = null;
        return;
      }

      // Палитра по тону - приглушенные, не отвлекающие цвета
      let pixelColor: string;

      if (tone === "danger") {
        pixelColor = "#ff6644"; // Мягкий красно-оранжевый
      } else if (tone === "warning") {
        pixelColor = "#ff9944"; // Теплый оранжевый
      } else {
        pixelColor = "#00d4aa"; // Спокойный циан-зеленый
      }

      // Один проход: рисуем яркие точки, CSS filter добавит bloom
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 1;
      ctx.fillStyle = pixelColor;
      drawOn(prev, tt, now, animate, 0);

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
        data-rainbow={mood === "listen" ? "true" : undefined}
        aria-hidden="true"
      />
      <span className={styles.srOnly}>{status}</span>
    </span>
  );
}
