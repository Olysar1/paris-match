import { describe, expect, it } from "vitest";

import { mapItemToArticle } from "@/infrastructure/rss/feed.mapper";

const rawItem = {
  title: "Les primaires en Californie",
  pubDate: "Tue, 02 Jun 2026 01:27:39 +0200",
  description: "A la veille du vote.",
  guid: {
    "#text": "https://www.lemonde.fr/international/article/2026/06/02/x_6696062_3210.html",
    "@_isPermaLink": "true",
  },
  link: "https://www.lemonde.fr/international/article/2026/06/02/les-primaires-en-californie_6696062_3210.html",
  "media:content": {
    "media:description": { "#text": "Près d’un bureau de vote.", "@_type": "plain" },
    "media:credit": { "#text": "MARIO TAMA/GETTY IMAGES via AFP", "@_scheme": "urn:ebu" },
    "@_width": "644",
    "@_height": "322",
    "@_url": "https://img.lemde.fr/2026/06/01/photo.jpg",
  },
};

describe("mapItemToArticle", () => {
  it("maps a raw RSS item to a normalized domain Article", () => {
    const article = mapItemToArticle(rawItem);

    expect(article).not.toBeNull();
    expect(article?.slug).toBe("les-primaires-en-californie-6696062");
    expect(article?.title).toBe("Les primaires en Californie");
    expect(article?.publishedAt).toBe("2026-06-01T23:27:39.000Z");
    expect(article?.category).toEqual({
      slug: "international",
      name: "International",
    });
    expect(article?.image).toEqual({
      url: "https://img.lemde.fr/2026/06/01/photo.jpg",
      width: 644,
      height: 322,
      alt: "Près d’un bureau de vote.",
      caption: "Près d’un bureau de vote.",
      credit: "MARIO TAMA/GETTY IMAGES via AFP",
    });
  });

  it("returns null for malformed items", () => {
    expect(mapItemToArticle({})).toBeNull();
    expect(mapItemToArticle({ title: "Sans lien" })).toBeNull();
  });

  it("tolerates a missing image", () => {
    const withoutImage = {
      title: rawItem.title,
      link: rawItem.link,
      pubDate: rawItem.pubDate,
      description: rawItem.description,
    };
    const article = mapItemToArticle(withoutImage);

    expect(article).not.toBeNull();
    expect(article?.image).toBeNull();
  });
});
