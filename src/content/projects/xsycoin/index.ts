import type { ProjectEntry } from "../registry";

import { xsycoinMetadata } from "./metadata";
import XsycoinCase from "./case";

export const xsycoinEntry: ProjectEntry = {
  slug: xsycoinMetadata.slug,
  title: xsycoinMetadata.title,
  summary: xsycoinMetadata.summary,
  year: xsycoinMetadata.year,
  role: xsycoinMetadata.role,
  tags: xsycoinMetadata.tags,
  metadata: xsycoinMetadata.metadata,
  render: XsycoinCase,
};
