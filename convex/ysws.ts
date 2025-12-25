import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { yswsTable } from "./schema";
import { YSWSesData } from "./types";
import { internal } from "./_generated/api";

export const fetchData = action({
  handler: async (ctx) => {
    const yswsesRequest = await fetch("https://ysws.hackclub.com/api.json");
    const yswsesData = (await yswsesRequest.json()) as YSWSesData;

    const yswses = [
      ...yswsesData.drafts.map((ysws) => ({
        category: "drafts",
        ...ysws,
      })),
      ...yswsesData.indefinite.map((ysws) => ({
        category: "indefinite",
        ...ysws,
      })),
      ...yswsesData.limitedTime.map((ysws) => ({
        category: "limitedTime",
        ...ysws,
      })),
      ...yswsesData.recentlyEnded.map((ysws) => ({
        category: "recentlyEnded",
        ...ysws,
      })),
    ];

    ctx.runMutation(internal.ysws.updateDb, { yswses: yswses });
  },
});

export const updateDb = internalMutation({
  args: {
    yswses: v.array(v.object(yswsTable)),
  },
  handler: async (ctx, args) => {
    args.yswses.forEach(async (ysws) => {
      const existing = await ctx.db
        .query("yswses")
        .withIndex("by_name", (q) => q.eq("name", ysws.name))
        .collect();
      if (existing.length > 0) {
        ctx.db.patch(existing[0]._id, ysws);
      } else {
        await ctx.db.insert("yswses", ysws);
      }
    });
  },
});
