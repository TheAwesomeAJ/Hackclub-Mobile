import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Text, View } from "react-native";

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
      </Unauthenticated>
      <Authenticated>
        <Text>Authenticated</Text>
      </Authenticated>
    </View>
  );
}
