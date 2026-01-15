import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "@context/AuthContext";
import { Button } from "@components/common";
import { FITNESS_GOALS } from "@constants/index";
import { COLORS } from "@constants/index";

interface FitnessGoalScreenProps {
  onSuccess?: () => void;
}

export const FitnessGoalScreen: React.FC<FitnessGoalScreenProps> = ({
  onSuccess,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<"lose_fat" | "maintain" | "gain_muscle">("maintain");
  const [loading, setLoading] = useState(false);

  const { updateProfile } = useAuth();

  const handleNext = async () => {
    setLoading(true);
    try {
      await updateProfile({
        fitness_goal: selectedGoal,
      } as any);

      onSuccess?.();
    } catch (error) {
      console.error("Update goal error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingVertical: 40,
      }}
    >
      <View style={{ marginBottom: 32 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: COLORS.neutral.textDark,
            marginBottom: 8,
          }}
        >
          What's Your Goal?
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: COLORS.neutral.text,
          }}
        >
          We'll customize your plan accordingly
        </Text>
      </View>

      <View style={{ gap: 12, marginBottom: 32 }}>
        {FITNESS_GOALS.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            onPress={() => setSelectedGoal(goal.id as any)}
            style={{
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor:
                selectedGoal === goal.id
                  ? COLORS.primary
                  : COLORS.neutral.border,
              backgroundColor:
                selectedGoal === goal.id ? "#f0f9ff" : "white",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color:
                  selectedGoal === goal.id
                    ? COLORS.primary
                    : COLORS.neutral.textDark,
                marginBottom: 4,
              }}
            >
              {goal.label}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: COLORS.neutral.text,
              }}
            >
              {goal.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title="Continue"
        onPress={handleNext}
        loading={loading}
        fullWidth
      />
    </ScrollView>
  );
};
