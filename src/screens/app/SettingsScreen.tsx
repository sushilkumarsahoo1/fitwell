import { Button, Card, LoadingSpinner, TextInput } from "@components/common";
import { ACTIVITY_LEVELS, COLORS, FITNESS_GOALS } from "@constants/index";
import { useAuth } from "@context/AuthContext";
import { useProfile } from "@hooks/useNutrition";
import {
    calculateDailyCalorieTarget,
    getGoalMetrics,
} from "@utils/nutritionUtils";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export const SettingsScreen: React.FC = () => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { data: currentProfile } = useProfile(user?.id || "");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "",
    heightCm: "",
    weightKg: "",
    dailyCalorieTarget: "",
    gender: "male" as "male" | "female" | "other",
    fitnessGoal: "maintain" as (typeof FITNESS_GOALS)[number]["id"],
    activityLevel: "moderate" as (typeof ACTIVITY_LEVELS)[number]["id"],
  });
  const [loading, setLoading] = useState(false);

  const profileData = currentProfile || profile;
  const parsedAge = parseInt(form.age, 10);
  const parsedHeight = parseFloat(form.heightCm);
  const parsedWeight = parseFloat(form.weightKg);

  const maintenanceFromProfile = profileData
    ? calculateDailyCalorieTarget(
        profileData.weight_kg,
        profileData.height_cm,
        profileData.age,
        profileData.gender,
        profileData.activity_level,
        "maintain",
      )
    : null;

  const goalFromProfile = maintenanceFromProfile
    ? getGoalMetrics(
        maintenanceFromProfile,
        profileData?.fitness_goal as (typeof FITNESS_GOALS)[number]["id"],
      ).calorieTarget
    : null;

  const maintenanceFromForm =
    profileData &&
    !Number.isNaN(parsedAge) &&
    !Number.isNaN(parsedHeight) &&
    !Number.isNaN(parsedWeight)
      ? calculateDailyCalorieTarget(
          parsedWeight,
          parsedHeight,
          parsedAge,
          form.gender,
          form.activityLevel,
          "maintain",
        )
      : null;

  const goalCalorieTarget = maintenanceFromForm
    ? getGoalMetrics(maintenanceFromForm, form.fitnessGoal).calorieTarget
    : goalFromProfile || profileData?.daily_calorie_target || 2000;

  useEffect(() => {
    if (!profileData) return;

    setForm({
      name: profileData.name || "",
      age: profileData.age?.toString() || "",
      heightCm: profileData.height_cm?.toString() || "",
      weightKg: profileData.weight_kg?.toString() || "",
      dailyCalorieTarget: (
        goalFromProfile ||
        profileData.daily_calorie_target ||
        goalCalorieTarget
      ).toString(),
      gender: profileData.gender,
      fitnessGoal:
        profileData.fitness_goal as (typeof FITNESS_GOALS)[number]["id"],
      activityLevel:
        profileData.activity_level as (typeof ACTIVITY_LEVELS)[number]["id"],
    });
  }, [profileData]);

  const handleSave = async () => {
    if (!profileData) return;
    setLoading(true);
    try {
      const age = parseInt(form.age, 10);
      const heightCm = parseFloat(form.heightCm);
      const weightKg = parseFloat(form.weightKg);
      const dailyTarget = parseInt(form.dailyCalorieTarget, 10);

      if (
        !form.name.trim() ||
        Number.isNaN(age) ||
        age <= 0 ||
        Number.isNaN(heightCm) ||
        heightCm <= 0 ||
        Number.isNaN(weightKg) ||
        weightKg <= 0 ||
        Number.isNaN(dailyTarget) ||
        dailyTarget <= 0
      ) {
        Alert.alert("Error", "Please enter valid profile values.");
        return;
      }

      await updateProfile({
        name: form.name.trim(),
        age,
        height_cm: heightCm,
        weight_kg: weightKg,
        daily_calorie_target: dailyTarget,
        gender: form.gender,
        fitness_goal: form.fitnessGoal,
        activity_level: form.activityLevel,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (!profileData) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: 20,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          color: COLORS.neutral.textDark,
          marginBottom: 20,
        }}
      >
        Settings
      </Text>

      {/* Profile Section */}
      <Card title="Profile Information" style={{ marginBottom: 16 }}>
        <View style={{ gap: 12 }}>
          <View>
            <Text
              style={{
                fontSize: 12,
                color: COLORS.neutral.text,
                marginBottom: 4,
              }}
            >
              Email
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.neutral.textDark,
                fontWeight: "600",
              }}
            >
              {user?.email}
            </Text>
          </View>

          <View>
            <Text
              style={{
                fontSize: 12,
                color: COLORS.neutral.text,
                marginBottom: 4,
              }}
            >
              Name
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.neutral.textDark,
                fontWeight: "600",
              }}
            >
              {profileData.name}
            </Text>
          </View>

          <View>
            <Text
              style={{
                fontSize: 12,
                color: COLORS.neutral.text,
                marginBottom: 4,
              }}
            >
              Daily Calorie Target
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.primary,
                fontWeight: "700",
              }}
            >
              {goalFromProfile ||
                profileData.daily_calorie_target ||
                goalCalorieTarget}{" "}
              cal
            </Text>
          </View>
        </View>
      </Card>

      {/* Edit Profile Section */}
      <Card title="Edit Profile" style={{ marginBottom: 16 }}>
        {isEditing ? (
          <View style={{ gap: 12 }}>
            <TextInput
              label="Name"
              placeholder="Your name"
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                label="Age"
                placeholder="e.g., 28"
                value={form.age}
                onChangeText={(text) => setForm({ ...form, age: text })}
                keyboardType="number-pad"
                style={{ flex: 1 }}
              />
              <TextInput
                label="Height (cm)"
                placeholder="e.g., 170"
                value={form.heightCm}
                onChangeText={(text) => setForm({ ...form, heightCm: text })}
                keyboardType="decimal-pad"
                style={{ flex: 1 }}
              />
            </View>

            <TextInput
              label="Weight (kg)"
              placeholder="e.g., 70"
              value={form.weightKg}
              onChangeText={(text) => setForm({ ...form, weightKg: text })}
              keyboardType="decimal-pad"
            />

            <TextInput
              label="Daily Calorie Target"
              placeholder={(
                goalFromProfile ||
                profileData.daily_calorie_target ||
                goalCalorieTarget
              ).toString()}
              value={form.dailyCalorieTarget}
              onChangeText={(text) =>
                setForm({ ...form, dailyCalorieTarget: text })
              }
              keyboardType="number-pad"
            />

            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 12, color: COLORS.neutral.textDark }}>
                Gender
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["male", "female", "other"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() =>
                      setForm({
                        ...form,
                        gender: option as "male" | "female" | "other",
                      })
                    }
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor:
                        form.gender === option
                          ? COLORS.primary
                          : COLORS.neutral.border,
                      backgroundColor:
                        form.gender === option ? "#f0f9ff" : "white",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        textAlign: "center",
                        color:
                          form.gender === option
                            ? COLORS.primary
                            : COLORS.neutral.text,
                      }}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 12, color: COLORS.neutral.textDark }}>
                Fitness Goal
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {FITNESS_GOALS.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    onPress={() => setForm({ ...form, fitnessGoal: goal.id })}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor:
                        form.fitnessGoal === goal.id
                          ? COLORS.primary
                          : COLORS.neutral.border,
                      backgroundColor:
                        form.fitnessGoal === goal.id ? "#f0f9ff" : "white",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color:
                          form.fitnessGoal === goal.id
                            ? COLORS.primary
                            : COLORS.neutral.text,
                      }}
                    >
                      {goal.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 12, color: COLORS.neutral.textDark }}>
                Activity Level
              </Text>
              <View style={{ gap: 8 }}>
                {ACTIVITY_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    onPress={() =>
                      setForm({ ...form, activityLevel: level.id })
                    }
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor:
                        form.activityLevel === level.id
                          ? COLORS.primary
                          : COLORS.neutral.border,
                      backgroundColor:
                        form.activityLevel === level.id ? "#f0f9ff" : "white",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color:
                          form.activityLevel === level.id
                            ? COLORS.primary
                            : COLORS.neutral.text,
                      }}
                    >
                      {level.label}
                    </Text>
                    <Text style={{ fontSize: 11, color: COLORS.neutral.text }}>
                      {level.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={loading}
              fullWidth
              style={{ marginTop: 8 }}
            />

            <Button
              title="Cancel"
              onPress={() => {
                setIsEditing(false);
              }}
              variant="secondary"
              fullWidth
            />
          </View>
        ) : (
          <Button
            title="Edit Profile"
            onPress={() => setIsEditing(true)}
            fullWidth
          />
        )}
      </Card>

      {/* Account Section */}
      <Card title="Account" style={{ marginBottom: 24 }}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="danger"
          fullWidth
        />
      </Card>
    </ScrollView>
  );
};
