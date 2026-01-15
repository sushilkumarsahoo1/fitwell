import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "@context/AuthContext";
import { useProfile } from "@hooks/useNutrition";
import { Card, Button, TextInput, LoadingSpinner } from "@components/common";
import { COLORS, FITNESS_GOALS, ACTIVITY_LEVELS } from "@constants/index";

export const SettingsScreen: React.FC = () => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { data: currentProfile } = useProfile(user?.id || "");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(currentProfile);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!editData) return;
    setLoading(true);
    try {
      await updateProfile(editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
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

  if (!currentProfile) {
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
              {currentProfile.name}
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
              {currentProfile.daily_calorie_target} cal
            </Text>
          </View>
        </View>
      </Card>

      {/* Edit Profile Section */}
      <Card title="Edit Profile" style={{ marginBottom: 16 }}>
        {isEditing ? (
          <View style={{ gap: 12 }}>
            <TextInput
              label="Daily Calorie Target"
              placeholder={currentProfile.daily_calorie_target.toString()}
              value={editData?.daily_calorie_target?.toString() || ""}
              onChangeText={(text) =>
                setEditData({
                  ...editData!,
                  daily_calorie_target: parseInt(text, 10),
                })
              }
              keyboardType="number-pad"
            />

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
                setEditData(currentProfile);
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
