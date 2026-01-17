/**
 * Utility Functions: Workout handling
 *
 * - Calorie burn calculation using MET (Metabolic Equivalent) values
 * - Duration tracking and averaging
 * - Workout statistics
 * - Set/rep calculations for strength training
 */


/**
 * Calculate calories burned based on activity MET value
 *
 * Formula: Calories = MET × Weight(kg) × Duration(hours)
 *
 * MET = Metabolic Equivalent of Task
 * 1 MET = energy at rest = ~1 kcal/kg/hour
 *
 * @param met - MET value of activity
 * @param weightKg - User's weight in kilograms
 * @param durationMinutes - Duration of activity in minutes
 * @returns Estimated calories burned
 */
export function calculateCaloriesBurned(
  met: number,
  weightKg: number,
  durationMinutes: number,
): number {
  // Convert minutes to hours
  const durationHours = durationMinutes / 60;

  // Apply MET formula
  const caloriesBurned = met * weightKg * durationHours;

  // Round to nearest whole number
  return Math.round(caloriesBurned);
}

/**
 * Calculate calories burned for strength training
 * More complex: factors in intensity, exercise type, and rest periods
 *
 * @param baseCaloriesPerMinute - Base calories per minute (5-8 for strength)
 * @param durationMinutes - Total workout duration including rest
 * @param intensityMultiplier - 0.7 (light) to 1.5 (intense)
 * @returns Estimated calories burned
 */
export function calculateStrengthCalories(
  baseCaloriesPerMinute: number = 6,
  durationMinutes: number,
  intensityMultiplier: number = 1.0,
): number {
  const calories =
    baseCaloriesPerMinute * durationMinutes * intensityMultiplier;
  return Math.round(calories);
}

/**
 * Calculate rest period between sets
 * Generally 30-90s between sets
 *
 * @param sets - Number of sets
 * @param reps - Reps per set
 * @param exerciseType - Type of exercise (determines baseline rest)
 * @returns Rest time in seconds
 */
export function calculateRestPeriod(
  sets: number,
  reps: number,
  exerciseType: "compound" | "isolation" = "compound",
): number {
  // Compound exercises require longer rest (heavy weight)
  // Isolation exercises need less rest
  const baseRest = exerciseType === "compound" ? 120 : 60; // seconds

  // Adjust based on reps (higher reps = shorter rest usually)
  if (reps > 12) return baseRest * 0.8;
  if (reps < 6) return baseRest * 1.3;

  return baseRest;
}

/**
 * Estimate total workout duration
 *
 * @param sets - Total sets across all exercises
 * @param reps - Average reps per set
 * @param secsPerRep - Estimated time per rep (typically 2-3 seconds)
 * @param restBetweenSets - Rest time in seconds (typical: 60-90)
 * @returns Total estimated duration in minutes
 */
