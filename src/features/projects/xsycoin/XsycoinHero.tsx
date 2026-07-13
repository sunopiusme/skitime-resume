import Link from "next/link";

import HeroVideo from "./HeroVideo";
import styles from "./XsycoinHero.module.css";

/**
 * XSYCOIN hero — «затмение»: диск-земля восходит снизу и закрывает
 * солнце, кромка диска светится тонкой обводкой и гладкой короной.
 * Презентационная сцена без интерактива (server component).
 */
export default function XsycoinHero() {
  return (
    <main id="main" tabIndex={-1} className={styles.stage}>
      <header className={styles.topbar} aria-label="Шапка сайта">
        <Link className={styles.brand} href="/" aria-label="Данила Фурманов, на главную">
          Фурманов
          <img src="/xlogo.svg" alt="" aria-hidden="true" className={styles.brandLogo} />
        </Link>
        <nav className={styles.navLinks} aria-label="Основная навигация">
          <Link href="/">Главная</Link>
          <Link href="/projects" aria-current="page">
            Проекты
          </Link>
        </nav>
      </header>

      <div className={styles.scene} aria-hidden="true">
        <div className={styles.stars} />
        <div className={styles.haze} />
        <div className={styles.streaks} />
        <div className={styles.earth} />
        <div className={styles.peak} />
        <div className={styles.vignette} />
        <div className={styles.grain} />
      </div>

      <div className={styles.content}>
        <img
          src="/projects/xsycoin/XSYCOIN.png"
          alt="XSYCOIN"
          className={styles.wordmark}
          fetchPriority="high"
          decoding="async"
        />
      </div>

      <HeroVideo />
    </main>
  );
}
