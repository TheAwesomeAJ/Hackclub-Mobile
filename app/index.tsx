import { authClient } from "@/lib/auth-client";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Button, Text, View } from "react-native";

export default function Index() {
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
        <Button title="Logout" onPress={() => authClient.signOut()} />
      </Authenticated>
    </View>
  );
}
