import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_CONVEX_SITE_URL,
  plugins: (() => {
    const p: any[] = [];

    // Lazy-require plugins to avoid running their module init code at import-time
    try {
      // @better-auth/expo may not be available in non-expo environments
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require("@better-auth/expo/client");
      const expoClient = mod?.expoClient ?? mod?.default ?? null;
      if (expoClient) {
        const e = expoClient({
          scheme: Constants.expoConfig?.scheme as string,
          storagePrefix: Constants.expoConfig?.scheme as string,
          storage: SecureStore,
        });
        if (e) p.push(e);
      }
    } catch (err) {
      // ignore
    }

    // Note: we intentionally do NOT load the Convex better-auth client plugin here.
    // Requiring `@convex-dev/better-auth` can pull in node-specific code that
    // breaks Metro bundling. If you need Convex integration, add it later with
    // explicit configuration in a web-only entrypoint.

    return p;
  })(),
});
