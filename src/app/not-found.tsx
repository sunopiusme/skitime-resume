import Link from "next/link";

import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className={styles.page}>
      <header className={styles.topbar} aria-label="Шапка сайта">
        <Link className={styles.brand} href="/" aria-label="Данила Фурманов — на главную">
          Данила Фурманов
        </Link>
        <nav className={styles.navLinks} aria-label="Основная навигация">
          <Link href="/projects">Проекты</Link>
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="nf-title">
        <div className={styles.metaRail} aria-hidden="true">
          <span>404</span>
          <span className={styles.metaRule} />
          <span>Страница не найдена</span>
        </div>

        <h1 id="nf-title" className={styles.title}>
          Такой страницы здесь пока нет.
        </h1>

        <p className={styles.subtitle}>
          Возможно, ссылка устарела или маршрут ещё не опубликован. Попробуйте начать с главной
          или перейти к избранным работам.
        </p>

        <div className={styles.actions}>
          <Link className={styles.primaryAction} href="/">
            На главную
          </Link>
          <Link className={styles.secondaryAction} href="/projects">
            Проекты
          </Link>
        </div>
      </section>

      <footer className={styles.footer} aria-label="Подвал">
        <span>© {new Date().getFullYear()} Данила Фурманов</span>
      </footer>
    </main>
  );
}
