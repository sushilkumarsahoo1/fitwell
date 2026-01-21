import { COLORS } from "@constants/index";
import React from "react";
import {
    Modal,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface ExtremeGoalWarningProps {
  visible: boolean;
  goalLabel: string;
  weeklyRate: string;
  dailyCalories: number;
  isLoss: boolean;
  onAcknowledge: () => void;
  onCancel: () => void;
}

export const ExtremeGoalWarning: React.FC<ExtremeGoalWarningProps> = ({
  visible,
  goalLabel,
  weeklyRate,
  dailyCalories,
  isLoss,
  onAcknowledge,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 20,
            maxHeight: "90%",
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Icon */}
            <View
              style={{
                alignSelf: "center",
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: "#fee2e2",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 32 }}>⚠️</Text>
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: COLORS.neutral?.textDark || "#1f2937",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Important Health Warning
            </Text>

            {/* Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: "#e5e7eb",
                marginVertical: 12,
              }}
            />

            {/* Content */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.neutral?.text || "#6b7280",
                  lineHeight: 22,
                  marginBottom: 12,
                }}
              >
                You are about to select the{" "}
                <Text style={{ fontWeight: "700" }}>{goalLabel}</Text> goal with
                a target of{" "}
                <Text style={{ fontWeight: "700" }}>
                  {dailyCalories} calories/day
                </Text>{" "}
                ({weeklyRate}).
              </Text>

              {isLoss && dailyCalories < 1500 && (
                <>
                  <Text
                    style={{
                      fontSize: 14,
                      color: COLORS.danger || "#ef4444",
                      lineHeight: 22,
                      marginBottom: 12,
                      fontWeight: "600",
                    }}
                  >
                    ⚠️ Consuming less than 1,500 calories per day is considered
                    an extremely restrictive diet and can lead to serious health
                    issues.
                  </Text>
                </>
              )}

              {!isLoss && dailyCalories > 3500 && (
                <>
                  <Text
                    style={{
                      fontSize: 14,
                      color: COLORS.danger || "#ef4444",
                      lineHeight: 22,
                      marginBottom: 12,
                      fontWeight: "600",
                    }}
                  >
                    ⚠️ Consuming more than 3,500 calories per day can lead to
                    rapid weight gain and associated health risks.
                  </Text>
                </>
              )}

              <Text
                style={{
                  fontSize: 13,
                  color: COLORS.neutral?.text || "#6b7280",
                  lineHeight: 20,
                  marginBottom: 12,
                }}
              >
                {isLoss
                  ? "Extreme caloric deficits can cause: muscle loss, nutritional deficiencies, fatigue, hormonal imbalances, and metabolic damage."
                  : "Extreme caloric surpluses can cause: excess fat gain, digestive issues, blood sugar spikes, and metabolic strain."}
              </Text>

              <View
                style={{
                  backgroundColor: "#fef3c7",
                  borderLeftWidth: 4,
                  borderLeftColor: COLORS.warning || "#f59e0b",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: "#78350f",
                    lineHeight: 20,
                    fontWeight: "600",
                  }}
                >
                  💡 Please consult with a doctor or nutritionist before
                  proceeding with this goal. They can help you create a safe and
                  sustainable plan.
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.neutral?.text || "#6b7280",
                  lineHeight: 18,
                  fontStyle: "italic",
                }}
              >
                By acknowledging this warning, you understand the risks and take
                full responsibility for your health and safety.
              </Text>
            </View>

            {/* Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: "#e5e7eb",
                marginVertical: 12,
              }}
            />

            {/* Buttons */}
            <View
              style={{
                flexDirection: "row",
                gap: 12,
              }}
            >
              <TouchableOpacity
                onPress={onCancel}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  borderWidth: 1.5,
                  borderColor: COLORS.neutral?.border || "#d1d5db",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: COLORS.neutral?.text || "#6b7280",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onAcknowledge}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: COLORS.danger || "#ef4444",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "white",
                  }}
                >
                  I Understand, Proceed
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