export function estimateWorkoutDuration(
  sets: number,
  reps: number,
  secsPerRep: number = 2.5,
  restBetweenSets: number = 90,
): number {
  // Time doing reps
  const workTime = (sets * reps * secsPerRep) / 60;

  // Time resting (sets - 1 because no rest after last set)
  const restTime = ((sets - 1) * restBetweenSets) / 60;

  // Add warm-up and cool-down (5 mins each)
  const totalTime = workTime + restTime + 10;

  return Math.round(totalTime * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate volume (sets × reps × weight) - measure of work performed
 * Used to track progress in strength training
 *
 * @param sets - Number of sets
 * @param reps - Reps per set
 * @param weightKg - Weight lifted in kilograms
 * @returns Total volume in kg
 */
export function calculateVolume(
  sets: number,
  reps: number,
  weightKg: number,
): number {
  return sets * reps * weightKg;
}

/**
 * Calculate average weight across multiple exercises
 *
 * @param exercises - Array of {weightKg, sets, reps}
 * @returns Average weight lifted
 */
export function calculateAverageWeight(
  exercises: { weightKg: number; sets: number; reps: number }[],
): number {
  const totalVolume = exercises.reduce(
    (sum, ex) => sum + calculateVolume(ex.sets, ex.reps, ex.weightKg),
    0,
  );
  const totalReps = exercises.reduce((sum, ex) => sum + ex.sets * ex.reps, 0);

  if (totalReps === 0) return 0;
  return Math.round((totalVolume / totalReps) * 10) / 10;
}

/**
 * Calculate one-rep max (1RM) estimate from reps and weight
 * Using Epley formula: 1RM = weight × (1 + reps/30)
 *
 * @param weightKg - Weight lifted
 * @param reps - Number of reps performed
 * @returns Estimated 1RM in kg
 */
export function estimate1RM(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  const oneRM = weightKg * (1 + reps / 30);
  return Math.round(oneRM * 10) / 10;
}

/**
 * Workout intensity classification
 */
export type WorkoutIntensity = "light" | "moderate" | "vigorous";

/**
 * Classify workout intensity based on MET value
 *
 * @param met - MET value
 * @returns Intensity classification
 */
export function classifyIntensity(met: number): WorkoutIntensity {
  if (met < 3) return "light";
  if (met < 6) return "moderate";
  return "vigorous";
}

/**
 * Calculate weekly calorie deficit/surplus
 *
 * @param dailyCaloriesConsumed - Average daily intake
 * @param dailyCalorieTarget - Target calorie intake
 * @param weeklyCaloriesBurned - Total calories burned in workouts during week
 * @returns Weekly balance (negative = deficit, positive = surplus)
 */
export function calculateWeeklyBalance(
  dailyCaloriesConsumed: number,
  dailyCalorieTarget: number,
  weeklyCaloriesBurned: number,
): number {
  // Net calories for the week
  const dailyDeficit = dailyCalorieTarget - dailyCaloriesConsumed;
  const weeklyDeficit = dailyDeficit * 7;

  // Adjust for exercise (burning calories is a deficit)
  return weeklyDeficit - weeklyCaloriesBurned;
}

/**
 * Format workout duration nicely
 *
 * @param durationMinutes - Duration in minutes
 * @returns Formatted string (e.g., "1h 30m" or "45m")
 */
export function formatDuration(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

/**
 * Calculate workout frequency (sessions per week)
 *
 * @param workoutLogsLast7Days - Array of workout logs from last 7 days
 * @returns Number of workouts per week
 */
export function calculateFrequency(workoutLogsLast7Days: any[]): number {
  return workoutLogsLast7Days.length;
}

/**
 * Calculate total duration (sum of all workouts)
 *
 * @param workoutLogs - Array of workout logs with duration_minutes
 * @returns Total duration in minutes
 */
export function calculateTotalDuration(
  workoutLogs: { duration_minutes: number }[],
): number {
  return workoutLogs.reduce((sum, log) => sum + log.duration_minutes, 0);
}

/**
 * Calculate average workout duration
 *
 * @param workoutLogs - Array of workout logs
 * @returns Average duration in minutes
 */
export function calculateAverageDuration(
  workoutLogs: { duration_minutes: number }[],
): number {
  if (workoutLogs.length === 0) return 0;
  const total = calculateTotalDuration(workoutLogs);
  return Math.round((total / workoutLogs.length) * 10) / 10;
}

/**
 * Calculate total calories burned from multiple workouts
 *
 * @param workoutLogs - Array of workout logs with calories_burned
 * @returns Total calories burned
 */
export function calculateTotalCaloriesBurned(
  workoutLogs: { calories_burned: number }[],
): number {
  return workoutLogs.reduce((sum, log) => sum + log.calories_burned, 0);
}

/**
 * Validate workout input
 *
 * @param duration - Duration in minutes
 * @param sets - Number of sets (for strength)
 * @param reps - Reps per set (for strength)
 * @param weight - Weight in kg (for strength)
 * @returns Validation result
 */
export function validateWorkoutInput(
  duration?: number,
  sets?: number,
  reps?: number,
  weight?: number,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (duration !== undefined && (duration <= 0 || duration > 1440)) {
    errors.push("Duration must be between 1 and 1440 minutes");
  }

  if (sets !== undefined && (sets < 1 || sets > 100)) {
    errors.push("Sets must be between 1 and 100");
  }

  if (reps !== undefined && (reps < 1 || reps > 100)) {
    errors.push("Reps must be between 1 and 100");
  }

  if (weight !== undefined && (weight < 0 || weight > 500)) {
    errors.push("Weight must be between 0 and 500 kg");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Exercise form cues (for future expansion)
 */
export const FORM_CUES: { [key: string]: string[] } = {
  bench_press: [
    "Feet flat on floor",
    "Shoulders pinned to bench",
    "Lower to chest",
    "Press up",
  ],
  squat: [
    "Feet shoulder-width apart",
    "Knees track over toes",
    "Lower until parallel",
    "Drive through heels",
  ],
  deadlift: [
    "Back straight",
    "Chest up",
    "Hips not too high",
    "Drive through heels",
  ],
  pull_ups: ["Chest to bar", "Full stretch at bottom", "Controlled descent"],
};

/**
 * Get form cues for exercise
 */
export function getFormCues(exerciseId: string): string[] {
  return FORM_CUES[exerciseId] || [];
}
