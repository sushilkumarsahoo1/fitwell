import { Card } from "@components/common";
import { COLORS } from "@constants/index";
import { useAuth } from "@context/AuthContext";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const ProgressScreen: React.FC = () => {
  const { profile } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">(
    "week",
  );

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
                {profile?.daily_calorie_target || 2000} cal
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
                0
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
                0 cal
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
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};
