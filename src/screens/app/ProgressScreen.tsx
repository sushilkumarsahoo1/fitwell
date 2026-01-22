import { Card } from "@components/common";
import { COLORS } from "@constants/index";
import { useAuth } from "@context/AuthContext";
import { useWeightLogs } from "@hooks/useTracking";
import { supabase } from "@services/supabase";
import { useQuery } from "@tanstack/react-query";
import { formatDate, getWeekStart } from "@utils/dateUtils";
import {
    calculateDailyCalorieTarget,
    getGoalMetrics,
} from "@utils/nutritionUtils";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
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
  const {
    data: weekFoodLogs = [],
    error: weekFoodLogsError,
    isLoading: weekFoodLogsLoading,
  } = useQuery({
    queryKey: ["periodFoodLogs", user?.id, weekStartStr, weekEndStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_logs")
        .select("*")
        .eq("user_id", user?.id || "")
        .gte("date", weekStartStr)
        .lte("date", weekEndStr);
      if (error) {
        console.error("[ProgressScreen] Error fetching week food logs:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user?.id && selectedPeriod === "week",
  });

  const {
    data: monthFoodLogs = [],
    error: monthFoodLogsError,
    isLoading: monthFoodLogsLoading,
  } = useQuery({
    queryKey: ["periodFoodLogs", user?.id, monthStartStr, monthEndStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_logs")
        .select("*")
        .eq("user_id", user?.id || "")
        .gte("date", monthStartStr)
        .lte("date", monthEndStr);
      if (error) {
        console.error(
          "[ProgressScreen] Error fetching month food logs:",
          error,
        );
        throw error;
      }
      return data || [];
    },
    enabled: !!user?.id && selectedPeriod === "month",
  });

  const {
    data: weekWorkoutLogs = [],
    error: weekWorkoutLogsError,
    isLoading: weekWorkoutLogsLoading,
  } = useQuery({
    queryKey: ["periodWorkoutLogs", user?.id, weekStartStr, weekEndStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("user_id", user?.id || "")
        .gte("date", weekStartStr)
        .lte("date", weekEndStr);
      if (error) {
        console.error(
          "[ProgressScreen] Error fetching week workout logs:",
          error,
        );
        throw error;
      }
      return data || [];
    },
    enabled: !!user?.id && selectedPeriod === "week",
  });

  const {
    data: monthWorkoutLogs = [],
    error: monthWorkoutLogsError,
    isLoading: monthWorkoutLogsLoading,
  } = useQuery({
    queryKey: ["periodWorkoutLogs", user?.id, monthStartStr, monthEndStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("user_id", user?.id || "")
        .gte("date", monthStartStr)
        .lte("date", monthEndStr);
      if (error) {
        console.error(
          "[ProgressScreen] Error fetching month workout logs:",
          error,
        );
        throw error;
      }
      return data || [];
    },
    enabled: !!user?.id && selectedPeriod === "month",
  });

  const { data: weightLogs = [] } = useWeightLogs(user?.id || "", {
    start: selectedPeriod === "week" ? weekStartStr : monthStartStr,
    end: selectedPeriod === "week" ? weekEndStr : monthEndStr,
  });

  // Fetch goal change history with period filtering
  const {
    data: goalChangeHistory = [],
    error: goalHistoryError,
    isLoading: goalHistoryLoading,
  } = useQuery({
    queryKey: [
      "goalChangeHistory",
      user?.id,
      selectedPeriod,
      weekStartStr,
      monthStartStr,
    ],
    queryFn: async () => {
      const startDate =
        selectedPeriod === "week" ? weekStartStr : monthStartStr;
      const endDate = selectedPeriod === "week" ? weekEndStr : monthEndStr;

      const { data, error } = await supabase
        .from("goal_change_history")
        .select("*")
        .eq("user_id", user?.id || "")
        .gte("changed_at", startDate)
        .lte("changed_at", endDate)
        .order("changed_at", { ascending: false })
        .limit(10);

      if (error) {
        if (error.code === "42P01") {
          console.warn(
            "[ProgressScreen] goal_change_history table missing. Returning empty history.",
          );
          return [];
        }
        console.error("[ProgressScreen] Error fetching goal history:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    const dataError =
      weekFoodLogsError ||
      monthFoodLogsError ||
      weekWorkoutLogsError ||
      monthWorkoutLogsError ||
      goalHistoryError;

    if (dataError) {
      Alert.alert(
        "Data Load Error",
        "We couldn't load your progress data. Please try again.",
      );
    }
  }, [
    weekFoodLogsError,
    monthFoodLogsError,
    weekWorkoutLogsError,
    monthWorkoutLogsError,
    goalHistoryError,
  ]);

  // Calculate maintenance calories for reference with validation
  const maintenanceCalories =
    profile &&
    profile.weight_kg &&
    profile.height_cm &&
    profile.age &&
    profile.gender &&
    profile.activity_level
      ? calculateDailyCalorieTarget(
          profile.weight_kg,
          profile.height_cm,
          profile.age,
          profile.gender,
          profile.activity_level,
          "maintain",
        )
      : null;

  // Get current goal metrics (only if we have valid maintenanceCalories)
  const currentGoalMetrics =
    profile?.fitness_goal && maintenanceCalories
      ? getGoalMetrics(maintenanceCalories, profile.fitness_goal as any)
      : null;

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
    // Calculate using actual days with logs instead of fixed period days
    const daysWithLogs = new Set(foodLogs.map((log) => log.date)).size;
    const avgDailyCalories = totalCaloriesConsumed / Math.max(daysWithLogs, 1);

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
      daysWithLogs,
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

        {/* Current Goal & Target */}
        {currentGoalMetrics && (
          <Card
            title="Your Goal"
            style={{
              marginBottom: 16,
            }}
          >
            <View style={{ gap: 12 }}>
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
                  Current Goal
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: COLORS.primary,
                    textTransform: "capitalize",
                  }}
                >
                  {profile?.fitness_goal?.replace(/_/g, " ")}
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
                  Daily Calorie Target
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: COLORS.primary,
                  }}
                >
                  {currentGoalMetrics.calorieTarget} cal
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
                  Expected Weekly Change
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color:
                      currentGoalMetrics.weeklyWeightChange > 0
                        ? COLORS.warning
                        : currentGoalMetrics.weeklyWeightChange < 0
                          ? COLORS.success
                          : COLORS.neutral.text,
                  }}
                >
                  {currentGoalMetrics.weeklyWeightChange > 0 ? "+" : ""}
                  {currentGoalMetrics.weeklyWeightChange} kg/week
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
                  Calorie{" "}
                  {currentGoalMetrics.deficitOrSurplus < 0
                    ? "Deficit"
                    : "Surplus"}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color:
                      currentGoalMetrics.deficitOrSurplus < 0
                        ? COLORS.success
                        : COLORS.warning,
                  }}
                >
                  {Math.abs(currentGoalMetrics.deficitOrSurplus)} cal/day
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Goal Change History */}
        {goalChangeHistory.length > 0 && (
          <Card
            title="Goal Change History"
            style={{
              marginBottom: 16,
            }}
          >
            <View style={{ gap: 8 }}>
              {goalChangeHistory.slice(0, 5).map((change, index) => (
                <View
                  key={change.id}
                  style={{
                    paddingVertical: 8,
                    borderBottomWidth:
                      index < goalChangeHistory.length - 1 ? 1 : 0,
                    borderBottomColor: COLORS.neutral.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: COLORS.neutral.textDark,
                      }}
                    >
                      {change.previous_goal?.replace(/_/g, " ")} →{" "}
                      {change.new_goal?.replace(/_/g, " ")}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: COLORS.neutral.text,
                      }}
                    >
                      {change.new_calorie_target} cal
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 10,
                      color: COLORS.neutral.text,
                    }}
                  >
                    {new Date(change.changed_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

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

              {/* Goal Adherence */}
              {currentGoalMetrics && maintenanceCalories && (
                <View
                  style={{
                    backgroundColor: "#E0F2F1",
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: "#00695C",
                      marginBottom: 4,
                    }}
                  >
                    🎯 Goal Adherence
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#00695C",
                    }}
                  >
                    {periodStats.daysWithLogs < 3
                      ? `Log at least 3 days of meals for accurate goal insights. You've logged ${periodStats.daysWithLogs} days so far.`
                      : periodStats.avgCalories >
                          currentGoalMetrics.calorieTarget + 100
                        ? `You're consuming ${periodStats.avgCalories - currentGoalMetrics.calorieTarget} more calories than your goal. Consider adjusting portions.`
                        : periodStats.avgCalories <
                            currentGoalMetrics.calorieTarget - 100
                          ? `You're consuming ${currentGoalMetrics.calorieTarget - periodStats.avgCalories} fewer calories than your goal. Make sure you're eating enough!`
                          : `Perfect! You're following your goal of ${currentGoalMetrics.calorieTarget} cal/day very well.`}
                  </Text>
                </View>
              )}
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};
