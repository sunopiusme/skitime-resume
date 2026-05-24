import type { ReactElement } from "react";

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * Renders a JSON-LD structured data block.
 * Use only with serializable, trusted data — never user input.
 */
export function JsonLd({ data }: JsonLdProps): ReactElement {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify is safe here because data is constructed from typed config.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
