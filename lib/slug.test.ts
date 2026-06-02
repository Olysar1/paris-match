import { describe, expect, it } from "vitest";

import { deriveSlug } from "@/lib/slug";

describe("deriveSlug", () => {
  it("builds a slug from the article text and numeric id", () => {
    const link =
      "https://www.lemonde.fr/international/article/2026/06/02/les-primaires-en-californie-un-test_6696062_3210.html";
    expect(deriveSlug(link)).toBe("les-primaires-en-californie-un-test-6696062");
  });

  it("handles live-blog URLs the same way", () => {
    const link =
      "https://www.lemonde.fr/international/live/2026/06/02/en-direct-guerre_6694380_3210.html";
    expect(deriveSlug(link)).toBe("en-direct-guerre-6694380");
  });

  it("falls back to the last path segment when there is no id pattern", () => {
    expect(deriveSlug("https://www.lemonde.fr/international/page-statique")).toBe(
      "page-statique",
    );
  });
});
