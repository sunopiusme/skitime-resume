import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProject, isProjectSlug, listProjects, type ProjectSlug } from "@/content/projects/registry";
import { siteConfig } from "@/design-system/site";
import { JsonLd } from "@/lib/seo/jsonLd";

type Params = { slug: string };

export function generateStaticParams(): { slug: ProjectSlug }[] {
  return listProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isProjectSlug(slug)) {
    return { title: "Проект не найден" };
  }
  const project = getProject(slug);
  return {
    title: project.title,
    description: project.metadata.description,
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
    openGraph: {
      title: project.title,
      description: project.metadata.description,
      url: `/projects/${project.slug}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.metadata.description,
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (!isProjectSlug(slug)) {
    notFound();
  }
  const project = getProject(slug);
  const Case = project.render;
  const base = siteConfig.url.replace(/\/$/, "");
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: project.title,
    description: project.metadata.description,
    inLanguage: siteConfig.locale,
    url: `${base}/projects/${project.slug}`,
    author: {
      "@type": "Person",
      name: siteConfig.name,
      url: base,
    },
    keywords: project.tags.join(", "),
  };
  return (
    <>
      <JsonLd data={articleLd} />
      <Case />
    </>
  );
}
