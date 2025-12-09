export const fetchWeeklyStats = async (id: string) => {
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

  return weeklyData;
};

export const fetchMonthlyStats = async (id: string) => {
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

  return monthlyData;
};

export const fetchThreeMonthStats = async (id: string) => {
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

  return threeMonthData;
};

export const fetchStats = async (id: string) => {
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
      throw new Error(`Failed to fetch today's stats: ${todayResponse.status}`);
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
