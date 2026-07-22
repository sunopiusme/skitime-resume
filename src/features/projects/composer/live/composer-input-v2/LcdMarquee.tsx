"use client";

import { useEffect, useId, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";

import styles from "./ComposerInput.module.css";
import { getGlyph, GLYPH_H, GLYPH_W } from "./lcdFont";
import { buildGlassFilterMarkup, type GlassTuning } from "./liquidGlass";
import type { VoiceWaveform } from "./voice/useVoiceWaveform";

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

/* ─── Push-сцена (только превью-обложка) ───────────────
   Питомец справа толкает слово «КОМПОЗЕР» влево «шагами»:
   каждый такт — замах (назад), рывок (вперёд), осадка.
   Караван [СЛОВО][зазор][ПИТОМЕЦ] повторяется без шва —
   бесконечная бегущая строка. Включается пропом scene.
   Кириллица — глифы lcdFont (заглавные); без Ж/Ш/Щ/Ю/Ц. */
const PUSH_WORD = "КОМПОЗЕР";
const PUSH_STEP_MS = 1100; // один «такт» каравана (символ пути)
const PUSH_STEP_PX = CHAR_ADVANCE; // караван уезжает на символ за такт
const PUSH_GAP_WORD_PET = CELL; // рука питомца почти вплотную к слову
const PUSH_GAP_PET_WORD = 7 * CELL; // зазор до следующего слова в караване
const PUSH_PET_W = PET_COLS * CELL; // 21px
/* Ножки семенят быстро — питомец «бежит», упираясь в слово,
   а строка при этом ползёт медленно и плавно: контраст усилий. */
const PUSH_LEG_MS = 130;
/* Каждый N-й такт питомец переводит дух: стоит, смотрит на зрителя,
   смахивает каплю пота. Караван в этот такт не едет. */
const PUSH_REST_EVERY = 7;

/* Питомец-толкач — тот же 7×7 питомец (PET_BASE), что и в живой
   панели. Тело и глаза неизменны; для походки чередуем только
   нижний ряд-ноги: A — ноги враскоряку (опора/толчок), B — ноги
   вместе (пронос). Глаза смотрят влево (на слово). Сами кадры
   собираются в drawPushScene из PET_BASE, см. ниже. */
const PUSHER_LEGS_A = "0100010"; // опора, ноги расставлены
const PUSHER_LEGS_B = "0011100"; // пронос, ноги вместе

/* Параметры liquid-glass линзы (см. liquidGlass.ts). Подобраны
   под компактную панель ~22px высотой: фаска узкая, толщина
   небольшая, смещение ограничено maxShift — точки/текст у краёв
   заметно «уходят» в стекло, но без агрессивного разрыва. */
const GLASS_TUNING: GlassTuning = {
  radius: 18, // = top border-radius .glass/.lcd в CSS (18), иначе
  // линза и рамка дают два разных контура («два экрана»).
  // Фаска шире (8) при ТОНКОМ стекле (10): константная толщина
  // в профиле Снелля доминировала и делала смещение почти плоским
  // по всей фаске — полоса одинаково сдвинутых точек и читалась
  // как «экран в экране». При thickness ≈ bezel преломление
  // концентрируется в наружных ~40% фаски и сходит к нулю у
  // внутренней границы — кромочный изгиб без шва.
  bezelWidth: 8,
  glassThickness: 10,
  ior: 1.5,
  scaleRatio: 1,
  // Центр почти не трогаем (0.1 — подпороговое смягчение), а
  // «оптическую толщину» даёт отдельный blur только в зоне фаски.
  blur: 0.1,
  bezelBlur: 0.6,
  specOpacity: 0.32,
  specSaturation: 2.2,
  // Реальный пик смещения = maxShift/2 (карта кодирует 128±127),
  // т.е. 2px на кромке — больше преломления там, где надо, и
  // меньше полошения, чем давал старый плоский профиль.
  maxShift: 4,
  // Дисперсия линзы: синий канал преломляется сильнее красного
  // (±0.25px на кромке — суб-пиксельно, материал, не RGB-глитч).
  chromaticAberration: 0.5,
  // Ключевой свет сверху чуть слева (как блики housing'а в CSS)
  // + слабый контровой на теневой кромке — линза «освещена», а
  // не симметричная бижутерия.
  lightAngle: (115 * Math.PI) / 180,
  counterLight: 0.18,
  specWidthRatio: 1.6,
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
const OFF = "rgba(184, 200, 226, 0.055)";

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
  /* Палитра — единая «продуктовая» система, как набор системных
     LED-цветов одного устройства (референс: Apple HIG dark-mode +
     hardware-индикаторы). Все акценты выровнены по светлоте и
     насыщенности: ни один стейт не «кричит» сильнее соседей,
     семантика держится только на hue. Тёплые статусы (voice,
     warning, files) — одна янтарная семья с разными температурами;
     холодные (decode, access-review, model-*) — одна лазурная. */

  /* База/idle — нейтрально-белый LED: ядро как у белого гребня
     радужной волны (один и тот же «эмиттер»), фринжи — к золоту
     и циану волны (см. ниже: вся аберрация выровнена по её
     спектру red→gold→white→mint→cyan→blue). */
  base: {
    color: "#f4f6fc",
    alpha: 0.98,
    halo: 0.22,
    fringe: 0.07,
    warm: "rgba(255, 224, 168, 1)",
    cool: "rgba(150, 212, 255, 1)",
  },
  /* Печать — ледяной голубой: чуть холоднее базы, спокойное
     «устройство слушает клавиатуру». */
  typing: {
    color: "#dbe9ff",
    alpha: 0.92,
    halo: 0.16,
    fringe: 0.05,
    warm: "rgba(232, 240, 255, 1)",
    cool: "rgba(158, 202, 255, 1)",
  },
  /* Запись — REC-янтарь из тёплой половины волны: оранжевый
     гребень → золото. Фринжи в тон слоям волны. */
  voice: {
    color: "#ffa23d",
    alpha: 0.98,
    halo: 0.22,
    fringe: 0.1,
    warm: "rgba(255, 206, 110, 1)",
    cool: "rgba(110, 216, 255, 1)",
  },
  /* Распознавание — белёсый, в тон записи: устройство «думает»
     тем же белым led-светом, что и слушает. Едва холодный оттенок
     отличает обработку от чистой базы. */
  decode: {
    color: "#eef4ff",
    alpha: 0.98,
    halo: 0.22,
    fringe: 0.08,
    warm: "rgba(255, 234, 200, 1)",
    cool: "rgba(170, 210, 255, 1)",
  },
  /* Warning — мягкое золото: внимание без тревоги. Жёлтый сектор
     (золото), а не оранжевый (REC) и не лимонный (files). */
  warning: {
    color: "#ffd54f",
    alpha: 0.95,
    halo: 0.13,
    fringe: 0.07,
    warm: "rgba(255, 232, 150, 1)",
    cool: "rgba(150, 216, 240, 1)",
  },
  /* Danger — системный красный. Cool-фринж — магента (физически
     корректный blue-shift красного эмиттера): главный «фото-
     графический» признак настоящего экрана на кромках. */
  danger: {
    color: "#ff3b30",
    alpha: 1,
    halo: 0.24,
    fringe: 0.12,
    warm: "rgba(255, 150, 84, 1)",
    cool: "rgba(255, 108, 164, 1)",
  },
  /* Зелёная семантика: три состояния, три оттенка.
     access-standard — «можно»: спокойный изумруд;
     branch — «маршрут»: мятный тил;
     success — «готово»: свежий зелёный (positive). */
  "access-standard": {
    color: "#3ddc97",
    alpha: 0.97,
    halo: 0.16,
    fringe: 0.07,
    warm: "rgba(190, 240, 182, 1)",
    cool: "rgba(120, 230, 212, 1)",
  },
  /* Синяя семантика: decode — лазурь (активная обработка),
     access-review — морской teal (спокойно, но смотри),
     model-high — периванковый синий (серьёзный инструмент). */
  "access-review": {
    color: "#45c4cf",
    alpha: 0.98,
    halo: 0.18,
    fringe: 0.09,
    warm: "rgba(178, 232, 224, 1)",
    cool: "rgba(126, 232, 226, 1)",
  },
  /* Полный доступ — коралл: «горячее» состояние, заметно теплее
     danger-красного, чтобы не путались (риск ≠ ошибка). */
  "access-full": {
    color: "#ff6b52",
    alpha: 1,
    halo: 0.22,
    fringe: 0.1,
    warm: "rgba(255, 152, 110, 1)",
    cool: "rgba(255, 206, 160, 1)",
  },
  branch: {
    color: "#4ad7c2",
    alpha: 0.96,
    halo: 0.16,
    fringe: 0.075,
    warm: "rgba(192, 236, 218, 1)",
    cool: "rgba(100, 222, 255, 1)",
  },
  /* План — мягкий violet: легитимное продолжение спектра волны
     за её глубоким синим краем. */
  plan: {
    color: "#c084fc",
    alpha: 0.98,
    halo: 0.2,
    fringe: 0.095,
    warm: "rgba(226, 182, 255, 1)",
    cool: "rgba(150, 176, 255, 1)",
  },
  /* Файлы — светлая солома: тёплый «документный» жёлтый, тише
     warning-золота (контекст, не сигнал). */
  files: {
    color: "#f5d76e",
    alpha: 0.94,
    halo: 0.13,
    fringe: 0.06,
    warm: "rgba(250, 232, 170, 1)",
    cool: "rgba(186, 220, 206, 1)",
  },
  success: {
    color: "#43e08c",
    alpha: 0.97,
    halo: 0.17,
    fringe: 0.08,
    warm: "rgba(196, 242, 160, 1)",
    cool: "rgba(112, 238, 210, 1)",
  },
  /* Лестница моделей — от тихого к парадному: серебро → бирюза →
     периванковый синий → violet → белое золото. Светимость растёт
     с уровнем — «мощность» читается даже без подписи. */
  "model-low": {
    color: "#cdd9e5",
    alpha: 0.88,
    halo: 0.12,
    fringe: 0.05,
    warm: "rgba(232, 230, 214, 1)",
    cool: "rgba(160, 214, 236, 1)",
  },
  "model-medium": {
    color: "#5fe0d8",
    alpha: 0.94,
    halo: 0.15,
    fringe: 0.065,
    warm: "rgba(196, 238, 210, 1)",
    cool: "rgba(110, 226, 255, 1)",
  },
  "model-high": {
    color: "#6b9eff",
    alpha: 0.97,
    halo: 0.19,
    fringe: 0.09,
    warm: "rgba(186, 210, 255, 1)",
    cool: "rgba(96, 140, 255, 1)",
  },
  "model-max": {
    color: "#b06cf5",
    alpha: 0.98,
    halo: 0.21,
    fringe: 0.095,
    warm: "rgba(216, 178, 250, 1)",
    cool: "rgba(160, 200, 250, 1)",
  },
  "model-ultra": {
    color: "#fff3d6",
    alpha: 1,
    halo: 0.24,
    fringe: 0.11,
    warm: "rgba(255, 224, 150, 1)",
    cool: "rgba(170, 214, 255, 1)",
  },
};

const TRANSITION_MS = 620;

/* ── Таймлайн распознавания (decode) ──────────────────
   Кино-грамматика «непрерывного жеста»: цвет НЕ покидает экран.
   Прежняя версия (волна → голая линия → точка → сфера easeOutBack)
   на стыках читалась монтажными склейками — цвет умирал и
   рождался заново. Теперь волна, не гаснув ни на кадр,
   сворачивается в шар одним движением:
   I  «вдох» (gather) — волна на замахе набирает объём
      (anticipation), стягивание ещё не началось;
   II «сборка» (converge) — весь цветной шёлк стягивается к
      центру и НА ЛЕТУ сворачивается в страты шара: каждая
      вершина ленты скользит по своей траектории (per-vertex
      морф «колокол волны → страта»), кремовое ядро ведёт,
      тяжёлые внешние ленты догоняют (DECODE_LAG_MS). Линия
      горизонта под собирающимся шёлком раскаляется и стихает
      вместе с морфом — энергия течёт в шар, а не исчезает;
   III «осадка» (settle) — шар принимает импульс прибытия:
      лёгкая рябь по стратам, тихая вспышка ядра, ~3.5%
      overshoot радиуса — «капля поймана», не «объект включили».
   Дальше сфера ЖИВЁТ ТИХО и ПЕРЕЛИВАЕТСЯ: медленное дыхание,
   hue-потоки бегут вдоль страт, перламутровый отсвет медленно
   обходит шар — жидкость, а не крашеный диск. В самом конце она
   схлопывается в яркую точку — выход поставлен, а не «свет
   выключили».
   VOICE_DECODE_TOTAL_MS импортирует ComposerInput — один
   источник правды для длительности. */
const DECODE_GATHER_MS = 420;
const DECODE_LAYER_MS = 950;
const DECODE_LAG_MS = 200;
const DECODE_CONVERGE_MS = DECODE_LAYER_MS + DECODE_LAG_MS;
const DECODE_SETTLE_MS = 460;
const DECODE_COLLAPSE_MS = 680;
export const VOICE_DECODE_TOTAL_MS = 12600;

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

   PLAN — чек-лист: левый столбец-«поля» (чекбоксы) + три строки-
   задачи справа. Силуэт из горизонтальных полос читается как
   «список/шаги» и НЕ путается ни с галочкой accept, ни с кольцом
   ready. Раньше тут жила тонкая галочка — она дублировала accept
   и читалась слабо, см. ACCEPT_MARK ниже. */
const PLAN_MARK = [
  "000000000",
  "110011110",
  "110000000",
  "110011110",
  "110000000",
  "110011110",
  "000000000",
];
/* ACCEPT — жирная галочка ✓ в две точки толщиной (одна сплошная
   диагональ снизу-слева вверх-направо). «Задача принята»: уверенное
   подтверждение при сабмите. Намеренно толстая и контурно цельная —
   старая галочка была тонкой 1px-диагональю и «ломалась» на 2px-сетке. */
const ACCEPT_MARK = [
  "000000000",
  "000000110",
  "000001110",
  "110011100",
  "111111000",
  "011110000",
  "001100000",
];
/* READY — кольцо-«готовность»/standby с ядром в центре. Радиально-
   симметричное, без направления — спокойный индикатор «готов к новой
   задаче». Заменяет дефолтный «!», который раньше горел в этом
   состоянии и читался как тревога/ошибка. */
const READY_MARK = [
  "000111000",
  "001111100",
  "011000110",
  "011010110",
  "011000110",
  "001111100",
  "000111000",
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
/* THINK — облачко мысли с многоточием «…» внутри. Фаза «думает»
   после сабмита (в пару к шиммеру по тексту). Заменяет песочные часы:
   облачко + бегущее многоточие — универсальный знак «идёт обработка»,
   и в отличие от статичных часов он ЖИВЁТ (точки загораются по
   очереди, см. drawThinking). Контур статичный, точки анимируются. */
const THINK_BUBBLE = [
  "001111100",
  "010000010",
  "010000010",
  "010000010",
  "001111100",
  "000010000",
  "000100000",
];
/* Колонки точек многоточия внутри облачка (ряд 2 — центр интерьера). */
const THINK_DOT_COLS = [2, 4, 6];
const THINK_DOT_ROW = 2;
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
/* MAX 2.6 (а не 2.3): на точечной сетке слота 2.3 почти не меняет
   число зажжённых точек, дыхание тонет. 2.6 надёжно зажигает
   диагональные точки (dist²=5) на пике и гасит во впадине —
   дыхание становится КВАНТОВАННО-ВИДИМЫМ, а не подпороговым. */
const BREATH_MAX_R = 2.6;
/* 4200мс ≈ 14 вдохов/мин (спокойное дыхание покоя). Не круглые 4000:
   нецелое значение расходится по фазе с тактами 300/1900/2600мс и
   не даёт всем ритмам «слипнуться» в один механический пульс. */
const BREATH_PERIOD_MS = 4200;

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
  | "accept"
  | "ready"
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
  /** Пульс печати: ref с временем последнего нажатия и сглаженным
      интервалом между клавишами. Питомец синхронизирует прыжок с
      реальным ритмом набора и затихает на паузе (vibe-coding:
      всплеск-набора → пауза-на-подумать). Опционален — без него
      «type» прыгает на свободном такте 300мс. */
  typingPulse?: { current: { lastKeyAt: number; interval: number } };
  /** Живой голосовой сигнал записи (общий с waveform в toolbar'е):
      rolling-буфер амплитуд 0..1 + момент последнего тика. Радужная
      волна в LCD реагирует на него: тишина — спокойная линия (idle),
      речь — волна пробегает и пульсирует под голос. */
  voice?: VoiceWaveform;
  /** Спец-сцена для превью-обложки. "push" — питомец толкает
      «КОМПОЗЕР» бесконечной бегущей строкой. По умолчанию обычная
      статус-панель живого composer'а. */
  scene?: "status" | "push";
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

/* Изинги анимации питомца: резкий выход, мягкая осадка.
   arc(t) — единственная «легальная» форма прыжка (0→пик→0). */
const easeOutQuad = (t: number) => 1 - (1 - clamp01(t)) * (1 - clamp01(t));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const easeInOut = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(t));
/* Кубический ease-in-out — для морфа лент в страты: медленный
   отрыв (шёлк «нехотя» трогается), быстрый пролёт середины и
   мягкая посадка без перелёта. Синусоидальный easeInOut для
   такого жеста слишком вялый в середине. */
const easeInOutCubic = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const arc = (t: number) => Math.sin(Math.PI * clamp01(t));

export default function LcdMarquee({
  status,
  mood,
  tone = "default",
  accessLevel,
  colorMode,
  typingPulse,
  voice,
  scene = "status",
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
  const sceneRef = useRef(scene);
  // Зеркалим ref пульса печати, чтобы RAF-цикл всегда читал свежий
  // проп без перезапуска (как с остальными props выше).
  const typingPulseRef = useRef(typingPulse);
  // Голосовой сигнал записи — так же зеркалится в ref для RAF-цикла.
  const voiceRef = useRef(voice);
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
    sceneRef.current = scene;
  }, [scene]);

  useEffect(() => {
    typingPulseRef.current = typingPulse;
  }, [typingPulse]);

  useEffect(() => {
    voiceRef.current = voice;
  }, [voice]);

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
    // Широкий охват на P3-дисплеях (MacBook, iPad Pro): Siri-спектр
    // получает реальную сочность эмиттеров. На sRGB-мониторах и в
    // браузерах без поддержки опция тихо игнорируется — цвет
    // остаётся прежним, деградация невидима.
    const wantP3 =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(color-gamut: p3)").matches;
    const ctx = canvas.getContext(
      "2d",
      wantP3 ? { colorSpace: "display-p3" } : undefined,
    );
    if (!ctx) return;

    // Canvas-filter blur не поддержан в Safari (присвоение тихо
    // игнорируется, filter остаётся "none"). Детектируем один раз:
    // где фильтр есть — рисуем как раньше, где нет — кромки слоёв
    // смягчаются полутеневым штрихом (см. drawVoiceWave). Один и
    // тот же шёлковый вид во всех браузерах вместо «в Chrome мягко,
    // в Safari пиксельные рёбра».
    let canFilter = false;
    try {
      ctx.filter = "blur(1px)";
      canFilter = ctx.filter !== "none";
      ctx.filter = "none";
    } catch {
      canFilter = false;
    }
    const setBlur = (px: number) => {
      if (canFilter) ctx.filter = px > 0 ? `blur(${px}px)` : "none";
    };

    let running = true;
    let rafId = 0;
    let cssW = 0;
    let cssH = 0;
    let dpr = 1;
    // Поле аберрации (см. dot): центр видимой зоны, нормировка
    // квадрата радиуса и смещение фринжа у дальнего края. Зависят
    // только от размера/DPR — пересчитываются в resize, не в кадре.
    let abCx = 0;
    let abCy = 0;
    let abInvR2 = 1;
    let abOffFar = 1;

    // Состояние dissolve-перехода правого слота «!» ↔ «✕».
    // slotDanger — текущий знак (null = ещё не инициализирован),
    // slotPrevDanger — уходящий знак во время перехода (null = нет
    // перехода), slotTransStart — момент старта осыпания.
    let slotDanger: boolean | null = null;
    let slotPrevDanger: boolean | null = null;
    let slotTransStart = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      // Кап 3 (был 2): канвас крошечный (~панель 22px высотой),
      // цена пикселей копеечная, а на ProMotion-ретине кромки
      // волны и сферы становятся идеально гладкими.
      dpr = Math.min(window.devicePixelRatio || 1, 3);
      cssW = Math.max(1, Math.floor(rect.width));
      cssH = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      abCx = cssW / 2;
      abCy = (cssH - SCREEN_TUCK) / 2;
      abInvR2 = 1 / (abCx * abCx + abCy * abCy);
      abOffFar = Math.max(1, Math.round(dpr));
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
        // voice-палитры (REC-абрикос #ffa94d, hue ~31°). Дышим в
        // диапазоне 26°..46° — от глубокого абрикоса к янтарю.
        // Warning-золото живёт выше (~42° статично), но воспри-
        // нимается иначе: REC переливается энергией, warning
        // горит ровно. Drifts ±3° для лёгкого «дыхания».
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
        // Тёплая REC-зона: 26° (глубокий абрикос) → 46° (яркий
        // янтарь). Энергия тянет к жёлтому, покой — к оранжевому.
        const hue = 26 + heat * 20 + drift * 3;
        // На пиках слегка обесцвечивается (как у реального яркого
        // источника света — горячая точка стремится к белому).
        const saturation = 88 - heat * 20;
        const lightness = 52 + heat * 18; // яркость растёт с энергией
        fill = `hsl(${hue}, ${saturation}%, ${lightness * brightness}%)`;
        alpha = activeAlpha * (0.72 + heat * 0.28);
      } else if (recognitionSweep) {
        // Белёсый скан в тон записи: бегущая волна читается
        // яркостью, а не цветом — едва холодный белый led.
        const sweep = Math.max(0, Math.sin(recognitionNow / 150 - xCss * 0.18));
        const shimmer = Math.max(0, Math.sin(recognitionNow / 70 + yCss * 0.95));
        const energy = Math.min(1, sweep * 0.82 + shimmer * 0.18);
        const lightness = 64 + energy * 26;
        fill = `hsl(220, 12%, ${lightness * brightness}%)`;
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

      // Ближний bloom: квадратное гало вокруг ячейки (эмиттер —
      // квадратная апертура; круглую дальнюю составляющую даёт
      // CSS drop-shadow). Поверх — латеральная хроматическая
      // аберрация РЕАЛЬНОЙ линзы: на оптической оси её нет, к
      // краю поля она растёт сверхлинейно, причём коротковолновый
      // (cool) образ увеличен сильнее — cool-фринж ложится
      // НАРУЖУ от центра экрана, warm — внутрь. Центральная
      // треть экрана остаётся идеально резкой (и дешевле: 2
      // прямоугольника вместо 4).
      ctx.fillStyle = fill;
      ctx.globalAlpha = alpha * halo;
      ctx.fillRect(
        px - Math.round(dpr),
        py - Math.round(dpr),
        s + Math.round(2 * dpr),
        s + Math.round(2 * dpr),
      );

      const fdx = xCss - abCx;
      const fdy = yCss - abCy;
      // Квадратичная кривая поля ≈ рост CA у линзы; без sqrt.
      const m = Math.min(1, (fdx * fdx + fdy * fdy) * abInvR2);
      if (m >= 0.06) {
        const side = fdx >= 0 ? 1 : -1;
        const oy = fdy > abCy * 0.6 ? 1 : fdy < -abCy * 0.6 ? -1 : 0;
        const off = m < 0.5 ? 1 : abOffFar;
        const fa = alpha * fringe * (0.25 + 0.75 * m);

        ctx.fillStyle = activePalette.cool; // синий преломляется сильнее → наружу
        ctx.globalAlpha = fa;
        ctx.fillRect(px + side * off, py + oy, s, s);

        ctx.fillStyle = activePalette.warm; // тёплый — внутрь, чуть слабее:
        ctx.globalAlpha = fa * 0.85; // асимметрия читается фотографично
        ctx.fillRect(px - side * off, py - oy, s, s);
      }

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

    /* ── Волна записи (voice-reactive rainbow) ──
       Радужный «шёлковый» бугор теперь живёт ГОЛОСОМ, а не
       таймерами. Два масштаба реактивности:
       • глобальная огибающая — весь стек лент дышит мгновенным
         уровнем (двойной one-pole follower: атака ~55-110мс,
         спад ~250-400мс);
       • стоячее поле — пара стоячих гармонических мод поверх
         колокола; их амплитуда живёт быстрой огибающей и
         транзиентами. Волна ПУЛЬСИРУЕТ на месте, как будто голос
         держит её в руке, — ничего не пробегает вдоль экрана.
       Тишина — тонкая белая линия покоя с редким бликом (idle).
       Цвет = голос: радуга существует только когда говоришь. */
    type WaveLayer = {
      h: number;
      s: number;
      l: number;
      amp: number; // доля максимальной амплитуды
      w: number; // ширина колокола, доля полупролёта
      shift: number; // смещение гребня от центра, доля полупролёта
      dir: -1 | 1; // -1 — верхняя половина, 1 — нижняя
      alpha: number;
      blur: number;
      resp: number; // 0 = ленивый «бас» (envSlow) … 1 = живой верх (envFast)
      histMix: number; // насколько слой артикулирует холмы истории речи
      dL: number; // подъём lightness с энергией
      bandY: number; // страта в шаре: вертикаль центра, доля радиуса (−1..1)
      bandT: number; // страта в шаре: толщина, доля радиуса
      core?: boolean;
    };

    /* Внешние ленты (красная/синяя) вздыхают лениво как бас,
       белое ядро щёлкает по каждому слогу — этот лаг между
       слоями и делает стек ламинарно-шёлковым, а не резиновым. */
    /* Палитра 1:1 по референсу (Siri-spectrum на чёрном): алый →
       оранж → золото → кремово-белый гребень (смещён ВЛЕВО от
       центра) → минт → циан → глубокий синий. Верхние ленты тянутся
       вправо длинным хвостом, синий — самый массивный снизу; bloom
       мягкий и широкий (blur у внешних лент больше). */
    /* bandY/bandT — раскладка спектра ВНУТРИ шара (доли радиуса):
       алый свод сверху, кремовый гребень чуть выше центра, массивный
       глубокий синий на дне — вертикальный срез референса. */
    const WAVE_LAYERS: readonly WaveLayer[] = [
      { h: 8, s: 100, l: 54, amp: 1, w: 0.72, shift: 0.22, dir: -1, alpha: 0.8, blur: 1.8, resp: 0.25, histMix: 0.5, dL: 10, bandY: -0.62, bandT: 0.3 },
      { h: 28, s: 100, l: 56, amp: 0.78, w: 0.56, shift: 0.13, dir: -1, alpha: 0.82, blur: 1.3, resp: 0.45, histMix: 0.65, dL: 12, bandY: -0.4, bandT: 0.26 },
      { h: 42, s: 100, l: 62, amp: 0.54, w: 0.46, shift: 0.04, dir: -1, alpha: 0.85, blur: 1.1, resp: 0.7, histMix: 0.8, dL: 12, bandY: -0.22, bandT: 0.22 },
      // Кремово-белый гребень: тёпло-белый, не стерильный (как на
      // референсе), смещён влево; blur пошире и мягче артикуляция —
      // резкое белое на чёрном выдаёт пиксели сильнее всего.
      { h: 44, s: 88, l: 91, amp: 0.36, w: 0.38, shift: -0.14, dir: -1, alpha: 0.88, blur: 1.5, resp: 1, histMix: 0.72, dL: 0, bandY: -0.06, bandT: 0.16, core: true },
      { h: 152, s: 82, l: 58, amp: 0.44, w: 0.44, shift: -0.05, dir: 1, alpha: 0.82, blur: 1.1, resp: 0.8, histMix: 0.8, dL: 10, bandY: 0.14, bandT: 0.22 },
      { h: 196, s: 100, l: 58, amp: 0.68, w: 0.54, shift: 0.05, dir: 1, alpha: 0.82, blur: 1.3, resp: 0.55, histMix: 0.65, dL: 10, bandY: 0.36, bandT: 0.26 },
      { h: 223, s: 100, l: 53, amp: 0.98, w: 0.7, shift: 0.1, dir: 1, alpha: 0.88, blur: 1.8, resp: 0.3, histMix: 0.5, dL: 8, bandY: 0.62, bandT: 0.34 },
    ];

    // Состояние огибающих между кадрами. Всё, что рисуется, —
    // непрерывная функция {act, envFast, envSlow, pop}, каждая
    // сглажена one-pole'ом → хлопки невозможны по построению.
    let wEnvFast = 0;
    let wEnvSlow = 0;
    let wAct = 0;
    let wPop = 0;
    // Полосные огибающие [низ, середина, верх] — артикуляция речи:
    // басовые внешние ленты ведёт низ голоса, кремовый гребень —
    // верх. Сглаживаются тем же one-pole'ом, что и общая энергия.
    const wBand = new Float32Array(3);
    let wGateOpen = false;
    let wSilentMs = 0;
    let wPrevNow = 0;
    let wLastTick = -1;
    let wPrevNewest = 0;
    // Был ли прошлый кадр в режиме записи: на входе в listen всё
    // состояние огибающих обнуляется — иначе хвост прошлой сессии
    // записи вспыхивал бы остаточной амплитудой.
    let wWasListening = false;
    // Момент входа в режим распознавания (think) — ведёт таймлайн
    // морфа «волна → линия → жидкая сфера».
    let wThinkStart = 0;
    // Момент зажигания сцены записи: линия горизонта разгорается из
    // центральной искры, а не «включается телевизором».
    let wWaveStart = 0;
    // 96 шагов: рябь rip (период ~74px) получает ~13 точек на
    // период вместо ~7 — на ретине контур больше не гранёный.
    const WAVE_STEPS = 96;
    const waveHist = new Float32Array(WAVE_STEPS + 1); // scratch, ноль аллокаций в кадре
    // Силуэт волны текущего кадра (макс. высота слоёв сверху/снизу
    // на каждом шаге) — маска для гребня-блика.
    const waveTopEnv = new Float32Array(WAVE_STEPS + 1);
    const waveBotEnv = new Float32Array(WAVE_STEPS + 1);
    const waveLayerH = new Float32Array(WAVE_STEPS + 1); // высоты текущего слоя
    // Контур морфящейся ленты (сборка/сфера): x/y верхней или нижней
    // кромки текущего слоя — scratch для гладкой трассировки Безье.
    const morphX = new Float32Array(WAVE_STEPS + 1);
    const morphY = new Float32Array(WAVE_STEPS + 1);

    const follow = (env: number, x: number, dt: number, tauA: number, tauR: number) =>
      env + (1 - Math.exp(-dt / (x > env ? tauA : tauR))) * (x - env);

    const resetWaveState = (now: number) => {
      wEnvFast = 0;
      wEnvSlow = 0;
      wAct = 0;
      wPop = 0;
      wBand.fill(0);
      wGateOpen = false;
      wSilentMs = 0;
      wPrevNow = now;
      wLastTick = -1;
      wPrevNewest = 0;
      wWaveStart = now;
    };

    /* decode=true — режим «РАСПОЗНАЁМ»: комплексный морф ОДНИМ
       рендером. Те же цветные ленты волны, не гаснув ни на кадр,
       per-vertex стягиваются с полного пролёта в страты жидкого
       шара (кремовое ядро ведёт, тяжёлые внешние ленты догоняют),
       шар принимает импульс лёгкой рябью и дальше ПЕРЕЛИВАЕТСЯ:
       hue-потоки бегут вдоль страт, перламутровый отсвет медленно
       обходит жидкость. Ничего не подменяется и не гаснет: физика
       огибающих общая, переход запись → распознавание бесшовный
       по построению. */
    const drawVoiceWave = (now: number, decode = false) => {
      const visH = cssH - SCREEN_TUCK;
      const midY = visH / 2;
      const startX = PET_ZONE;
      const endX = cssW - ALERT_ZONE;
      const span = endX - startX;
      if (span < 40) return;

      const xAt = (st: number) => startX + (span * st) / WAVE_STEPS;
      // Гладкий контур по точкам шага: квадратичные Безье через
      // середины хорд. Полилиния из lineTo на ретине читалась
      // гранёной — кривые дают шёлковый край почти бесплатно.
      // sign: -1 — контур над линией (midY - h), 1 — под (midY + h).
      const smoothEnv = (
        h: Float32Array,
        sign: number,
        from: number,
        to: number,
        move: boolean,
      ) => {
        const dir = to > from ? 1 : -1;
        const y0 = midY + sign * h[from]!;
        if (move) ctx.moveTo(xAt(from), y0);
        else ctx.lineTo(xAt(from), y0);
        for (let st = from + dir; st !== to; st += dir) {
          const y = midY + sign * h[st]!;
          const yn = midY + sign * h[st + dir]!;
          ctx.quadraticCurveTo(xAt(st), y, (xAt(st) + xAt(st + dir)) / 2, (y + yn) / 2);
        }
        ctx.lineTo(xAt(to), midY + sign * h[to]!);
      };

      // Та же шёлковая трассировка для произвольного контура
      // (morphX/morphY): кромки морфящейся ленты и страты шара —
      // безье через середины хорд, без гранёной полилинии.
      const tracePts = (move: boolean) => {
        if (move) ctx.moveTo(morphX[0]!, morphY[0]!);
        else ctx.lineTo(morphX[0]!, morphY[0]!);
        for (let i = 1; i < WAVE_STEPS; i++) {
          ctx.quadraticCurveTo(
            morphX[i]!,
            morphY[i]!,
            (morphX[i]! + morphX[i + 1]!) / 2,
            (morphY[i]! + morphY[i + 1]!) / 2,
          );
        }
        ctx.lineTo(morphX[WAVE_STEPS]!, morphY[WAVE_STEPS]!);
      };

      /* ── Таймлайн декода: вдох → сборка → осадка → жизнь → финал ──
         (грамматика — см. блок констант DECODE_*). Ключевое отличие
         от прежних версий: между волной и шаром НЕТ промежуточных
         «голой линии» и «точки» как отдельных кадров-форм — цветные
         ленты сами, не гаснув, стягиваются в страты per-vertex
         морфом. Резкая смена формы невозможна по построению:
         каждый кадр — та же геометрия, просто дальше по траектории. */
      const tThink = decode ? now - wThinkStart : 0;
      const gather = decode ? arc(clamp01(tThink / DECODE_GATHER_MS)) : 0;
      // Глобальная сборка 0..1 (включая лаги всех лент) — ведёт
      // сценические шкалы: затухание линии и волновых бликов,
      // проявление жизни шара.
      const convLin = decode
        ? clamp01((tThink - DECODE_GATHER_MS) / DECODE_CONVERGE_MS)
        : 0;
      // morph = «сферность» сцены: ведёт цветовую жизнь страт,
      // затухание линии и доводку радиуса.
      const morph = easeInOut(convLin);
      const mFade = 1 - morph;
      // Прибытие: весь шёлк собрался — шар принимает импульс
      // (settle: рябь по стратам, тихая вспышка ядра, overshoot
      // радиуса ~3.5%) и успокаивается. arc даёт 0→1→0.
      const tArrive = DECODE_GATHER_MS + DECODE_CONVERGE_MS;
      const settle = decode
        ? arc(clamp01((tThink - tArrive) / DECODE_SETTLE_MS))
        : 0;
      // Жизнь шара (лимб, ореол, ядро, глянец, кромка) проявляется
      // на последней трети сборки — когда силуэт уже почти круглый;
      // раньше кольцевые элементы обводили бы недособранный шёлк.
      const lifeIn = decode ? easeInOut(clamp01((convLin - 0.7) / 0.3)) : 0;
      // Переливы (hue-потоки вдоль страт, перламутровый отсвет)
      // расцветают после осадки: сначала шар «садится», потом живёт.
      const iridIn = decode
        ? easeInOut(clamp01((tThink - tArrive) / 700))
        : 0;
      // Дыхание сферы: ровная медленная синусоида. Прежний lub-dub
      // (сердцебиение) толчками дёргал радиус, толщину страт и
      // яркость ядра — сфера «пульсировала». Спокойный объект едва
      // дышит: все модуляции от heart ниже плавные и вдвое тише.
      const heart = morph * (0.18 + 0.18 * Math.sin(tThink / 1500));
      const tCollapse = tThink - (VOICE_DECODE_TOTAL_MS - DECODE_COLLAPSE_MS);
      const collapse = decode ? easeInOut(clamp01(tCollapse / DECODE_COLLAPSE_MS)) : 0;
      // Вдох перед финалом: за 360мс до схлопывания сфера слегка
      // раздувается — anticipation последнего акта.
      const inhale =
        decode && tCollapse < 0 ? arc(clamp01((tCollapse + 360) / 360)) : 0;
      const cScale = (1 + 0.08 * inhale) * (1 - collapse * 0.94);
      const sphereMax = (Math.min(CONTENT_H, visH - 2) / 2) * cScale;
      // Радиус: шар собирается сразу почти в полный размер (ленты
      // стягиваются К НЕМУ, а не растят его из точки), доносит
      // последние ~10% с морфом и мягко перелетает на осадке.
      const sphereR = decode
        ? sphereMax * (0.9 + 0.1 * morph) * (1 + 0.035 * settle)
        : 0;
      // Жёсткого спина НЕТ: шар не «крутящийся диск», его содержимое
      // переливается — страты жидкости гуляют волнами и наклоняются
      // (см. slosh/tilt в морфе слоёв). Физика лавовой лампы.

      let raw: number;
      if (decode) {
        // Синтетический уровень обработки: ровное дыхание сферы +
        // вдох-замах перед выдохом. Питает огибающие, чтобы страты
        // и цвет жили, пока волна оседает и сфера расцветает.
        const t = now / 1000;
        raw = Math.max(
          0,
          0.3 + 0.26 * heart + 0.08 * Math.sin(t * 5.1 + 1.7) + 0.5 * gather,
        );
      } else {
        const vw = voiceRef.current;
        const bars = vw?.barsRef.current ?? null;
        const barsN = bars ? bars.length : 0;
        raw = bars && barsN > 0 ? bars[barsN - 1]! : 0;
      }

      // Огибающие (frame-rate independent; clamp dt переживает
      // расфокус вкладки без скачков).
      const dt = Math.min(50, Math.max(0.1, now - wPrevNow));
      wPrevNow = now;
      // Детектор транзиентов — раз на sample-tick: резкий скачок
      // уровня = «пик» (вспышка яркости/ширины ядра на ~0.5с).
      // ТОЛЬКО в записи: в decode транзиентов нет — сфера не
      // вспыхивает и не пульсирует яркостью, хвост wPop с записи
      // гаснет естественным распадом.
      if (!decode) {
        const lastSample = voiceRef.current?.lastSampleRef.current ?? now;
        if (lastSample !== wLastTick) {
          wLastTick = lastSample;
          const jump = raw - wPrevNewest;
          if (jump > 0.18) wPop = Math.min(1, wPop + 1.6 * jump);
          wPrevNewest = raw;
        }
      }
      wPop *= Math.exp(-dt / 160);
      wEnvFast = follow(wEnvFast, raw, dt, 55, 250);
      wEnvSlow = follow(wEnvSlow, raw, dt, 110, 400);
      // Полосные огибающие: в записи их питает спектр голоса
      // (useVoiceWaveform), в decode полос нет — все три следуют
      // синтетическому пульсу с лёгким наклоном вниз по частоте.
      const vb = decode ? null : (voiceRef.current?.bandsRef?.current ?? null);
      for (let bi = 0; bi < 3; bi++) {
        const target = vb ? vb[bi]! : raw * (1 - 0.12 * bi);
        wBand[bi] = follow(wBand[bi]!, target, dt, 70, 300);
      }
      // Гейт тишины: открывается мгновенно, закрывается после
      // 250мс тишины (держит межсловные паузы без мерцания).
      if (wEnvFast < 0.012 && raw < 0.02) wSilentMs += dt;
      else wSilentMs = 0;
      if (raw > 0.025) wGateOpen = true;
      else if (wSilentMs > 250) wGateOpen = false;
      wAct = follow(wAct, wGateOpen ? 1 : 0, dt, 90, 450);
      const S = wAct * wAct * (3 - 2 * wAct); // smoothstep-микс idle↔active

      const cx = (startX + endX) / 2;
      const halfSpan = span / 2;
      // Побольше вертикального объёма: бугор «пухлый», а не
      // плоская полоса — мягкий потолок hMax всё равно держит
      // его в пределах экрана.
      const maxAmp = visH * 0.58;
      const hMax = visH * 0.48;
      const spread = 0.5;
      const eFast = Math.pow(wEnvFast, 0.75);
      const eSlow = Math.pow(wEnvSlow, 0.75);

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.globalCompositeOperation = "lighter";

      /* ── Зажигание сцены ──────────────────────────────
         Вход в запись — проявление СВЕТОМ: линия горизонта сразу
         занимает весь пролёт и за ~420мс набирает яркость (ease-out).
         Никакой геометрии «из точки» — ни звезды, ни растущей линии:
         они читались экраном загрузки. Свет просто приходит, как
         подсветка клавиатуры MacBook. И вход прерываем: голос,
         пришедший сразу после нажатия, пробивает зажигание (gate
         ниже) — устройство слушает с первой миллисекунды. */
      const tWave = now - wWaveStart;
      const ignite = wWaveStart === 0 ? 1 : easeOutCubic(clamp01(tWave / 420));
      const igniteGate = Math.max(ignite, clamp01(wEnvFast * 4));

      // Линия покоя: живёт всегда (под волной — почти гаснет,
      // чтобы не читалась «флейром» во всю ширину экрана),
      // микро-шиммер ±12% за ~17с — «едва жива», но не мертва.
      // В decode линия — ПОДДЕРЖКА перехода, не отдельный акт:
      // она сжимается СИНХРОННО с собирающимся шёлком (morph) и
      // раскаляется под ним (lineHeat, пик в середине сборки) —
      // энергия течёт по линии в шар, и зрителю не показывают
      // «голую линию» как самостоятельный кадр.
      const coreHalf = Math.max(2, sphereMax * 0.22);
      const lineHalf = halfSpan + (coreHalf - halfSpan) * morph;
      const lineL = cx - lineHalf;
      const lineHeat = decode ? arc(convLin) * (0.5 + 0.4 * morph) : 0;
      const lineDim =
        ((1 - 0.85 * S) * (0.88 + 0.12 * Math.sin(now / 2700)) +
          2.2 * lineHeat) *
        (1 - 0.93 * morph) *
        ignite;
      const lineGrad = ctx.createLinearGradient(lineL, 0, cx + lineHalf, 0);
      lineGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
      lineGrad.addColorStop(0.18, `rgba(255, 255, 255, ${Math.min(1, 0.22 * lineDim)})`);
      lineGrad.addColorStop(0.5, `rgba(255, 255, 255, ${Math.min(1, 0.4 * lineDim)})`);
      lineGrad.addColorStop(0.82, `rgba(255, 255, 255, ${Math.min(1, 0.22 * lineDim)})`);
      lineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = lineGrad;
      ctx.fillRect(lineL, midY - 0.5, lineHalf * 2, 1);

      // Раскалённое ядро линии: тёпло-белый ореол растёт по мере
      // того, как энергия собирающегося шёлка течёт по линии к
      // центру, и передаёт свет ядру шара — стык бесшовный по
      // яркости (ядро подхватывает его своим свечением, см. coreA).
      if (lineHeat > 0.01) {
        const ha = Math.min(1, 0.55 * lineHeat);
        const hot = ctx.createLinearGradient(lineL, 0, cx + lineHalf, 0);
        hot.addColorStop(0, "rgba(255, 248, 238, 0)");
        hot.addColorStop(0.5, `rgba(255, 250, 242, ${ha})`);
        hot.addColorStop(1, "rgba(255, 248, 238, 0)");
        ctx.fillStyle = hot;
        setBlur(1.2);
        ctx.fillRect(lineL, midY - 1.5, lineHalf * 2, 3);
        setBlur(0);
      }

      // Редкий бегущий блик по линии — только в покое записи.
      if (!decode && S < 0.3 && now % 5200 < 1400) {
        const headX = startX + ((now % 5200) / 1400) * span;
        const glint = ctx.createLinearGradient(headX - 30, 0, headX + 30, 0);
        glint.addColorStop(0, "rgba(255, 255, 255, 0)");
        glint.addColorStop(0.5, `rgba(255, 255, 255, ${0.15 * lineDim})`);
        glint.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = glint;
        ctx.fillRect(headX - 30, midY - 0.5, 60, 1);
      }

      // Чистый покой: ни слоёв, ни blur — нулевая цена кадра.
      if (S < 0.01) {
        ctx.globalAlpha = 1;
        ctx.restore();
        return;
      }

      // Стоячее поле вместо бегущей истории: волна не «проезжает»
      // по экрану, а пульсирует на месте под голосом. Две стоячие
      // гармонические моды поверх колокола; их амплитуда живёт
      // быстрой огибающей и транзиентами (pop), фазы лишь слегка
      // покачиваются от медленной энергии — дрейфа вдоль экрана
      // нет по построению. Огибающая sin(u) гасит моды к краям,
      // чтобы основание оставалось на линии покоя.
      const a2 = (0.16 + 0.3 * wPop) * eFast;
      const a3 = 0.12 * eFast * eFast + 0.18 * wPop;
      const ph2 = 0.7 * Math.sin(now / 1300) * eSlow;
      const ph3 = 0.9 * Math.sin(now / 1900 + 1.7) * eSlow;
      for (let st = 0; st <= WAVE_STEPS; st++) {
        const u = (st / WAVE_STEPS) * Math.PI;
        const taper = Math.sin(u);
        waveHist[st] =
          (a2 * Math.sin(2 * u + ph2) + a3 * Math.sin(3 * u + ph3)) * taper;
      }

      // Автономные таймеры дыхания удалены: и качание, и
      // остаточная жизнь существуют только при звуке (×eSlow×S).
      const sway = Math.sin(now / 1500) * halfSpan * 0.04 * eSlow * S;
      const breath = 1 + 0.03 * Math.sin(now / 1100) * eSlow;

      waveTopEnv.fill(0);
      waveBotEnv.fill(0);
      let maxHH = 0; // высота самого большого бугра кадра — для растворения бликов
      for (const L of WAVE_LAYERS) {
        // Полосная артикуляция: resp слоя выбирает его «частотный
        // дом» — тяжёлые внешние ленты (resp≈0.25) слушают низ,
        // средние — середину, кремовый гребень (resp=1) — верх.
        // Волна ПРОИЗНОСИТ речь (гласные качают низ, согласные
        // вспыхивают на гребне), а не дышит одной общей громкостью.
        const bandE =
          L.resp < 0.5
            ? wBand[0]! + (wBand[1]! - wBand[0]!) * (L.resp * 2)
            : wBand[1]! + (wBand[2]! - wBand[1]!) * ((L.resp - 0.5) * 2);
        const e =
          Math.pow(wEnvSlow + (wEnvFast - wEnvSlow) * L.resp, 0.75) *
          (0.62 + 0.52 * Math.min(1, bandE * 1.45));
        // Вдох-замах: волна вспухает перед сборкой, верхние слои
        // сильнее (живой верх реагирует первым). Отдельного «выдоха
        // в линию» больше НЕТ: высоту источника сводит сам морф
        // (вершины скользят к стратам шара), а огибающие естественно
        // опадают, когда gather отпускает.
        const amp =
          maxAmp *
          L.amp *
          (0.18 + 0.82 * e) *
          S *
          breath *
          (1 + 0.3 * wPop * L.resp) *
          (1 + 0.4 * gather * (0.6 + 0.6 * L.resp)) *
          igniteGate;
        // Плавное проявление вместо жёсткого порога: пока бугор
        // ниже ~2px, слой растворяется по альфе — затухание в ноль
        // идёт светом, а не пиксельными ступеньками высоты.
        const reveal = clamp01((amp * 1.5 - 0.3) / 2.4);
        // Морф ленты: 0 — чистая волна, 1 — страта шара. Кремовое
        // ядро (resp=1) трогается первым, тяжёлые внешние ленты
        // догоняют с лагом до DECODE_LAG_MS — шёлк сворачивается
        // «изнутри наружу», а не телепортируется целиком.
        const mGeo = decode
          ? easeInOutCubic(
              clamp01(
                (tThink - DECODE_GATHER_MS - DECODE_LAG_MS * (1 - L.resp)) /
                  DECODE_LAYER_MS,
              ),
            )
          : 0;
        if (reveal <= 0 && mGeo <= 0) continue;
        const rv = reveal * reveal * (3 - 2 * reveal);
        const w = halfSpan * L.w * spread * (L.core ? 1 + 0.15 * wPop : 1);
        const shift = halfSpan * L.shift * spread + sway;

        // Высота колокола в шаге st — общая для волны и морфа:
        // источник траектории каждой вершины ленты.
        const bellH = (st: number) => {
          const x = xAt(st);
          const d = (x - cx - shift) / w;
          // Асимметричный колокол: длинный тающий хвост в сторону
          // смещения гребня, крутой подъём с другой — «шёлк,
          // натянутый вбок», как на референсе.
          const bell = Math.exp(
            -d * d * (1 - 0.26 * Math.tanh(d) * (L.shift >= 0 ? 1 : -1)),
          );
          const field = 1 + L.histMix * waveHist[st]!;
          // Рябь — лёгкий шиммер на месте (дрейф ~5px/с, едва
          // заметен): движение по экрану читалось «пробеганием».
          const rip =
            1 +
            (0.015 + 0.05 * wEnvFast) *
              Math.sin(x * 0.085 - now * 0.0014 + L.shift * 7);
          const hRaw = amp * bell * field * rip;
          // Мягкий потолок вместо жёсткого клиппинга 21px-полосы.
          return hMax * (1 - Math.exp(-Math.max(0, hRaw) / hMax));
        };

        setBlur(L.blur);
        // Альфа слоя: в волне — голос и высота (rv); по мере морфа
        // лента непрерывно доезжает до полной плотности страты.
        // Никакого fade-out/fade-in на стыке форм — цвет не гаснет.
        const waveA = S * rv;
        const layerAlpha =
          L.alpha *
          (0.55 + 0.45 * Math.min(1, e)) *
          (waveA + (1 - waveA) * mGeo);
        ctx.globalAlpha = layerAlpha;
        // Пики слегка обесцвечиваются и светлеют — горячий свет
        // стремится к белому (та же физика, что у LED-точек).
        // В сфере цвет ЖИВЁТ: hue каждого слоя медленно дрейфует
        // (±16°, у всех своя фаза) — жидкость переливается, спектр
        // перетекает между лентами, а не стоит выкрашенным диском.
        const hueDrift =
          morph *
          (16 * Math.sin(now / 1400 + L.shift * 9) +
            7 * Math.sin(now / 530 + L.h * 0.2));
        const hue = L.h + hueDrift;
        // На схлопывании цвет выгорает в белый: насыщенность падает,
        // светлота растёт — сфера плавно РАСКАЛЯЕТСЯ в звезду, а не
        // переключается на неё.
        const sat = Math.max(0, (L.s - 14 * wPop) * (1 - collapse * 0.85));
        const lig = Math.min(
          100,
          L.l + L.dL * e + 6 * wPop + 5 * heart * morph + 30 * collapse,
        );
        // Шёлковая вуаль: вертикальный градиент от насыщенного
        // основания у горизонта к тающему гребню — кромка слоя
        // растворяется в воздухе, а не обрывается, и стек лент
        // читается как подсвеченная дымка над горизонтом.
        const veil = ctx.createLinearGradient(0, midY, 0, midY + L.dir * hMax);
        veil.addColorStop(0, `hsla(${hue}, ${sat}%, ${lig}%, 0.95)`);
        veil.addColorStop(0.55, `hsla(${hue}, ${sat}%, ${lig}%, 0.78)`);
        veil.addColorStop(1, `hsla(${hue}, ${sat}%, ${Math.min(100, lig + 14)}%, 0.1)`);
        ctx.fillStyle = veil;
        if (mGeo <= 0) {
          // ── Волна (запись + вдох): обычный силуэт лент ──
          const env = L.dir < 0 ? waveTopEnv : waveBotEnv;
          for (let st = 0; st <= WAVE_STEPS; st++) {
            const hh = bellH(st);
            waveLayerH[st] = hh;
            if (hh > env[st]!) env[st] = hh;
            if (hh > maxHH) maxHH = hh;
          }
          ctx.beginPath();
          ctx.moveTo(startX, midY);
          smoothEnv(waveLayerH, L.dir, 0, WAVE_STEPS, false);
          ctx.lineTo(endX, midY);
          ctx.closePath();
          ctx.fill();
        } else {
          /* ── Сборка и сфера: лента per-vertex затекает в страту ──
             Кинематографичность = непрерывность. Ни одна форма не
             гаснет и не подменяется: верхняя кромка ленты скользит
             от колокола волны к верхней кромке своей страты, нижняя
             — от линии горизонта к нижней; x сжимается с полного
             пролёта к хорде шара. На mGeo=0 это в точности волна,
             на 1 — в точности страта; между ними шёлк сворачивается
             в шар «изнутри наружу» (ядро ведёт). Прежние версии —
             летящая воронка/спираль (читалась хаосом) и монтажная
             склейка волна→линия→точка→шар (читалась резкой) — обе
             хуже: морф держит одну читаемую форму на всём пути.
             Страты живут (bow-широты, slosh, дрейф) уже в полёте. */
          const R = Math.max(0.7, sphereR);
          const Wc = R * 0.985;
          const hB =
            R * L.bandT * (1 + 0.16 * heart * L.resp) * (1 - 0.45 * collapse);
          const yC =
            R * L.bandY + R * 0.03 * Math.sin(now / 2300 + L.bandY * 8);
          const latR = Math.sqrt(Math.max(1, R * R - yC * yC));
          const camT = 0.16; // наклон «камеры»: сила прогиба широт
          const tilt =
            0.09 * Math.sin(now / 1900 + L.bandY * 5) * morph +
            0.55 * collapse * collapse;
          const w1 = now * 0.0011 + L.bandY * 7;
          const w2 = now * 0.0017 - L.bandY * 4;
          // Рябь прибытия: на осадке жидкость ловит импульс (живые
          // слои сильнее, ×resp) и успокаивается вместе с arc(settle).
          const sloshAmp =
            R *
            (0.05 + 0.05 * heart * L.resp) *
            (1 + 0.9 * collapse) *
            (1 + 1.5 * settle * L.resp);
          const pts = WAVE_STEPS;
          // Верхняя кромка: страта → лерп к колоколу (для нижних
          // лент источник — линия горизонта). Попутно слой ОСТАЁТСЯ
          // в огибающей силуэта с весом (1−mGeo): белые блики
          // (гребень/рим/горизонт) тают вместе с уходящим шёлком
          // непрерывно, а не отщёлкиваются ступенькой в кадре,
          // когда слой переходит из волновой ветки в морф.
          for (let st = 0; st <= pts; st++) {
            const u = st / pts;
            const xr = (2 * u - 1) * Wc;
            const ch = Math.sqrt(Math.max(0, R * R - xr * xr));
            const ux = xr / R;
            const bow =
              camT *
              latR *
              Math.sqrt(Math.max(0, 1 - (xr * xr) / (latR * latR)));
            const slosh =
              sloshAmp * Math.sin(7.2 * ux + w1) +
              R * 0.028 * Math.sin(13.5 * ux - w2);
            let yT = yC + bow + tilt * xr - hB + slosh;
            yT = yT < -ch ? -ch : yT > ch ? ch : yT;
            let px = cx + xr;
            let py = midY + yT;
            if (mGeo < 1) {
              const sx = xAt(st);
              let sy = midY;
              if (L.dir < 0) {
                const bh = bellH(st);
                sy = midY - bh;
                const ghost = bh * (1 - mGeo);
                if (ghost > waveTopEnv[st]!) waveTopEnv[st] = ghost;
                if (ghost > maxHH) maxHH = ghost;
              }
              px = sx + (px - sx) * mGeo;
              py = sy + (py - sy) * mGeo;
            }
            morphX[st] = px;
            morphY[st] = py;
          }
          ctx.beginPath();
          tracePts(true);
          // Нижняя кромка (обратный ход): страта → лерп к линии
          // горизонта (для нижних лент источник — колокол волны).
          for (let st = pts; st >= 0; st--) {
            const u = st / pts;
            const xr = (2 * u - 1) * Wc;
            const ch = Math.sqrt(Math.max(0, R * R - xr * xr));
            const ux = xr / R;
            const bow =
              camT *
              latR *
              Math.sqrt(Math.max(0, 1 - (xr * xr) / (latR * latR)));
            const slosh =
              sloshAmp * 0.7 * Math.sin(7.2 * ux + w1 + 0.9) +
              R * 0.03 * Math.sin(11.1 * ux + w2);
            let yB = yC + bow + tilt * xr + hB + slosh;
            yB = yB < -ch ? -ch : yB > ch ? ch : yB;
            let px = cx + xr;
            let py = midY + yB;
            if (mGeo < 1) {
              const sx = xAt(st);
              let sy = midY;
              if (L.dir > 0) {
                const bh = bellH(st);
                sy = midY + bh;
                const ghost = bh * (1 - mGeo);
                if (ghost > waveBotEnv[st]!) waveBotEnv[st] = ghost;
                if (ghost > maxHH) maxHH = ghost;
              }
              px = sx + (px - sx) * mGeo;
              py = sy + (py - sy) * mGeo;
            }
            morphX[pts - st] = px;
            morphY[pts - st] = py;
          }
          tracePts(false);
          ctx.closePath();

          /* Заливка: вертикальная вуаль волны после осадки
             кроссфейдится в горизонтальный hue-поток — цвет БЕЖИТ
             вдоль страты (~4с период), соседние страты сдвинуты по
             фазе, и спектр перетекает из ленты в ленту, как плёнка
             масла на воде. Кроссфейд точный в аддитивном свете
             ((1−i)+i), стык невидим: при i=0 потока нет вовсе. */
          const iridFx = iridIn * (1 - collapse);
          if (iridFx > 0.01) {
            const ig = ctx.createLinearGradient(cx - Wc, 0, cx + Wc, 0);
            for (let si = 0; si <= 4; si++) {
              const su = si / 4;
              const ph = 5.34 * su - now / 640 + L.bandY * 4.6;
              const ihue =
                hue + 11 * Math.sin(ph) + 4 * Math.sin(1.9 * ph + 1.4);
              const ilig = Math.min(96, lig + 6 * Math.sin(ph + 1.2));
              const ia = 0.86 + 0.08 * Math.sin(ph + 2.1);
              ig.addColorStop(su, `hsla(${ihue}, ${sat}%, ${ilig}%, ${ia})`);
            }
            ctx.globalAlpha = layerAlpha * (1 - iridFx);
            ctx.fill();
            ctx.globalAlpha = layerAlpha * iridFx;
            ctx.fillStyle = ig;
            ctx.fill();
            // Возвращаем вуаль: Safari-фолбэк ниже обводит ею кромку.
            ctx.globalAlpha = layerAlpha;
            ctx.fillStyle = veil;
          } else {
            ctx.fill();
          }
        }

        // Safari-фолбэк: вместо canvas-blur кромка слоя смягчается
        // полутеневым штрихом того же вертикального градиента —
        // шёлковый край без фильтров, одинаковый вид с Chromium.
        if (!canFilter) {
          ctx.globalAlpha = layerAlpha * 0.45;
          ctx.lineWidth = Math.max(1.2, L.blur * 1.5);
          ctx.lineJoin = "round";
          ctx.strokeStyle = veil;
          ctx.stroke();
          ctx.globalAlpha = layerAlpha;
        }
      }

      // Гребень-блик: закреплён на бугре и ВСПЫХИВАЕТ голосом
      // (быстрая огибающая + транзиенты), а не едет по экрану.
      // Маскируется силуэтом самой волны: заливаем не
      // прямоугольник, а контур top/bot-огибающих слоёв — белый
      // свет не выходит за волну.
      // Все блики растворяются вместе с высотой волны (glow):
      // у крошечного силуэта нет ни кромок, ни ореола — затухание
      // в ноль чисто световое, без мерцающих суб-пиксельных линий.
      setBlur(0);
      const glow = clamp01((maxHH - 1.2) / 3.2);
      // Линейные блики гаснут вместе с морфом (mFade): их геометрия
      // (smoothEnv-контуры, горизонтальная линия) принадлежит ленте,
      // а не сфере — растворяются светом, без резких переходов.
      const glowS = glow * glow * (3 - 2 * glow) * mFade;
      if (glowS > 0 && (eFast > 0.04 || wPop > 0.05)) {
        const xPeak = cx + sway;
        const crest = ctx.createLinearGradient(xPeak - 45, 0, xPeak + 45, 0);
        crest.addColorStop(0, "rgba(255, 255, 255, 0)");
        crest.addColorStop(
          0.5,
          `rgba(255, 255, 255, ${0.22 * (eFast + 0.5 * wPop) * S * glowS})`,
        );
        crest.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = crest;
        setBlur(1);
        ctx.beginPath();
        smoothEnv(waveTopEnv, -1, 0, WAVE_STEPS, true);
        smoothEnv(waveBotEnv, 1, WAVE_STEPS, 0, false);
        ctx.closePath();
        ctx.fill();
        setBlur(0);
      }

      // Раскалённый горизонт: с голосом линия покоя не гаснет, а
      // раскаляется — тонкое тёпло-белое ядро и мягкий ореол
      // поверх оснований лент. «Солнце за горизонтом» сцены.
      if (S > 0.02 && glowS > 0) {
        const heat = S * (0.3 + 0.7 * eSlow) * glowS;
        // Ореол живёт только в пределах бугра (ширина волны), а не
        // на весь пролёт — иначе читается «линзовым флейром» через
        // весь экран.
        const hw = halfSpan * spread * 1.5;
        const hx = cx + sway;
        const horizon = ctx.createLinearGradient(hx - hw, 0, hx + hw, 0);
        horizon.addColorStop(0, "rgba(255, 244, 235, 0)");
        horizon.addColorStop(0.22, `rgba(255, 244, 235, ${0.5 * heat})`);
        horizon.addColorStop(0.5, `rgba(255, 250, 244, ${0.8 * heat})`);
        horizon.addColorStop(0.78, `rgba(255, 244, 235, ${0.5 * heat})`);
        horizon.addColorStop(1, "rgba(255, 244, 235, 0)");
        // Ядро линии слегка размыто: жёсткий 1px-штрих белого на
        // чёрном — главный источник «дешёвого» пиксельного блеска.
        ctx.fillStyle = horizon;
        setBlur(0.5);
        ctx.globalAlpha = 0.8;
        ctx.fillRect(hx - hw, midY - 0.75, hw * 2, 1.5);
        setBlur(1.5);
        ctx.globalAlpha = 0.25;
        ctx.fillRect(hx - hw, midY - 3, hw * 2, 6);
        setBlur(0);

        // Рим-свет: волосяная белая кромка по контуру силуэта —
        // блик «жидкого стекла», вспыхивающий на транзиентах.
        // Нижняя кромка вдвое тише — как отражение. Яркость кромки
        // гаснет к краям бугра тем же градиентом, что и ореол:
        // там, где огибающая сходится к линии покоя, кромки нет.
        const rim = (0.08 + 0.18 * eFast + 0.1 * wPop) * S * glowS;
        const rimGrad = ctx.createLinearGradient(hx - hw, 0, hx + hw, 0);
        rimGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        rimGrad.addColorStop(0.25, `rgba(255, 255, 255, ${rim * 0.7})`);
        rimGrad.addColorStop(0.5, `rgba(255, 255, 255, ${rim})`);
        rimGrad.addColorStop(0.75, `rgba(255, 255, 255, ${rim * 0.7})`);
        rimGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        // Кромка чуть шире и с лёгким blur — волосяной 1px-штрих
        // на движущейся кривой мерцал ступеньками антиалиасинга.
        setBlur(0.6);
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1.5;
        ctx.lineJoin = "round";
        ctx.strokeStyle = rimGrad;
        ctx.beginPath();
        smoothEnv(waveTopEnv, -1, 0, WAVE_STEPS, true);
        ctx.stroke();
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        smoothEnv(waveBotEnv, 1, 0, WAVE_STEPS, true);
        ctx.stroke();
        setBlur(0);
      }

      // Искры «энергия стекается в сферу» УДАЛЕНЫ: летящие белые
      // блики на стыке запись → распознавание читались случайными
      // «звёздами»-артефактами, а не частью сцены. Сборку целиком
      // рассказывает воронка самих лент — лишние объекты только
      // спорили с ней за внимание.

      /* ── Жизнь сферы (decode; проявляется на последней трети
         сборки, когда силуэт уже почти круглый) ──────
         Сфера — СПОКОЙНЫЙ, но ЖИВОЙ объект: никаких ударов и
         вспышек — медленное дыхание (heart, ~9.4с), hue-потоки
         вдоль страт (см. iridFx в морфе слоёв) и переливы света:
         • ядро — тёпло-белая сердцевина, едва дышит светом,
           тихо вспыхивает на осадке (settle);
         • глянец ключевого света — фиксирован сверху-слева,
           принадлежит источнику света, а не жидкости;
         • перламутровый отсвет — мягкая полоса света медленно
           обходит шар, переливы плёнки на самой жидкости;
         • рим-свет — холодная кромка по контуру, ярче сверху
           (ключевой свет сцены — тот же, что у линзы);
         • финал — сфера сжимается, ядро раскаляется в точку. */
      if (decode && lifeIn > 0.005) {
        const lifeA = lifeIn * (1 - collapse * 0.4);

        // Затемнение лимба: к кромке шар темнеет (свет в объёме
        // жидкости проходит больший путь) — destination-out выедает
        // немного света у края силуэта. Именно этот градиент яркости
        // собирает страты в ВЫПУКЛЫЙ шар: без него круг читается
        // плоским крашеным диском.
        const limbA = 0.36 * lifeA * (1 - collapse);
        if (limbA > 0.01) {
          const limb = ctx.createRadialGradient(
            cx, midY, sphereR * 0.66, cx, midY, sphereR,
          );
          limb.addColorStop(0, "rgba(0, 0, 0, 0)");
          limb.addColorStop(0.62, `rgba(0, 0, 0, ${limbA * 0.25})`);
          limb.addColorStop(1, `rgba(0, 0, 0, ${limbA})`);
          ctx.globalCompositeOperation = "destination-out";
          setBlur(0);
          ctx.globalAlpha = 1;
          ctx.fillStyle = limb;
          ctx.beginPath();
          ctx.arc(cx, midY, sphereR * 0.995, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalCompositeOperation = "lighter";
        }

        // Ауральный ореол: нейтрально-холодный воздух вокруг шара,
        // вдвое тише прежнего тёплого. Тёплый ореол + тёплое ядро +
        // золотой гребень в lighter-композите складывались в ту
        // самую «лимонную» заливку — теперь цвет принадлежит
        // стратам, а не атмосфере.
        const haloR = Math.max(2, sphereR * 2.1);
        const haloA = (0.04 + 0.06 * heart) * lifeA * (1 - 0.7 * collapse);
        const halo = ctx.createRadialGradient(
          cx, midY, sphereR * 0.5, cx, midY, haloR,
        );
        halo.addColorStop(0, `rgba(228, 238, 252, ${haloA})`);
        halo.addColorStop(1, "rgba(228, 238, 252, 0)");
        setBlur(0);
        ctx.globalAlpha = 1;
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(cx, midY, haloR, 0, Math.PI * 2);
        ctx.fill();

        // Глубинное свечение: компактный нейтрально-белый свет у
        // кремового гребня (чуть выше и левее центра — там его
        // страта). Вдвое тише и на треть меньше прежнего: шар
        // «налит» светом изнутри, но цвет страт не выгорает в
        // жёлтый. Тихая вспышка на осадке (settle) — шар «принял»
        // энергию записи; на схлопывании ядро раскаляется.
        const coreX = cx - sphereR * 0.16;
        const coreY = midY - sphereR * 0.08;
        const coreR = sphereR * (0.46 + 0.08 * heart) + 1.5;
        const coreA =
          (0.07 + 0.12 * heart + 0.025 * Math.sin(now / 530)) * lifeA +
          0.14 * settle +
          collapse * 0.55;
        const core = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, coreR);
        core.addColorStop(0, `rgba(255, 252, 247, ${Math.min(1, coreA)})`);
        core.addColorStop(0.55, `rgba(252, 248, 244, ${Math.min(1, coreA) * 0.35})`);
        core.addColorStop(1, "rgba(252, 248, 244, 0)");
        setBlur(1);
        ctx.globalAlpha = 1;
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(coreX, coreY, coreR, 0, Math.PI * 2);
        ctx.fill();

        // Глянец ключевого света: ФИКСИРОВАН сверху-слева — блик
        // принадлежит источнику света, а не жидкости (физика стекла).
        // Дышит, но не орбитирует. Широкий отсвет + горячая точка.
        const gAng = 2.18 + 0.07 * Math.sin(now / 1300);
        const gxp = cx + Math.cos(gAng) * sphereR * 0.5;
        const gyp = midY - Math.sin(gAng) * sphereR * 0.5;
        const glossR = Math.max(1.5, sphereR * (0.42 + 0.07 * heart));
        const glossA = (0.3 + 0.2 * heart) * lifeA * (1 - collapse);
        const gloss = ctx.createRadialGradient(gxp, gyp, 0, gxp, gyp, glossR);
        gloss.addColorStop(0, `rgba(255, 255, 255, ${glossA})`);
        gloss.addColorStop(1, "rgba(255, 255, 255, 0)");
        setBlur(0.8);
        ctx.fillStyle = gloss;
        ctx.beginPath();
        ctx.arc(gxp, gyp, glossR, 0, Math.PI * 2);
        ctx.fill();
        const pinX = cx + Math.cos(gAng) * sphereR * 0.64;
        const pinY = midY - Math.sin(gAng) * sphereR * 0.64;
        const pinR = Math.max(0.8, sphereR * 0.13);
        const pin = ctx.createRadialGradient(pinX, pinY, 0, pinX, pinY, pinR);
        pin.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, glossA * 1.7)})`);
        pin.addColorStop(1, "rgba(255, 255, 255, 0)");
        setBlur(0.4);
        ctx.fillStyle = pin;
        ctx.beginPath();
        ctx.arc(pinX, pinY, pinR, 0, Math.PI * 2);
        ctx.fill();

        // Перламутровый отсвет: мягкая холодно-белая полоса света
        // медленно обходит шар (~8.4с на круг, приплюснутая орбита)
        // поверх hue-потоков страт. Это НЕ второй источник света
        // (ключевой глянец фиксирован сверху-слева и ярче) — это
        // переливы плёнки на самой жидкости, как на мыльном пузыре.
        // Клип по кругу: отсвет живёт строго внутри шара.
        const pearl = iridIn * (1 - collapse) * lifeA;
        if (pearl > 0.01) {
          const pAng = now / 1340;
          const pxc = cx + Math.cos(pAng) * sphereR * 0.5;
          const pyc = midY + Math.sin(pAng) * sphereR * 0.38;
          const pR = Math.max(2, sphereR * 0.92);
          const pg = ctx.createRadialGradient(pxc, pyc, 0, pxc, pyc, pR);
          pg.addColorStop(0, `rgba(255, 255, 255, ${0.11 * pearl})`);
          pg.addColorStop(0.55, `rgba(214, 232, 255, ${0.05 * pearl})`);
          pg.addColorStop(1, "rgba(214, 232, 255, 0)");
          setBlur(0);
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, midY, sphereR * 0.99, 0, Math.PI * 2);
          ctx.clip();
          ctx.globalAlpha = 1;
          ctx.fillStyle = pg;
          ctx.fillRect(cx - sphereR, midY - sphereR, sphereR * 2, sphereR * 2);
          ctx.restore();
        }

        // Френель-кромка: яркая дуга с освещённой стороны (верх-лево)
        // и холодный отблеск-отскок снизу-справа — именно кромка
        // (вместе с затемнением лимба под ней) собирает страты в
        // ЕДИНЫЙ стеклянный шар. Чуть ярче прежнего: холодный обод
        // уравновешивает тёплое нутро.
        const rimA = (0.21 + 0.16 * heart) * lifeA * (1 - collapse);
        setBlur(0.6);
        ctx.lineWidth = 1.25;
        ctx.strokeStyle = `rgba(244, 250, 255, ${rimA})`;
        ctx.beginPath();
        ctx.arc(cx, midY, sphereR * 0.99, Math.PI * 0.95, Math.PI * 1.62);
        ctx.stroke();
        ctx.strokeStyle = `rgba(150, 196, 255, ${rimA * 0.6})`;
        ctx.beginPath();
        ctx.arc(cx, midY, sphereR * 0.99, -Math.PI * 0.06, Math.PI * 0.5);
        ctx.stroke();

        // Кольцо-вспышка прибытия УДАЛЕНО: расширяющееся белое
        // кольцо на крошечном экране тоже читалось артефактом.
        // Прибытие отыгрывает упругая осадка радиуса (settle).

        // Финал: энергия сферы концентрируется в раскалённую точку,
        // и из точки бьёт вспышка горизонта — свет растекается обратно
        // в линию покоя (зеркало рассвета на входе). Выход поставлен:
        // сфера → точка → горизонт, никакого «выключили свет».
        if (collapse > 0.1) {
          const star = (collapse - 0.1) / 0.9;
          // Послесвечение: в последние ~150мс точка тает — передаёт
          // сцену статусу мягко, без жёсткого среза кадра.
          const starFade =
            1 - clamp01((tThink - (VOICE_DECODE_TOTAL_MS - 150)) / 150);
          const starA = Math.min(1, star * 1.4) * 0.85 * starFade;
          const starR = 2.2 + 4 * star;
          const sg = ctx.createRadialGradient(cx, midY, 0, cx, midY, starR * 3);
          sg.addColorStop(0, `rgba(255, 250, 238, ${starA})`);
          sg.addColorStop(0.4, `rgba(255, 240, 212, ${starA * 0.4})`);
          sg.addColorStop(1, "rgba(255, 240, 212, 0)");
          setBlur(0.5);
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(cx, midY, starR * 3, 0, Math.PI * 2);
          ctx.fill();

          // Вспышка горизонта: из точки к краям бежит тёплая линия
          // света — ease-out, тает по мере разбега. Та же грамматика,
          // что у рассветной искры на входе, но в обратную сторону.
          const flashHalf = halfSpan * easeOutCubic(star);
          const flashA = starA * (1 - 0.6 * star);
          const rayG = ctx.createLinearGradient(cx - flashHalf, midY, cx + flashHalf, midY);
          rayG.addColorStop(0, "rgba(255, 246, 228, 0)");
          rayG.addColorStop(0.3, `rgba(255, 246, 228, ${flashA * 0.4})`);
          rayG.addColorStop(0.5, `rgba(255, 252, 244, ${flashA})`);
          rayG.addColorStop(0.7, `rgba(255, 246, 228, ${flashA * 0.4})`);
          rayG.addColorStop(1, "rgba(255, 246, 228, 0)");
          ctx.fillStyle = rayG;
          setBlur(0.5);
          ctx.fillRect(cx - flashHalf, midY - 0.75, flashHalf * 2, 1.5);
          setBlur(1.5);
          ctx.globalAlpha = 0.3;
          ctx.fillRect(cx - flashHalf, midY - 2.5, flashHalf * 2, 5);
          ctx.globalAlpha = 1;
        }

        setBlur(0);
      }

      ctx.globalAlpha = 1;
      ctx.restore();
    };

    // Правый слот при печати «дышит»: диск из точек медленно
    // расширяется и сжимается синусоидой. Радиус ходит между
    // BREATH_MIN_R и BREATH_MAX_R; точка зоны зажигается, если
    // попадает внутрь текущего радиуса. Спокойный ритм без букв.
    const drawBreath = (now: number, startX: number, dxDev: number) => {
      // Косинусное смягчение обоих концов: диск «задерживается» на
      // полном вдохе и полном выдохе, с более быстрым переходом между
      // ними — так пульс читается как ДЫХАНИЕ, а не как «тревожный
      // throb». (raw — обычная синусоида 0..1, phase — её ease-in-out.)
      const raw = (Math.sin((now / BREATH_PERIOD_MS) * Math.PI * 2) + 1) / 2;
      const phase = 0.5 - 0.5 * Math.cos(Math.PI * raw);
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

    /* REC-индикатор записи. Эквалайзер ушёл: рядом с радужной
       волной в центре вторая активная анимация спорила бы с ней
       за внимание. Вместо него классический «идёт запись» —
       круглая точка, мягко дышащая радиусом (вдох/выдох ~2с,
       та же косинусная огибающая, что у drawBreath). Рисуется
       белым led-светом вместе с питомцем. */
    const REC_CX = (ALERT_COLS - 1) / 2; // 4 — центр слота
    const REC_CY = (GLYPH_H - 1) / 2; // 3
    const REC_MIN_R = 1.1;
    const REC_MAX_R = 2.6;
    const REC_PERIOD_MS = 2000;

    const drawRecordingMeter = (now: number, startX: number, dxDev: number) => {
      const top = yTop();
      const raw = (Math.sin((now / REC_PERIOD_MS) * Math.PI * 2) + 1) / 2;
      const phase = 0.5 - 0.5 * Math.cos(Math.PI * raw);
      const r = REC_MIN_R + (REC_MAX_R - REC_MIN_R) * phase;
      const r2 = r * r;
      for (let row = 0; row < GLYPH_H; row++) {
        for (let col = 0; col < ALERT_COLS; col++) {
          const dx = col - REC_CX;
          const dy = row - REC_CY;
          if (dx * dx + dy * dy > r2) continue;
          dot(startX + col * CELL, top + row * CELL, dxDev, 0, now);
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

    // «Думает»: облачко-контур статично, многоточие внутри бежит —
    // точки загораются по очереди (1→2→3→пусто), цикл ~1.28с. Живой
    // знак обработки вместо статичных песочных часов.
    const drawThinking = (now: number, startX: number, dxDev: number) => {
      drawRows(THINK_BUBBLE, startX, dxDev, now);
      const top = yTop();
      const count = Math.floor(now / 320) % 4; // 0,1,2,3
      for (let i = 0; i < count; i++) {
        const col = THINK_DOT_COLS[i]!;
        dot(startX + col * CELL, top + THINK_DOT_ROW * CELL, dxDev, 0, now);
      }
    };

    // «Готово»: кольцо статично, ядро в центре мягко «дышит» (медленный
    // вкл/выкл ~1.8с) — спокойный standby-пульс «жду новую задачу».
    const drawReady = (now: number, startX: number, dxDev: number) => {
      const top = yTop();
      for (let row = 0; row < GLYPH_H; row++) {
        const rowStr = READY_MARK[row]!;
        for (let col = 0; col < rowStr.length; col++) {
          if (rowStr[col] !== "1") continue;
          // Центральное ядро (ряд 3, кол 4) пульсирует; кольцо всегда.
          if (row === 3 && col === 4 && Math.floor(now / 900) % 2 !== 0) continue;
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

      // «Думает» (пост-сабмит) — облачко мысли с бегущим многоточием.
      if (moodRef.current === "ponder") {
        drawThinking(now, startX, dxDev);
        slotPrevDanger = null;
        return;
      }

      // «Задача принята» (сабмит) — жирная галочка.
      if (moodRef.current === "accept") {
        drawRows(ACCEPT_MARK, startX, dxDev, now);
        slotPrevDanger = null;
        return;
      }

      // «Готово к новой задаче» — кольцо standby с пульсирующим ядром.
      if (moodRef.current === "ready") {
        drawReady(now, startX, dxDev);
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

      // Ошибка (ГОЛОС НЕДОСТУПЕН / ФАЙЛ НЕ ПРИНЯТ) — сразу крест ✕,
      // чётким срезом. Раньше у cancel не было своей ветки, и слот
      // проваливался в общую danger-логику: переход стартовал со
      // старого «!» (ALERT_MARK), который мелькал и «осыпался» перед
      // крестом (баг «распознаём → ! → ✕»). Рисуем крест напрямую и
      // фиксируем slotDanger=true, чтобы при выходе из ошибки крест
      // корректно растворился обратно в «!».
      if (moodRef.current === "cancel") {
        drawRows(CROSS_MARK, startX, dxDev, now);
        slotPrevDanger = null;
        slotDanger = true;
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

    /* ── Питомец: общая грамматика анимаций ──────────────
       • Каждое настроение — маленький спектакль: замах →
         действие → осадка (anticipation / follow-through).
       • Ни один периодический ритм не делит период с другим
         (551/834/1900/2330/3700/6700/9100… попарно некратны) —
         рисунки никогда не залипают в метроном.
       • Моргание всегда с детерминированным джиттером
         (slot*131 % окно) — ровное моргание выдаёт «робота».
       • Экстра-точки — только «существительные» (искра, капля
         пота, файл, пункт списка), максимум ~5 одновременно.
         Колонка -1 — крайняя видимая слева (x=0), дальше канвас
         клиппит; справа видимо до ~10.
       • ponder больше НЕ алиасится на think: быстрый сканер и
         медленный философ — разные роли. */

    // Джиттерное моргание: возвращает слот и факт закрытых глаз.
    const blinkAt = (now: number, period: number, jitterWin: number, dur: number) => {
      const slot = Math.floor(now / period);
      const at = now - slot * period;
      const jit = (slot * 131) % jitterWin;
      return { slot, at, jit, closed: at >= jit && at < jit + dur };
    };

    // Пульс печати, общий для petRows/petExtras/petBody: фаза
    // прыжка p и энергия (гаснет за 500мс после паузы >600мс).
    const typePulse = (now: number) => {
      const tp = typingPulseRef.current?.current;
      const period = tp ? Math.min(420, Math.max(150, tp.interval)) : 300;
      const p = (now % period) / period;
      let energy = 1;
      if (tp) {
        const sinceKey = now - tp.lastKeyAt;
        energy = sinceKey < 600 ? 1 : Math.max(0, 1 - (sinceKey - 600) / 500);
      }
      return { p, energy };
    };

    const petEyeRow = (now: number, animate: boolean, since: number) => {
      if (!animate) return EYE_CENTER;
      const mood = moodRef.current;

      if (mood === "type") {
        // Моргание ~2.6с (реже, чем в покое: «сосредоточен на тексте»),
        // 100мс длительность, детерминированный джиттер, и редкий
        // двойной моргок (1 из 5). Взгляд в основном вправо (на текст),
        // изредка в центр («глянул на тебя»).
        const slot = Math.floor(now / 2600);
        const at = now - slot * 2600;
        const jitter = (slot * 131) % 700;
        const blink = at >= jitter && at < jitter + 100;
        const dblBlink = slot % 5 === 2 && at >= jitter + 180 && at < jitter + 280;
        if (blink || dblBlink) return EYE_BLINK;
        return Math.floor(now / 1900) % 4 === 2 ? EYE_CENTER : EYE_RIGHT;
      }
      if (mood === "accept") {
        // Зажмурился на замахе — глаза распахиваются ровно в момент
        // отрыва («!»); широта взгляда добирается рядом 3 в petRows.
        return since < 130 ? EYE_BLINK : EYE_CENTER;
      }
      if (mood === "ready") {
        // Долгий довольный «кошачий» моргок — знак доверия, затем эхо.
        if (since >= 600 && since < 830) return EYE_BLINK;
        if (since >= 1500 && since < 1610) return EYE_BLINK;
        return EYE_CENTER;
      }
      if (mood === "listen") {
        if (blinkAt(now, 2900, 700, 120).closed) return EYE_BLINK;
        // Долгий взгляд на волну, короткий чек-ин с пользователем.
        return now % 3100 < 2300 ? EYE_RIGHT : EYE_CENTER;
      }
      if (mood === "think") {
        // Быстрый асимметричный скан Л,П,Л — сканирует, но не метроном.
        return Math.floor(now / 150) % 3 === 1 ? EYE_RIGHT : EYE_LEFT;
      }
      if (mood === "ponder") {
        // Маятник «взвешивает варианты»: Л, Ц, П, Ц; редкие тяжёлые моргки.
        if (blinkAt(now, 4100, 800, 130).closed) return EYE_BLINK;
        const g = Math.floor(now / 1400) % 4;
        return g === 0 ? EYE_LEFT : g === 2 ? EYE_RIGHT : EYE_CENTER;
      }
      if (mood === "model") {
        // Глаза ЗАКРЫТЫ всю зарядку (сплошное лицо = «выключен,
        // принимает прошивку») и распахиваются ровно в кадре, когда
        // шкала доходит доверху, — весь гэг в этой синхронизации.
        if (since < 680) return EYE_BLINK;
        if (since >= 1500 && since < 1600) return EYE_BLINK; // выдох-моргок
        return EYE_CENTER;
      }
      if (mood === "access") {
        // Караульный не моргает. Один уставной моргок на «вольно».
        return since >= 1480 && since < 1580 ? EYE_BLINK : EYE_CENTER;
      }
      if (mood === "branch") {
        if (since < 430) return EYE_RIGHT; // глаза ведут рывок (цель!)
        if (since >= 560 && since < 860) return EYE_LEFT; // взгляд на старую ветку
        if (since >= 1450 && since < 1540) return EYE_BLINK;
        return EYE_CENTER;
      }
      if (mood === "plan") {
        // Работает над списком — не моргает; один моргок в конце.
        if (since >= 1560 && since < 1650) return EYE_BLINK;
        return since < 1480 ? EYE_RIGHT : EYE_CENTER; // список → «план готов»
      }
      if (mood === "files") {
        if (since < 380) return EYE_RIGHT; // следит за падением
        if (since < 470) return EYE_BLINK; // зажмурился на ловле
        if (since >= 1300 && since < 1390) return EYE_BLINK;
        return EYE_CENTER; // «файл у меня»
      }
      if (mood === "cancel") {
        if (since < 90) return EYE_CENTER;
        if (since < 990) {
          // Классическое «нет»: глаза прикованы к зрителю, голова
          // мотается ПОД ними — контр-фиксация взгляда.
          const s = since - 90;
          const headDx = 4.2 * Math.sin(s / 42) * (1 - s / 900);
          return headDx > 1 ? EYE_LEFT : headDx < -1 ? EYE_RIGHT : EYE_CENTER;
        }
        if (since >= 1560 && since < 1690) return EYE_BLINK; // тяжёлый виноватый
        return EYE_LEFT; // взгляд отведён — извиняется
      }

      // idle: джиттерное моргание + редкий двойной, взгляд блуждает
      // с долгими осмысленными паузами (центр-доминантно).
      const b = blinkAt(now, 3700, 900, 120);
      if (b.closed) return EYE_BLINK;
      if (b.slot % 4 === 1 && b.at >= b.jit + 260 && b.at < b.jit + 350) return EYE_BLINK;
      const g = Math.floor(now / 1900) % 6;
      return g === 1 ? EYE_LEFT : g === 4 ? EYE_RIGHT : EYE_CENTER;
    };

    const petRows = (eyes: string, now: number, since: number): string[] => {
      const mood = moodRef.current;
      const rows = [...PET_BASE];
      rows[2] = eyes;

      if (mood === "listen") {
        // Плотная капсула-«всё внимание»: тело собрано, тихий
        // toe-tap раз в 1.7с (вне такта кивка 2.33с).
        rows[1] = "1111111";
        rows[3] = "1111111";
        rows[4] = "1111111";
        rows[5] = "0111110";
        rows[6] = now % 1700 < 180 ? "0101010" : "0100010";
      } else if (mood === "think") {
        // «Сканер»: голова втянута (там, где была, ходит луч —
        // см. petExtras), стойка широкая упёртая. Сквош-силуэт
        // (низкий + широкий) мгновенно читается как «вкалывает».
        rows[0] = "0000000";
        rows[6] = "1100011";
      } else if (mood === "ponder") {
        // Контрапост: вес на одной ноге — философ, не сканер.
        rows[6] = "0110010";
      } else if (mood === "type") {
        // В воздухе ноги поджаты (stretch), на земле — обычная стойка.
        const { p, energy } = typePulse(now);
        rows[6] = p < 0.35 && energy > 0.3 ? "0011100" : "0100010";
      } else if (mood === "accept") {
        if (since < 110) {
          // Глубокий присед: голова «проглочена», база расширена.
          rows[0] = "0000000";
          rows[1] = "0011100";
          rows[5] = "1111111";
          rows[6] = "1100011";
        } else if (since < 460) {
          rows[0] = "1011101"; // уши-вспышка в полёте
          rows[6] = "0011100"; // ноги поджаты
        } else if (since < 560) {
          rows[6] = "1100011"; // приземление враскоряку
        } else {
          rows[3] = "1101011"; // распахнутые 2-ряда-глаза: «сияет»
        }
      } else if (mood === "ready") {
        // Спокойный ровный силуэт; вся сцена — в выдохе и моргке.
      } else if (mood === "model") {
        if (since >= 680 && since < 1500) rows[0] = "1011101"; // «динь» — уши
        if (since >= 1040 && since < 1140) rows[6] = "1100011"; // приземление
      } else if (mood === "access") {
        if (since >= 140) {
          rows[5] = "1111111"; // грудь колесом
          rows[6] = "1000001"; // широкая уставная стойка
        }
      } else if (mood === "branch") {
        if (since < 180) rows[6] = "1100010"; // вес заряжен влево
        else if (since < 430) rows[6] = "0011100"; // полёт, ноги поджаты
        else if (since < 640) rows[6] = "1100011"; // юз-торможение
      } else if (mood === "plan") {
        if (since >= 220 && since < 1480) rows[6] = "0100110"; // вес к «доске»
      } else if (mood === "files") {
        if (since >= 380 && since < 560) rows[6] = "1100011"; // сквош ловли
      } else if (mood === "cancel") {
        if (since >= 1080) rows[0] = "0000000"; // голова повисла
      } else {
        // idle: ушко-перк раз в 9.1с, перенос веса раз в 6.7с.
        if (now % 9100 < 360) rows[0] = "1011101";
        if (now % 6700 < 900) rows[6] = "0110010";
      }

      return rows;
    };

    const petExtras = (now: number, since: number): PetDot[] => {
      const mood = moodRef.current;

      if (mood === "type") {
        // Только пыль приземления — сам прыжок и есть шоу.
        const { p, energy } = typePulse(now);
        return p >= 0.35 && p < 0.47 && energy > 0.5
          ? ([
              [-1, 6],
              [7, 6],
            ] as PetDot[])
          : [];
      }
      if (mood === "listen") {
        // Ушко-тарелка «<» раскрыта к волне + входящий звук:
        // точка прилетает справа и замедляясь «всасывается» в ухо.
        const dish: PetDot[] = [
          [8, 1],
          [7, 2],
          [8, 3],
        ];
        const t = now % 1900;
        const incoming: PetDot[] = t < 260 ? [[10, 2]] : t < 480 ? [[9, 2]] : [];
        return [...dish, ...incoming];
      }
      if (mood === "think") {
        // Скан-луч ходит по ряду 0 — ровно там, где была голова
        // (стейджинг!), 630мс на проход, рестарт слева. Плюс
        // «проглатываемая» точка данных у груди.
        const scanCol = -1 + (Math.floor(now / 70) % 9);
        const beam: PetDot[] = [[scanCol, 0]];
        if (scanCol - 1 >= -1) beam.push([scanCol - 1, 0]);
        const intake: PetDot[] = now % 260 < 130 ? [[8, 3]] : [];
        return [...beam, ...intake];
      }
      if (mood === "ponder") {
        // Цепочка мыслей растёт вверх-вправо — к облачку THINK_BUBBLE
        // в правом слоте (одна история), потом лопается: такт пустоты
        // перед следующей мыслью.
        const ph = now % 2600;
        const out: PetDot[] = [];
        if (ph < 900) out.push([7, 1]);
        if (ph >= 700 && ph < 1700) out.push([8, 0]);
        return out;
      }
      if (mood === "accept") {
        // Искры с апекса продолжают подниматься, когда питомец уже
        // падает — классический follow-through.
        if (since >= 230 && since < 340)
          return [
            [-1, 1],
            [8, 1],
          ];
        if (since >= 340 && since < 440)
          return [
            [-1, 0],
            [8, 0],
          ];
        return [];
      }
      if (mood === "ready") {
        // Один блик с каждой стороны, последовательно — never both.
        if (since >= 250 && since < 470) return [[7, 0]];
        if (since >= 520 && since < 740) return [[-1, 1]];
        return [];
      }
      if (mood === "model") {
        // Шкала зарядки: пара точек карабкается по флангам
        // ноги→голова (90мс/шаг) — метафора «уровень растёт».
        if (since >= 140 && since < 680) {
          const level = Math.min(5, Math.floor((since - 140) / 90));
          return [
            [-1, 6 - level],
            [7, 6 - level],
          ];
        }
        if (since >= 760 && since < 960)
          return [
            [-1, 0],
            [8, 0],
          ];
        return [];
      }
      if (mood === "access") {
        // Салют у брови (виден весь «доклад»), затем двойной
        // confirm-LED — служба, не праздник.
        if (since >= 180 && since < 820)
          return [
            [7, 1],
            [8, 0],
          ];
        if ((since >= 1430 && since < 1530) || (since >= 1610 && since < 1700))
          return [[7, 1]];
        return [];
      }
      if (mood === "branch") {
        // Спид-штрихи на покинутой стороне (едут с телом — читаются
        // как смаз движения), затем пыль юза.
        const out: PetDot[] = [];
        if (since >= 200 && since < 410) {
          out.push([-1, 2], [-1, 4]);
        }
        if (since >= 430 && since < 560) out.push([-1, 6]);
        if (since >= 430 && since < 500) out.push([0, 5]);
        return out;
      }
      if (mood === "plan") {
        // Пункты списка ПОЯВЛЯЮТСЯ И ОСТАЮТСЯ (накопление — фикс
        // читаемости), «рука» коротко прикасается к каждому слоту.
        if (since >= 1620) return [];
        const out: PetDot[] = [];
        const items: ReadonlyArray<readonly [number, number]> = [
          [300, 1],
          [680, 3],
          [1060, 5],
        ];
        for (const [t0, r] of items) {
          if (since >= t0) out.push([8, r]);
          if (since >= t0 && since < t0 + 80) out.push([7, r]);
        }
        return out;
      }
      if (mood === "files") {
        // Файл падает по дуге справа (ускоряясь), пойман и прижат
        // к боку (низко, ряд 4 — не путается с ухом listen), в конце
        // «мигает» — убран в карман.
        if (since < 100) return [[8, 0]];
        if (since < 200) return [[8, 1]];
        if (since < 290) return [[8, 2]];
        if (since < 380) return [[8, 3]];
        const out: PetDot[] = [];
        const stored = since < 1460 || (since >= 1540 && since < 1620);
        if (stored) out.push([7, 4]);
        if (since >= 380 && since < 470) out.push([9, 3]);
        if (since >= 380 && since < 440) out.push([9, 4]);
        return out;
      }
      if (mood === "cancel") {
        // «Не-а»-штрих напротив маха только в крайних точках; в
        // финале — капля пота сползает по виску. ✕ уже в слоте.
        if (since >= 90 && since < 990) {
          const s = since - 90;
          const headDx = 4.2 * Math.sin(s / 42) * (1 - s / 900);
          if (headDx > 2.5) return [[-1, 1]];
          if (headDx < -2.5) return [[8, 1]];
          return [];
        }
        if (since >= 1280 && since < 1480) return [[7, 2]];
        if (since >= 1480 && since < 1680) return [[7, 3]];
        if (since >= 1680 && since < 1840) return [[7, 4]];
        return [];
      }

      // idle: один редкий блик, стороны чередуются. Покой не суетится.
      if (now % 11300 < 220) {
        return [[Math.floor(now / 11300) % 2 === 0 ? 7 : -1, 1]];
      }
      return [];
    };

    const petBody = (now: number, animate: boolean, since: number): [number, number] => {
      if (!animate) return [0, 0];
      const mood = moodRef.current;
      const u = dpr;

      if (mood === "type") {
        // Прыжок в такт печати: период = сглаженный интервал клавиш.
        const tp = typingPulseRef.current?.current;
        const period = tp ? Math.min(420, Math.max(150, tp.interval)) : 300;
        const p = (now % period) / period;
        // Асимметричный профиль: быстрый ease-out взлёт и мягкое
        // приземление (экспонента 1.7).
        const lift =
          p < 0.35
            ? Math.sin((p / 0.35) * (Math.PI / 2)) * 2.2
            : 2.2 * Math.pow(1 - (p - 0.35) / 0.65, 1.7);
        // Anticipation: крошечный присед перед прыжком.
        const anticip = p < 0.08 ? -0.9 * (p / 0.08) : 0;
        // Follow-through: лёгкий отскок выше линии запуска.
        const overshoot =
          p > 0.3 && p < 0.42 ? 0.8 * Math.sin(((p - 0.3) / 0.12) * Math.PI) : 0;
        let energy = 1;
        if (tp) {
          const sinceKey = now - tp.lastKeyAt;
          energy = sinceKey < 600 ? 1 : Math.max(0, 1 - (sinceKey - 600) / 500);
        }
        // Лёгкий наклон к тексту, гаснущий вместе с энергией набора.
        return [
          Math.round(0.8 * energy * u),
          Math.round(-(lift + anticip + overshoot) * energy * u),
        ];
      }
      if (mood === "accept") {
        // Полный squash-and-stretch: загрузка вниз → дуга 5px (самый
        // большой прыжок в репертуаре) → сквош приземления.
        if (since < 110) return [0, Math.round(2.2 * (since / 110) * u)];
        if (since < 460) return [0, Math.round(-5 * arc((since - 110) / 350) * u)];
        if (since < 560) return [0, Math.round(1.2 * arc((since - 460) / 100) * u)];
        return [0, 0];
      }
      if (mood === "ready") {
        // Выдох «готово» — одна осадка, затем тихое дыхание.
        if (since < 450) return [0, Math.round(1.6 * arc(since / 450) * u)];
        return [
          Math.round(Math.sin(now / 2100) * 0.7 * u),
          Math.round(Math.sin(now / 2900) * 0.4 * u),
        ];
      }
      if (mood === "listen") {
        // Разовый наклон к волне + дыхание медленнее idle (внимание
        // удерживается) + кивок понимания «угу» раз в 2.33с.
        const lean = 1.2 * easeOutQuad(clamp01(since / 420));
        let dy = Math.sin(now / 494) * 0.7;
        const at = now % 2330;
        if (at < 160) dy += 1.1 * Math.sin((Math.PI * at) / 160);
        return [Math.round(lean * u), Math.round(dy * u)];
      }
      if (mood === "think") {
        // Электрическая дрожь (~88мс, суб-пиксель — вибрация, не
        // движение) + постоянный прижим вниз в сквош.
        return [Math.round(Math.sin(now / 14) * 0.8 * u), Math.round(u)];
      }
      if (mood === "ponder") {
        // Маятник на бедре (контрапост), периоды 414/581 не сходятся.
        return [
          Math.round((-0.5 + Math.sin(now / 414) * 1.2) * u),
          Math.round(Math.sin(now / 581) * 0.5 * u),
        ];
      }
      if (mood === "model") {
        // Осел → выпрямляется по мере зарядки → хлопок вверх в момент
        // открытия глаз → сквош приземления. Никакой тряски: именно
        // старый wobble делал сцену нечитаемой.
        if (since < 140) return [0, Math.round(1.5 * (since / 140) * u)];
        if (since < 680) return [0, Math.round(1.5 * (1 - (since - 140) / 540) * u)];
        if (since < 1040) return [0, Math.round(-3 * arc((since - 680) / 360) * u)];
        if (since < 1140) return [0, Math.round(0.8 * arc((since - 1040) / 100) * u)];
        return [0, 0];
      }
      if (mood === "access") {
        // Подобрался → грудь колесом (вверх) → один уставной поклон:
        // быстро вниз, торжественно медленно вверх. dx=0 — караул
        // не раскачивается.
        if (since < 120) return [0, Math.round(-(since / 120) * 1.2 * u)];
        if (since < 480) return [0, Math.round(-1.2 * u)];
        if (since < 900) {
          const t = (since - 480) / 420;
          const down =
            t < 0.35
              ? Math.sin(((t / 0.35) * Math.PI) / 2)
              : 1 - Math.pow((t - 0.35) / 0.65, 1.6);
          return [0, Math.round((-1.2 + down * 2.6) * u)];
        }
        return [0, Math.round(-1.2 * Math.max(0, 1 - (since - 900) / 500) * u)];
      }
      if (mood === "branch") {
        // Замах от цели → рывок дугой (не юзом!) → юз-осадка →
        // удержание у новой ветки с дыханием → прыжок-возврат домой.
        if (since < 180) return [Math.round(-2 * Math.pow(since / 180, 2) * u), 0];
        if (since < 430) {
          const t = (since - 180) / 250;
          return [
            Math.round((-2 + 7.5 * easeOutCubic(t)) * u),
            Math.round(-1.6 * arc(t) * u),
          ];
        }
        if (since < 560)
          return [Math.round((5.5 - easeOutQuad((since - 430) / 130)) * u), 0];
        if (since < 940)
          return [Math.round(4.5 * u), Math.round(Math.sin(now / 494) * 0.4 * u)];
        if (since < 1340) {
          const t = (since - 940) / 400;
          return [
            Math.round(4.5 * (1 - easeInOut(t)) * u),
            Math.round(-1.2 * arc(t) * u),
          ];
        }
        return [0, 0];
      }
      if (mood === "plan") {
        // Шаг к доске, кивок на каждый прикреплённый пункт (быстро
        // вниз — медленнее вверх), финальный утверждающий кивок крупнее.
        let dx = 1.5 * easeOutQuad(clamp01(since / 220));
        if (since >= 1480) dx = 1.5 * (1 - clamp01((since - 1480) / 220));
        let dy = 0;
        for (const t0 of [300, 680, 1060]) {
          const t = since - t0;
          if (t >= 0 && t < 150) dy += t < 60 ? 1.2 * (t / 60) : 1.2 * (1 - (t - 60) / 90);
        }
        const ta = since - 1280;
        if (ta >= 0 && ta < 250) dy += ta < 90 ? 2 * (ta / 90) : 2 * (1 - (ta - 90) / 160);
        return [Math.round(dx * u), Math.round(dy * u)];
      }
      if (mood === "files") {
        // Выпад к падающему файлу → сквош ловли → гордый подъём груди
        // с укачивающим покачиванием → отпускает к концу.
        let dx = 0;
        if (since >= 140 && since < 380) dx = 2.4 * easeOutCubic((since - 140) / 240);
        else if (since >= 380 && since < 1400) dx = 2.4;
        else if (since >= 1400) dx = 2.4 * (1 - clamp01((since - 1400) / 300));
        let dy = 0;
        if (since >= 380 && since < 540) dy = 1.6 * arc((since - 380) / 160);
        if (since >= 600) {
          const lift = since < 950 ? easeInOut((since - 600) / 350) : 1;
          const fade = since >= 1400 ? 1 - clamp01((since - 1400) / 300) : 1;
          dy += -0.8 * lift * fade;
          if (since < 1400) dx += Math.sin((since - 600) / 118) * 0.6;
        }
        return [Math.round(dx * u), Math.round(dy * u)];
      }
      if (mood === "cancel") {
        // Человеческий темп «нет»: ~264мс на мах, линейный декей
        // (≈3.4 маха), затем виноватая осадка вниз — и так до конца.
        if (since < 90) return [0, Math.round((since / 90) * u)];
        if (since < 990) {
          const s = since - 90;
          const dx = 4.2 * Math.sin(s / 42) * (1 - s / 900);
          const dy = Math.max(0, 1 - s / 120);
          return [Math.round(dx * u), Math.round(dy * u)];
        }
        if (since >= 1080)
          return [0, Math.round(1.2 * easeInOut(clamp01((since - 1080) / 300)) * u)];
        return [0, 0];
      }

      // idle: микро-дыхание (834/551 — некратные периоды), на dpr2
      // квантуется в мягкий ±1-device-px шиммер.
      return [
        Math.round(Math.sin(now / 834) * 0.7 * u),
        Math.round(Math.sin(now / 551) * 0.55 * u),
      ];
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

    /* ─── Push-сцена: питомец толкает «КОМПОЗЕР» ─────────
       Караван юнитов [СЛОВО · ПИТОМЕЦ] ползёт влево ПЛАВНО и
       медленно, единым телом — без сжатий и рывков. Комизм в
       контрасте: строка еле едет, а питомец рядом семенит
       ножками изо всех сил (PUSH_LEG_MS), упёршись в слово.
       Перед передышкой строка мягко тормозит, после — мягко
       разгоняется. Каждый PUSH_REST_EVERY-й такт питомец
       переводит дух: смотрит в зал, дышит, со лба скатывается
       капля пота — караван стоит. */
    const pushWordW = textWidth(PUSH_WORD);
    const pushUnitW =
      pushWordW + PUSH_GAP_WORD_PET + PUSH_PET_W + PUSH_GAP_PET_WORD;

    const drawPushWord = (originX: number, now: number) => {
      const top = yTop();
      for (let i = 0; i < PUSH_WORD.length; i++) {
        const charX = originX + i * CHAR_ADVANCE;
        if (charX > cssW || charX + GLYPH_W * CELL < 0) continue;
        const glyph = getGlyph(PUSH_WORD[i]!);
        for (let row = 0; row < GLYPH_H; row++) {
          const gr = glyph[row]!;
          for (let col = 0; col < GLYPH_W; col++) {
            if (!gr[col]) continue;
            dot(charX + col * CELL, top + row * CELL, 0, 0, now);
          }
        }
      }
    };

    const drawPusher = (
      originX: number,
      now: number,
      frame: string[],
      leanDev: number,
      bobDev: number,
      extras: ReadonlyArray<readonly [number, number]>,
    ) => {
      const top = yTop();
      if (originX > cssW || originX + PUSH_PET_W < 0) return;
      for (let row = 0; row < PET_COLS; row++) {
        const rowStr = frame[row]!;
        for (let col = 0; col < PET_COLS; col++) {
          if (rowStr[col] !== "1") continue;
          dot(originX + col * CELL, top + row * CELL, leanDev, bobDev, now);
        }
      }
      for (const [col, row] of extras) {
        dot(originX + col * CELL, top + row * CELL, leanDev, bobDev, now);
      }
    };

    const drawPushScene = (now: number) => {
      const step = Math.floor(now / PUSH_STEP_MS);
      const p = (now % PUSH_STEP_MS) / PUSH_STEP_MS;
      const slot = step % PUSH_REST_EVERY;
      const resting = slot === PUSH_REST_EVERY - 1;
      // База каравана копит только завершённые ездовые такты
      // (rest-такты пути не добавляют).
      const pushesDone = step - Math.floor(step / PUSH_REST_EVERY);
      const base = pushesDone * PUSH_STEP_PX;

      // Сдвиг внутри такта: строка едет ровно (linear), но перед
      // остановкой плавно тормозит, а после — плавно разгоняется.
      let shift = 0;
      if (!resting) {
        if (slot === PUSH_REST_EVERY - 2) {
          shift = Math.sin((p * Math.PI) / 2); // ease-out в остановку
        } else if (slot === 0) {
          shift = 1 - Math.cos((p * Math.PI) / 2); // ease-in с места
        } else {
          shift = p; // ровный ход
        }
        shift *= PUSH_STEP_PX;
      }

      const frame = PET_BASE.slice();
      const extras: Array<readonly [number, number]> = [];
      let leanDev = 0;
      let bobDev = 0;

      if (resting) {
        // Передышка: стоит, смотрит в зал, грудь ходит от дыхания,
        // пара морганий, со лба скатывается капля пота.
        frame[2] = p < 0.1 || (p > 0.52 && p < 0.6) ? EYE_BLINK : EYE_CENTER;
        frame[6] = PUSHER_LEGS_A;
        bobDev = Math.round(Math.sin(p * Math.PI * 2) * dpr);
        const dropRow = Math.floor(p * 8) - 1;
        if (dropRow >= 0 && dropRow <= 5) extras.push([7, dropRow] as const);
      } else {
        // Бежит, упираясь в слово: ножки семенят быстро, корпус
        // наклонён вперёд, лёгкая тряска от бега. Глаза на слово.
        frame[2] = EYE_LEFT;
        frame[6] =
          Math.floor(now / PUSH_LEG_MS) % 2 === 0
            ? PUSHER_LEGS_A
            : PUSHER_LEGS_B;
        leanDev = Math.round(-1.6 * dpr);
        bobDev = Math.floor(now / PUSH_LEG_MS) % 2 === 0 ? 0 : Math.round(-dpr);
        // Пыль из-под ножек — пара точек позади, мерцают в такт бегу.
        if (Math.floor(now / (PUSH_LEG_MS * 2)) % 2 === 0) {
          extras.push([7, 6] as const);
        } else {
          extras.push([8, 6] as const, [7, 5] as const);
        }
      }

      // Сдвиг по модулю юнита — бесконечный караван без шва.
      const caravan = base + shift;
      const phase = ((caravan % pushUnitW) + pushUnitW) % pushUnitW;
      for (let unitX = -phase; unitX < cssW + pushUnitW; unitX += pushUnitW) {
        drawPushWord(unitX, now);
        drawPusher(
          unitX + pushWordW + PUSH_GAP_WORD_PET,
          now,
          frame,
          leanDev,
          bobDev,
          extras,
        );
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

      // Запись и распознавание: вместо статусного текста в
      // центральной зоне живёт спектральная волна (Siri-spectrum) —
      // при записи её ведёт голос, при распознавании она, не гаснув,
      // сворачивается в переливающуюся жидкую сферу (per-vertex
      // морф лент в страты, см. drawVoiceWave).
      // Питомец и правый слот рисуются БЕЛЫМ
      // led-светом (база), не янтарным spectrum'ом: радужная
      // волна — единственный цветной субъект на экране.
      if (animate && (moodRef.current === "listen" || moodRef.current === "think")) {
        drawVoiceWave(now, moodRef.current === "think");
        const wasSpectrum = voiceSpectrum;
        voiceSpectrum = false;
        activePalette = LCD_PALETTE.base;
        activeAlpha = LCD_PALETTE.base.alpha;
        ctx.fillStyle = LCD_PALETTE.base.color;
        drawPet(now, dxDev, animate);
        drawRightSlot(now, dxDev, animate);
        voiceSpectrum = wasSpectrum;
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

      // Push-сцена превью: своя самодостаточная отрисовка, без
      // статус-текста/слота/настроений. Бесконечный караван.
      if (sceneRef.current === "push") {
        const palette = LCD_PALETTE.base;
        ctx.globalCompositeOperation = "lighter";
        activePalette = palette;
        activeAlpha = palette.alpha;
        ctx.fillStyle = palette.color;
        drawPushScene(animate ? now : 0);
        activeAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        return;
      }

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
        if (!wWasListening) {
          resetWaveState(now);
          wWasListening = true;
        }
        wThinkStart = 0;
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
        // Запись → распознавание: состояние волны НЕ сбрасывается,
        // голосовой бугор бесшовно перетекает в машинный пульс.
        // Сброс нужен только при входе в think «с нуля».
        if (!wWasListening) {
          resetWaveState(now);
          wWasListening = true;
        }
        if (wThinkStart === 0) wThinkStart = now;
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
      // Вышли из обоих волновых режимов (listen/think) — следующий
      // вход начнёт волну с чистого состояния.
      wWasListening = false;
      wThinkStart = 0;

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
