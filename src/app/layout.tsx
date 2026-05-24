import type { Metadata } from "next";
import localFont from "next/font/local";

import { siteConfig } from "@/design-system/site";

import "./globals.css";
import skipLinkStyles from "./skip-link.module.css";

const inter = localFont({
  src: [
    {
      path: "../../public/fonts/InterVariable.woff2",
      style: "normal",
      weight: "100 900",
    },
    {
      path: "../../public/fonts/InterVariable-Italic.woff2",
      style: "italic",
      weight: "100 900",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = localFont({
  src: [
    {
      path: "../../public/fonts/InstrumentSerif-Regular.ttf",
      style: "normal",
      weight: "400",
    },
    {
      path: "../../public/fonts/InstrumentSerif-Italic.ttf",
      style: "italic",
      weight: "400",
    },
  ],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.role}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.role}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.role}`,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${instrumentSerif.variable}`}
    >
      <body>
        <a className={skipLinkStyles.skipLink} href="#main">
          Перейти к содержимому
        </a>
        {children}
      </body>
    </html>
  );
}
