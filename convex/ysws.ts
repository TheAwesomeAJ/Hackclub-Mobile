import { v } from "convex/values";
import { action, internalMutation, query } from "./_generated/server";
import { yswsTable } from "./schema";
import { YSWSesData } from "./types";
import { internal } from "./_generated/api";

export const fetchData = action({
  handler: async (ctx) => {
    const yswsesRequest = await fetch("https://ysws.hackclub.com/api.json");
    const yswsesData = (await yswsesRequest.json()) as YSWSesData;

    const yswses = [
      ...yswsesData.drafts.map((ysws) => ({
        category: "drafts" as const,
        ...ysws,
      })),
      ...yswsesData.indefinite.map((ysws) => ({
        category: "indefinite" as const,
        ...ysws,
      })),
      ...yswsesData.limitedTime.map((ysws) => ({
        category: "limitedTime" as const,
        ...ysws,
      })),
      ...yswsesData.recentlyEnded.map((ysws) => ({
        category: "recentlyEnded" as const,
        ...ysws,
      })),
    ];

    await ctx.runMutation(internal.ysws.updateDb, { yswses: yswses });
  },
});

export const updateDb = internalMutation({
  args: {
    yswses: v.array(v.object(yswsTable)),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const ysws of args.yswses) {
      const existing = await ctx.db
        .query("yswses")
        .withIndex("by_name", (q) => q.eq("name", ysws.name))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, ysws);
      } else {
        await ctx.db.insert("yswses", ysws);
      }
    }
  },
});

export const get = query({
  handler: async (ctx) => {
    const yswses = await ctx.db.query("yswses").collect();
    return yswses;
  },
});
