"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";

import styles from "./WalletHome.module.css";
import {
  BitcoinMark,
  BoltIcon,
  BuySellIcon,
  CardIcon,
  ChevronRightIcon,
  ClockIcon,
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

type WalletMode = "main" | "ton";

type WalletHomeProps = {
  onModeChange?: (nextMode: WalletMode) => void | Promise<void>;
};

type QuickAction = {
  label: string;
  icon: ReactNode;
};

const QUICK_ACTIONS: readonly QuickAction[] = [
  { label: "Send", icon: <SendIcon /> },
  { label: "Deposit", icon: <PlusIcon /> },
  { label: "Exchange", icon: <ExchangeIcon /> },
  { label: "Buy/Sell", icon: <BuySellIcon /> },
];

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

const MAIN_ASSETS: readonly Asset[] = [
  { symbol: "USDT", name: "Dollars", amount: "8,420.00 USDT", fiat: "$8,420.00", mark: <TetherMark />, tint: "#009393" },
  { symbol: "TON", name: "Toncoin", amount: "620.4 TON", fiat: "$3,102.00", mark: <TonMark />, tint: "#0098ea" },
  { symbol: "BTC", name: "Bitcoin", amount: "0.0154 BTC", fiat: "$958.35", mark: <BitcoinMark />, tint: "#f7931a" },
];

const TON_ASSETS: readonly Asset[] = [
  { symbol: "TON", name: "Toncoin", amount: "620.4 TON", fiat: "$3,102.00", mark: <TonMark />, tint: "#0098ea" },
  { symbol: "USDT", name: "Tether", amount: "240.00 USDT", fiat: "$240.00", mark: <TetherMark />, tint: "#009393" },
];

type Tab = "Assets" | "Explore" | "History";

type Service = {
  name: string;
  icon: ReactNode;
  tint: string;
};

const SERVICES: readonly Service[] = [
  { name: "Exchange", icon: <ExchangeIcon />, tint: "#007afa" },
  { name: "P2P Market", icon: <P2pIcon />, tint: "#2ac281" },
  { name: "Bank card", icon: <CardIcon />, tint: "#7d5cff" },
  { name: "Wallet Earn", icon: <BoltIcon />, tint: "#f7931a" },
  { name: "Giveaways", icon: <GiftIcon />, tint: "#eb5545" },
];

type HistoryItem = {
  title: string;
  hint: string;
  amount: string;
  icon: ReactNode;
  tint: string;
};

const HISTORY: readonly HistoryItem[] = [
  { title: "Deposit", hint: "Today, 14:02", amount: "+250.00 USDT", icon: <PlusIcon />, tint: "#2ac281" },
  { title: "Exchange", hint: "Yesterday, 19:41", amount: "+62.40 TON", icon: <ExchangeIcon />, tint: "#007afa" },
  { title: "Send", hint: "Jul 21, 09:18", amount: "−0.0021 BTC", icon: <SendIcon />, tint: "#8e8e92" },
  { title: "Card top-up", hint: "Pending · Jul 20", amount: "+$120.00", icon: <ClockIcon />, tint: "#f7931a" },
];

export default function WalletHome({ onModeChange }: WalletHomeProps) {
  const [mode, setMode] = useState<WalletMode>("main");
  const [tab, setTab] = useState<Tab>("Assets");
  const [pendingMode, setPendingMode] = useState<WalletMode | null>(null);
  const [modeError, setModeError] = useState<string | null>(null);
  const isTon = mode === "ton";
  const assets = isTon ? TON_ASSETS : MAIN_ASSETS;

  const modeRequestRef = useRef(0);

  const shownMode = pendingMode ?? mode;

  async function handleModeChange(nextMode: WalletMode) {
    if (nextMode === shownMode) return;

    const requestId = modeRequestRef.current + 1;
    modeRequestRef.current = requestId;

    setPendingMode(nextMode);
    setModeError(null);

    try {
      await onModeChange?.(nextMode);
      if (modeRequestRef.current !== requestId) return;
      setMode(nextMode);
    } catch {
      if (modeRequestRef.current !== requestId) return;
      setModeError("Couldn’t switch wallets. Try again.");
    } finally {
      if (modeRequestRef.current === requestId) setPendingMode(null);
    }
  }

  const foldCount: Record<Tab, number> = {
    Assets: assets.length + 1,
    Explore: SERVICES.length,
    History: HISTORY.length,
  };

  function foldHeader(section: Tab) {
    const open = tab === section;

    return (
      <h3 className={styles.foldHeading}>
        <button
          type="button"
          className={styles.foldTrigger}
          aria-expanded={open}
          aria-controls={`wallet-fold-${section.toLowerCase()}`}
          onClick={() => setTab(section)}
        >
          <span className={styles.foldTitle}>{section}</span>
          <span className={styles.foldCount}>{foldCount[section]}</span>
          <ChevronRightIcon className={styles.foldChevron} aria-hidden="true" />
        </button>
      </h3>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.screen} data-mode={mode} aria-label="Главный экран Wallet">
        <div className={styles.body}>
          <section className={styles.wallet} data-mode={mode} aria-label="Кошелёк">
            <div className={styles.walletTop}>
              <button type="button" className={styles.circleBtn} aria-label="Настройки">
                <GearIcon />
              </button>

              <div
                className={styles.switch}
                role="tablist"
                aria-label="Переключатель кошелька"
                aria-busy={pendingMode !== null}
                data-mode={shownMode}
              >
                <span className={styles.switchThumb} aria-hidden="true" />
                <button
                  type="button"
                  role="tab"
                  aria-selected={shownMode === "main"}
                  className={styles.switchOption}
                  onClick={() => void handleModeChange("main")}
                >
                  Main Wallet
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={shownMode === "ton"}
                  className={styles.switchOption}
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

            <div className={styles.walletFocus} key={`focus-${mode}`}>
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
                    <span className={styles.balanceNumber}>12,480</span>
                    <span className={styles.balanceCents}>.35</span>
                  </p>
                </div>
              )}
            </div>

            <nav
              className={styles.actions}
              data-mode={mode}
              key={`actions-${mode}`}
              aria-label="Быстрые действия"
            >
              {(isTon ? TON_ACTIONS : QUICK_ACTIONS).map((action) => (
                <button key={action.label} type="button" className={styles.action}>
                  <span className={styles.actionIcon}>{action.icon}</span>
                  <span className={styles.actionLabel}>{action.label}</span>
                </button>
              ))}
            </nav>

            {!isTon && (
              <button type="button" className={styles.promo}>
                <span className={styles.promoArt} aria-hidden="true">
                  <EarnIcon />
                </span>
                <span className={styles.promoText}>
                  <span className={styles.promoTitle}>Earn 50% APY</span>
                  <span className={styles.promoSubtitle}>on USDT, daily</span>
                </span>
                <span className={styles.promoCta} aria-hidden="true">
                  Start
                  <ChevronRightIcon className={styles.promoCtaArrow} />
                </span>
              </button>
            )}
          </section>

          <section className={styles.pane} data-mode={mode} aria-label="Разделы кошелька">
            <div className={styles.fold}>
              <section className={styles.foldSection} data-open={tab === "Assets"}>
                {foldHeader("Assets")}
                <div className={styles.foldPanel} id="wallet-fold-assets" hidden={tab !== "Assets"}>
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

                    <li className={`${styles.assetRow} ${styles.assetRowLink} ${styles.assetTail}`}>
                      <span className={styles.assetIcon} style={{ background: "#eef0f3", color: "#8e8e92" }} aria-hidden="true">
                        {isTon ? <CollectiblesIcon /> : <PlusIcon />}
                      </span>
                      <span className={styles.assetBody}>
                        <span className={styles.assetName}>{isTon ? "Collectibles" : "More assets"}</span>
                      </span>
                      <button
                        type="button"
                        className={styles.rowButton}
                        aria-label={isTon ? "Open collectibles" : "Show all tokens"}
                      >
                        <ChevronRightIcon className={styles.rowChevron} />
                      </button>
                    </li>
                  </ul>
                </div>
              </section>

              <section className={styles.foldSection} data-open={tab === "Explore"}>
                {foldHeader("Explore")}
                <div className={styles.foldPanel} id="wallet-fold-explore" hidden={tab !== "Explore"}>
                  <ul className={styles.assets}>
                    {SERVICES.map((service) => (
                      <li key={service.name} className={`${styles.assetRow} ${styles.assetRowLink}`}>
                        <span className={styles.assetIcon} style={{ background: service.tint }} aria-hidden="true">
                          {service.icon}
                        </span>
                        <span className={styles.assetBody}>
                          <span className={styles.assetName}>{service.name}</span>
                        </span>
                        <button type="button" className={styles.rowButton} aria-label={`Open ${service.name}`}>
                          <ChevronRightIcon className={styles.rowChevron} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className={styles.foldSection} data-open={tab === "History"}>
                {foldHeader("History")}
                <div className={styles.foldPanel} id="wallet-fold-history" hidden={tab !== "History"}>
                  <ul className={styles.assets}>
                    {HISTORY.map((item) => (
                      <li key={item.title} className={styles.assetRow}>
                        <span className={styles.assetIcon} style={{ background: item.tint }} aria-hidden="true">
                          {item.icon}
                        </span>
                        <span className={styles.assetBody}>
                          <span className={styles.assetName}>{item.title}</span>
                          <span className={styles.assetAmount}>{item.hint}</span>
                        </span>
                        <span className={styles.assetFiat}>{item.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
