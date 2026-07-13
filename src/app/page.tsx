import Link from "next/link";

import { listProjects } from "@/content/projects/registry";
import { getEmailUrl, getTelegramUrl, siteConfig } from "@/design-system/site";
import { JsonLd } from "@/lib/seo/jsonLd";
import ProjectCard from "@/features/projects/list/ProjectCard";
import styles from "@/features/home/home.module.css";

/* Черновики текстов секций «Что делаю» и «Подход».
   Нейтральные формулировки в духе siteConfig.description —
   пользователь отредактирует позже. */
const DO_ITEMS = [
  {
    title: "Продуктовые интерфейсы",
    text: "Проектирую сценарии и UI сложных продуктов: от структуры экранов до состояний и микровзаимодействий.",
  },
  {
    title: "Сайты и лендинги в коде",
    text: "Собираю страницы сразу в коде: типографика, ритм и адаптив ведут себя как задумано, а не как получилось.",
  },
  {
    title: "Прототипы и дизайн-системы",
    text: "Строю рабочие прототипы и системы компонентов, которые команда может развивать без дизайнера рядом.",
  },
] as const;

const APPROACH_STEPS = [
  {
    title: "Сценарии",
    text: "Начинаю с задач пользователя и пути к результату — интерфейс собирается вокруг сценария, а не наоборот.",
  },
  {
    title: "UI-система",
    text: "Довожу решение до системы: сетка, типографика, состояния и правила, по которым продукт растёт дальше.",
  },
  {
    title: "Рабочий код",
    text: "Финальная точка — не макет, а работающая страница: то, что вы видите на этом сайте, собрано этим процессом.",
  },
] as const;

