import type { ReactElement } from "react";
import type { JsonLd as JsonLdData } from "@/lib/seo";

export function JsonLd({ data }: { data: JsonLdData }): ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
