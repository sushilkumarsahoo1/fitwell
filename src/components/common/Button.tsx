import React from "react";
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { COLORS } from "@constants/index";

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.neutral.border;
    switch (variant) {
      case "primary":
        return COLORS.primary;
      case "secondary":
        return "transparent";
      case "danger":
        return COLORS.danger;
      default:
        return COLORS.primary;
    }
  };

  const getPadding = () => {
    switch (size) {
      case "small":
        return "px-3 py-2";
      case "large":
        return "px-6 py-4";
      case "medium":
      default:
        return "px-4 py-3";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "small":
        return { fontSize: 14 };
      case "large":
        return { fontSize: 18 };
      case "medium":
      default:
        return { fontSize: 16 };
    }
  };

  const buttonStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? "100%" : "auto",
    paddingHorizontal: size === "small" ? 12 : size === "large" ? 24 : 16,
    paddingVertical: size === "small" ? 8 : size === "large" ? 16 : 12,
    borderWidth: variant === "secondary" ? 2 : 0,
    borderColor: variant === "secondary" ? COLORS.primary : undefined,
    ...style,
  };

  const textColor =
    variant === "secondary" || disabled ? COLORS.primary : "white";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyle}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={[
            {
              color: textColor,
              fontWeight: "600",
              ...getTextSize(),
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
