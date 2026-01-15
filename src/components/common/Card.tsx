import React from "react";
import { View, Text, ViewStyle } from "react-native";
import { COLORS } from "@constants/index";

interface CardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({ children, style, title, subtitle }) => {
  return (
    <View
      style={[
        {
          backgroundColor: "white",
          borderRadius: 16,
          padding: 16,
          marginVertical: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        },
        style,
      ]}
    >
      {title && (
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: COLORS.neutral.textDark,
            marginBottom: subtitle ? 4 : 12,
          }}
        >
          {title}
        </Text>
      )}
      {subtitle && (
        <Text
          style={{
            fontSize: 13,
            color: COLORS.neutral.text,
            marginBottom: 12,
          }}
        >
          {subtitle}
        </Text>
      )}
      {children}
    </View>
  );
};
