import { Stack } from "expo-router";
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/colors";
const convex = new ConvexReactClient(
  process.env.EXPO_PUBLIC_CONVEX_URL as string,
  {
    // Optionally pause queries until the user is authenticated
    expectAuth: true,
    unsavedChangesWarning: false,
  },
);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || "dark"];

  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: themeColors.background },
          }}
        />
      </SafeAreaProvider>
    </ConvexBetterAuthProvider>
  );
}
