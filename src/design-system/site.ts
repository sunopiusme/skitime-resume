export const siteConfig = {
  name: "Данила Фурманов",
  shortName: "ДФ",
  role: "Продуктовый / UI-дизайнер",
  description:
    "Продуктовый и UI-дизайн с AI-native процессом. Проектирую интерфейсы, прототипы и продуктовые системы в духе SwiftUI с 2019 года.",
  url: "https://skitime-resume.vercel.app",
  locale: "ru-RU",
  /**
   * Внешние контакты. Опциональны: ссылка на главной появляется
   * только если значение задано. Пустые значения исключают мёртвые CTA.
   */
  contacts: {
    telegram: "" as const,
    email: "" as const,
  },
} as const;

export function getTelegramUrl(): string | null {
  const handle = siteConfig.contacts.telegram.trim();
  if (!handle) return null;
  if (handle.startsWith("http")) return handle;
  const normalized = handle.replace(/^@/, "");
  return `https://t.me/${normalized}`;
}

export function getEmailUrl(): string | null {
  const email = siteConfig.contacts.email.trim();
  if (!email) return null;
  return `mailto:${email}`;
}
