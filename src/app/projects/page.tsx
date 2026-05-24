import type { Metadata } from "next";

import { siteConfig } from "@/design-system/site";
import ProjectsList from "@/features/projects/list/ProjectsList";
import { JsonLd } from "@/lib/seo/jsonLd";

const title = "Проекты";
const description =
  "Портфолио Данилы Фурманова. Кейсы с полным путём от продуктового мышления до кода.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title,
    description,
    url: "/projects",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function ProjectsPage() {
  const base = siteConfig.url.replace(/\/$/, "");
  const breadcrumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Главная",
        item: `${base}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Проекты",
        item: `${base}/projects`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbsLd} />
      <ProjectsList />
    </>
  );
}
