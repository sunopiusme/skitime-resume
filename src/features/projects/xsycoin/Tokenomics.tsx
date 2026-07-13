import styles from "./Tokenomics.module.css";

/**
 * Секция «Токеномика $XSY» — идёт сразу после hero-затмения.
 * 3D-монета на «продуктовой» подсветке короны, тезис проекта,
 * ряд ключевых цифр и проза, объясняющая экономику игры.
 * Презентационный блок без интерактива (server component).
 *
 * Тон фактов — из паблика XSYCOIN: фиксированный максимум 14 млрд,
 * ежедневный burn, «знания + фарм», принцип «никогда не просим
 * вкладывать деньги», философия «это всего лишь игра… наверно».
 */

type Stat = {
  label: string;
  value: string;
  note: string;
};

const STATS: Stat[] = [
  { label: "Тикер", value: "$XSY", note: "Внутриигровой токен" },
  { label: "Всего", value: "14 млрд", note: "Запас закрыт навсегда" },
  { label: "Сеть", value: "TON", note: "The Open Network" },
  { label: "Эмиссия", value: "Дефляция", note: "Сгорает каждый день" },
];

export default function Tokenomics() {
  return (
    <section className={styles.section} aria-labelledby="tokenomics-title">
      <div className={styles.coinStage} aria-hidden="true">
        <div className={styles.glow} />
        <img
          src="/projects/xsycoin/coin3d.png"
          alt=""
          className={styles.coin}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className={styles.caption}>
        <p className={styles.kicker}>Токеномика</p>
        <h2 id="tokenomics-title" className={styles.title}>
          $XSY нельзя купить
        </h2>
      </div>

      <dl className={styles.stats}>
        {STATS.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <dt className={styles.statLabel}>{stat.label}</dt>
            <dd className={styles.statValue}>{stat.value}</dd>
            <p className={styles.statNote}>{stat.note}</p>
          </div>
        ))}
      </dl>

      <div className={styles.prose}>
        <p>
          За $XSY не дают купить раннюю позицию. Токен зарабатывается временем и вниманием:
          задания, обучение, знания на блокчейне. Кошелёк тут не помогает.
        </p>
        <p>
          Запас закрыт на 14 миллиардах. Новые токены не печатаются, а старые каждый день горят.
          Дефляция здесь не приём для графика, а таймер сюжета. Игра идёт к концу вместе с запасом.
        </p>
        <p>
          Поэтому поздний вход дороже раннего, но дорожает не цена, а усилие. Никто не предлагает
          занести денег и пропустить очередь. Мы ничего не обещаем и не зовём инвестировать.
        </p>
        <p>
          Дальше $XSY открывает комнату, коллекции и платформу, где накопленный опыт превращается
          в цифровой паспорт. Хотя это всего лишь игра… наверно.
        </p>
      </div>
    </section>
  );
}
