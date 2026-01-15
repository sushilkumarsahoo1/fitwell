import React from "react";
import { View, Text, ViewStyle } from "react-native";
import { COLORS } from "@constants/index";

interface StatBoxProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  style?: ViewStyle;
}

export const StatBox: React.FC<StatBoxProps> = ({
  label,
  value,
  unit,
  color = COLORS.primary,
  style,
}) => {
  return (
    <View
      style={[
        {
          backgroundColor: "#f0f9ff",
          borderRadius: 12,
          padding: 12,
          flex: 1,
          marginHorizontal: 4,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 12,
          color: COLORS.neutral.text,
          marginBottom: 4,
        }}
      >
        {label}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: color,
          }}
        >
          {value}
        </Text>
        {unit && (
          <Text
            style={{
              fontSize: 12,
              color: COLORS.neutral.text,
              marginLeft: 4,
              marginBottom: 2,
            }}
          >
            {unit}
          </Text>
        )}
      </View>
    </View>
  );
};
