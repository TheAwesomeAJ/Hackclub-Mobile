import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Defs,
  Rect,
  Stop,
  LinearGradient as SvgLinearGradient,
  Text as SvgText,
} from "react-native-svg";

const screenWidth = Dimensions.get("window").width;

interface BarChartData {
  label: string;
  value: number;
  subLabel?: string; // optional smaller second line
}

interface BarChartProps {
  data: BarChartData[];
  width: number;
  height: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, width, height }) => {
  const padding = { top: 20, bottom: 48, left: 40, right: 20 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  if (!data || data.length === 0) {
    return (
      <View
        style={{
          width,
          height,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#666" }}>No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = chartWidth / data.length;
  const barGap = barWidth * 0.3;
  const actualBarWidth = barWidth - barGap;

  return (
    <View
      style={{
        backgroundColor: "#2a2139",
        borderRadius: 16,
        padding: 10,
        marginTop: 16,
      }}
    >
      <Svg width={width} height={height}>
        <Defs>
          <SvgLinearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#ff9cc5" stopOpacity="1" />
            <Stop offset="100%" stopColor="#ff6b9d" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>

        {data.map((item, index) => {
          const barHeight =
            maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;
          const x = padding.left + index * barWidth + barGap / 2;
          const y = padding.top + (chartHeight - barHeight);

          return (
            <React.Fragment key={index}>
              <Rect
                x={x}
                y={y}
                width={actualBarWidth}
                height={barHeight}
                fill="url(#barGradient)"
                rx={6}
                ry={6}
              />
              <SvgText
                x={x + actualBarWidth / 2}
                y={padding.top + chartHeight + 12}
                fontSize="12"
                fill="#FFF"
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
              {item.subLabel ? (
                <SvgText
                  x={x + actualBarWidth / 2}
                  y={padding.top + chartHeight + 24}
                  fontSize="9"
                  fill="#BBB"
                  textAnchor="middle"
                >
                  {item.subLabel}
                </SvgText>
              ) : null}
            </React.Fragment>
          );
        })}

        <SvgText x={10} y={padding.top} fontSize="10" fill="#888">
          {maxValue.toFixed(1)}h
        </SvgText>
        <SvgText
          x={10}
          y={height - padding.bottom - 10}
          fontSize="10"
          fill="#888"
        >
          0h
        </SvgText>
      </Svg>
    </View>
  );
};

interface Language {
  name: string;
  total_seconds: number;
  text: string;
  hours: number;
  minutes: number;
  percent: number;
  digital: string;
}

interface StatsData {
  username: string;
  user_id: string;
  is_coding_activity_visible: boolean;
  is_other_usage_visible: boolean;
  status: string;
  start: string;
  end: string;
  range: string;
  human_readable_range: string;
  total_seconds: number;
  daily_average: number;
  human_readable_total: string;
  human_readable_daily_average: string;
  languages: Language[];
}

interface ApiResponse {
  data: StatsData;
  trust_factor: {
    trust_level: string;
    trust_value: number;
  };
}

interface WeeklyData {
  date: string;
  hours: number;
}

interface MonthlyData {
  weekStart: string;
  weekEnd: string;
  hours: number;
  weekLabel: string;
}

interface ThreeMonthData {
  monthStart: string;
  monthEnd: string;
  hours: number;
  monthLabel: string;
}

export default function Index() {
  const [slackId, setSlackId] = useState("");
  const [storedSlackId, setStoredSlackId] = useState<string | null>(null);
  const [inputVisible, setInputVisible] = useState(false);
  const [allTimeStats, setAllTimeStats] = useState<StatsData | null>(null);
  const [todayStats, setTodayStats] = useState<StatsData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [threeMonthData, setThreeMonthData] = useState<ThreeMonthData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const session = authClient.useSession();
  const userInfo = useQuery(api.auth.getCurrentUser);

  // Convert a local calendar day to a full UTC ISO timestamp at local midnight.
  const toUtcIsoMidnight = (date: Date) =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
      0,
    ).toISOString();

  const loadCachedData = async () => {
    try {
      const cachedStats = await AsyncStorage.getItem("cachedStats");
      if (cachedStats) {
        const parsed = JSON.parse(cachedStats);
        setAllTimeStats(parsed.allTimeStats);
        setTodayStats(parsed.todayStats);
        setWeeklyData(parsed.weeklyData || []);
        setMonthlyData(parsed.monthlyData || []);
        setThreeMonthData(parsed.threeMonthData || []);
      }
    } catch (err) {
      console.error("Error loading cached data:", err);
    }
  };

  // Load cached data on mount
  useEffect(() => {
    if (userInfo?.slackId) {
      setStoredSlackId(userInfo.slackId);
      loadCachedData().then(() => {
        // Fetch fresh data in background
        fetchStats(userInfo.slackId!);
      });
    } else {
      setInputVisible(true);
    }
  }, [userInfo?.slackId]);

  const fetchWeeklyStats = async (id: string) => {
    const weeklyData: WeeklyData[] = [];
    const today = new Date();

    // Fetch 14 days of data (this week + last week)
    for (let i = 13; i >= 0; i--) {
      // Local date for display
      const displayDate = new Date(today);
      displayDate.setDate(today.getDate() - i);

      // Convert local day to UTC ISO midnights for API
      const startDate = toUtcIsoMidnight(displayDate);

      const nextDay = new Date(displayDate);
      nextDay.setDate(displayDate.getDate() + 1);
      const endDate = toUtcIsoMidnight(nextDay);

      // Keep local date string for display
      const displayDateStr = `${displayDate.getFullYear()}-${
        displayDate.getMonth() + 1
      }-${displayDate.getDate()}`;

      try {
        const response = await fetch(
          `https://hackatime.hackclub.com/api/v1/users/${id}/stats?start_date=${startDate}&end_date=${endDate}`,
        );

        if (response.ok) {
          const data: ApiResponse = await response.json();
          const hours = data.data.total_seconds / 3600;
          const roundedHours = Math.round(hours * 100) / 100;
          const hoursInt = Math.floor(hours);
          const minutes = Math.floor((hours - hoursInt) * 60);
          const dayOfWeek = displayDate.toLocaleDateString("en-US", {
            weekday: "short",
          });

          weeklyData.push({
            date: displayDateStr,
            hours: roundedHours,
          });
        } else {
          const displayDateStr = `${displayDate.getFullYear()}-${
            displayDate.getMonth() + 1
          }-${displayDate.getDate()}`;
          weeklyData.push({
            date: displayDateStr,
            hours: 0,
          });
        }
      } catch (err) {
        const errorDisplayDateStr = `${displayDate.getFullYear()}-${
          displayDate.getMonth() + 1
        }-${displayDate.getDate()}`;
        console.error(`Error fetching data for ${errorDisplayDateStr}:`, err);
        weeklyData.push({
          date: errorDisplayDateStr,
          hours: 0,
        });
      }
    }

    setWeeklyData(weeklyData);
  };

  const fetchMonthlyStats = async (id: string) => {
    const monthlyData: MonthlyData[] = [];
    const today = new Date();

    const getCurrentWeekStart = (date: Date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff));
    };

    const currentWeekStart = getCurrentWeekStart(today);

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(currentWeekStart.getDate() - i * 7);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // Use local week bounds converted to UTC ISO midnights
      const startDate = toUtcIsoMidnight(weekStart);

      const nextDay = new Date(weekEnd);
      nextDay.setDate(weekEnd.getDate() + 1);
      const endDate = toUtcIsoMidnight(nextDay);

      try {
        const response = await fetch(
          `https://hackatime.hackclub.com/api/v1/users/${id}/stats?start_date=${startDate}&end_date=${endDate}`,
        );

        if (response.ok) {
          const data: ApiResponse = await response.json();
          const hours = data.data.total_seconds / 3600;

          const weekLabel = weekStart.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          monthlyData.push({
            weekStart: startDate,
            weekEnd: endDate,
            hours: Math.round(hours * 100) / 100,
            weekLabel: weekLabel,
          });
        } else {
          const weekLabel = weekStart.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          monthlyData.push({
            weekStart: startDate,
            weekEnd: endDate,
            hours: 0,
            weekLabel: weekLabel,
          });
        }
      } catch (err) {
        console.error(`Error fetching data for week ${startDate}:`, err);
        const weekLabel = weekStart.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        monthlyData.push({
          weekStart: startDate,
          weekEnd: endDate,
          hours: 0,
          weekLabel: weekLabel,
        });
      }
    }

    setMonthlyData(monthlyData);
  };

  const fetchThreeMonthStats = async (id: string) => {
    const threeMonthData: ThreeMonthData[] = [];
    const today = new Date();

    // Fetch last 3 months (current month, last month, 2 months ago)
    for (let i = 2; i >= 0; i--) {
      // Calculate the first day of the target month (display date)
      const displayMonthStart = new Date(
        today.getFullYear(),
        today.getMonth() - i,
        1,
      );

      // Calculate the last day of the target month (display date)
      const displayMonthEnd = new Date(
        today.getFullYear(),
        today.getMonth() - i + 1,
        0,
      );

      // Use local month bounds converted to UTC ISO midnights
      const startDate = toUtcIsoMidnight(displayMonthStart);

      const nextDay = new Date(displayMonthEnd);
      nextDay.setDate(displayMonthEnd.getDate() + 1);
      const endDate = toUtcIsoMidnight(nextDay);

      const monthLabel = displayMonthStart.toLocaleDateString("en-US", {
        month: "short",
      });

      try {
        const response = await fetch(
          `https://hackatime.hackclub.com/api/v1/users/${id}/stats?start_date=${startDate}&end_date=${endDate}`,
        );

        if (response.ok) {
          const data: ApiResponse = await response.json();
          const hours = data.data.total_seconds / 3600;

          threeMonthData.push({
            monthStart: startDate,
            monthEnd: endDate,
            hours: Math.round(hours * 100) / 100,
            monthLabel: monthLabel,
          });
        } else {
          threeMonthData.push({
            monthStart: startDate,
            monthEnd: endDate,
            hours: 0,
            monthLabel: monthLabel,
          });
        }
      } catch (err) {
        console.error(`Error fetching data for month ${startDate}:`, err);
        threeMonthData.push({
          monthStart: startDate,
          monthEnd: endDate,
          hours: 0,
          monthLabel: monthLabel,
        });
      }
    }

    setThreeMonthData(threeMonthData);
  };

  const fetchStats = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const allTimeResponse = await fetch(
        `https://hackatime.hackclub.com/api/v1/users/${id}/stats`,
      );
      if (!allTimeResponse.ok) {
        throw new Error(
          `Failed to fetch all-time stats: ${allTimeResponse.status}`,
        );
      }
      const allTimeData: ApiResponse = await allTimeResponse.json();
      setAllTimeStats(allTimeData.data);

      // Fetch today's stats: local day -> UTC ISO midnights (no shifts)
      const today = new Date();
      const todayDate = toUtcIsoMidnight(today);

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const tomorrowDate = toUtcIsoMidnight(tomorrow);

      const todayResponse = await fetch(
        `https://hackatime.hackclub.com/api/v1/users/${id}/stats?start_date=${todayDate}&end_date=${tomorrowDate}`,
      );
      if (!todayResponse.ok) {
        throw new Error(
          `Failed to fetch today's stats: ${todayResponse.status}`,
        );
      }
      const todayData: ApiResponse = await todayResponse.json();
      setTodayStats(todayData.data);

      await fetchWeeklyStats(id);
      await fetchMonthlyStats(id);
      await fetchThreeMonthStats(id);

      // Cache the stats after successful fetch
      const cacheData = {
        allTimeStats: allTimeData.data,
        todayStats: todayData.data,
        weeklyData,
        monthlyData,
        threeMonthData,
        timestamp: new Date().toISOString(),
      };
      await AsyncStorage.setItem("cachedStats", JSON.stringify(cacheData));
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
      Alert.alert(
        "Error",
        "Failed to fetch stats. Please check your Slack ID and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeId = () => {
    setInputVisible(true);
    setAllTimeStats(null);
    setTodayStats(null);
    setWeeklyData([]);
    setMonthlyData([]);
    setThreeMonthData([]);
    setError(null);
  };

  const getFavoriteLanguage = (stats: StatsData | null) => {
    if (!stats || !stats.languages.length) return "N/A";
    const topLanguage = stats.languages.find((lang) => lang.total_seconds > 0);
    return topLanguage ? topLanguage.name : "N/A";
  };

  const getWeeklyChartData = () => {
    if (weeklyData.length === 0) {
      return [];
    }

    // Only show the last 7 days for the chart
    return weeklyData.slice(-7).map((item) => {
      const [y, m, d] = item.date.split("-").map(Number);
      const date = new Date(y, (m || 1) - 1, d || 1);
      const label = date.toLocaleDateString("en-US", { weekday: "short" });
      const subLabel = date.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
      });
      return {
        label,
        subLabel,
        value: item.hours,
      };
    });
  };

  const getMonthlyChartData = () => {
    if (monthlyData.length === 0) {
      return [];
    }

    return monthlyData.map((item) => ({
      label: item.weekLabel,
      value: item.hours,
    }));
  };

  const getThreeMonthChartData = () => {
    if (threeMonthData.length === 0) {
      return [];
    }

    return threeMonthData.map((item) => ({
      label: item.monthLabel,
      value: item.hours,
    }));
  };

  const getTotalHoursToday = () => {
    if (!todayStats) return 0;
    return Math.round((todayStats.total_seconds / 3600) * 10) / 10;
  };

  const getStreak = () => {
    // Simple streak calculation based on weekly data
    let streak = 0;
    for (let i = weeklyData.length - 1; i >= 0; i--) {
      if (weeklyData[i].hours > 0.25) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getRank = () => {
    // Mock rank - you can implement actual rank logic
    return "#1";
  };

  const getWeeklyComparison = () => {
    if (weeklyData.length < 7) return 0;
    const thisWeek = weeklyData.slice(-7).reduce((sum, d) => sum + d.hours, 0);
    const lastWeek = weeklyData
      .slice(-14, -7)
      .reduce((sum, d) => sum + d.hours, 0);
    if (lastWeek === 0) return 0;
    return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  };

  // Log coding time
  useEffect(() => {
    if (todayStats && weeklyData.length > 0) {
      const todaySeconds = todayStats.total_seconds;
      const todayHours = Math.floor(todaySeconds / 3600);
      const todayMinutes = Math.floor((todaySeconds % 3600) / 60);

      const weekSeconds = weeklyData
        .slice(-7)
        .reduce((sum, d) => sum + d.hours * 3600, 0);
      const weekHours = Math.floor(weekSeconds / 3600);
      const weekMinutes = Math.floor((weekSeconds % 3600) / 60);
    }
  }, [todayStats, weeklyData]);

  if (loading || session.isPending) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ff6b9d" />
        <Text style={styles.loadingText}>Loading stats...</Text>
      </View>
    );
  }

  if (!userInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.title}>Not logged in</Text>
          <Button
            title="Login"
            onPress={() => {
              authClient.signIn.oauth2({
                providerId: "hackclub",
                callbackURL: "/hackatime",
              });
            }}
          />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => storedSlackId && fetchStats(storedSlackId)}
        >
          <Text style={styles.saveButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>welcome back,</Text>
          <Text
            style={styles.usernameText}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {allTimeStats?.username || storedSlackId}
          </Text>
        </View>

        {/* Stats Cards Row */}
        <View style={styles.statsRow}>
          {/* Streak Card */}
          <LinearGradient
            colors={["#ff9c8f", "#ff6b7a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <Text style={styles.statEmoji}>🔥</Text>
            <View>
              <Text style={styles.statLabel}>you have a</Text>
              <Text style={styles.statValue}>{getStreak()} days streak</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statsRow}>
          {/* Hours Coded Card */}
          <LinearGradient
            colors={["#ffb088", "#ff8866"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.smallStatCard}
          >
            <Text style={styles.smallStatValue}>{getTotalHoursToday()}</Text>
            <Text style={styles.smallStatLabel}>HOURS CODED</Text>
          </LinearGradient>

          {/* Rank Card */}
          <LinearGradient
            colors={["#ff9988", "#ff7766"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.smallStatCard}
          >
            <Text style={styles.smallStatValue}>{getRank()}</Text>
            <Text style={styles.smallStatLabel}>AMONG FRIENDS</Text>
          </LinearGradient>
        </View>

        {/* Weekly Comparison Card */}
        <LinearGradient
          colors={["#5b7de8", "#4a6cd4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.comparisonCard}
        >
          <Text style={styles.comparisonValue}>{getWeeklyComparison()}%</Text>
          <Text style={styles.comparisonLabel}>
            Weekly Coding Time vs Last Week
          </Text>
        </LinearGradient>

        {/* Last 7 Days Activity */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Last 7 Days Activity</Text>
          <BarChart
            data={getWeeklyChartData()}
            width={screenWidth - 32}
            height={200}
          />
        </View>

        {/* Last 3 Months Activity */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Last 3 Months Activity</Text>
          <BarChart
            data={getThreeMonthChartData()}
            width={screenWidth - 32}
            height={200}
          />
        </View>

        <View style={styles.navbarSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2a2139",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#2a2139",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 30,
  },
  welcomeContainer: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "300",
    fontStyle: "italic",
    color: "#FFFFFF",
  },
  usernameText: {
    fontSize: 28,
    fontWeight: "700",
    fontStyle: "italic",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#FFFFFF",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statEmoji: {
    fontSize: 28,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "400",
    color: "#FFFFFF",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  smallStatCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  smallStatValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  smallStatLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  comparisonCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  comparisonValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  comparisonLabel: {
    fontSize: 9,
    fontWeight: "400",
    color: "#FFFFFF",
    flex: 1,
    marginLeft: 12,
  },
  comparisonTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  chartContainer: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  card: {
    backgroundColor: "#3a3149",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  statsGrid: {
    gap: 12,
  },
  statItem: {
    marginBottom: 8,
  },
  statItemLabel: {
    fontSize: 11,
    color: "#999",
    marginBottom: 3,
  },
  statItemValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  profileCard: {
    backgroundColor: "#3a3149",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  profileIcon: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#c9b8a8",
    justifyContent: "center",
    alignItems: "center",
  },
  profileIconText: {
    fontSize: 28,
  },
  profileInfo: {
    gap: 4,
  },
  profileUsername: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  profileStatus: {
    fontSize: 10,
    fontWeight: "600",
    color: "#666",
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#c9b8a8",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsIcon: {
    fontSize: 18,
  },
  inputContainer: {
    width: "85%",
    backgroundColor: "#3a3149",
    borderRadius: 16,
    padding: 24,
  },
  inputLabel: {
    color: "#FFFFFF",
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  textInput: {
    backgroundColor: "#2a2139",
    color: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#4a4159",
  },
  saveButton: {
    backgroundColor: "#ff6b9d",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#666",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#CCCCCC",
  },
  errorText: {
    color: "#ff6b9d",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 20,
  },
  navbarSpacer: {
    height: 20,
  },
});
