"use node";
import { v } from "convex/values";
import Parser from "rss-parser";
import { action } from "./_generated/server";

const parser = new Parser();

export const fetchRSS = action({
  args: { url: v.string() },
  returns: v.array(
    v.object({
      title: v.optional(v.string()),
      link: v.optional(v.string()),
      content: v.optional(v.string()),
      pubDate: v.optional(v.string()),
    })
  ),
  handler: async (_ctx, { url }) => {
    const feed = await parser.parseURL(url);
    return feed.items.map((item) => ({
      title: item.title,
      link: item.link,
      content: item.contentSnippet || item.content,
      pubDate: item.pubDate,
    }));
  },
});