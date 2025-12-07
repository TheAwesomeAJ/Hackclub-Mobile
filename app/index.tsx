import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { Button, Text, View } from "react-native";

export default function Index() {
  const user = useQuery(api.auth.getCurrentUser);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
