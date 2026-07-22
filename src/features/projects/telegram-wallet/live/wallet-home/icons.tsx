/* ─────────────────────────────────────────
   Иконки экрана Wallet Home.

   Две группы:
   1. Интерфейсные (currentColor, штрих 1.6–2px
      под 24px-сетку) — в стиле composer-демо:
      геометрия Lucide, тонкий равномерный штрих.
      В Figma это были SF Symbols; в вебе их нет.
   2. Брендовые логотипы токенов — заливка белым
      поверх цветного круга (tint задаётся в CSS).
      Рисуем контуром, а не эмодзи, чтобы держать
      резкость на любом размере.
   ───────────────────────────────────────── */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/* Общие props для штриховых иконок — единый штрих
   и стыки, как в composer/icons.tsx. */
const stroke = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

/* Заливочные брендовые марки — свой viewBox, currentColor
   не нужен: цвет знака задаётся прямо (обычно белый). */
const brand = {
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": true,
  xmlns: "http://www.w3.org/2000/svg",
} as const;

/* ── Интерфейсные ──────────────────────── */

/* Шестерёнка — настройки (􀣋). Настоящий cog с зубцами
   (Lucide «settings»), а не звезда/солнце из радиальных лучей. */
export function GearIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props} strokeWidth={1.6}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx={12} cy={12} r={3} />
    </svg>
  );
}

/* QR-код (􀖂). */
export function QrIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <rect x={4} y={4} width={6} height={6} rx={1.4} />
      <rect x={4} y={14} width={6} height={6} rx={1.4} />
      <rect x={14} y={4} width={6} height={6} rx={1.4} />
      <path d="M14 14h2.5M20 14v2.5M14 17.5V20M17.5 20H20M20 17.5v.01M17.5 14h.01" />
    </svg>
  );
}

/* Шеврон вниз (􀆈). */
export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props} strokeWidth={2}>
      <path d="m6 9.5 6 6 6-6" />
    </svg>
  );
}

/* Стрелка вверх — отправить (􀄨). */
export function SendIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props} strokeWidth={2.2}>
      <path d="M12 19V5.5M12 5.5 6.5 11M12 5.5 17.5 11" />
    </svg>
  );
}

/* Плюс — пополнить (􀅼). */
export function PlusIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props} strokeWidth={2.2}>
      <path d="M12 5.5v13M5.5 12h13" />
    </svg>
  );
}

/* Две встречные стрелки — обмен (􀄭). */
export function ExchangeIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M6 8h12M18 8l-3.2-3.2M18 8l-3.2 3.2M18 16H6M6 16l3.2-3.2M6 16l3.2 3.2" />
    </svg>
  );
}

/* Купить/продать — стопка монет (􁽈). */
export function BuySellIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <ellipse cx={12} cy={6} rx={6.5} ry={2.6} />
      <path d="M5.5 6v5c0 1.44 2.91 2.6 6.5 2.6s6.5-1.16 6.5-2.6V6" />
      <path d="M5.5 11v5c0 1.44 2.91 2.6 6.5 2.6s6.5-1.16 6.5-2.6v-5" />
    </svg>
  );
}

/* Стрелка вверх-вправо — badge кнопки OPEN (􀋦). */
export function ArrowUpRightIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props} strokeWidth={2}>
      <path d="M8 16 16 8M9 8h7v7" />
    </svg>
  );
}

/* Закрыть промо (✕). */
export function CloseIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props} strokeWidth={2}>
      <path d="M7 7 17 17M17 7 7 17" />
    </svg>
  );
}

/* Проценты в круге — Wallet Earn (заменяет 🪙). */
export function EarnIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <circle cx={12} cy={12} r={9} />
      <path d="M9 9h.01M15 15h.01M15.5 8.5 8.5 15.5" strokeWidth={2} />
    </svg>
  );
}

/* Стопка изображений — коллекционные/NFT в TON Space. */
export function CollectiblesIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <rect x={4} y={4} width={16} height={16} rx={3} />
      <circle cx={9} cy={9} r={1.6} />
      <path d="M20 15.5 15.5 11 6 20" />
    </svg>
  );
}

