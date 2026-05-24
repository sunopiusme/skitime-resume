import type { ComponentType } from "react";

import { composerEntry } from "./composer";

export type ProjectSlug = "composer";

export type ProjectEntry = {
  slug: ProjectSlug;
  title: string;
  summary: string;
  year: string;
  role: string;
  tags: readonly string[];
  metadata: {
    description: string;
  };
  render: ComponentType;
};

export const projects: Record<ProjectSlug, ProjectEntry> = {
  composer: composerEntry,
};

const ALL_SLUGS: readonly ProjectSlug[] = ["composer"];

export function isProjectSlug(value: string): value is ProjectSlug {
  return (ALL_SLUGS as readonly string[]).includes(value);
}

export function getProject(slug: ProjectSlug): ProjectEntry {
  return projects[slug];
}

export function listProjects(): ProjectEntry[] {
  return ALL_SLUGS.map((slug) => projects[slug]);
}
