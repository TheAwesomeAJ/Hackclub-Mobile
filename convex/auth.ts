import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { genericOAuth } from "better-auth/plugins";
import authSchema from "./betterAuth/schema";

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: {
      schema: authSchema,
    },
  },
);

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false },
) => {
  return betterAuth({
    // disable logging when createAuth is called just to generate options.
    // this is not required, but there's a lot of noise in logs without it.
    logger: {
      disabled: optionsOnly,
    },
    // It doesnt work unless there is a blank string for some reason future me problem
    trustedOrigins: ["hackclubmobile://", "exp://*/*", ""],
    database: authComponent.adapter(ctx),
    // Configure simple, non-verified email/password to get started
    emailAndPassword: {
      enabled: false,
    },
    plugins: [
      // The Expo and Convex plugins are required
      expo(),
      convex(),
      genericOAuth({
        config: [
          {
            providerId: "hackclub",
            clientId: process.env.HACKCLUB_CLIENT_ID!,
            clientSecret: process.env.HACKCLUB_CLIENT_SECRET!,
            discoveryUrl:
              "https://auth.hackclub.com/.well-known/openid-configuration",
            scopes: ["openid", "profile", "email", "name", "slack_id"],
            mapProfileToUser: async (profile) => {
              return {
                name: profile.name,
                email: profile.email,
                emailVerified: profile.email_verified,
                id: profile.sub,
                slackId: profile.slack_id,
              };
            },
          },
        ],
      }),
    ],
    user: {
      additionalFields: {
        slackId: {
          type: "string",
          required: false,
          defaultValue: null,
          input: false,
        },
      },
    },
  });
};

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.safeGetAuthUser(ctx);
  },
});
