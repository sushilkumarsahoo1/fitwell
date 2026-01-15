import React from "react";
import { View, Text } from "react-native";
import { COLORS } from "@constants/index";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  label,
  color = COLORS.primary,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: COLORS.neutral.border,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Background circle would be SVG in production */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: color,
            textAlign: "center",
          }}
        >
          {Math.round(percentage)}%
        </Text>
      </View>
      {label && (
        <Text
          style={{
            marginTop: 8,
            fontSize: 12,
            color: COLORS.neutral.text,
            textAlign: "center",
          }}
        >
          {label}
        </Text>
      )}
    </View>
  );
};
