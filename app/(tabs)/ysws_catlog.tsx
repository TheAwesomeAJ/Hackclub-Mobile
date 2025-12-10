import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";
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

export default function YSWSCatalog() {
  const fetchFeed = useAction(api.ysws.fetchRSS);
  const [items, setItems] = useState<Array<{
    title?: string;
    link?: string;
    content?: string;
    pubDate?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      const data = await fetchFeed({ url: RSS_FEED_URL });
      if (!data) throw new Error("No data returned from feed");
      setItems(data);
    } catch (e) {
      console.error(e);
      setError("Failed to load feed. Pull to retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openLink = (url?: string) => {
    if (url) Linking.openURL(url);
  };

  if (loading) {
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
      {error ? (
        <View style={styles.center}>
          <Text style={{ color: "#ec3750", marginBottom: 8 }}>{error}</Text>
          <TouchableOpacity
            onPress={() => {
              setLoading(true);
              load();
            }}
            style={styles.retry}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <FlatList
        data={items}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openLink(item.link)}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>
              {item.pubDate ? new Date(item.pubDate).toDateString() : ""}
            </Text>
            <Text style={styles.snippet} numberOfLines={3}>
              {item.content}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading && !error ? (
            <View style={styles.center}>
              <Text>No feed items available.</Text>
            </View>
          ) : null
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