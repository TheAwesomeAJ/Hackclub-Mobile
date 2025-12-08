import { Colors } from "@/constants/colors";
import { Text as RnText, useColorScheme } from "react-native";

export default function Text(props: React.ComponentProps<typeof RnText>) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || "dark"];

  return (
    <RnText style={[{ color: themeColors.foreground }, props.style]}>
      {props.children}
    </RnText>
  );
}
