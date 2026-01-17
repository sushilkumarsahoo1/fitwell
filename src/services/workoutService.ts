/**
 * Workout Service: Local workout logging with exercise database
 *
 * This service provides complete workout logging functionality:
 * - Strength training (sets, reps, weight tracking)
 * - Cardio (duration, distance, intensity)
 * - Yoga (duration, style)
 * - HIIT (intervals, duration)
 * - Calorie burn estimation using MET values
 * - No external API needed - all local
 */

import {
    findCardioActivity,
    findExercise,
    findHIITWorkout,
    findYogaStyle,
} from "../constants/exercises";
import {
    calculateCaloriesBurned,
    calculateStrengthCalories,
} from "../utils/workoutUtils";
import { supabase } from "./supabase";

/**
 * Simple UUID v4 generator for React Native compatibility
 * Replaces uuid library which doesn't work well with React Native
 */
function generateUUID(): string {
  let id = "";
  const characters = "0123456789abcdef";
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      id += "-";
    } else {
      id += characters[Math.floor(Math.random() * 16)];
    }
  }
  // Ensure version 4 and variant bits
  id =
    id.substring(0, 14) +
    "4" +
    id.substring(15, 19) +
    ["8", "9", "a", "b"][Math.floor(Math.random() * 4)] +
    id.substring(20);
  return id;
}

/**
 * Strength workout entry
 */
export interface StrengthWorkout {
  user_id: string;
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight_kg: number;
  duration_minutes?: number;
  notes?: string;
  date: string; // YYYY-MM-DD
}

/**
 * Cardio workout entry
 */
export interface CardioWorkout {
  user_id: string;
  activity_id: string;
  activity_name: string;
  duration_minutes: number;
  distance_km?: number;
  intensity?: "light" | "moderate" | "vigorous";
  notes?: string;
  date: string; // YYYY-MM-DD
}

/**
 * Yoga workout entry
 */
export interface YogaWorkout {
  user_id: string;
  style_id: string;
  style_name: string;
  duration_minutes: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
  notes?: string;
  date: string; // YYYY-MM-DD
}

/**
 * HIIT workout entry
 */
export interface HIITWorkout {
  user_id: string;
  workout_id: string;
  workout_name: string;
  duration_minutes: number;
  rounds?: number;
  exercises?: string;
  intensity?: "light" | "moderate" | "vigorous";
  notes?: string;
  date: string; // YYYY-MM-DD
}

/**
 * Complete workout log entry (database model)
 */
export interface WorkoutLogEntry {
  user_id: string;
  workout_id?: string; // Optional - will be generated if not provided
  type: "strength" | "cardio" | "yoga" | "hiit";
  exercise_name: string;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  duration_minutes: number;
  distance_km?: number;
  intensity?: string;
  calories_burned: number;
  notes?: string;
  date: string; // YYYY-MM-DD
}

/**
 * Add strength training workout
 *
 * @param workout - Strength workout data
 * @param userWeight - User's weight in kg (for calorie calculation)
 * @returns Database response
 */
export async function addStrengthWorkout(
  workout: StrengthWorkout,
  userWeight: number,
): Promise<any> {
  try {
    // Validate input
    if (
      !workout.exercise_id ||
      workout.sets < 1 ||
      workout.reps < 1 ||
      workout.weight_kg < 0
    ) {
      throw new Error("Invalid strength workout data");
    }

    // Get exercise info for MET value
    const exercise = findExercise(workout.exercise_id);
    const met = exercise?.met || 6.0; // Default to 6.0 if not found

    // Calculate duration if not provided (average 2-3 mins per set including rest)
    const durationMinutes = workout.duration_minutes || workout.sets * 3;

    // Calculate calories burned using MET formula
    // MET value for strength training varies; use intensity multiplier
    const caloriesBurned = calculateStrengthCalories(
      met / 60, // Convert MET to per-minute calorie burn
      durationMinutes,
      1.0,
    );

    // Create log entry
    const logEntry: WorkoutLogEntry = {
      user_id: workout.user_id,
      workout_id: generateUUID(), // Generate unique ID for this workout log
      type: "strength",
      exercise_name: workout.exercise_name,
      sets: workout.sets,
      reps: workout.reps,
      weight_kg: workout.weight_kg,
      duration_minutes: durationMinutes,
      calories_burned: caloriesBurned,
      notes: workout.notes,
      date: workout.date,
    };

    // Insert into database
    const { data, error } = await supabase
      .from("workout_logs")
      .insert(logEntry)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log("[WorkoutService] Strength workout logged:", data);
    return data;
  } catch (error) {
    console.error("[WorkoutService] Error logging strength workout:", error);
    throw error;
  }
}

