"use client";

import { useEffect, useId, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";

import styles from "./ComposerInput.module.css";
import { getGlyph, GLYPH_H, GLYPH_W } from "./lcdFont";
import { buildGlassFilterMarkup, type GlassTuning } from "./liquidGlass";

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

/* Нижняя часть экрана (.lcd) уходит под карточку composer'а, пряча
   скруглённые нижние углы стеклянной линзы. Это значение = tuck в
   CSS (lcdRow overlap − padding-bottom). Контент центрируется по
   видимой зоне cssH − SCREEN_TUCK, а не по всей высоте канваса. */
const SCREEN_TUCK = 12;

const PET_COLS = 7;
const PET_X = CELL; // отступ слева 3px
const PET_ZONE = (PET_COLS + 2) * CELL; // 27px — зона питомца + зазор
const ALERT_COLS = 9;
const ALERT_ZONE = (ALERT_COLS + 2) * CELL; // 33px — зона LCD-индикатора справа

/* Параметры liquid-glass линзы (см. liquidGlass.ts). Подобраны
   под компактную панель ~22px высотой: фаска узкая, толщина
   небольшая, смещение ограничено maxShift — точки/текст у краёв
   заметно «уходят» в стекло, но без агрессивного разрыва. */
const GLASS_TUNING: GlassTuning = {
  radius: 12, // = top border-radius .glass/.lcd в CSS (12), иначе
  // линза и рамка дают два разных контура («два экрана»).
  // Смещение НАМЕРЕННО маленькое: на компактном экране большой
  // maxShift сжимает точки у кромки в видимый внутренний
  // прямоугольник («экран в экране»). Объём даёт CSS-огранка
  // (.glass), а не агрессивное преломление.
  bezelWidth: 6,
  glassThickness: 18,
  ior: 1.5,
  scaleRatio: 1,
  // Предразмытие подложки держим минимальным: blur 0.4 заметно
  // «мылил» точки под линзой (экран читался мутным). 0.15 — почти
  // незаметная смягчающая дымка по краям, ядро точки остаётся резким.
  blur: 0.15,
  specOpacity: 0.4,
  specSaturation: 3,
  maxShift: 3,
};

/* Цветовая модель — реальная RGB LED-матрица (референс: панель
   в духе Adafruit 32×). Не один общий tint, а язык аппаратных
   ламп: idle/база = бело-горячий LED (тело субъекта на референсе),
   а состояния — сочные насыщенные hue (REC-красный, scan-cyan,
   plan-violet, security-зелёный). Ядро яркое и тугое, bloom
   квадратный и умеренный, по краям лёгкий RGB-subpixel split.

   OFF — погасший LED: холодно-серая точка на charcoal. На
   референсе сетка непогашенных диодов отчётливо читается, поэтому
   делаем её заметной (а не почти невидимой, как было у VFD). */
const OFF = "rgba(188, 202, 224, 0.05)";

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
  /* База/idle — бело-горячий LED (тело субъекта на референсе):
     яркое холодно-белое ядро, прохладный bloom, едва заметный
     RGB-subpixel split. Не тусклый, но и не кричит. */
  base: {
    color: "#eef4ff",
    alpha: 0.98,
    halo: 0.2,
    fringe: 0.06,
    warm: "rgba(255, 236, 210, 1)",
    cool: "rgba(176, 214, 255, 1)",
  },
  typing: {
    color: "#cad6ec",
    alpha: 0.72,
    halo: 0.12,
    fringe: 0.05,
    warm: "rgba(232, 226, 210, 1)",
    cool: "rgba(168, 206, 240, 1)",
  },
  /* Запись: насыщенный медовый (#ffcd4a, hue ~47°). Сидит в
     тёплой зоне рядом с warning (#f5b042, hue ~33°), но сдвинут
     в сторону жёлтого — глаз различает «тлеющий персик» и
     «горящий мёд», как две разные LED-лампы на одной панели.
     В реальном LCD-дисплее: «красный — красный, золотой —
     золотой, у каждого своё место в спектре». Cool-fringe
     с явным teal — это оптика (RGB-аберрация стекла/фосфора),
     а не попытка перекрасить spectrum в холодный. */
  voice: {
    color: "#ffcd4a",
    alpha: 1,
    halo: 0.24,
    fringe: 0.1,
    warm: "rgba(255, 220, 100, 1)",
    cool: "rgba(120, 224, 236, 1)",
  },
  decode: {
    color: "#38c8ff",
    alpha: 0.98,
    halo: 0.22,
    fringe: 0.1,
    warm: "rgba(156, 226, 255, 1)",
    cool: "rgba(96, 248, 255, 1)",
  },
  /* Warning живёт в покое («ПРОВЕРЬТЕ ХУКИ»). В реальном LCD-
     дисплее warning — это жёлто-оранжевый, отдельный от voice
     только оттенком, но в той же тёплой зоне: «красный —
     красный, золотой — золотой, у каждого своё место в
     спектре». Персиково-золотой тон (#f5b042, hue ~33°)
     читается как «тёплое присутствие с нотой внимания»,
     а не как «алярм». Halo умеренный: пульсирует, но не
     моргает. Cool-fringe с лёгким teal — это оптика
     (хроматическая аберрация), не смысловая нагрузка. */
  warning: {
    color: "#ffb52e",
    alpha: 1,
    halo: 0.16,
    fringe: 0.07,
    warm: "rgba(252, 218, 158, 1)",
    cool: "rgba(168, 224, 214, 1)",
  },
  danger: {
    color: "#ff2218",
    alpha: 1,
    halo: 0.26,
    fringe: 0.12,
    warm: "rgba(255, 100, 66, 1)",
    cool: "rgba(255, 192, 150, 1)",
  },
  /* Зелёная семантика: три состояния, три оттенка.
     access-standard — «можно»: спокойный изумруд (холодный,
     читается как «нейтрально-разрешено»);
     branch — «сменили ветку»: мятный (тиловый, «маршрут»);
     success — «готово»: салатовый (тёплый, явный positive).
     Раньше все три сидели в одном hue-секторе 0..170 и
     сливались на тёмном фоне. */
  "access-standard": {
    color: "#34d399",
    alpha: 0.97,
    halo: 0.16,
    fringe: 0.07,
    warm: "rgba(196, 236, 170, 1)",
    cool: "rgba(118, 226, 214, 1)",
  },
  /* Синяя семантика: три состояния, три оттенка.
     decode — «обработка голоса»: яркий cyan (активный,
     самый «электрический» из тройки);
     access-review — «нужна проверка»: приглушённый teal
     (уходит в зелёный, читается как «спокойно, но
     требует внимания», не «давай подтвердим»);
     model-high — «мощная модель»: индиго (с фиолетовым
     оттенком, уходит в сторону model-max, читается
     как «серьёзный инструмент»). */
  "access-review": {
    color: "#3ec0c8",
    alpha: 0.98,
    halo: 0.2,
    fringe: 0.094,
    warm: "rgba(180, 232, 226, 1)",
    cool: "rgba(120, 232, 222, 1)",
  },
  "access-full": {
    color: "#ff3b30",
    alpha: 1,
    halo: 0.22,
    fringe: 0.104,
    warm: "rgba(255, 132, 84, 1)",
    cool: "rgba(255, 204, 150, 1)",
  },
  branch: {
    color: "#2dd4bf",
    alpha: 0.96,
    halo: 0.17,
    fringe: 0.078,
    warm: "rgba(196, 234, 220, 1)",
    cool: "rgba(110, 224, 226, 1)",
  },
  plan: {
    color: "#b06bff",
    alpha: 0.98,
    halo: 0.22,
    fringe: 0.1,
    warm: "rgba(228, 168, 255, 1)",
    cool: "rgba(120, 224, 255, 1)",
  },
  files: {
    color: "#ffe04a",
    alpha: 0.97,
    halo: 0.16,
    fringe: 0.074,
    warm: "rgba(255, 234, 140, 1)",
    cool: "rgba(150, 234, 210, 1)",
  },
  success: {
    color: "#84cc16",
    alpha: 0.97,
    halo: 0.17,
    fringe: 0.078,
    warm: "rgba(220, 240, 160, 1)",
    cool: "rgba(170, 232, 188, 1)",
  },
  "model-low": {
    color: "#c4d4dc",
    alpha: 0.88,
    halo: 0.13,
    fringe: 0.056,
    warm: "rgba(230, 226, 206, 1)",
    cool: "rgba(150, 216, 232, 1)",
  },
  "model-medium": {
    color: "#54e6e0",
    alpha: 0.94,
    halo: 0.16,
    fringe: 0.07,
    warm: "rgba(210, 238, 198, 1)",
    cool: "rgba(120, 230, 240, 1)",
  },
  "model-high": {
    color: "#5b8dff",
    alpha: 0.97,
    halo: 0.2,
    fringe: 0.086,
    warm: "rgba(186, 208, 255, 1)",
    cool: "rgba(132, 198, 255, 1)",
  },
  "model-max": {
    color: "#9d4edd",
    alpha: 0.98,
    halo: 0.22,
    fringe: 0.1,
    warm: "rgba(214, 168, 248, 1)",
    cool: "rgba(150, 196, 248, 1)",
  },
  "model-ultra": {
    color: "#f6faff",
    alpha: 1,
    halo: 0.26,
    fringe: 0.11,
    warm: "rgba(255, 244, 206, 1)",
    cool: "rgba(150, 230, 255, 1)",
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
/* Иконки правого слота для конфиг-действий — тот же язык, что
   замок/щит. Раньше model/plan/branch показывали дефолтный «!»;
   теперь у каждого свой знак, читаемый в 9×7.

   PLAN — галочка ✓ (план/задача подтверждены). */
const PLAN_MARK = [
  "000000000",
  "000000010",
  "000000100",
  "000001000",
  "001010000",
  "000100000",
  "000000000",
];
/* BRANCH — git-ветвь: основная линия (col2) + ответвление к
   узлу справа-сверху. */
const BRANCH_MARK = [
  "000000100",
  "001000100",
  "001001100",
  "001110000",
  "001000000",
  "001000000",
  "000000000",
];
/* MODEL — чип/CPU: корпус с ножками по краям и ядром в центре
   (движок/модель). */
const MODEL_MARK = [
  "001010100",
  "011111110",
  "010000010",
  "110010011",
  "010000010",
  "011111110",
  "001010100",
];
/* PONDER — песочные часы: фаза «думает» после сабмита. Чистый,
   однозначный знак «идёт обработка», в пару к шиммеру по тексту. */
const PONDER_MARK = [
  "011111100",
  "001111000",
  "000111000",
  "000010000",
  "000111000",
  "001111000",
  "011111100",
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
   Непрерывные: idle/type/listen/think/ponder. One-shot (transient):
   model/access/branch/plan/files/cancel.
   ponder — пост-сабмит «думает» (как ChatGPT): шиммер по тексту +
   песочные часы в слоте; питомец думает так же, как при think. */
export type PetMood =
  | "idle"
  | "type"
  | "listen"
  | "think"
  | "ponder"
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

export default function LcdMarquee({
  status,
  mood,
  tone = "default",
  accessLevel,
  colorMode,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glassRef = useRef<HTMLSpanElement>(null);
  const filterRef = useRef<SVGFilterElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  // Уникальный id фильтра на инстанс — чтобы несколько панелей
  // не делили один <filter>. useId даёт ":r0:"-стиль, чистим
  // под валидный для url(#…) фрагмент.
  const filterId = `lcd-glass-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  // url(#…) применяем только когда карта смещения собрана —
  // иначе пустой <filter> на первом кадре скрыл бы canvas.
  const [glassReady, setGlassReady] = useState(false);

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

  // Liquid-glass линза: пересобираем карту смещения под текущий
  // размер стеклянного слоя. Фильтр статичен после сборки —
  // backdrop-filter сам пересэмплит анимирующийся canvas покадрово.
  useEffect(() => {
    const glassEl = glassRef.current;
    const filter = filterRef.current;
    if (!glassEl || !filter) return;

    let raf = 0;
    let lastW = 0;
    let lastH = 0;

    const rebuild = () => {
      const rect = glassEl.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w < 2 || h < 2 || (w === lastW && h === lastH)) return;
      const markup = buildGlassFilterMarkup(w, h, GLASS_TUNING);
      if (!markup) return;
      lastW = w;
      lastH = h;
      filter.innerHTML = markup;
      setGlassReady(true);
    };

    rebuild();
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(rebuild);
    });
    ro.observe(glassEl);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

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
    // textShimmer — режим «думает» (ChatGPT-style): приглушённый
    // белый текст с бегущим белым бликом. Включается только вокруг
    // отрисовки статус-текста (не питомца/слота), см. drawOn.
    let textShimmer = false;
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
        // Аудио-энергия как переливающаяся волна в hue-зоне
        // voice-палитры (медовый #ffcd4a, hue ~47°). Дышим в
        // диапазоне 42°..62° — насыщенный жёлто-золотой, как
        // «горящая LED-лампа». Рядом с warning (33°) это даёт
        // 10°..30° hue-зазор: глаз видит «тлеющий персик» и
        // «горящий мёд» как два разных состояния, а не одну
        // «тёплую кашу». Drifts ±3° для лёгкого «дыхания».
        const carrier = Math.sin(voiceNow / 124 + xCss * 0.32);
        const beat = Math.sin(voiceNow / 215) * 0.5 + 0.5;
        const detail = Math.sin(voiceNow / 56 + yCss * 1.05 + xCss * 0.12);
        const flow = Math.sin(xCss * 0.26 - voiceNow / 165);
        const envelope = Math.max(
          0,
          carrier * 0.54 + detail * 0.22 + beat * 0.12 + flow * 0.16,
        );
        const heat = envelope ** 1.42;
        const drift = Math.sin(voiceNow / 1300 + xCss * 0.05);
        // Насыщенная жёлто-золотая зона: 42° (глубокий мёд) →
        // 62° (яркий янтарь). Оба в «тёплом», но явно в стороне
        // от warning (33°) — это и есть логика реального LCD.
        const hue = 42 + heat * 20 + drift * 3;
        // На пиках слегка обесцвечивается (как у реального яркого
        // источника света — горячая точка стремится к белому).
        const saturation = 82 - heat * 18;
        const lightness = 50 + heat * 18; // яркость растёт с энергией
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
      } else if (textShimmer) {
        // «Думает» как в ChatGPT: текст приглушённо-белый, по нему
        // слева-направо бежит яркий белый блик (~1.5с цикл). Без
        // трёх точек — статус читается «живым» именно за счёт блика.
        const period = 1500;
        const headX = ((now % period) / period) * (cssW + 80) - 40;
        const gleam = Math.max(0, 1 - Math.abs(xCss - headX) / 34);
        const lift = gleam * gleam;
        const lightness = (60 + lift * 38) * brightness; // 60%→98% на блике
        fill = `hsl(214, ${14 - lift * 12}%, ${lightness}%)`;
        alpha = activeAlpha * (0.66 + lift * 0.34);
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

    // Нижние ~SCREEN_TUCK px экрана уходят под карточку (см. .lcd в
    // CSS) — там прячутся скруглённые нижние углы стеклянной линзы.
    // Поэтому центрируем контент не по всей высоте канваса, а по
    // ВИДИМОЙ зоне (cssH − SCREEN_TUCK), иначе матрица уезжает под
    // карточку и клиппится снизу.
    const yTop = () => Math.round((cssH - SCREEN_TUCK - CONTENT_H) / 2);

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

    /* ── Волна записи (Siri-spectrum) ──
       Референс: центрированный «шёлковый» бугор из цветных
       слоёв — красный гребень сверху, через оранжевый и золотой
       к белому ядру, ниже мятный, циан и глубокий синий; к краям
       всё спадает в тонкую белую линию. Точечная матрица здесь
       не используется: на 7 рядах плавный градиент не передать,
       поэтому слои рисуются гладкими безье-лентами с blur и
       аддитивным смешением прямо в css-координатах. Волна дышит
       амплитудой и медленно перекатывается. */
    type WaveLayer = {
      color: string;
      amp: number; // доля максимальной амплитуды
      w: number; // ширина колокола, доля полупролёта
      shift: number; // смещение гребня от центра, доля полупролёта
      dir: -1 | 1; // -1 — верхняя половина, 1 — нижняя
      alpha: number;
      blur: number;
    };

    const WAVE_LAYERS: readonly WaveLayer[] = [
      { color: "#ff2d20", amp: 1, w: 0.66, shift: 0.18, dir: -1, alpha: 0.75, blur: 1.6 },
      { color: "#ff9f0a", amp: 0.76, w: 0.54, shift: 0.1, dir: -1, alpha: 0.8, blur: 1.2 },
      { color: "#ffd84d", amp: 0.52, w: 0.44, shift: 0.02, dir: -1, alpha: 0.85, blur: 1 },
      { color: "#ffffff", amp: 0.34, w: 0.36, shift: -0.08, dir: -1, alpha: 0.95, blur: 0.8 },
      { color: "#5ef2c8", amp: 0.42, w: 0.42, shift: -0.02, dir: 1, alpha: 0.8, blur: 1 },
      { color: "#32c5ff", amp: 0.66, w: 0.52, shift: 0.04, dir: 1, alpha: 0.8, blur: 1.2 },
      { color: "#0a5cff", amp: 0.95, w: 0.62, shift: 0.08, dir: 1, alpha: 0.85, blur: 1.6 },
    ];

    const drawVoiceWave = (now: number) => {
      const visH = cssH - SCREEN_TUCK;
      const midY = visH / 2;
      const startX = PET_ZONE;
      const endX = cssW - ALERT_ZONE;
      if (endX - startX < 40) return;
      const cx = (startX + endX) / 2;
      const halfSpan = (endX - startX) / 2;
      const maxAmp = visH * 0.46;

      const breathe = 0.82 + 0.18 * Math.sin(now / 1100);
      const sway = Math.sin(now / 1700) * halfSpan * 0.05;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.globalCompositeOperation = "lighter";

      // Тонкая линия покоя: через весь пролёт, гаснет к краям.
      const lineGrad = ctx.createLinearGradient(startX, 0, endX, 0);
      lineGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
      lineGrad.addColorStop(0.18, "rgba(255, 255, 255, 0.26)");
      lineGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.46)");
      lineGrad.addColorStop(0.82, "rgba(255, 255, 255, 0.26)");
      lineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = lineGrad;
      ctx.fillRect(startX, midY - 0.5, endX - startX, 1);

      const steps = 56;
      for (const layer of WAVE_LAYERS) {
        const w = halfSpan * layer.w;
        const shift = halfSpan * layer.shift + sway;
        const amp = maxAmp * layer.amp * breathe;

        ctx.filter = `blur(${layer.blur}px)`;
        ctx.globalAlpha = layer.alpha;
        ctx.fillStyle = layer.color;
        ctx.beginPath();
        ctx.moveTo(startX, midY);
        for (let s = 0; s <= steps; s++) {
          const x = startX + ((endX - startX) * s) / steps;
          const d = (x - cx - shift) / w;
          // Асимметричный колокол: левый склон чуть круче правого —
          // «шёлк», натянутый в сторону, как на референсе.
          const skewed = d * d * (1 + 0.3 * Math.tanh(d));
          const ripple = 1 + 0.05 * Math.sin(now / 640 + d * 2.4);
          const e = Math.exp(-skewed) * ripple;
          ctx.lineTo(x, midY + layer.dir * amp * Math.max(0, e));
        }
        ctx.lineTo(endX, midY);
        ctx.closePath();
        ctx.fill();
      }

      ctx.filter = "none";
      ctx.globalAlpha = 1;
      ctx.restore();
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

    /* VU-метр эквалайзера. Старая версия: 4 широких столбика +
       2-точечный мигающий REC в углу. Эффект «уровень горит» —
       но неотличим от обычной анимации. Новая: 8 узких столбиков
       на всю ширину слота, у каждого — peak-маркер на верхушке,
       который держится ~800мс и медленно стекает. REC-точка
       одна, в правом краю, горит всегда — не мигает (мигание
       отвлекает на маленьком экране и читается как «ошибка»).
       Атака быстрая (0.55), затухание плавное (0.12) — выглядит
       как реальный VU-метр, а не «декоративная синусоида». */
    const METER_BARS = 8;
    const METER_MAX = 6;
    const meterLevels = new Float32Array(METER_BARS);
    const meterPeaks = new Float32Array(METER_BARS);
    for (let i = 0; i < METER_BARS; i++) {
      meterLevels[i] = 1.5 + (i % 3) * 0.4;
      meterPeaks[i] = meterLevels[i]!;
    }
    let meterLastNow = 0;

    const drawRecordingMeter = (now: number, startX: number, dxDev: number) => {
      const top = yTop();
      const dt = meterLastNow === 0 ? 16 : Math.min(48, now - meterLastNow);
      meterLastNow = now;

      // REC-индикатор: одна точка в дальнем правом углу, горит
      // постоянно. Не мигает — на маленьком экране мигание читается
      // как «ошибка», а не как «live». Статус «идёт запись» уже
      // считывается из янтарного spectrum'а и из waveform'а в toolbar'е.
      dot(startX + 8 * CELL, top + 3 * CELL, dxDev, 0, now);

      for (let i = 0; i < METER_BARS; i++) {
        // Сигнал: 4 синусоиды + per-bar «дыхание» + per-frame
        // микро-jitter. На маленьком экране (8 баров) jitter
        // делает «живость» — без него столбики выглядят слишком
        // плавно, как бегущая волна, а не как реальный VU.
        const phase = i * 0.7;
        const signal =
          Math.sin(now / (140 + i * 23) + phase) * 0.42 +
          Math.sin(now / (78 + i * 13) + phase * 1.6) * 0.26 +
          Math.sin(now / 320 + phase * 0.5) * 0.18 +
          0.5;
        // Лёгкий per-frame jitter (детерминирован по bar+frame),
        // имитирует мгновенную энергию голоса. Амплитуда ±0.06.
        const jitter = ((Math.sin(now * 0.027 + i * 11.3) + 1) * 0.5 - 0.5) * 0.12;
        const raw = signal + jitter;
        // Маппинг в 0..METER_MAX. Возводим в степень > 1, чтобы
        // тихие участки речи давали низкие столбики (а не средние).
        const shaped = Math.pow(Math.max(0, Math.min(1, raw)), 1.35);
        const target = shaped * METER_MAX;

        // Attack быстрый, release медленный — классический
        // peak-meter, выглядит «отзывчивым», но не дёрганым.
        const smoothing = target > meterLevels[i]! ? 0.55 : 0.12;
        meterLevels[i] = meterLevels[i]! + (target - meterLevels[i]!) * smoothing;

        const height = Math.max(0, Math.min(METER_MAX, Math.round(meterLevels[i]!)));
        // Peak: держится ~800мс на уровень. С max=6 это ≈4.8s полного
        // стекания — нормальный VU-hold для маленького дисплея.
        meterPeaks[i] = Math.max(height, meterPeaks[i]! - dt / 800);

        const col = i;
        // Столбик: 1px-wide колонка точек снизу вверх.
        for (let h = 0; h < height; h++) {
          dot(startX + col * CELL, top + (GLYPH_H - 1 - h) * CELL, dxDev, 0, now);
        }

        // Peak-маркер: 1 точка над верхушкой, если peak выше текущей.
        const peak = Math.max(height, Math.min(METER_MAX, Math.round(meterPeaks[i]!)));
        if (peak > height) {
          dot(
            startX + col * CELL,
            top + (GLYPH_H - 1 - peak) * CELL,
            dxDev,
            0,
            now,
          );
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

      // «Думает» (пост-сабмит) — песочные часы в слоте.
      if (moodRef.current === "ponder") {
        drawRows(PONDER_MARK, startX, dxDev, now);
        slotPrevDanger = null;
        return;
      }

      // Конфиг-действия — свой знак в слоте вместо дефолтного «!».
      if (moodRef.current === "model") {
        drawRows(MODEL_MARK, startX, dxDev, now);
        slotPrevDanger = null;
        return;
      }

      if (moodRef.current === "plan") {
        drawRows(PLAN_MARK, startX, dxDev, now);
        slotPrevDanger = null;
        return;
      }

      if (moodRef.current === "branch") {
        drawRows(BRANCH_MARK, startX, dxDev, now);
        slotPrevDanger = null;
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
      // ponder делит «думающую» пластику питомца с think.
      const mood = moodRef.current === "ponder" ? "think" : moodRef.current;

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
      // ponder делит «думающую» пластику питомца с think.
      const mood = moodRef.current === "ponder" ? "think" : moodRef.current;
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
      // ponder делит «думающую» пластику питомца с think.
      const mood = moodRef.current === "ponder" ? "think" : moodRef.current;

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
      // ponder делит «думающую» пластику питомца с think.
      const mood = moodRef.current === "ponder" ? "think" : moodRef.current;
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

      // Шиммер «думает» — только на статус-тексте, не на питомце/слоте.
      textShimmer = moodRef.current === "ponder";

      // Запись: вместо статусного текста в центральной зоне живёт
      // спектральная волна (Siri-spectrum). Текстовые переходы
      // (dissolve/typewriter) на время записи не рисуются вовсе.
      if (animate && moodRef.current === "listen") {
        drawVoiceWave(now);
        drawPet(now, dxDev, animate);
        drawRightSlot(now, dxDev, animate);
        return;
      }

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

      // Питомец и слот рисуются обычным цветом, без шиммера.
      textShimmer = false;
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
      {/* Стеклянная крышка над дисплеем. CSS (.glass) даёт огранку
          (блик-cap, фаска, толщина) кроссбраузерно; backdrop-filter
          с SVG-картой смещения добавляет настоящее преломление точек
          по краям линзы (только Chromium — иначе слой игнорится). */}
      <span
        ref={glassRef}
        className={styles.glass}
        style={
          glassReady
            ? {
                backdropFilter: `url(#${filterId})`,
                WebkitBackdropFilter: `url(#${filterId})`,
              }
            : undefined
        }
        aria-hidden="true"
      />
      {/* Скрытый SVG-фильтр; innerHTML фильтра пересобирается по
          размеру в эффекте выше. */}
      <svg
        className={styles.glassDefs}
        aria-hidden="true"
        focusable="false"
        width="0"
        height="0"
      >
        <defs>
          <filter
            ref={filterRef}
            id={filterId}
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          />
        </defs>
      </svg>
      <span className={styles.srOnly}>{status}</span>
    </span>
  );
}
