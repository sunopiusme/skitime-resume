"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import styles from "./WalletHome.module.css";
import {
  BitcoinMark,
  BoltIcon,
  BuySellIcon,
  CardIcon,
  ChevronRightIcon,
  ClockIcon,
  CloseIcon,
  CollectiblesIcon,
  EarnIcon,
  ExchangeIcon,
  GearIcon,
  GiftIcon,
  P2pIcon,
  PlusIcon,
  QrIcon,
  SendIcon,
  TetherMark,
  TonMark,
} from "./icons";

/* ─────────────────────────────────────────
   Wallet Home — ландшафтный «терминал».
   Переработка Figma-фрейма
   «Main Wallet (Home/Defaut/Assets/More assets)»
   в горизонтальную раскладку: словно телефон
   повернули набок и раскрыли в один кадр.

   Раскладка — две колонки под общей шапкой:
   • слева  — баланс, быстрые действия, промо.
     Колонка «якорь»: при смене кошелька стоит
     на месте.
   • справа — вкладки и список активов. Меняется
     при переключении Main Wallet ⇄ TON Space.

   Palette локальная (--w-*), сайт остаётся тёмным.
   Системный chrome (статус-бар, Dynamic Island,
   таб-бар) намеренно опущен — переносим контент.

   Интерактив: pill-переключатель в шапке гоняет
   правую колонку между Main Wallet и TON Space
   (два состояния из брифа — кастодиальный баланс
   и блокчейн-профиль в TON).
   ───────────────────────────────────────── */

type WalletMode = "main" | "ton";

type WalletHomeProps = {
  onModeChange?: (nextMode: WalletMode) => void | Promise<void>;
};

type QuickAction = {
  label: string;
  icon: ReactNode;
};

/* Подписи английские: бриф требует «Design interfaces in
   English with localization support». */
const QUICK_ACTIONS: readonly QuickAction[] = [
  { label: "Send", icon: <SendIcon /> },
  { label: "Deposit", icon: <PlusIcon /> },
  { label: "Exchange", icon: <ExchangeIcon /> },
  { label: "Buy/Sell", icon: <BuySellIcon /> },
];

/* TON Space — on-chain профиль, действий три: отправить, пополнить,
   обменять. Как на референсе: Send / Deposit / Swap. */
const TON_ACTIONS: readonly QuickAction[] = [
  { label: "Send", icon: <SendIcon /> },
  { label: "Deposit", icon: <PlusIcon /> },
  { label: "Swap", icon: <ExchangeIcon /> },
];

type Asset = {
  symbol: string;
  name: string;
  amount: string;
  fiat: string;
  mark: ReactNode;
  tint: string;
};

/* Активы из брифа: Toncoin, USDT, Bitcoin. Notcoin
   убран — в задании перечислены только эти три. */
const MAIN_ASSETS: readonly Asset[] = [
  { symbol: "USDT", name: "Dollars", amount: "0 USDT", fiat: "$0.00", mark: <TetherMark />, tint: "#009393" },
  { symbol: "TON", name: "Toncoin", amount: "0 TON", fiat: "$0.00", mark: <TonMark />, tint: "#0098ea" },
  { symbol: "BTC", name: "Bitcoin", amount: "0 BTC", fiat: "$0.00", mark: <BitcoinMark />, tint: "#f7931a" },
];

/* TON Space — блокчейн-профиль: держит только TON-активы. */
const TON_ASSETS: readonly Asset[] = [
  { symbol: "TON", name: "Toncoin", amount: "0 TON", fiat: "$0.00", mark: <TonMark />, tint: "#0098ea" },
  { symbol: "USDT", name: "Tether", amount: "0 USDT", fiat: "$0.00", mark: <TetherMark />, tint: "#009393" },
];

const TABS = ["Assets", "Explore", "History"] as const;
type Tab = (typeof TABS)[number];

/* Explore — витрина сервисов кошелька из брифа: обмен, P2P-маркет,
   вывод на карту, Wallet Earn, промо-кампании. За вкладкой должен
   стоять контент, а не пустота. */
type Service = {
  name: string;
  hint: string;
  icon: ReactNode;
  tint: string;
};