/**
 * Add cardio workout
 *
 * @param workout - Cardio workout data
 * @returns Database response
 */
export async function addCardioWorkout(workout: CardioWorkout): Promise<any> {
  try {
    // Validate input
    if (!workout.activity_id || workout.duration_minutes < 1) {
      throw new Error("Invalid cardio workout data");
    }

    // Get activity info for MET value
    const activity = findCardioActivity(workout.activity_id);
    const met = activity?.met || 8.0; // Default to 8.0 if not found

    // Get user for calorie calculation
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("weight_kg")
      .eq("user_id", workout.user_id)
      .single();

    if (profileError) {
      console.warn("Could not fetch user weight for calorie calculation");
    }

    const userWeight = profileData?.weight_kg || 70; // Default to 70kg if not found

    // Calculate calories burned
    const caloriesBurned = calculateCaloriesBurned(
      met,
      userWeight,
      workout.duration_minutes,
    );

    // Create log entry
    const logEntry: WorkoutLogEntry = {
      user_id: workout.user_id,
      workout_id: generateUUID(), // Generate unique ID for this workout log
      type: "cardio",
      exercise_name: workout.activity_name,
      duration_minutes: workout.duration_minutes,
      distance_km: workout.distance_km,
      intensity: workout.intensity,
      calories_burned: caloriesBurned,
      notes: workout.notes,
      date: workout.date,
    };

    // Insert into database
    const { data, error } = await supabase
      .from("workout_logs")
      .insert(logEntry)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log("[WorkoutService] Cardio workout logged:", data);
    return data;
  } catch (error) {
    console.error("[WorkoutService] Error logging cardio workout:", error);
    throw error;
  }
}

/**
 * Add yoga workout
 *
 * @param workout - Yoga workout data
 * @returns Database response
 */
export async function addYogaWorkout(workout: YogaWorkout): Promise<any> {
  try {
    // Validate input
    if (!workout.style_id || workout.duration_minutes < 1) {
      throw new Error("Invalid yoga workout data");
    }

    // Get yoga style info for MET value
    const style = findYogaStyle(workout.style_id);
    const met = style?.met || 3.0; // Default to 3.0 if not found

    // Get user for calorie calculation
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("weight_kg")
      .eq("user_id", workout.user_id)
      .single();

    if (profileError) {
      console.warn("Could not fetch user weight for calorie calculation");
    }

    const userWeight = profileData?.weight_kg || 70;

    // Calculate calories burned
    const caloriesBurned = calculateCaloriesBurned(
      met,
      userWeight,
      workout.duration_minutes,
    );

    // Create log entry
    const logEntry: WorkoutLogEntry = {
      user_id: workout.user_id,
      workout_id: generateUUID(), // Generate unique ID for this workout log
      type: "yoga",
      exercise_name: workout.style_name,
      duration_minutes: workout.duration_minutes,
      calories_burned: caloriesBurned,
      notes: workout.notes,
      date: workout.date,
    };

    // Insert into database
    const { data, error } = await supabase
      .from("workout_logs")
      .insert(logEntry)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log("[WorkoutService] Yoga workout logged:", data);
    return data;
  } catch (error) {
    console.error("[WorkoutService] Error logging yoga workout:", error);
    throw error;
  }
}

