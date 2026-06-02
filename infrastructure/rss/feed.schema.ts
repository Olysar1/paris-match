import { z } from "zod";

const TextNode = z.union([
  z.string(),
  z.number().transform(String),
  z
    .object({ "#text": z.union([z.string(), z.number()]) })
    .transform((node) => String(node["#text"])),
]);

const MediaContentSchema = z.object({
  "@_url": z.string(),
  "@_width": z.coerce.number().optional(),
  "@_height": z.coerce.number().optional(),
  "media:description": TextNode.optional(),
  "media:credit": TextNode.optional(),
});

export const RawItemSchema = z.object({
  title: TextNode,
  link: z.string(),
  description: TextNode.optional().default(""),
  pubDate: z.string(),
  "media:content": z
    .union([MediaContentSchema, z.array(MediaContentSchema)])
    .transform((media) => (Array.isArray(media) ? media[0] : media))
    .optional(),
});

export type RawItem = z.infer<typeof RawItemSchema>;

export const RawFeedSchema = z.object({
  rss: z.object({
    channel: z.object({
      item: z
        .unknown()
        .transform((item) => (Array.isArray(item) ? item : [item]) as unknown[]),
    }),
  }),
});
