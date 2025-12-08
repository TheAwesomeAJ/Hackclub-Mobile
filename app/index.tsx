import { Colors } from "@/constants/colors";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { router } from "expo-router";

import { Button, Text, useColorScheme, View } from "react-native";
;


export default function Index() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || "dark"];

  const user = useQuery(api.auth.getCurrentUser);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: themeColors.background,
      }}
    >
      <AuthLoading>
        <Text>loading...</Text>
      </AuthLoading>
      <Unauthenticated>
        <Text>Unauthenticated</Text>
        <Button
          title="Login"
          onPress={() => {
            authClient.signIn.oauth2({
              providerId: "hackclub",
              callbackURL: "/",
            });
          }}
        />
        <View style={{ marginTop: 20 }}>
          <Button
            title="View Hackatime UI (Dev Bypass)"
            onPress={() => router.push("/features/hackatime")}
            color="orange"
          />
        </View>
      </Unauthenticated>
      <Authenticated>
        <Text>Authenticated</Text>
        {user && (
          <Text>
            {user.name} ({user.email} - {user.slackId})
          </Text>
        )}

        <Button title="Logout" onPress={() => authClient.signOut()} />
        <View style={{ marginTop: 20 }}>
          <Button
            title="Go to Hackatime"
            onPress={() => router.push("/features/hackatime")}
          />
        </View>
      </Authenticated>
    </View>
  );
}