/**
 * Add HIIT workout
 *
 * @param workout - HIIT workout data
 * @returns Database response
 */
export async function addHIITWorkout(workout: HIITWorkout): Promise<any> {
  try {
    // Validate input
    if (!workout.workout_id || workout.duration_minutes < 1) {
      throw new Error("Invalid HIIT workout data");
    }

    // Get HIIT workout info for MET value
    const hiitWorkout = findHIITWorkout(workout.workout_id);
    const met = hiitWorkout?.met || 12.0; // Default to 12.0 if not found

    // Get user for calorie calculation
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("weight_kg")
      .eq("user_id", workout.user_id)
      .single();

    if (profileError) {
      console.warn("Could not fetch user weight for calorie calculation");
    }

    const userWeight = profileData?.weight_kg || 70;

    // Calculate calories burned (HIIT typically has higher burn)
    const caloriesBurned = calculateCaloriesBurned(
      met,
      userWeight,
      workout.duration_minutes,
    );

    // Create log entry
    const logEntry: WorkoutLogEntry = {
      user_id: workout.user_id,
      workout_id: generateUUID(), // Generate unique ID for this workout log
      type: "hiit",
      exercise_name: workout.workout_name,
      duration_minutes: workout.duration_minutes,
      intensity: workout.intensity,
      calories_burned: caloriesBurned,
      notes: workout.notes,
      date: workout.date,
    };

    // Insert into database
    const { data, error } = await supabase
      .from("workout_logs")
      .insert(logEntry)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log("[WorkoutService] HIIT workout logged:", data);
    return data;
  } catch (error) {
    console.error("[WorkoutService] Error logging HIIT workout:", error);
    throw error;
  }
}

/**
 * Get daily workout logs
 *
 * @param userId - User ID
 * @param date - Date string (YYYY-MM-DD)
 * @returns Array of workout logs for the day
 */
export async function getDailyWorkoutLogs(
  userId: string,
  date: string,
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("[WorkoutService] Error fetching daily workout logs:", error);
    throw error;
  }
}

/**
 * Get weekly workout logs
 *
 * @param userId - User ID
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Array of workout logs for the week
 */
export async function getWeeklyWorkoutLogs(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error(
      "[WorkoutService] Error fetching weekly workout logs:",
      error,
    );
    throw error;
  }
}

/**
 * Delete workout log
 *
 * @param logId - Workout log ID to delete
 * @returns Delete response
 */
export async function deleteWorkoutLog(logId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("workout_logs")
      .delete()
      .eq("id", logId);

    if (error) {
      throw error;
    }

    console.log("[WorkoutService] Workout log deleted:", logId);
  } catch (error) {
    console.error("[WorkoutService] Error deleting workout log:", error);
    throw error;
  }
}

/**
 * Get workout statistics for a date range
 *
 * @param userId - User ID
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Statistics object
 */
export async function getWorkoutStats(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<any> {
  try {
    const workouts = await getWeeklyWorkoutLogs(userId, startDate, endDate);

    const stats = {
      totalWorkouts: workouts.length,
      totalDuration: workouts.reduce(
        (sum, w) => sum + (w.duration_minutes || 0),
        0,
      ),
      totalCaloriesBurned: workouts.reduce(
        (sum, w) => sum + (w.calories_burned || 0),
        0,
      ),
      byType: {
        strength: 0,
        cardio: 0,
        yoga: 0,
        hiit: 0,
      },
      averageDuration: 0,
    };

    // Count by type
    workouts.forEach((w) => {
      if (w.type && (w.type as keyof typeof stats.byType) in stats.byType) {
        stats.byType[w.type as keyof typeof stats.byType]++;
      }
    });

    // Calculate average duration
    if (stats.totalWorkouts > 0) {
      stats.averageDuration = Math.round(
        stats.totalDuration / stats.totalWorkouts,
      );
    }

    return stats;
  } catch (error) {
    console.error("[WorkoutService] Error fetching workout stats:", error);
    throw error;
  }
}
