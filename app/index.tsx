import { Colors } from "@/constants/colors";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { Button, useColorScheme, View } from "react-native";
import Text from "@/components/Text";

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
      </Unauthenticated>
      <Authenticated>
        <Text>Authenticated</Text>
        {user && (
          <Text>
            {user.name} ({user.email} - {user.slackId})
          </Text>
        )}

        <Button title="Logout" onPress={() => authClient.signOut()} />
      </Authenticated>
    </View>
  );
}
