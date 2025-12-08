import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import { Text } from "react-native";

export default function Layout() {
  return (
    <Tabs>
      <TabSlot />
      <TabList>
        <TabTrigger name="home" href="/">
          <Text>Home</Text>
        </TabTrigger>
        <TabTrigger name="hackatime" href="/hackatime">
          <Text>Hackatime</Text>
        </TabTrigger>
        <TabTrigger name="events" href="/events">
          <Text>Events</Text>
        </TabTrigger>
        <TabTrigger name="more" href="/more">
          <Text>More</Text>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}
