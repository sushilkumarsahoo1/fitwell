import { Button, Card, LoadingSpinner, TextInput } from "@components/common";
import { COLORS, WORKOUT_TYPES } from "@constants/index";
import { useAuth } from "@context/AuthContext";
import {
    useAddWorkoutLog,
    useDailyWorkoutLogs,
    useDeleteWorkoutLog,
    useWorkoutTemplates,
} from "@hooks/useWorkouts";
import { useNavigation } from "@react-navigation/native";
import { formatDate } from "@utils/dateUtils";
import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface WorkoutLoggingScreenProps {}

export const WorkoutLoggingScreen: React.FC<WorkoutLoggingScreenProps> = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [date] = useState(formatDate(new Date()));
  const [selectedType, setSelectedType] = useState<string>("cardio");
  const [duration, setDuration] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [notes, setNotes] = useState("");
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: workoutLogs = [], isLoading: logsLoading } =
    useDailyWorkoutLogs(user?.id || "", date);
  const { data: templates = [], isLoading: templatesLoading } =
    useWorkoutTemplates(user?.id || "");
  const addWorkoutLog = useAddWorkoutLog();
  const deleteWorkoutLog = useDeleteWorkoutLog();

  const handleAddWorkout = async (workoutId: string) => {
    if (!user || !duration || !caloriesBurned) return;

    setLoading(true);
    try {
      await addWorkoutLog.mutateAsync({
        user_id: user.id,
        workout_id: workoutId,
        duration_minutes: parseInt(duration, 10),
        calories_burned: parseInt(caloriesBurned, 10),
        date,
        notes,
      } as any);

      setDuration("");
      setCaloriesBurned("");
      setNotes("");
      setShowWorkoutModal(false);
      navigation.navigate("Dashboard" as never);
    } catch (error) {
      console.error("Add workout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      await deleteWorkoutLog.mutateAsync(logId);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (logsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
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
          Log Workout
        </Text>

        {/* Workout Type Selector */}
        <Card title="Workout Type" style={{ marginBottom: 16 }}>
          <View style={{ gap: 8 }}>
            {WORKOUT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => setSelectedType(type.id)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor:
                    selectedType === type.id
                      ? COLORS.primary
                      : COLORS.neutral.border,
                  backgroundColor:
                    selectedType === type.id ? "#f0f9ff" : "white",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color:
                      selectedType === type.id
                        ? COLORS.primary
                        : COLORS.neutral.text,
                    fontWeight: "600",
                  }}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Today's Workouts */}
        <Card title="Today's Sessions" style={{ marginBottom: 16 }}>
          {workoutLogs.length === 0 ? (
            <Text
              style={{
                fontSize: 12,
                color: COLORS.neutral.text,
                textAlign: "center",
                paddingVertical: 12,
              }}
            >
              No workouts logged
            </Text>
          ) : (
            workoutLogs.map((log) => (
              <View
                key={log.id}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.neutral.border,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: COLORS.neutral.textDark,
                    }}
                  >
                    {log.workouts?.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: COLORS.neutral.text,
                      marginTop: 2,
                    }}
                  >
                    {log.duration_minutes} min • {log.calories_burned} cal
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteLog(log.id)}
                  style={{
                    paddingHorizontal: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: COLORS.danger,
                      fontWeight: "600",
                    }}
                  >
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </Card>

        <Button
          title="Add Workout"
          onPress={() => setShowWorkoutModal(true)}
          fullWidth
          style={{ marginTop: 24 }}
        />
      </ScrollView>

      {/* Workout Selection Modal */}
      <Modal
        visible={showWorkoutModal}
        onRequestClose={() => setShowWorkoutModal(false)}
        animationType="slide"
      >
        <View style={{ flex: 1, paddingTop: 40 }}>
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: COLORS.neutral.textDark,
                }}
              >
                Select Workout
              </Text>
              <TouchableOpacity onPress={() => setShowWorkoutModal(false)}>
                <Text style={{ fontSize: 16, color: COLORS.primary }}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              label="Duration (minutes)"
              placeholder="30"
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
            />

            <TextInput
              label="Calories Burned"
              placeholder="200"
              value={caloriesBurned}
              onChangeText={setCaloriesBurned}
              keyboardType="number-pad"
            />

            <TextInput
              label="Notes (Optional)"
              placeholder="Add notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            {/* Workout List */}
            {templatesLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: COLORS.neutral.textDark,
                    marginBottom: 12,
                    marginTop: 12,
                  }}
                >
                  Available Workouts
                </Text>
                {templates.map((workout) => (
                  <TouchableOpacity
                    key={workout.id}
                    onPress={() => handleAddWorkout(workout.id)}
                    style={{
                      backgroundColor: "white",
                      borderWidth: 1,
                      borderColor: COLORS.neutral.border,
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: COLORS.neutral.textDark,
                      }}
                    >
                      {workout.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: COLORS.neutral.text,
                        marginTop: 2,
                      }}
                    >
                      {workout.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            <Button
              title="Close"
              onPress={() => setShowWorkoutModal(false)}
              variant="secondary"
              fullWidth
              style={{ marginTop: 20 }}
            />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};
