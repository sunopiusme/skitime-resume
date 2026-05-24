import Link from "next/link";

import { listProjects } from "@/content/projects/registry";
import { siteConfig } from "@/design-system/site";

import ProjectCover from "./ProjectCover";
import styles from "./ProjectsList.module.css";

export default function ProjectsList() {
  const entries = listProjects();

  return (
    <main id="main" tabIndex={-1} className={styles.page}>
      <header className={styles.topbar} aria-label="Шапка сайта">
        <Link className={styles.brand} href="/" aria-label={`${siteConfig.name} — на главную`}>
          {siteConfig.name}
        </Link>
        <nav className={styles.navLinks} aria-label="Основная навигация">
          <Link href="/">Главная</Link>
          <Link href="/projects" aria-current="page">
            Проекты
          </Link>
        </nav>
      </header>

      <section className={styles.section} aria-labelledby="projects-title">
        <header className={styles.heroHead}>
          <h1 id="projects-title" className={styles.title}>
            Проекты
          </h1>
          <p className={styles.lede}>
            Кейсы с полным путём от продуктового мышления до кода. Открываются как длинные разборы.
          </p>
        </header>

        <div className={styles.tableWrap} role="region" aria-label="Список проектов">
          <div className={styles.tableHead} aria-hidden="true">
            <span className={styles.colIndex}>№</span>
            <span className={styles.colCover}>Обложка</span>
            <span className={styles.colTitle}>Проект</span>
            <span className={styles.colYear}>Год</span>
            <span className={styles.colTags}>Темы</span>
          </div>

          <ol className={styles.table}>
            {entries.map((entry, idx) => {
              const issue = String(idx + 1).padStart(2, "0");
              return (
                <li key={entry.slug} className={styles.row}>
                  <Link
                    className={styles.rowLink}
                    href={`/projects/${entry.slug}`}
                    aria-label={`${entry.title}, ${entry.year}`}
                  >
                    <span className={styles.colIndex}>{issue}</span>

                    <span className={styles.colCover}>
                      <ProjectCover
                        title={entry.title}
                        eyebrow={entry.tags[0] ?? entry.role}
                      />
                    </span>

                    <span className={styles.colTitle}>
                      <span className={styles.rowTitle}>{entry.title}</span>
                      <span className={styles.rowSummary}>{entry.summary}</span>
                    </span>

                    <span className={styles.colYear}>{entry.year}</span>

                    <span className={styles.colTags}>{entry.tags.join(", ")}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <footer className={styles.footer} aria-label="Подвал">
        <span>© {new Date().getFullYear()} {siteConfig.name}</span>

        {siteConfig.socials.length > 0 ? (
          <ul className={styles.socials} aria-label="Профили в других сервисах">
            {siteConfig.socials
              .filter((s) => s.url.trim().length > 0)
              .map((s) => (
                <li key={s.url}>
                  <a href={s.url} rel="noopener noreferrer me" target="_blank">
                    {s.label}
                  </a>
                </li>
              ))}
          </ul>
        ) : null}
      </footer>
    </main>
  );
}
