import Link from "next/link";

import { getEmailUrl, getTelegramUrl, siteConfig } from "@/design-system/site";
import { JsonLd } from "@/lib/seo/jsonLd";
import styles from "@/features/home/home.module.css";

export default function HomePage() {
  const telegramUrl = getTelegramUrl();
  const emailUrl = getEmailUrl();
  const contactUrl = telegramUrl ?? emailUrl;

  const socials = siteConfig.socials.filter((s) => s.url.trim().length > 0);
  const currently = siteConfig.currently.trim();

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
          Фурманов
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
          <Link className={styles.primaryAction} href="/projects">
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
                d="M3 11L11 3M11 3H4.5M11 3V9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          {/* Кнопка-контакт показывается всегда. Пока контакты в siteConfig
              пустые — ведёт на placeholder «#»; как только задан Telegram или
              email, href и rel/target подхватываются автоматически. */}
          <a
            className={styles.secondaryAction}
            href={contactUrl ?? "#"}
            rel={telegramUrl ? "noopener noreferrer me" : emailUrl ? "me" : undefined}
            target={telegramUrl ? "_blank" : undefined}
          >
            Связаться со мной
          </a>
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
