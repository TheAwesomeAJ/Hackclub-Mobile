import { Colors } from "@/constants/colors";
import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import { CalendarDays, Clock, Home, List } from "lucide-react-native";
import { Text, useColorScheme } from "react-native";

export default function Layout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || "dark"];

  const tabs: {
    name: string;
    href: React.ComponentProps<typeof TabTrigger>["href"];
    label: string;
    icon: React.ComponentType<any>;
  }[] = [
    {
      name: "home",
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      name: "hackatime",
      href: "/hackatime",
      label: "Hackatime",
      icon: Clock,
    },
    {
      name: "events",
      href: "/events",
      label: "Events",
      icon: CalendarDays,
    },
    {
      name: "more",
      href: "/more",
      label: "More",
      icon: List,
    },
  ];

  return (
    <Tabs>
      <TabSlot />
      <TabList style={{ backgroundColor: themeColors.background }}>
        {tabs.map((tab) => (
          <TabTrigger
            style={{
              padding: 10,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
            key={tab.name}
            name={tab.name}
            href={tab.href}
          >
            <tab.icon size={24} color={themeColors.foreground} />
            <Text style={{ color: themeColors.foreground }}>{tab.label}</Text>
          </TabTrigger>
        ))}
      </TabList>
    </Tabs>
  );
}
