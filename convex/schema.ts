import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tables = {
  yswses: defineTable({
    category: v.union(
      v.literal("limitedTime"),
      v.literal("recentlyEnded"),
      v.literal("indefinite"),
      v.literal("drafts"),
    ),
    name: v.string(),
    description: v.string(),
    website: v.optional(v.string()),
    slack: v.optional(v.string()),
    slackChannel: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("draft"),
      v.literal("ended"),
    ),
    detailedDescription: v.optional(v.string()),
    deadline: v.optional(v.string()),
    ended: v.optional(v.string()),
    participants: v.optional(v.number()),
    steps: v.optional(v.array(v.string())),
    details: v.optional(v.array(v.string())),
    requirements: v.optional(v.union(v.array(v.string()), v.string())),
  }),
};
