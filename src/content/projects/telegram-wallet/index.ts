import type { ProjectEntry } from "../registry";

import { telegramWalletMetadata } from "./metadata";
import TelegramWalletCase from "./case";

export const telegramWalletEntry: ProjectEntry = {
  slug: telegramWalletMetadata.slug,
  title: telegramWalletMetadata.title,
  summary: telegramWalletMetadata.summary,
  year: telegramWalletMetadata.year,
  role: telegramWalletMetadata.role,
  tags: telegramWalletMetadata.tags,
  metadata: telegramWalletMetadata.metadata,
  render: TelegramWalletCase,
};
