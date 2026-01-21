import { COLORS } from "@constants/index";
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

interface AnimatedCalorieDisplayProps {
  calories: number;
  target: number;
  animate?: boolean;
}

export const AnimatedCalorieDisplay: React.FC<AnimatedCalorieDisplayProps> = ({
  calories,
  target,
  animate = true,
}) => {
  const animatedValue = useRef(new Animated.Value(calories)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animate) {
      // Animate to new value
      Animated.timing(animatedValue, {
        toValue: calories,
        duration: 400,
        useNativeDriver: false,
      }).start();

      // Flash highlight
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      animatedValue.setValue(calories);
    }
  }, [calories, animate, animatedValue, scaleValue]);

  const displayValue = animatedValue.interpolate({
    inputRange: [0, calories],
    outputRange: [0, calories],
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleValue }],
      }}
    >
      <Animated.Text
        style={{
          fontSize: 20,
          fontWeight: "700",
          color: COLORS.primary,
        }}
      >
        {displayValue.interpolate({
          inputRange: [0, calories],
          outputRange: ["0", `${calories}`],
        })}
      </Animated.Text>
    </Animated.View>
  );
};
