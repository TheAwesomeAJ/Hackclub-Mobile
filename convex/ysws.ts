import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { yswsTable } from "./schema";

export const fetch = action({
  handler: async (ctx) => {},
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
