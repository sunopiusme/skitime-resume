import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const stroke = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const brand = {
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "data-brand": "true",
  "aria-hidden": true,
  xmlns: "http://www.w3.org/2000/svg",
} as const;

export function GearIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props} strokeWidth={1.6}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx={12} cy={12} r={3} />
    </svg>
  );
}

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

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props} strokeWidth={2}>
      <path d="m6 9.5 6 6 6-6" />
    </svg>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props} strokeWidth={2.2}>
      <path d="M12 19V5.5M12 5.5 6.5 11M12 5.5 17.5 11" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props} strokeWidth={2.2}>
      <path d="M12 5.5v13M5.5 12h13" />
    </svg>
  );
}

export function ExchangeIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M6 8h12M18 8l-3.2-3.2M18 8l-3.2 3.2M18 16H6M6 16l3.2-3.2M6 16l3.2 3.2" />
    </svg>
  );
}

export function BuySellIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <ellipse cx={12} cy={6} rx={6.5} ry={2.6} />
      <path d="M5.5 6v5c0 1.44 2.91 2.6 6.5 2.6s6.5-1.16 6.5-2.6V6" />
      <path d="M5.5 11v5c0 1.44 2.91 2.6 6.5 2.6s6.5-1.16 6.5-2.6v-5" />
    </svg>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props} strokeWidth={2}>
      <path d="M8 16 16 8M9 8h7v7" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props} strokeWidth={2}>
      <path d="M7 7 17 17M17 7 7 17" />
    </svg>
  );
}

export function EarnIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <circle cx={12} cy={12} r={9} />
      <path d="M9 9h.01M15 15h.01M15.5 8.5 8.5 15.5" strokeWidth={2} />
    </svg>
  );
}

export function CollectiblesIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <rect x={4} y={4} width={16} height={16} rx={3} />
      <circle cx={9} cy={9} r={1.6} />
      <path d="M20 15.5 15.5 11 6 20" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props} strokeWidth={2}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <circle cx={12} cy={12} r={9} />
      <path d="M12 7.5V12l3 2" strokeWidth={2} />
    </svg>
  );
}

export function P2pIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M7 9h9m0 0-2.5-2.5M16 9l-2.5 2.5M17 15H8m0 0 2.5-2.5M8 15l2.5 2.5" strokeWidth={1.8} />
    </svg>
  );
}

export function CardIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <rect x={3} y={6} width={18} height={12} rx={3} />
      <path d="M3 10h18M7 14.5h4" strokeWidth={1.8} />
    </svg>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z" />
    </svg>
  );
}

export function GiftIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <rect x={4} y={9} width={16} height={11} rx={2} />
      <path d="M4 13h16M12 9v11M12 9S10.5 5 8.5 5 6.5 8 8.5 9m3.5 0s1.5-4 3.5-4 2 3 0 4" strokeWidth={1.8} />
    </svg>
  );
}

export function TetherMark(props: IconProps) {
  return (
    <svg {...brand} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        transform="translate(0 .85)"
        d="M19.4658 10.6604c0-.8068-2.5515-1.4799-5.9473-1.6369V7.195h4.186V4.4055H6.3076V7.195h4.1852v1.8286c-3.4018.1562-5.9601.83-5.9601 1.6376 0 .8075 2.5583 1.4806 5.9601 1.6376v5.8618h3.025v-5.8639c3.394-.1563 5.948-.8295 5.948-1.6363ZM18.7538 10.5176c0 .6251-2.2379 1.1483-5.2381 1.2812l.0028.0007c-.0848.0064-.5233.0325-1.5012.0325-.7778 0-1.33-.0233-1.5237-.0325-3.0059-.1322-5.2495-.6555-5.2495-1.2819s2.2436-1.149 5.2495-1.2834v2.0442c.1965.0142.7594.0474 1.5372.0474.9334 0 1.4008-.0389 1.4849-.0466V9.2356c2.9994.1337 5.2381.657 5.2381 1.282Z"
      />
    </svg>
  );
}

export function TonMark(props: IconProps) {
  return (
    <svg {...brand} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.902 6.697h8.196c1.505 0 2.462 1.628 1.705 2.94l-5.059 8.765a.86.86 0 0 1-1.488 0L6.199 9.637c-.758-1.314.197-2.94 1.703-2.94Zm4.844 1.496v7.58l1.102-2.128 2.656-4.756a.465.465 0 0 0-.408-.696h-3.35ZM7.9 8.195a.464.464 0 0 0-.408.694l2.658 4.754 1.102 2.13V8.195H7.9Z"
      />
    </svg>
  );
}

export function BitcoinMark(props: IconProps) {
  return (
    <svg {...brand} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.288 10.291c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z"
      />
    </svg>
  );
}
