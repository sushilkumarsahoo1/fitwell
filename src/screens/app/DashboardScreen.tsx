import { Card, LoadingSpinner, ProgressRing, StatBox } from "@components/common";
import { COLORS, MEAL_TYPES } from "@constants/index";
import { useAuth } from "@context/AuthContext";
import { useDailyFoodLogs } from "@hooks/useNutrition";
import { useDailyWorkoutLogs } from "@hooks/useWorkouts";
import { useNavigation } from "@react-navigation/native";
import { formatDate } from "@utils/dateUtils";
import React, { useState } from "react";
import {
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface DashboardScreenProps {}

export const DashboardScreen: React.FC<DashboardScreenProps> = () => {
  const navigation = useNavigation();
  const { user, profile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [date] = useState(formatDate(new Date()));

  const { data: foodLogs = [], isLoading: foodLoading } = useDailyFoodLogs(
    user?.id || "",
    date
  );
  const { data: workoutLogs = [], isLoading: workoutLoading } =
    useDailyWorkoutLogs(user?.id || "", date);

  const calorieTarget = profile?.daily_calorie_target || 2000;
  const totalCalories = foodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const totalProtein = foodLogs.reduce((sum, log) => sum + (log.protein_g || 0), 0);
  const totalCarbs = foodLogs.reduce((sum, log) => sum + (log.carbs_g || 0), 0);
  const totalFats = foodLogs.reduce((sum, log) => sum + (log.fats_g || 0), 0);
  const totalCaloriesBurned = workoutLogs.reduce(
    (sum, log) => sum + (log.calories_burned || 0),
    0
  );

  const caloriePercentage = (totalCalories / calorieTarget) * 100;
  const remainingCalories = calorieTarget - totalCalories;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (foodLoading || workoutLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 20,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: COLORS.neutral.textDark,
          }}
        >
          {`Hello, ${profile?.name || "User"}!`}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: COLORS.neutral.text,
            marginTop: 4,
          }}
        >
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      {/* Calories Card */}
      <Card
        style={{
          marginBottom: 16,
          padding: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 13,
                color: COLORS.neutral.text,
                marginBottom: 4,
              }}
            >
              Calorie Progress
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: COLORS.primary,
              }}
            >
              {totalCalories} / {calorieTarget}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: COLORS.neutral.text,
                marginTop: 4,
              }}
            >
              {remainingCalories > 0
                ? `${remainingCalories} remaining`
                : `${Math.abs(remainingCalories)} over`}
            </Text>
          </View>
          <ProgressRing
            percentage={Math.min(caloriePercentage, 100)}
            size={100}
            strokeWidth={6}
          />
        </View>
      </Card>

      {/* Macro Summary */}
      <Card
        title="Macro Breakdown"
        style={{
          marginBottom: 16,
          padding: 16,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <StatBox
            label="Protein"
            value={Math.round(totalProtein)}
            unit="g"
            color={COLORS.success}
          />
          <StatBox
            label="Carbs"
            value={Math.round(totalCarbs)}
            unit="g"
            color={COLORS.warning}
          />
          <StatBox
            label="Fats"
            value={Math.round(totalFats)}
            unit="g"
            color={COLORS.accent}
          />
        </View>
      </Card>

      {/* Quick Actions */}
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("Food" as never)}
          style={{
            flex: 1,
            backgroundColor: COLORS.primary,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            + Add Food
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Workout" as never)}
          style={{
            flex: 1,
            backgroundColor: COLORS.accent,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            + Log Workout
          </Text>
        </TouchableOpacity>
      </View>

      {/* Today's Meals */}
      <Card title="Today's Meals" style={{ marginBottom: 16 }}>
        {MEAL_TYPES.map((mealType) => {
          const mealLogs = foodLogs.filter((log) => log.meal_type === mealType.id);
          return (
            <View key={mealType.id} style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: COLORS.neutral.textDark,
                  marginBottom: 8,
                }}
              >
                {mealType.label} ({mealLogs.length})
              </Text>
              {mealLogs.length === 0 ? (
                <Text
                  style={{
                    fontSize: 12,
                    color: COLORS.neutral.text,
                    marginBottom: 12,
                  }}
                >
                  No items logged
                </Text>
              ) : (
                mealLogs.map((log) => (
                  <View
                    key={log.id}
                    style={{
                      paddingVertical: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: COLORS.neutral.border,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: COLORS.neutral.textDark,
                        }}
                      >
                        {log.foods?.name || "Food"}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: COLORS.primary,
                        }}
                      >
                        {log.calories} cal
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          );
        })}
      </Card>

      {/* Workouts Summary */}
      <Card title="Today's Workouts" style={{ marginBottom: 24 }}>
        {workoutLogs.length === 0 ? (
          <Text
            style={{
              fontSize: 13,
              color: COLORS.neutral.text,
              textAlign: "center",
              paddingVertical: 16,
            }}
          >
            No workouts logged yet
          </Text>
        ) : (
          <>
            <StatBox
              label="Total Duration"
              value={workoutLogs.reduce((sum, w) => sum + (w.duration_minutes || 0), 0)}
              unit="min"
            />
            <StatBox
              label="Calories Burned"
              value={totalCaloriesBurned}
              unit="cal"
              color={COLORS.danger}
              style={{ marginTop: 12 }}
            />
          </>
        )}
      </Card>
    </ScrollView>
  );
};
