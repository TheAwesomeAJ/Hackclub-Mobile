import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "convex/react";
import { router } from "expo-router";

import Header from "@/components/Header";
import Text from "@/components/Text";
import { Button, View } from "react-native";
export default function Index() {

  const user = useQuery(api.auth.getCurrentUser);
  const session = authClient.useSession();

  return (
    <>
      <Header />
      <View
        style={{
          flex: 1,
          justifyContent: "flex-start",
          alignItems: "center",
          backgroundColor: "transparent",
        }}
      >
        <View style={{ width: "100%", padding: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Button title="Hackatime" onPress={() => router.push("/hackatime")} />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Button title="Events" onPress={() => router.push("/events")} />
            </View>
          </View>

          <View style={{ height: 12 }} />

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Button title="Toolbox" onPress={() => router.push("/toolbox")} />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Button title="More" onPress={() => router.push("/more")} />
            </View>
          </View>
        </View>
        {session.isPending && (
          <Text>loading...</Text>
        )}

        {!session.isPending && !session.data?.user && (
          <>
            <Text>Unauthenticated</Text>
            <Button
              title="Login"
              onPress={() => {
                authClient.signIn.social({
                  provider: "hackclub",
                });
              }}
            />
          </>
        )}

        {!session.isPending && session.data?.user && (
          <>
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
                onPress={() => router.push("/hackatime")}
              />
            </View>
          </>
        )}
      </View>
    </>
  );
}
