import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "@context/AuthContext";
import { Button, TextInput } from "@components/common";
import {
  validateName,
  validateAge,
  validateHeight,
  validateWeight,
} from "@utils/validationUtils";
import { COLORS } from "@constants/index";

interface ProfileSetupScreenProps {
  onSuccess?: () => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { updateProfile } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateName(name)) {
      newErrors.name = "Name must be 2-255 characters";
    }

    if (!validateAge(parseInt(age, 10))) {
      newErrors.age = "Age must be between 13 and 120";
    }

    if (!validateHeight(parseFloat(height))) {
      newErrors.height = "Height must be between 50-300 cm";
    }

    if (!validateWeight(parseFloat(weight))) {
      newErrors.weight = "Weight must be between 20-500 kg";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await updateProfile({
        name,
        age: parseInt(age, 10),
        gender,
        height_cm: parseFloat(height),
        weight_kg: parseFloat(weight),
      } as any);

      onSuccess?.();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "Update failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
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
            Create Your Profile
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.neutral.text,
            }}
          >
            Help us personalize your fitness journey
          </Text>
        </View>

        {errors.general && (
          <View
            style={{
              backgroundColor: "#fee2e2",
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
            }}
          >
            <Text style={{ color: COLORS.danger, fontSize: 14 }}>
              {errors.general}
            </Text>
          </View>
        )}

        <TextInput
          label="Full Name"
          placeholder="John Doe"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        <TextInput
          label="Age"
          placeholder="25"
          value={age}
          onChangeText={setAge}
          error={errors.age}
          keyboardType="number-pad"
        />

        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: COLORS.neutral.textDark,
              marginBottom: 12,
            }}
          >
            Gender
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {["male", "female", "other"].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() =>
                  setGender(option as "male" | "female" | "other")
                }
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor:
                    gender === option ? COLORS.primary : COLORS.neutral.border,
                  backgroundColor:
                    gender === option ? "#f0f9ff" : "white",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color:
                      gender === option
                        ? COLORS.primary
                        : COLORS.neutral.text,
                    fontWeight: "600",
                    textTransform: "capitalize",
                  }}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TextInput
          label="Height (cm)"
          placeholder="170"
          value={height}
          onChangeText={setHeight}
          error={errors.height}
          keyboardType="decimal-pad"
        />

        <TextInput
          label="Weight (kg)"
          placeholder="70"
          value={weight}
          onChangeText={setWeight}
          error={errors.weight}
          keyboardType="decimal-pad"
        />

        <Button
          title="Continue"
          onPress={handleNext}
          loading={loading}
          fullWidth
          style={{ marginVertical: 16 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
