import { Card } from "@components/common";
import { COLORS } from "@constants/index";
import { useAuth } from "@context/AuthContext";
import { useWeightLogs } from "@hooks/useTracking";
import { supabase } from "@services/supabase";
import { useQuery } from "@tanstack/react-query";
import { formatDate, getWeekStart } from "@utils/dateUtils";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const ProgressScreen: React.FC = () => {
  const { profile, user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">(
    "week",
  );
  const today = new Date();
  const todayStr = formatDate(today);

  // Calculate date ranges
  const weekStart = getWeekStart(today);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const weekStartStr = formatDate(weekStart);
  const weekEndStr = formatDate(weekEnd);
  const monthStartStr = formatDate(monthStart);
  const monthEndStr = formatDate(monthEnd);

  // Fetch period-based data
  const { data: weekFoodLogs = [] } = useQuery({
    queryKey: ["periodFoodLogs", user?.id, weekStartStr, weekEndStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_logs")
        .select("*")
        .eq("user_id", user?.id || "")
        .gte("date", weekStartStr)
        .lte("date", weekEndStr);
      return data || [];
    },
    enabled: !!user?.id && selectedPeriod === "week",
  });

  const { data: monthFoodLogs = [] } = useQuery({
    queryKey: ["periodFoodLogs", user?.id, monthStartStr, monthEndStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_logs")
        .select("*")
        .eq("user_id", user?.id || "")
        .gte("date", monthStartStr)
        .lte("date", monthEndStr);
      return data || [];
    },
    enabled: !!user?.id && selectedPeriod === "month",
  });

  const { data: weekWorkoutLogs = [] } = useQuery({
    queryKey: ["periodWorkoutLogs", user?.id, weekStartStr, weekEndStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("user_id", user?.id || "")
        .gte("date", weekStartStr)
        .lte("date", weekEndStr);
      return data || [];
    },
    enabled: !!user?.id && selectedPeriod === "week",
  });

  const { data: monthWorkoutLogs = [] } = useQuery({
    queryKey: ["periodWorkoutLogs", user?.id, monthStartStr, monthEndStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("user_id", user?.id || "")
        .gte("date", monthStartStr)
        .lte("date", monthEndStr);
      return data || [];
    },
    enabled: !!user?.id && selectedPeriod === "month",
  });

  const { data: weightLogs = [] } = useWeightLogs(user?.id || "", {
    start: selectedPeriod === "week" ? weekStartStr : monthStartStr,
    end: selectedPeriod === "week" ? weekEndStr : monthEndStr,
  });

  // Select data based on period
  const foodLogs = selectedPeriod === "week" ? weekFoodLogs : monthFoodLogs;
  const workoutLogs =
    selectedPeriod === "week" ? weekWorkoutLogs : monthWorkoutLogs;

  // Calculate stats for period
  const periodStats = React.useMemo(() => {
    const totalWorkouts = workoutLogs.length;
    const totalCaloriesBurned = workoutLogs.reduce(
      (sum, log) => sum + (log.calories_burned || 0),
      0,
    );
    const totalCaloriesConsumed = foodLogs.reduce(
      (sum, log) => sum + (log.calories || 0),
      0,
    );
    const avgDailyCalories =
      selectedPeriod === "week"
        ? totalCaloriesConsumed / 7
        : totalCaloriesConsumed /
          new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    // Calculate weight change if data available
    const sortedWeights = [...weightLogs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const startWeight = sortedWeights[0]?.weight_kg;
    const endWeight = sortedWeights[sortedWeights.length - 1]?.weight_kg;
    const weightChange = startWeight && endWeight ? endWeight - startWeight : 0;

    // Calculate insights
    const avgWorkoutsPerDay =
      selectedPeriod === "week"
        ? (totalWorkouts / 7).toFixed(1)
        : (
            totalWorkouts /
            new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
          ).toFixed(1);

    const burnedMoreThanConsumed = totalCaloriesBurned > totalCaloriesConsumed;
    const netCalories = totalCaloriesConsumed - totalCaloriesBurned;

    return {
      workouts: totalWorkouts,
      caloriesBurned: totalCaloriesBurned,
      avgCalories: Math.round(avgDailyCalories),
      totalCaloriesConsumed,
      weightChange: Math.round(weightChange * 10) / 10,
      avgWorkoutsPerDay: parseFloat(avgWorkoutsPerDay),
      burnedMoreThanConsumed,
      netCalories: Math.abs(netCalories),
      startDate: selectedPeriod === "week" ? weekStartStr : monthStartStr,
    };
  }, [selectedPeriod, workoutLogs, foodLogs, weightLogs, today]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f5f5f5" }}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 200,
        }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: COLORS.neutral.textDark,
            marginBottom: 20,
          }}
        >
          Progress & Analytics
        </Text>

        {/* Period Selector */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            onPress={() => setSelectedPeriod("week")}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderBottomWidth: 2,
              borderBottomColor:
                selectedPeriod === "week"
                  ? COLORS.primary
                  : COLORS.neutral.border,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color:
                  selectedPeriod === "week"
                    ? COLORS.primary
                    : COLORS.neutral.text,
                textAlign: "center",
              }}
            >
              This Week
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedPeriod("month")}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderBottomWidth: 2,
              borderBottomColor:
                selectedPeriod === "month"
                  ? COLORS.primary
                  : COLORS.neutral.border,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color:
                  selectedPeriod === "month"
                    ? COLORS.primary
                    : COLORS.neutral.text,
                textAlign: "center",
              }}
            >
              This Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <Card
          title="Summary"
          style={{
            marginBottom: 16,
          }}
        >
          <View
            style={{
              gap: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: COLORS.neutral.text,
                }}
              >
                Avg Daily Calories
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: COLORS.primary,
                }}
              >
                {Math.round(periodStats.avgCalories)} cal
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 8,
                borderTopWidth: 1,
                borderTopColor: COLORS.neutral.border,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: COLORS.neutral.text,
                }}
              >
                Workouts Completed
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: COLORS.accent,
                }}
              >
                {periodStats.workouts}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 8,
                borderTopWidth: 1,
                borderTopColor: COLORS.neutral.border,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: COLORS.neutral.text,
                }}
              >
                Total Calories Burned
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: COLORS.danger,
                }}
              >
                {Math.round(periodStats.caloriesBurned)} cal
              </Text>
            </View>
          </View>
        </Card>

        {/* Insights */}
        <Card
          title="Insights"
          style={{
            marginBottom: 24,
          }}
        >
          {workoutLogs.length === 0 && foodLogs.length === 0 ? (
            <Text
              style={{
                fontSize: 13,
                color: COLORS.neutral.text,
                textAlign: "center",
                paddingVertical: 16,
              }}
            >
              Complete more entries to unlock personalized insights about your
              fitness journey
            </Text>
          ) : (
            <View style={{ gap: 12 }}>
              {/* Calorie Balance Insight */}
              <View
                style={{
                  backgroundColor: periodStats.burnedMoreThanConsumed
                    ? "#E8F5E9"
                    : "#FFF3E0",
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: periodStats.burnedMoreThanConsumed
                      ? "#2E7D32"
                      : "#E65100",
                    marginBottom: 4,
                  }}
                >
                  {periodStats.burnedMoreThanConsumed ? "💪" : "🎯"} Calorie
                  Balance
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: periodStats.burnedMoreThanConsumed
                      ? "#2E7D32"
                      : "#E65100",
                  }}
                >
                  {periodStats.burnedMoreThanConsumed
                    ? `You burned ${periodStats.netCalories} more calories than you consumed. Keep up the great work!`
                    : `You consumed ${periodStats.netCalories} more calories than you burned.`}
                </Text>
              </View>

              {/* Workout Consistency */}
              {periodStats.workouts > 0 && (
                <View
                  style={{
                    backgroundColor: "#E3F2FD",
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: "#1565C0",
                      marginBottom: 4,
                    }}
                  >
                    🏋️ Workout Consistency
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#1565C0",
                    }}
                  >
                    {periodStats.avgWorkoutsPerDay.toFixed(1)} workouts per day
                    {periodStats.avgWorkoutsPerDay >= 1
                      ? " - Excellent consistency!"
                      : " - Try to increase frequency for better results"}
                  </Text>
                </View>
              )}

              {/* Weight Progress */}
              {Math.abs(periodStats.weightChange) > 0 && (
                <View
                  style={{
                    backgroundColor: "#F3E5F5",
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: "#6A1B9A",
                      marginBottom: 4,
                    }}
                  >
                    ⚖️ Weight Change
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#6A1B9A",
                    }}
                  >
                    {periodStats.weightChange > 0
                      ? `↑ +${periodStats.weightChange} kg`
                      : `↓ ${periodStats.weightChange} kg`}
                  </Text>
                </View>
              )}

              {/* Daily Average */}
              <View
                style={{
                  backgroundColor: "#FCE4EC",
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#C2185B",
                    marginBottom: 4,
                  }}
                >
                  🍽️ Daily Average
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#C2185B",
                  }}
                >
                  {periodStats.avgCalories} calories/day
                </Text>
              </View>
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};
