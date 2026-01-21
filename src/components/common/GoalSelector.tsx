import { COLORS } from "@constants/index";
import React, { useState } from "react";
import {
    Text,
    TouchableOpacity,
    View
} from "react-native";

export type GoalType =
  | "maintain"
  | "mild_loss"
  | "normal_loss"
  | "extreme_loss"
  | "mild_gain"
  | "normal_gain"
  | "extreme_gain";

export interface GoalOption {
  id: GoalType;
  label: string;
  weeklyRate: string;
  ratePercentage: number;
  description: string;
  icon: string;
  color: string;
  requiresWarning: boolean;
}

export interface GoalCategory {
  id: "maintain" | "loss" | "gain";
  label: string;
  icon: string;
  color: string;
  description: string;
  options: GoalOption[];
}

const LOSS_OPTIONS: GoalOption[] = [
  {
    id: "mild_loss",
    label: "Mild Loss",
    weeklyRate: "0.25 kg/week",
    ratePercentage: 89,
    description: "Gradual weight loss",
    icon: "↓",
    color: COLORS.warning,
    requiresWarning: false,
  },
  {
    id: "normal_loss",
    label: "Normal Loss",
    weeklyRate: "0.5 kg/week",
    ratePercentage: 79,
    description: "Moderate weight loss",
    icon: "↓",
    color: COLORS.warning,
    requiresWarning: false,
  },
  {
    id: "extreme_loss",
    label: "Extreme Loss",
    weeklyRate: "1 kg/week",
    ratePercentage: 57,
    description: "Fast weight loss",
    icon: "⬇️",
    color: COLORS.danger,
    requiresWarning: true,
  },
];

const GAIN_OPTIONS: GoalOption[] = [
  {
    id: "mild_gain",
    label: "Mild Gain",
    weeklyRate: "0.25 kg/week",
    ratePercentage: 111,
    description: "Gradual weight gain",
    icon: "↑",
    color: COLORS.warning,
    requiresWarning: false,
  },
  {
    id: "normal_gain",
    label: "Normal Gain",
    weeklyRate: "0.5 kg/week",
    ratePercentage: 121,
    description: "Moderate weight gain",
    icon: "↑",
    color: COLORS.warning,
    requiresWarning: false,
  },
  {
    id: "extreme_gain",
    label: "Extreme Gain",
    weeklyRate: "1 kg/week",
    ratePercentage: 143,
    description: "Fast weight gain",
    icon: "⬆️",
    color: COLORS.danger,
    requiresWarning: true,
  },
];

export const GOAL_CATEGORIES: GoalCategory[] = [
  {
    id: "maintain",
    label: "Maintain Weight",
    icon: "↔️",
    color: COLORS.success,
    description: "Keep current weight",
    options: [
      {
        id: "maintain",
        label: "Maintain Weight",
        weeklyRate: "0 kg/week",
        ratePercentage: 100,
        description: "Keep your current weight",
        icon: "↔️",
        color: COLORS.success,
        requiresWarning: false,
      },
    ],
  },
  {
    id: "loss",
    label: "Weight Loss",
    icon: "📉",
    color: COLORS.warning,
    description: "Lose weight at your pace",
    options: LOSS_OPTIONS,
  },
  {
    id: "gain",
    label: "Weight Gain",
    icon: "📈",
    color: COLORS.warning,
    description: "Gain weight at your pace",
    options: GAIN_OPTIONS,
  },
];

interface GoalSelectorProps {
  selectedGoal: GoalType;
  onSelectGoal: (goal: GoalType) => void;
  maintenanceCalories: number;
  loading?: boolean;
}

