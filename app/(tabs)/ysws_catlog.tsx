import { api } from "@/convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const RSS_FEED_URL = "https://ysws.hackclub.com/feed.xml";

/**
 * Renders the YSWS Catalog screen that displays RSS feed items.
 *
 * Fetches the feed from a fixed RSS URL on mount, shows a loading state while fetching,
 * displays an error with a retry option if loading fails, and supports pull-to-refresh.
 * Tapping an item opens its link in the system browser.
 *
 * @returns The rendered React element for the catalog screen.
 */
export default function YSWSCatalog() {
  const items = useQuery(api.ysws.get);
  const reload = useAction(api.ysws.fetchData);

  const [refreshing, setRefreshing] = useState(false);

  const openLink = (url?: string) => {
    if (url) Linking.openURL(url);
  };

  useEffect(() => {
    reload();
  }, [reload]);

  if (items === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ec3750" />
        <Text style={{ marginTop: 8 }}>Loading feed…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>YSWS Catalog</Text>
      <FlatList
        data={items}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await reload();
              setRefreshing(false);
            }}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              if (item.website) {
                openLink(item.website);
              }
            }}
          >
            <Text style={styles.title}>{item.name}</Text>
            {item.deadline && (
              <Text style={styles.date}>
                {item.status === "active" &&
                  "Ends on " + new Date(item.deadline).toDateString()}
                {item.status === "ended" &&
                  "Ended on " + new Date(item.deadline).toDateString()}
              </Text>
            )}
            {item.status === "draft" && <Text style={styles.date}>Draft</Text>}
            <Text style={styles.snippet} numberOfLines={3}>
              {item.description.length > 0
                ? item.description
                : item.detailedDescription}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No items available.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", paddingTop: 50 },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ec3750",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 4 },
  date: { fontSize: 12, color: "#888", marginBottom: 8 },
  snippet: { fontSize: 14, color: "#555", lineHeight: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  retry: {
    backgroundColor: "#ec3750",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
