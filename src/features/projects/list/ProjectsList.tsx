import Link from "next/link";

import { listProjects } from "@/content/projects/registry";
import { siteConfig } from "@/design-system/site";

import ProjectCard from "./ProjectCard";
import styles from "./ProjectsList.module.css";

export default function ProjectsList() {
  const entries = listProjects();
  const socials = siteConfig.socials.filter((s) => s.url.trim().length > 0);

  return (
    <main id="main" tabIndex={-1} className={styles.page}>
      <header className={styles.topbar} aria-label="Шапка сайта">
        <Link className={styles.brand} href="/" aria-label={`${siteConfig.name}, на главную`}>
          <span className={styles.brandName}>Фурманов</span>
          <img src="/xlogo.svg" alt="" aria-hidden="true" className={styles.brandLogo} />
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
            Рассказываю о своих проектах так, как сам люблю читать про чужие.
          </p>
        </header>

        <ol className={styles.grid} aria-label="Список проектов">
          {entries.map((entry, idx) => {
            const issue = String(idx + 1).padStart(2, "0");
            return (
              <li key={entry.slug} className={styles.card}>
                <ProjectCard
                  slug={entry.slug}
                  title={entry.title}
                  year={entry.year}
                  index={issue}
                />
              </li>
            );
          })}
        </ol>
      </section>

      <footer className={styles.footer} aria-label="Подвал">
        <div className={styles.footerInner}>
          <span>© {new Date().getFullYear()} {siteConfig.name}</span>

          {socials.length > 0 ? (
            <ul className={styles.socials} aria-label="Профили в других сервисах">
              {socials.map((s) => (
                <li key={s.url}>
                  <a href={s.url} rel="noopener noreferrer me" target="_blank">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </footer>
    </main>
  );
}