export const GoalSelector: React.FC<GoalSelectorProps> = ({
  selectedGoal,
  onSelectGoal,
  maintenanceCalories,
  loading = false,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<
    "maintain" | "loss" | "gain" | null
  >(
    selectedGoal === "maintain"
      ? "maintain"
      : selectedGoal.includes("loss")
        ? "loss"
        : "gain",
  );

  const renderMainCategory = (category: GoalCategory) => {
    const isExpanded = expandedCategory === category.id;
    const isSelected =
      (category.id === "maintain" && selectedGoal === "maintain") ||
      (category.id === "loss" && selectedGoal.includes("loss")) ||
      (category.id === "gain" && selectedGoal.includes("gain"));

    return (
      <View key={category.id} style={{ marginBottom: 12 }}>
        {/* Main Category Button */}
        <TouchableOpacity
          onPress={() => {
            if (category.id === "maintain") {
              onSelectGoal("maintain");
              setExpandedCategory(null);
            } else {
              setExpandedCategory(isExpanded ? null : category.id);
            }
          }}
          disabled={loading}
          activeOpacity={0.7}
          style={{
            borderRadius: 12,
            padding: 14,
            backgroundColor: isSelected ? `${category.color}20` : "white",
            borderWidth: 2,
            borderColor: isSelected ? category.color : "#e5e7eb",
            flexDirection: "row",
            alignItems: "center",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {/* Icon */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: `${category.color}25`,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 18 }}>{category.icon}</Text>
          </View>

          {/* Label and Description */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: COLORS.neutral.textDark,
                marginBottom: 2,
              }}
            >
              {category.label}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: COLORS.neutral.text,
              }}
            >
              {category.description}
            </Text>
          </View>

          {/* Chevron for expandable categories */}
          {category.id !== "maintain" && (
            <Text
              style={{
                fontSize: 18,
                color: category.color,
                marginLeft: 8,
                transform: [{ rotate: isExpanded ? "180deg" : "0deg" }],
              }}
            >
              ▼
            </Text>
          )}
        </TouchableOpacity>

        {/* Expanded Sub-options */}
        {isExpanded && category.id !== "maintain" && (
          <View style={{ marginTop: 8 }}>
            {category.options.map((option, index) => {
              const isSelectedOption = selectedGoal === option.id;
              const adjustedCalories = Math.round(
                (maintenanceCalories * option.ratePercentage) / 100,
              );

              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => !loading && onSelectGoal(option.id)}
                  disabled={loading}
                  activeOpacity={0.7}
                  style={{
                    marginLeft: 8,
                    marginBottom: index === category.options.length - 1 ? 0 : 8,
                    borderRadius: 10,
                    padding: 12,
                    backgroundColor: isSelectedOption
                      ? `${option.color}20`
                      : "#f9fafb",
                    borderLeftWidth: 3,
                    borderLeftColor: isSelectedOption
                      ? option.color
                      : "#e5e7eb",
                    flexDirection: "row",
                    alignItems: "center",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {/* Sub-option Icon */}
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      backgroundColor: `${option.color}20`,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 10,
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>{option.icon}</Text>
                  </View>

                  {/* Sub-option Details */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: COLORS.neutral.textDark,
                      }}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: COLORS.neutral.text,
                        marginTop: 2,
                      }}
                    >
                      {option.weeklyRate}
                    </Text>
                  </View>

                  {/* Calories and Percentage */}
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: option.color,
                      }}
                    >
                      {adjustedCalories}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: option.color,
                        fontWeight: "600",
                        marginTop: 2,
                      }}
                    >
                      {option.ratePercentage}%
                    </Text>
                  </View>

                  {/* Selection Indicator */}
                  {isSelectedOption && (
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: option.color,
                        marginLeft: 8,
                      }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Maintain Category Display */}
        {category.id === "maintain" && isSelected && (
          <View style={{ marginTop: 8 }}>
            {category.options.map((option) => {
              const adjustedCalories = Math.round(
                (maintenanceCalories * option.ratePercentage) / 100,
              );

              return (
                <View
                  key={option.id}
                  style={{
                    marginLeft: 8,
                    borderRadius: 10,
                    padding: 12,
                    backgroundColor: `${option.color}10`,
                    borderLeftWidth: 3,
                    borderLeftColor: option.color,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: COLORS.neutral.textDark,
                      }}
                    >
                      Your Daily Target
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: COLORS.neutral.text,
                        marginTop: 2,
                      }}
                    >
                      {option.weeklyRate}
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: option.color,
                      }}
                    >
                      {adjustedCalories}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: COLORS.neutral.text,
                        marginTop: 2,
                      }}
                    >
                      Calories/day
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <View
      style={{
        marginVertical: 12,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: COLORS.neutral.textDark,
          marginBottom: 12,
          paddingHorizontal: 4,
        }}
      >
        Select Your Goal
      </Text>
      <View>
        {GOAL_CATEGORIES.map((category) => renderMainCategory(category))}
      </View>
    </View>
  );
};