const SERVICES: readonly Service[] = [
  { name: "Exchange", hint: "Swap crypto instantly", icon: <ExchangeIcon />, tint: "#007afa" },
  { name: "P2P Market", hint: "Buy & sell with people", icon: <P2pIcon />, tint: "#2ac281" },
  { name: "Bank card", hint: "Withdraw to your card", icon: <CardIcon />, tint: "#7d5cff" },
  { name: "Wallet Earn", hint: "Up to 50% APY on USDT", icon: <BoltIcon />, tint: "#f7931a" },
  { name: "Giveaways", hint: "Raffles & Premium gifts", icon: <GiftIcon />, tint: "#eb5545" },
];

export default function WalletHome({ onModeChange }: WalletHomeProps) {
  const [mode, setMode] = useState<WalletMode>("main");
  const [tab, setTab] = useState<Tab>("Assets");
  const [pendingMode, setPendingMode] = useState<WalletMode | null>(null);
  const [modeError, setModeError] = useState<string | null>(null);
  const isTon = mode === "ton";
  const assets = isTon ? TON_ASSETS : MAIN_ASSETS;

  async function handleModeChange(nextMode: WalletMode) {
    if (nextMode === mode || pendingMode) return;

    setPendingMode(nextMode);
    setModeError(null);

    try {
      await onModeChange?.(nextMode);
      setMode(nextMode);
    } catch {
      setModeError("Couldn’t switch wallets. Try again.");
    } finally {
      setPendingMode(null);
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.screen} data-mode={mode} aria-label="Главный экран Wallet">
        {/* Две секции. Слева — секция кошелька: управление
           (переключатель + QR у левого края), баланс, действия,
           промо. Справа — секция Assets/Explore/History со списком.
           Общей шапки на всю ширину больше нет — её роль взяла на
           себя верхняя строка левой секции. */}
        <div className={styles.body}>
          {/* ── Секция кошелька ── */}
          <section className={styles.wallet} data-mode={mode} aria-label="Кошелёк">
            {/* Верхняя строка секции: настройки слева, переключатель
               в центре, QR-код справа. */}
            <div className={styles.walletTop}>
              <button type="button" className={styles.circleBtn} aria-label="Настройки">
                <GearIcon />
              </button>

              <div
                className={styles.switch}
                role="tablist"
                aria-label="Переключатель кошелька"
                aria-busy={pendingMode !== null}
                data-mode={mode}
              >
                <span className={styles.switchThumb} aria-hidden="true" />
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isTon}
                  className={styles.switchOption}
                  disabled={pendingMode !== null}
                  onClick={() => void handleModeChange("main")}
                >
                  Main Wallet
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isTon}
                  className={styles.switchOption}
                  disabled={pendingMode !== null}
                  onClick={() => void handleModeChange("ton")}
                >
                  TON Space
                </button>
              </div>

              <button
                type="button"
                className={`${styles.circleBtn} ${styles.walletTopEnd}`}
                aria-label="QR-код"
              >
                <QrIcon />
              </button>
            </div>

            {modeError && (
              <p className={styles.modeError} role="alert">
                {modeError}
              </p>
            )}

            {/* Оба режима занимают один слот: при мгновенной смене
               действия и остальная геометрия остаются на месте. */}
            <div className={styles.walletFocus}>
              {isTon ? (
                <div className={styles.tonProfile}>
                  <span className={styles.tonAvatar} aria-hidden="true">
                    <TonMark />
                  </span>
                  <p className={styles.tonAddressLabel}>Your TON address</p>
                  <p className={styles.tonAddress}>UQCK…nv6U</p>
                </div>
              ) : (
                <div className={styles.balance}>
                  <p className={styles.balanceLabel}>Total balance</p>
                  <p className={styles.balanceValue}>
                    <span className={styles.balanceSign}>$</span>
                    <span className={styles.balanceNumber}>0.00</span>
                  </p>
                </div>
              )}
            </div>

            <nav className={styles.actions} data-mode={mode} aria-label="Быстрые действия">
              {(isTon ? TON_ACTIONS : QUICK_ACTIONS).map((action) => (
                <span key={action.label} className={styles.action}>
                  <span className={styles.actionIcon}>{action.icon}</span>
                  <span className={styles.actionLabel}>{action.label}</span>
                </span>
              ))}
            </nav>

            {/* Промо только в Main Wallet: живой баннер Wallet Earn.
               В TON Space промо нет — там чистый фон секции, без
               блока-обрубка. Высоту карточки держит правая секция
               (.pane min-height), поэтому при переключении фон не
               «прыгает» и без промо-заглушки слева. */}
            {!isTon && (
              <section className={styles.promo}>
                <span className={styles.promoArt} aria-hidden="true">
                  <EarnIcon />
                </span>
                <div className={styles.promoText}>
                  <p className={styles.promoTitle}>Earn 50% APY on USDT</p>
                  <span className={styles.promoCta}>
                    Learn more
                    <ChevronRightIcon className={styles.promoCtaArrow} />
                  </span>
                </div>
                <button type="button" className={styles.promoClose} aria-label="Закрыть">
                  <CloseIcon />
                </button>
              </section>
            )}
          </section>

          {/* ── Секция активов ── */}
          <section className={styles.pane} data-mode={mode} aria-label="Разделы кошелька">
            {/* Вкладки — настоящие: переключают контент справа. */}
            <div className={styles.tabs} role="tablist" aria-label="Разделы">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  className={tab === t ? `${styles.tab} ${styles.tabActive}` : styles.tab}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Область контента фиксированной высоты со скроллом:
               поглощает разницу высот между вкладками, карточка не
               «прыгает». */}
            <div className={styles.paneBody}>
            {/* Assets — список активов + хвост «More assets/Collectibles». */}
            {tab === "Assets" && (
              <ul className={styles.assets}>
                {assets.map((asset) => (
                  <li key={asset.symbol} className={styles.assetRow}>
                    <span className={styles.assetIcon} style={{ background: asset.tint }} aria-hidden="true">
                      {asset.mark}
                    </span>
                    <span className={styles.assetBody}>
                      <span className={styles.assetName}>{asset.name}</span>
                      <span className={styles.assetAmount}>{asset.amount}</span>
                    </span>
                    <span className={styles.assetFiat}>{asset.fiat}</span>
                  </li>
                ))}

                {/* Хвост списка — «More assets» (Main) / «Collectibles» (TON Space). */}
                <li className={`${styles.assetRow} ${styles.assetRowLink}`}>
                  <span className={styles.assetIcon} style={{ background: "#eef0f3", color: "#8e8e92" }} aria-hidden="true">
                    {isTon ? <CollectiblesIcon /> : <ChevronRightIcon />}
                  </span>
                  <span className={styles.assetBody}>
                    <span className={styles.assetName}>{isTon ? "Collectibles" : "More assets"}</span>
                    <span className={styles.assetAmount}>
                      {isTon ? "NFTs & Web3 Mini Apps" : "Show all tokens"}
                    </span>
                  </span>
                  <ChevronRightIcon className={styles.rowChevron} />
                </li>
              </ul>
            )}

            {/* Explore — витрина сервисов кошелька из брифа. */}
            {tab === "Explore" && (
              <ul className={styles.assets}>
                {SERVICES.map((service) => (
                  <li key={service.name} className={`${styles.assetRow} ${styles.assetRowLink}`}>
                    <span className={styles.assetIcon} style={{ background: service.tint }} aria-hidden="true">
                      {service.icon}
                    </span>
                    <span className={styles.assetBody}>
                      <span className={styles.assetName}>{service.name}</span>
                      <span className={styles.assetAmount}>{service.hint}</span>
                    </span>
                    <ChevronRightIcon className={styles.rowChevron} />
                  </li>
                ))}
              </ul>
            )}

            {/* History — пустое состояние: баланс $0, транзакций ещё нет. */}
            {tab === "History" && (
              <div className={styles.empty}>
                <span className={styles.emptyIcon} aria-hidden="true">
                  <ClockIcon />
                </span>
                <p className={styles.emptyTitle}>No transactions yet</p>
                <p className={styles.emptyText}>
                  Your Send, Deposit and Exchange activity will appear here.
                </p>
              </div>
            )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
