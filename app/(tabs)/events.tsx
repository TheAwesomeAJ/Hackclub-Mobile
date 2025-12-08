import Text from "@/components/Text";
import { Colors } from "@/constants/colors";
import { useColorScheme, View } from "react-native";

export default function Hackatime() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || "dark"];

  return (
    <View
      style={{
        backgroundColor: themeColors.background,
      }}
    >
      <Text>Events</Text>
    </View>
  );
}
