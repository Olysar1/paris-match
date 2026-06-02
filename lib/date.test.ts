import { describe, expect, it } from "vitest";

import { formatDate, toISODate } from "@/lib/date";

describe("toISODate", () => {
  it("converts an RFC-822 date to a UTC ISO string", () => {
    expect(toISODate("Tue, 02 Jun 2026 01:27:39 +0200")).toBe(
      "2026-06-01T23:27:39.000Z",
    );
  });

  it("throws on an unparseable date", () => {
    expect(() => toISODate("pas une date")).toThrow();
  });
});

describe("formatDate", () => {
  it("formats an ISO date using the long French style", () => {
    const result = formatDate("2026-06-02T12:00:00.000Z");
    expect(result).toContain("juin");
    expect(result).toContain("2026");
  });
});