/* Стрелка вправо — переход к разделу (􀯻). */
export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props} strokeWidth={2}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

/* Часы — пустое состояние History. */
export function ClockIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <circle cx={12} cy={12} r={9} />
      <path d="M12 7.5V12l3 2" strokeWidth={2} />
    </svg>
  );
}

/* Две встречные стрелки в круге — P2P Market. */
export function P2pIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M7 9h9m0 0-2.5-2.5M16 9l-2.5 2.5M17 15H8m0 0 2.5-2.5M8 15l2.5 2.5" strokeWidth={1.8} />
    </svg>
  );
}

/* Карта — вывод на банковскую карту. */
export function CardIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <rect x={3} y={6} width={18} height={12} rx={3} />
      <path d="M3 10h18M7 14.5h4" strokeWidth={1.8} />
    </svg>
  );
}

/* Молния — Web3 Mini Apps / сервисы. */
export function BoltIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z" />
    </svg>
  );
}

/* Подарок — розыгрыши и кампании. */
export function GiftIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <rect x={4} y={9} width={16} height={11} rx={2} />
      <path d="M4 13h16M12 9v11M12 9S10.5 5 8.5 5 6.5 8 8.5 9m3.5 0s1.5-4 3.5-4 2 3 0 4" strokeWidth={1.8} />
    </svg>
  );
}

/* ── Брендовые логотипы токенов ────────── */

/* Tether (USDT) — «T» на фоне круга (сам круг рисует CSS). */
export function TetherMark(props: IconProps) {
  return (
    <svg {...brand} {...props}>
      <path
        d="M13.4 10.6V9.1h3.5V6.8H7.1v2.3h3.5v1.5c-2.8.13-4.9.68-4.9 1.35 0 .66 2.1 1.22 4.9 1.35v4.4h2.8v-4.4c2.8-.13 4.9-.69 4.9-1.35 0-.67-2.1-1.22-4.9-1.35Zm0 2.29c-.07.01-.75.05-1.36.05-.49 0-.85-.02-1.44-.05-2.35-.1-4.1-.51-4.1-1 0-.48 1.75-.89 4.1-1v1.6c.6.04.97.06 1.45.06.6 0 1.24-.04 1.35-.05v-1.61c2.35.11 4.09.52 4.09 1 0 .49-1.74.9-4.09 1Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* Toncoin (TON) — фирменный «алмаз» с внутренними гранями. */
export function TonMark(props: IconProps) {
  return (
    <svg {...brand} {...props}>
      <path
        d="M6.2 8.3h11.6c.5 0 .8.55.55.98l-5.8 9.9a.64.64 0 0 1-1.1 0L5.65 9.28a.63.63 0 0 1 .55-.98Zm5.15 1.4H7.9l3.45 5.9V9.7Zm1.3 0v5.9l3.45-5.9h-3.45Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* Bitcoin (BTC) — символ ₿. */
export function BitcoinMark(props: IconProps) {
  return (
    <svg {...brand} {...props}>
      <path
        d="M15.3 10.9c.24-1.5-.9-2.3-2.47-2.83l.51-2.04-1.24-.31-.5 1.99c-.33-.08-.66-.16-1-.23l.5-2-1.24-.31-.51 2.03c-.27-.06-.53-.12-.79-.19l-1.71-.43-.33 1.33s.92.21.9.22c.5.13.6.46.58.73l-1.4 5.6c-.06.15-.22.38-.57.29.01.02-.9-.22-.9-.22l-.62 1.42 1.61.4c.3.08.6.16.89.23l-.52 2.06 1.24.31.51-2.04c.34.09.67.18 1 .26l-.5 2.03 1.24.31.51-2.06c2.12.4 3.71.24 4.38-1.67.54-1.54-.03-2.42-1.14-3 .81-.19 1.42-.72 1.58-1.82Zm-2.83 3.97c-.39 1.54-2.98.71-3.82.5l.68-2.72c.84.21 3.54.62 3.14 2.22Zm.39-3.99c-.35 1.4-2.51.69-3.21.51l.62-2.47c.7.18 2.96.5 2.59 1.96Z"
        fill="currentColor"
      />
    </svg>
  );
}
