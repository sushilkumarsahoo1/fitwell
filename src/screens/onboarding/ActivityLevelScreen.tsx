import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "@context/AuthContext";
import { Button } from "@components/common";
import { ACTIVITY_LEVELS } from "@constants/index";
import { COLORS } from "@constants/index";

interface ActivityLevelScreenProps {
  onSuccess?: () => void;
}

export const ActivityLevelScreen: React.FC<ActivityLevelScreenProps> = ({
  onSuccess,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>("moderate");
  const [loading, setLoading] = useState(false);

  const { updateProfile, profile } = useAuth();

  const handleNext = async () => {
    setLoading(true);
    try {
      const selectedActivityLevel = ACTIVITY_LEVELS.find(
        (level) => level.id === selectedLevel
      );

      if (profile && selectedActivityLevel) {
        const adjustedCalories = Math.round(
          profile.daily_calorie_target * (selectedActivityLevel.multiplier / 1.55)
        );

        await updateProfile({
          activity_level: selectedLevel,
          daily_calorie_target: adjustedCalories,
        } as any);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Update activity level error:", error);
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
          Activity Level
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: COLORS.neutral.text,
          }}
        >
          Select your typical exercise routine
        </Text>
      </View>

      <View style={{ gap: 12, marginBottom: 32 }}>
        {ACTIVITY_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.id}
            onPress={() => setSelectedLevel(level.id)}
            style={{
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor:
                selectedLevel === level.id
                  ? COLORS.primary
                  : COLORS.neutral.border,
              backgroundColor:
                selectedLevel === level.id ? "#f0f9ff" : "white",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color:
                  selectedLevel === level.id
                    ? COLORS.primary
                    : COLORS.neutral.textDark,
                marginBottom: 4,
              }}
            >
              {level.label}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: COLORS.neutral.text,
              }}
            >
              {level.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title="Complete Setup"
        onPress={handleNext}
        loading={loading}
        fullWidth
      />
    </ScrollView>
  );
};
