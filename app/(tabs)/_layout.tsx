import { HapticTab } from "@/components/tabs/HapticTab";
import { Colors } from "@/constants/colors";
import { Tabs } from "expo-router";
import {
  CalendarDays,
  Clock,
  Home,
  LayoutGrid,
  List,
} from "lucide-react-native";
import { useColorScheme } from "react-native";

/**
 * Render the app's bottom tab navigator configured for the Expo Router.
 *
 * Provides a themed Tabs container with custom tab styling, haptic tab buttons,
 * and the app's primary tab screens (Home, Hackatime, Events, YSWS, Toolbox placeholder, More).
 *
 * @returns The configured Tabs navigator element with themed styles and screen entries.
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || "dark"];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.background,
          borderTopWidth: 0,
          position: "absolute",
        },
        sceneStyle: {
          backgroundColor: themeColors.background,
        },
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.ring,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="hackatime"
        options={{
          title: "Hackatime",
          tabBarIcon: ({ color }) => <Clock color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color }) => <CalendarDays color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="ysws_catlog"
        options={{
          title: "YSWS",
          tabBarIcon: ({ color }) => <LayoutGrid color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="toolbox"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color }) => <List color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}