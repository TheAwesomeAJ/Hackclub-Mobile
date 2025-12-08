import { Colors } from "@/constants/colors";
import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import { Text, useColorScheme } from "react-native";

export default function Layout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || "dark"];

  const tabs: {
    name: string;
    href: React.ComponentProps<typeof TabTrigger>["href"];
    label: string;
  }[] = [
    {
      name: "home",
      href: "/",
      label: "Home",
    },
    {
      name: "hackatime",
      href: "/hackatime",
      label: "Hackatime",
    },
    {
      name: "events",
      href: "/events",
      label: "Events",
    },
    {
      name: "more",
      href: "/more",
      label: "More",
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
            <Text style={{ color: themeColors.foreground }}>{tab.label}</Text>
          </TabTrigger>
        ))}
      </TabList>
    </Tabs>
  );
}
