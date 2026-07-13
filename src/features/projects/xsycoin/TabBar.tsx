import styles from "./TabBar.module.css";

/**
 * Превью таб-бара приложения XSYCOIN — тёмная «пилюля» с четырьмя
 * вкладками (иконка + подпись). Презентационный блок: показывает
 * навигацию перед поэлементным разбором кейса (server component).
 */

type Tab =
  | { kind: "emoji"; glyph: string; label: string }
  | { kind: "brand"; label: string };

const TABS: Tab[] = [
  { kind: "emoji", glyph: "🧸", label: "frenx" },
  { kind: "brand", label: "earn" },
  { kind: "emoji", glyph: "🎩", label: "room" },
  { kind: "emoji", glyph: "🍔", label: "foost" },
];

function TabIcon({ tab }: { tab: Tab }) {
  if (tab.kind === "brand") {
    return (
      <span className={styles.coin} aria-hidden="true">
        <img src="/xlogo.svg" alt="" className={styles.coinGlyph} />
      </span>
    );
  }
  return (
    <span className={styles.emoji} aria-hidden="true">
      {tab.glyph}
    </span>
  );
}

export default function TabBar() {
  return (
    <section className={styles.section} aria-label="Превью таб-бара приложения">
      <nav className={styles.bar} aria-label="Навигация приложения">
        {TABS.map((tab) => (
          <span key={tab.label} className={styles.tab}>
            <span className={styles.iconWrap}>
              <TabIcon tab={tab} />
            </span>
            <span className={styles.label}>{tab.label}</span>
          </span>
        ))}
      </nav>
    </section>
  );
}