export default function HomePage() {
  const telegramUrl = getTelegramUrl();
  const emailUrl = getEmailUrl();
  const contactUrl = telegramUrl ?? emailUrl;

  const socials = siteConfig.socials.filter((s) => s.url.trim().length > 0);
  const currently = siteConfig.currently.trim();
  const entries = listProjects();

  const sameAs = [
    telegramUrl,
    emailUrl,
    ...socials.map((s) => s.url),
  ].filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    jobTitle: siteConfig.role,
    description: siteConfig.description,
    url: siteConfig.url,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: siteConfig.locale,
  };

  const contactRel = telegramUrl
    ? "noopener noreferrer me"
    : emailUrl
      ? "me"
      : undefined;
  const contactTarget = telegramUrl ? "_blank" : undefined;

  return (
    <main id="main" tabIndex={-1} className={styles.page}>
      <JsonLd data={[personLd, websiteLd]} />

      <header className={styles.topbar} aria-label="Шапка сайта">
        <Link
          className={styles.brand}
          href="/"
          aria-label={`${siteConfig.name} — на главную`}
          aria-current="page"
        >
          <span className={styles.brandName}>Фурманов</span>
          <img src="/xlogo.svg" alt="" aria-hidden="true" className={styles.brandLogo} />
        </Link>

        <nav className={styles.navLinks} aria-label="Основная навигация">
          <Link href="/" aria-current="page">
            Главная
          </Link>
          <Link href="/projects">Проекты</Link>
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        {currently ? (
          <p className={styles.eyebrow} aria-label="Текущий статус">
            <span className={styles.eyebrowDot} aria-hidden="true" />
            {currently}
          </p>
        ) : null}

        <h1 id="hero-title" className={styles.title}>
          Проектирую интерфейсы и довожу их до{" "}
          <em className={styles.accent}>работающего кода</em>
        </h1>

        <p className={styles.subtitle}>
          С 2019 года занимаюсь продуктовым и UI дизайном. Прототипы собираю в коде, в связке
          с AI агентами.
        </p>

        <div className={styles.actions} aria-label="Основные действия">
          {/* Работы теперь живут на этой же странице — кнопка скроллит
              вниз к секции #works вместо перехода на /projects. */}
          <a className={styles.primaryAction} href="#works">
            Избранные работы
            <svg
              className={styles.actionIcon}
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 2.5V11.5M7 11.5L2.75 7.25M7 11.5L11.25 7.25"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          {/* Кнопка-контакт показывается всегда. Пока контакты в siteConfig
              пустые — ведёт на placeholder «#»; как только задан Telegram или
              email, href и rel/target подхватываются автоматически. */}
          <a
            className={styles.secondaryAction}
            href={contactUrl ?? "#contact"}
            rel={contactUrl ? contactRel : undefined}
            target={contactUrl ? contactTarget : undefined}
          >
            Связаться со мной
          </a>
        </div>
      </section>

      {/* ─── Избранные работы ─── */}
      <section id="works" className={styles.works} aria-labelledby="works-title">
        <header className={styles.sectionHead}>
          <p className={styles.sectionEyebrow}>Избранные работы</p>
          <h2 id="works-title" className={styles.sectionTitle}>
            Кейсы: от задачи до работающего интерфейса
          </h2>
        </header>

        <ol className={styles.worksList} aria-label="Список избранных работ">
          {entries.map((entry, idx) => {
            const issue = String(idx + 1).padStart(2, "0");
            return (
              <li key={entry.slug} className={styles.workItem}>
                <ProjectCard
                  slug={entry.slug}
                  title={entry.title}
                  year={entry.year}
                  index={issue}
                />

                <div className={styles.workMeta}>
                  <h3 className={styles.workTitle}>{entry.title}</h3>
                  <p className={styles.workSummary}>{entry.summary}</p>
                  <p className={styles.workFacts}>
                    {entry.role} · {entry.year}
                  </p>

                  {entry.tags.length > 0 ? (
                    <ul className={styles.workTags} aria-label="Теги проекта">
                      {entry.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  ) : null}

                  <Link
                    className={styles.workLink}
                    href={`/projects/${entry.slug}`}
                  >
                    Открыть кейс
                    <svg
                      className={styles.actionIcon}
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 11L11 3M11 3H4.5M11 3V9.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>

        <p className={styles.worksArchive}>
          <Link href="/projects">Все проекты →</Link>
        </p>
      </section>

      {/* ─── Что делаю ─── */}
      <section className={styles.block} aria-labelledby="do-title">
        <header className={styles.sectionHead}>
          <p className={styles.sectionEyebrow}>Что делаю</p>
          <h2 id="do-title" className={styles.sectionTitle}>
            Три формата работы
          </h2>
        </header>

        <ul className={styles.doGrid}>
          {DO_ITEMS.map((item) => (
            <li key={item.title} className={styles.doItem}>
              <h3 className={styles.itemTitle}>{item.title}</h3>
              <p className={styles.itemText}>{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ─── Подход ─── */}
      <section className={styles.block} aria-labelledby="approach-title">
        <header className={styles.sectionHead}>
          <p className={styles.sectionEyebrow}>Подход</p>
          <h2 id="approach-title" className={styles.sectionTitle}>
            От сценария до кода
          </h2>
        </header>

        <ol className={styles.approachList}>
          {APPROACH_STEPS.map((step, idx) => (
            <li key={step.title} className={styles.approachItem}>
              <span className={styles.approachIndex} aria-hidden="true">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className={styles.itemTitle}>{step.title}</h3>
                <p className={styles.itemText}>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── Контакты ─── */}
      <section id="contact" className={styles.contact} aria-labelledby="contact-title">
        <header className={styles.sectionHead}>
          <p className={styles.sectionEyebrow}>Контакты</p>
          <h2 id="contact-title" className={styles.sectionTitle}>
            Обсудим задачу?
          </h2>
        </header>

        <p className={styles.contactLede}>
          Открыт к продуктовым командам и проектам, где дизайн доводится до кода.
        </p>

        <div className={styles.contactActions}>
          <a
            className={styles.primaryAction}
            href={contactUrl ?? "#"}
            rel={contactRel}
            target={contactTarget}
          >
            Связаться со мной
          </a>

          {socials.map((s) => (
            <a
              key={s.url}
              className={styles.secondaryAction}
              href={s.url}
              rel="noopener noreferrer me"
              target="_blank"
            >
              {s.label}
            </a>
          ))}
        </div>
      </section>

      <footer className={styles.footer} aria-label="Подвал">
        <div className={styles.footerInner}>
          <span>© {new Date().getFullYear()} {siteConfig.name}</span>

          {socials.length > 0 ? (
            <ul className={styles.socials} aria-label="Профили в других сервисах">
              {socials.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    rel="noopener noreferrer me"
                    target="_blank"
                  >
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
