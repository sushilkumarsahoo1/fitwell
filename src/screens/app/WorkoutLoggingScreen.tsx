import { Button, Card, LoadingSpinner, TextInput } from "@components/common";
import {
    CARDIO_ACTIVITIES,
    EXERCISE_CATEGORIES,
    getExercisesByCategory,
    HIIT_WORKOUTS,
    STRENGTH_EXERCISES,
    YOGA_STYLES,
} from "@constants/exercises";
import { COLORS } from "@constants/index";
import { useAuth } from "@context/AuthContext";
import {
    useAddCardioWorkout,
    useAddHIITWorkout,
    useAddStrengthWorkout,
    useAddWorkoutLog,
    useAddYogaWorkout,
    useDailyWorkoutLogs,
    useDeleteWorkoutLog,
    useWorkoutTemplates,
} from "@hooks/useWorkouts";
import { useNavigation } from "@react-navigation/native";
import { formatDate } from "@utils/dateUtils";
import { formatDuration } from "@utils/workoutUtils";
import React, { useMemo, useState } from "react";
import { Alert, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface WorkoutLoggingScreenProps {}

type WorkoutMode = "quick" | "strength" | "cardio" | "yoga" | "hiit";

export const WorkoutLoggingScreen: React.FC<WorkoutLoggingScreenProps> = () => {
  const navigation = useNavigation();
  const { user, profile } = useAuth();
  const [date] = useState(formatDate(new Date()));
  const [selectedType, setSelectedType] = useState<string>("cardio");
  const [workoutMode, setWorkoutMode] = useState<WorkoutMode>("quick");
  const [duration, setDuration] = useState("30");
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [notes, setNotes] = useState("");
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Strength training state
  const [selectedExerciseCategory, setSelectedExerciseCategory] =
    useState("chest");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("0");

  // Cardio state
  const [selectedCardioActivity, setSelectedCardioActivity] = useState<
    string | null
  >(null);
  const [distance, setDistance] = useState("");
  const [cardioIntensity, setCardioIntensity] = useState<
    "light" | "moderate" | "vigorous"
  >("moderate");

  // Yoga state
  const [selectedYogaStyle, setSelectedYogaStyle] = useState<string | null>(
    null,
  );
  const [yogaDifficulty, setYogaDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("beginner");

  // HIIT state
  const [selectedHIIT, setSelectedHIIT] = useState<string | null>(null);
  const [rounds, setRounds] = useState("4");
  const [hiitExercises, setHiitExercises] = useState("");

  // Hooks
  const { data: workoutLogs = [], isLoading: logsLoading } =
    useDailyWorkoutLogs(user?.id || "", date);
  const { data: templates = [] } = useWorkoutTemplates(user?.id || "");
  const addWorkoutLog = useAddWorkoutLog();
  const addStrengthWorkout = useAddStrengthWorkout();
  const addCardioWorkout = useAddCardioWorkout();
  const addYogaWorkout = useAddYogaWorkout();
  const addHIITWorkout = useAddHIITWorkout();
  const deleteWorkoutLog = useDeleteWorkoutLog();

  // Memoized exercise list
  const exercisesByCategory = useMemo(
    () => getExercisesByCategory(selectedExerciseCategory),
    [selectedExerciseCategory],
  );

  /**
   * Handle quick workout (backward compatibility with old system)
   */
  const handleAddQuickWorkout = async (workoutId: string) => {
    if (!user || !duration || !caloriesBurned) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await addWorkoutLog.mutateAsync({
        user_id: user.id,
        workout_id: workoutId,
        duration_minutes: parseInt(duration, 10),
        calories_burned: parseInt(caloriesBurned, 10),
        date,
        notes: notes || undefined,
      } as any);

      setDuration("30");
      setCaloriesBurned("");
      setNotes("");
      setShowWorkoutModal(false);
      Alert.alert("Success", "Workout logged!");
    } catch (error) {
      console.error("Error logging workout:", error);
      Alert.alert("Error", "Failed to log workout");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle strength training workout
   */
  const handleAddStrengthWorkout = async () => {
    if (!user || !selectedExercise || !sets || !reps) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const exercise = STRENGTH_EXERCISES.find(
      (ex) => ex.id === selectedExercise,
    );
    if (!exercise || !profile) {
      Alert.alert("Error", "Exercise not found");
      return;
    }

    setLoading(true);
    try {
      await addStrengthWorkout.mutateAsync({
        userId: user.id,
        exerciseId: selectedExercise,
        exerciseName: exercise.name,
        sets: parseInt(sets, 10),
        reps: parseInt(reps, 10),
        weightKg: parseFloat(weight) || 0,
        date,
        notes: notes || undefined,
        userWeight: profile.weight_kg,
      });

      // Reset form
      setSelectedExercise(null);
      setSets("3");
      setReps("10");
      setWeight("0");
      setNotes("");
      setShowWorkoutModal(false);
      Alert.alert("Success", "Strength workout logged!");
    } catch (error) {
      console.error("Error logging strength workout:", error);
      Alert.alert("Error", "Failed to log strength workout");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle cardio workout
   */
  const handleAddCardioWorkout = async () => {
    if (!user || !selectedCardioActivity || !duration) {
      Alert.alert("Error", "Please select activity and duration");
      return;
    }

    const activity = CARDIO_ACTIVITIES.find(
      (a) => a.id === selectedCardioActivity,
    );
    if (!activity) {
      Alert.alert("Error", "Activity not found");
      return;
    }

    setLoading(true);
    try {
      await addCardioWorkout.mutateAsync({
        userId: user.id,
        activityId: selectedCardioActivity,
        activityName: activity.name,
        durationMinutes: parseInt(duration, 10),
        distanceKm: distance ? parseFloat(distance) : undefined,
        intensity: cardioIntensity,
        date,
        notes: notes || undefined,
      });

      // Reset form
      setSelectedCardioActivity(null);
      setDuration("30");
      setDistance("");
      setCardioIntensity("moderate");
      setNotes("");
      setShowWorkoutModal(false);
      Alert.alert("Success", "Cardio workout logged!");
    } catch (error) {
      console.error("Error logging cardio workout:", error);
      Alert.alert("Error", "Failed to log cardio workout");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle yoga workout
   */
  const handleAddYogaWorkout = async () => {
    if (!user || !selectedYogaStyle || !duration) {
      Alert.alert("Error", "Please select yoga style and duration");
      return;
    }

    const style = YOGA_STYLES.find((s) => s.id === selectedYogaStyle);
    if (!style) {
      Alert.alert("Error", "Yoga style not found");
      return;
    }

    setLoading(true);
    try {
      await addYogaWorkout.mutateAsync({
        userId: user.id,
        styleId: selectedYogaStyle,
        styleName: style.name,
        durationMinutes: parseInt(duration, 10),
        difficulty: yogaDifficulty,
        date,
        notes: notes || undefined,
      });

      // Reset form
      setSelectedYogaStyle(null);
      setDuration("30");
      setYogaDifficulty("beginner");
      setNotes("");
      setShowWorkoutModal(false);
      Alert.alert("Success", "Yoga workout logged!");
    } catch (error) {
      console.error("Error logging yoga workout:", error);
      Alert.alert("Error", "Failed to log yoga workout");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle HIIT workout
   */
  const handleAddHIITWorkout = async () => {
    if (!user || !selectedHIIT || !duration) {
      Alert.alert("Error", "Please select HIIT type and duration");
      return;
    }

    const hiit = HIIT_WORKOUTS.find((h) => h.id === selectedHIIT);
    if (!hiit) {
      Alert.alert("Error", "HIIT workout not found");
      return;
    }

    setLoading(true);
    try {
      await addHIITWorkout.mutateAsync({
        userId: user.id,
        workoutId: selectedHIIT,
        workoutName: hiit.name,
        durationMinutes: parseInt(duration, 10),
        rounds: rounds ? parseInt(rounds, 10) : undefined,
        exercises: hiitExercises || undefined,
        intensity: "vigorous",
        date,
        notes: notes || undefined,
      });

      // Reset form
      setSelectedHIIT(null);
      setDuration("30");
      setRounds("4");
      setHiitExercises("");
      setNotes("");
      setShowWorkoutModal(false);
      Alert.alert("Success", "HIIT workout logged!");
    } catch (error) {
      console.error("Error logging HIIT workout:", error);
      Alert.alert("Error", "Failed to log HIIT workout");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle delete
   */
  const handleDeleteLog = async (logId: string) => {
    try {
      await deleteWorkoutLog.mutateAsync(logId);
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Failed to delete workout");
    }
  };

  // Calculate total workout stats for today
  const todayStats = useMemo(() => {
    return {
      totalWorkouts: workoutLogs.length,
      totalDuration: workoutLogs.reduce(
        (sum, log) => sum + (log.duration_minutes || 0),
        0,
      ),
      totalCalories: workoutLogs.reduce(
        (sum, log) => sum + (log.calories_burned || 0),
        0,
      ),
    };
  }, [workoutLogs]);

  if (logsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f5f5f5" }}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 200,
        }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
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

        {/* Today's Stats */}
        <Card title="Today's Activity" style={{ marginBottom: 16 }}>
          <View style={{ gap: 8 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 12, color: COLORS.neutral.text }}>
                Workouts:
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: COLORS.primary,
                }}
              >
                {todayStats.totalWorkouts}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 12, color: COLORS.neutral.text }}>
                Duration:
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: COLORS.success,
                }}
              >
                {formatDuration(todayStats.totalDuration)}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 12, color: COLORS.neutral.text }}>
                Calories Burned:
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: COLORS.warning,
                }}
              >
                {todayStats.totalCalories}
              </Text>
            </View>
          </View>
        </Card>

        {/* Workout Type Selector */}
        <Card title="Workout Type" style={{ marginBottom: 16 }}>
          <View style={{ gap: 8 }}>
            {[
              { id: "strength", label: "Strength Training", icon: "💪" },
              { id: "cardio", label: "Cardio", icon: "🏃" },
              { id: "yoga", label: "Yoga", icon: "🧘" },
              { id: "hiit", label: "HIIT", icon: "⚡" },
            ].map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => {
                  setSelectedType(type.id);
                  setWorkoutMode(type.id as WorkoutMode);
                }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
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
                  {type.icon} {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Today's Workouts */}
        <Card title="Today's Workouts" style={{ marginBottom: 16 }}>
          {workoutLogs.length === 0 ? (
            <Text
              style={{
                fontSize: 12,
                color: COLORS.neutral.text,
                textAlign: "center",
                paddingVertical: 12,
              }}
            >
              No workouts logged yet
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
                    {log.exercise_name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: COLORS.neutral.text,
                      marginTop: 2,
                    }}
                  >
                    {formatDuration(log.duration_minutes)} •{" "}
                    {log.calories_burned} cal
                    {log.weight_kg ? ` • ${log.weight_kg}kg` : ""}
                    {log.sets && log.reps ? ` • ${log.sets}×${log.reps}` : ""}
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
          title={`Log ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Workout`}
          onPress={() => setShowWorkoutModal(true)}
          fullWidth
          style={{ marginTop: 24 }}
        />
      </ScrollView>

      {/* Workout Modal */}
      <Modal
        visible={showWorkoutModal}
        onRequestClose={() => setShowWorkoutModal(false)}
        animationType="slide"
      >
        <View style={{ flex: 1, paddingTop: 40 }}>
          <ScrollView
            scrollEnabled={true}
            nestedScrollEnabled={true}
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
                Log{" "}
                {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
              </Text>
              <TouchableOpacity onPress={() => setShowWorkoutModal(false)}>
                <Text style={{ fontSize: 16, color: COLORS.primary }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* STRENGTH TRAINING */}
            {selectedType === "strength" && (
              <>
                {/* Exercise Category */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: COLORS.neutral.textDark,
                      marginBottom: 8,
                    }}
                  >
                    Muscle Group
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginHorizontal: -16, paddingHorizontal: 16 }}
                  >
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {Object.entries(EXERCISE_CATEGORIES).map(
                        ([catId, catLabel]) => (
                          <TouchableOpacity
                            key={catId}
                            onPress={() => setSelectedExerciseCategory(catId)}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              borderRadius: 8,
                              borderWidth: 2,
                              borderColor:
                                selectedExerciseCategory === catId
                                  ? COLORS.primary
                                  : COLORS.neutral.border,
                              backgroundColor:
                                selectedExerciseCategory === catId
                                  ? "#f0f9ff"
                                  : "white",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 12,
                                color:
                                  selectedExerciseCategory === catId
                                    ? COLORS.primary
                                    : COLORS.neutral.text,
                                fontWeight: "600",
                              }}
                            >
                              {catLabel}
                            </Text>
                          </TouchableOpacity>
                        ),
                      )}
                    </View>
                  </ScrollView>
                </View>

                {/* Exercise Selection */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: COLORS.neutral.textDark,
                      marginBottom: 8,
                    }}
                  >
                    Exercise
                  </Text>
                  {exercisesByCategory.map((exercise) => (
                    <TouchableOpacity
                      key={exercise.id}
                      onPress={() => setSelectedExercise(exercise.id)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        borderRadius: 8,
                        borderWidth: selectedExercise === exercise.id ? 2 : 1,
                        borderColor:
                          selectedExercise === exercise.id
                            ? COLORS.primary
                            : COLORS.neutral.border,
                        backgroundColor:
                          selectedExercise === exercise.id
                            ? "#f0f9ff"
                            : "white",
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color:
                            selectedExercise === exercise.id
                              ? COLORS.primary
                              : COLORS.neutral.textDark,
                        }}
                      >
                        {exercise.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Sets, Reps, Weight */}
                <View
                  style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}
                >
                  <TextInput
                    label="Sets"
                    placeholder="3"
                    value={sets}
                    onChangeText={setSets}
                    keyboardType="number-pad"
                    style={{ flex: 1 }}
                  />
                  <TextInput
                    label="Reps"
                    placeholder="10"
                    value={reps}
                    onChangeText={setReps}
                    keyboardType="number-pad"
                    style={{ flex: 1 }}
                  />
                  <TextInput
                    label="Weight (kg)"
                    placeholder="0"
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    style={{ flex: 1 }}
                  />
                </View>

                <TextInput
                  label="Notes"
                  placeholder="Optional notes"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  style={{ marginBottom: 16 }}
                />

                <Button
                  title="Log Strength Workout"
                  onPress={handleAddStrengthWorkout}
                  disabled={loading || !selectedExercise}
                  fullWidth
                />
              </>
            )}

            {/* CARDIO */}
            {selectedType === "cardio" && (
              <>
                {/* Activity Selection */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: COLORS.neutral.textDark,
                      marginBottom: 8,
                    }}
                  >
                    Activity
                  </Text>
                  <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                    {CARDIO_ACTIVITIES.map((activity) => (
                      <TouchableOpacity
                        key={activity.id}
                        onPress={() => setSelectedCardioActivity(activity.id)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderRadius: 8,
                          borderWidth:
                            selectedCardioActivity === activity.id ? 2 : 1,
                          borderColor:
                            selectedCardioActivity === activity.id
                              ? COLORS.primary
                              : COLORS.neutral.border,
                          backgroundColor:
                            selectedCardioActivity === activity.id
                              ? "#f0f9ff"
                              : "white",
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color:
                              selectedCardioActivity === activity.id
                                ? COLORS.primary
                                : COLORS.neutral.textDark,
                          }}
                        >
                          {activity.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Duration, Distance, Intensity */}
                <TextInput
                  label="Duration (minutes)"
                  placeholder="30"
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="number-pad"
                  style={{ marginBottom: 12 }}
                />

                <TextInput
                  label="Distance (km) - Optional"
                  placeholder="5"
                  value={distance}
                  onChangeText={setDistance}
                  keyboardType="decimal-pad"
                  style={{ marginBottom: 12 }}
                />

                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: COLORS.neutral.textDark,
                      marginBottom: 8,
                    }}
                  >
                    Intensity
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {(["light", "moderate", "vigorous"] as const).map(
                      (intensity) => (
                        <TouchableOpacity
                          key={intensity}
                          onPress={() => setCardioIntensity(intensity)}
                          style={{
                            flex: 1,
                            paddingVertical: 8,
                            borderRadius: 8,
                            borderWidth: 2,
                            borderColor:
                              cardioIntensity === intensity
                                ? COLORS.primary
                                : COLORS.neutral.border,
                            backgroundColor:
                              cardioIntensity === intensity
                                ? "#f0f9ff"
                                : "white",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              color:
                                cardioIntensity === intensity
                                  ? COLORS.primary
                                  : COLORS.neutral.text,
                              fontWeight: "600",
                              textAlign: "center",
                            }}
                          >
                            {intensity.charAt(0).toUpperCase() +
                              intensity.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                </View>

                <TextInput
                  label="Notes"
                  placeholder="Optional notes"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  style={{ marginBottom: 16 }}
                />

                <Button
                  title="Log Cardio Workout"
                  onPress={handleAddCardioWorkout}
                  disabled={loading || !selectedCardioActivity}
                  fullWidth
                />
              </>
            )}

            {/* YOGA */}
            {selectedType === "yoga" && (
              <>
                {/* Yoga Style Selection */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: COLORS.neutral.textDark,
                      marginBottom: 8,
                    }}
                  >
                    Yoga Style
                  </Text>
                  {YOGA_STYLES.map((style) => (
                    <TouchableOpacity
                      key={style.id}
                      onPress={() => setSelectedYogaStyle(style.id)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        borderRadius: 8,
                        borderWidth: selectedYogaStyle === style.id ? 2 : 1,
                        borderColor:
                          selectedYogaStyle === style.id
                            ? COLORS.primary
                            : COLORS.neutral.border,
                        backgroundColor:
                          selectedYogaStyle === style.id ? "#f0f9ff" : "white",
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color:
                            selectedYogaStyle === style.id
                              ? COLORS.primary
                              : COLORS.neutral.textDark,
                        }}
                      >
                        {style.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  label="Duration (minutes)"
                  placeholder="30"
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="number-pad"
                  style={{ marginBottom: 12 }}
                />

                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: COLORS.neutral.textDark,
                      marginBottom: 8,
                    }}
                  >
                    Difficulty
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {(["beginner", "intermediate", "advanced"] as const).map(
                      (level) => (
                        <TouchableOpacity
                          key={level}
                          onPress={() => setYogaDifficulty(level)}
                          style={{
                            flex: 1,
                            paddingVertical: 8,
                            borderRadius: 8,
                            borderWidth: 2,
                            borderColor:
                              yogaDifficulty === level
                                ? COLORS.primary
                                : COLORS.neutral.border,
                            backgroundColor:
                              yogaDifficulty === level ? "#f0f9ff" : "white",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              color:
                                yogaDifficulty === level
                                  ? COLORS.primary
                                  : COLORS.neutral.text,
                              fontWeight: "600",
                              textAlign: "center",
                            }}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                </View>

                <TextInput
                  label="Notes"
                  placeholder="Optional notes"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  style={{ marginBottom: 16 }}
                />

                <Button
                  title="Log Yoga Session"
                  onPress={handleAddYogaWorkout}
                  disabled={loading || !selectedYogaStyle}
                  fullWidth
                />
              </>
            )}

            {/* HIIT */}
            {selectedType === "hiit" && (
              <>
                {/* HIIT Workout Selection */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: COLORS.neutral.textDark,
                      marginBottom: 8,
                    }}
                  >
                    HIIT Type
                  </Text>
                  {HIIT_WORKOUTS.map((workout) => (
                    <TouchableOpacity
                      key={workout.id}
                      onPress={() => setSelectedHIIT(workout.id)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        borderRadius: 8,
                        borderWidth: selectedHIIT === workout.id ? 2 : 1,
                        borderColor:
                          selectedHIIT === workout.id
                            ? COLORS.primary
                            : COLORS.neutral.border,
                        backgroundColor:
                          selectedHIIT === workout.id ? "#f0f9ff" : "white",
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color:
                            selectedHIIT === workout.id
                              ? COLORS.primary
                              : COLORS.neutral.textDark,
                        }}
                      >
                        {workout.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  label="Duration (minutes)"
                  placeholder="20"
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="number-pad"
                  style={{ marginBottom: 12 }}
                />

                <TextInput
                  label="Rounds"
                  placeholder="4"
                  value={rounds}
                  onChangeText={setRounds}
                  keyboardType="number-pad"
                  style={{ marginBottom: 12 }}
                />

                <TextInput
                  label="Exercises"
                  placeholder="e.g., burpees, mountain climbers"
                  value={hiitExercises}
                  onChangeText={setHiitExercises}
                  multiline
                  style={{ marginBottom: 12 }}
                />

                <TextInput
                  label="Notes"
                  placeholder="Optional notes"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  style={{ marginBottom: 16 }}
                />

                <Button
                  title="Log HIIT Workout"
                  onPress={handleAddHIITWorkout}
                  disabled={loading || !selectedHIIT}
                  fullWidth
                />
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
