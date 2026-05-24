import type { ProjectEntry } from "../registry";

import { composerMetadata } from "./metadata";
import ComposerCase from "./case";

export const composerEntry: ProjectEntry = {
  slug: composerMetadata.slug,
  title: composerMetadata.title,
  summary: composerMetadata.summary,
  year: composerMetadata.year,
  role: composerMetadata.role,
  tags: composerMetadata.tags,
  metadata: composerMetadata.metadata,
  render: ComposerCase,
};
