import Link from "next/link";

import { listProjects } from "@/content/projects/registry";
import { getEmailUrl, getTelegramUrl, siteConfig } from "@/design-system/site";
import { JsonLd } from "@/lib/seo/jsonLd";
import ProjectCard from "@/features/projects/list/ProjectCard";
import styles from "@/features/home/home.module.css";

const DO_ITEMS = [
  {
    title: "Продуктовые интерфейсы",
    text: "Разбираю сложный продукт до сценария: какая задача у пользователя, через какие состояния проходит экран, где решение ломается на практике. Интерфейс собирается вокруг этого, а не вокруг набора функций.",
  },
  {
    title: "Сайты и лендинги в коде",
    text: "Страница финализируется не в макете, а в коде. Типографика, ритм и адаптив проверяются в браузере. То, что видно, и есть результат.",
  },
  {
    title: "Прототипы и UI-системы",
    text: "Прототип отвечает на вопрос, работает ли решение, до того как оно попадёт в разработку. Систему компонентов отдаю в виде, который команда развивает без дизайнера рядом.",
  },
] as const;

const APPROACH_STEPS = [
  {
    title: "Сценарии",
    text: "Начинаю не с экрана, а с задачи пользователя и пути к результату. Пока сценарий не ясен, макет остаётся догадкой.",
  },
  {
    title: "UI-система",
    text: "Довожу решение до системы: сетка, типографика, состояния и правила, по которым продукт растёт без переработки с нуля.",
  },
  {
    title: "Рабочий код",
    text: "Финальная точка не картинка, а работающая страница, проверяемая в браузере. Этот сайт собран тем же процессом.",
  },
] as const;

export default function HomePage() {
  const telegramUrl = getTelegramUrl();
  const emailUrl = getEmailUrl();
  const contactUrl = telegramUrl ?? emailUrl;

  const socials = siteConfig.socials.filter((s) => s.url.trim().length > 0);
  const currently = siteConfig.currently.trim();
  /* Избранное — только первый проект (Composer), якорь списка. */
  const entries = listProjects().slice(0, 1);

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

      {/* Хром как в кейсе Composer: только лого, те же поля, тот же nav. */}
      <header className={styles.topbar} aria-label="Шапка сайта">
        <Link
          className={styles.brand}
          href="/"
          aria-label={`${siteConfig.name} — на главную`}
          aria-current="page"
        >
          <img src="/xlogo.svg" alt="" aria-hidden="true" className={styles.brandLogo} />
        </Link>

        <nav className={styles.navLinks} aria-label="Основная навигация">
          <Link href="/" aria-current="page">
            Главная
          </Link>
          <Link href="/projects">Проекты</Link>
        </nav>
      </header>

      {/* Hero — постер главной, без правок композиции. */}
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
          <a className={styles.primaryAction} href="#works">
            Избранные работы
          </a>
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

      {/* Ниже hero — один левый край на shell 1120.
          Заголовок и контент секции в одном стеке, без
          прыжка 640→1120 (из-за него h2 «висел» над сеткой). */}
      <article className={styles.article}>
        <section id="works" className={styles.part} aria-labelledby="works-title">
          {/* Заголовок и ссылка-архив на одной линии:
              title слева, «Смотреть все проекты» справа. */}
          <div className={styles.worksHead}>
            <h2 id="works-title" className={styles.sectionTitle}>
              Избранные работы
            </h2>

            <p className={styles.worksArchive}>
              <Link href="/projects">Смотреть все проекты →</Link>
            </p>
          </div>

          {/* Полка как в App Store / Launchpad: одна линия,
              только обложки, без описаний. */}
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
                </li>
              );
            })}
          </ol>
        </section>

        <section className={styles.part} aria-labelledby="do-title">
          <h2 id="do-title" className={styles.sectionTitle}>
            Что делаю
          </h2>

          <ul className={styles.doGrid}>
            {DO_ITEMS.map((item) => (
              <li key={item.title} className={styles.doItem}>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemText}>{item.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.part} aria-labelledby="approach-title">
          <h2 id="approach-title" className={styles.sectionTitle}>
            Подход
          </h2>

          <ol className={styles.approachList}>
            {APPROACH_STEPS.map((step, idx) => (
              <li key={step.title} className={styles.approachItem}>
                <span className={styles.approachIndex} aria-hidden="true">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className={styles.approachBody}>
                  <h3 className={styles.itemTitle}>{step.title}</h3>
                  <p className={styles.itemText}>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="contact" className={styles.part} aria-labelledby="contact-title">
          <h2 id="contact-title" className={styles.sectionTitle}>
            Обсудим задачу?
          </h2>
          <p className={styles.contactLede}>
            Открыт к продуктовым командам и проектам, где дизайн не останавливается на макете, а доводится до работающего кода.
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
      </article>

      <footer className={styles.sitefooter} aria-label="Подвал">
        <p className={styles.footerNote}>
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </footer>
    </main>
  );
}
