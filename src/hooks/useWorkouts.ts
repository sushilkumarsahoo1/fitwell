import { supabase } from "@services/supabase";
import * as workoutService from "@services/workoutService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Workout, WorkoutLog } from "@types/index";

export const useWorkoutTemplates = (userId: string) => {
  return useQuery({
    queryKey: ["workouts", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .or(`user_id.eq.${userId},is_template.eq.false`);

      if (error) throw error;
      return data as Workout[];
    },
    enabled: !!userId,
  });
};

export const useDailyWorkoutLogs = (userId: string, date: string) => {
  return useQuery({
    queryKey: ["workoutLogs", userId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_logs")
        .select()
        .eq("user_id", userId)
        .eq("date", date)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId && !!date,
  });
};

export const useAddWorkoutLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      workoutLog: Omit<WorkoutLog, "id" | "created_at" | "updated_at">,
    ) => {
      const { data, error } = await supabase
        .from("workout_logs")
        .insert([workoutLog])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutLogs"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
    },
  });
};

export const useDeleteWorkoutLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workoutLogId: string) => {
      const { error } = await supabase
        .from("workout_logs")
        .delete()
        .eq("id", workoutLogId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutLogs"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
    },
  });
};

export const useWeeklyWorkoutSummary = (userId: string, weekStart: string) => {
  return useQuery({
    queryKey: ["weeklyWorkoutSummary", userId, weekStart],
    queryFn: async () => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const weekEndStr = weekEnd.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("workout_logs")
        .select("*, workouts(*)")
        .eq("user_id", userId)
        .gte("date", weekStart)
        .lte("date", weekEndStr);

      if (error) throw error;

      return {
        workouts: data || [],
        totalSessions: data?.length || 0,
        totalDuration:
          data?.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) || 0,
        totalCalories:
          data?.reduce((sum, w) => sum + (w.calories_burned || 0), 0) || 0,
      };
    },
    enabled: !!userId && !!weekStart,
  });
};
/**
 * Log strength training workout
 * Calculates calories based on exercise MET value and user weight
 */
export const useAddStrengthWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: {
      userId: string;
      exerciseId: string;
      exerciseName: string;
      sets: number;
      reps: number;
      weightKg: number;
      date: string;
      notes?: string;
      userWeight: number;
    }) => {
      return await workoutService.addStrengthWorkout(
        {
          user_id: variables.userId,
          exercise_id: variables.exerciseId,
          exercise_name: variables.exerciseName,
          sets: variables.sets,
          reps: variables.reps,
          weight_kg: variables.weightKg,
          date: variables.date,
          notes: variables.notes,
        },
        variables.userWeight,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutLogs"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
      queryClient.invalidateQueries({ queryKey: ["weeklyWorkoutSummary"] });
    },
  });
};

/**
 * Log cardio workout
 * Calculates calories based on activity MET value and duration
 */
export const useAddCardioWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: {
      userId: string;
      activityId: string;
      activityName: string;
      durationMinutes: number;
      distanceKm?: number;
      intensity?: "light" | "moderate" | "vigorous";
      date: string;
      notes?: string;
    }) => {
      return await workoutService.addCardioWorkout({
        user_id: variables.userId,
        activity_id: variables.activityId,
        activity_name: variables.activityName,
        duration_minutes: variables.durationMinutes,
        distance_km: variables.distanceKm,
        intensity: variables.intensity,
        date: variables.date,
        notes: variables.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutLogs"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
      queryClient.invalidateQueries({ queryKey: ["weeklyWorkoutSummary"] });
    },
  });
};

/**
 * Log yoga workout
 * Calculates calories based on style intensity and duration
 */
export const useAddYogaWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: {
      userId: string;
      styleId: string;
      styleName: string;
      durationMinutes: number;
      difficulty?: "beginner" | "intermediate" | "advanced";
      date: string;
      notes?: string;
    }) => {
      return await workoutService.addYogaWorkout({
        user_id: variables.userId,
        style_id: variables.styleId,
        style_name: variables.styleName,
        duration_minutes: variables.durationMinutes,
        difficulty: variables.difficulty,
        date: variables.date,
        notes: variables.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutLogs"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
      queryClient.invalidateQueries({ queryKey: ["weeklyWorkoutSummary"] });
    },
  });
};

/**
 * Log HIIT workout
 * Calculates calories based on high-intensity exercise duration
 */
export const useAddHIITWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: {
      userId: string;
      workoutId: string;
      workoutName: string;
      durationMinutes: number;
      rounds?: number;
      exercises?: string;
      intensity?: "light" | "moderate" | "vigorous";
      date: string;
      notes?: string;
    }) => {
      return await workoutService.addHIITWorkout({
        user_id: variables.userId,
        workout_id: variables.workoutId,
        workout_name: variables.workoutName,
        duration_minutes: variables.durationMinutes,
        rounds: variables.rounds,
        exercises: variables.exercises,
        intensity: variables.intensity,
        date: variables.date,
        notes: variables.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutLogs"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
      queryClient.invalidateQueries({ queryKey: ["weeklyWorkoutSummary"] });
    },
  });
};

/**
 * Get workout statistics for a date range
 */
export const useWorkoutStats = (
  userId: string,
  startDate: string,
  endDate: string,
) => {
  return useQuery({
    queryKey: ["workoutStats", userId, startDate, endDate],
    queryFn: async () => {
      return await workoutService.getWorkoutStats(userId, startDate, endDate);
    },
    enabled: !!userId && !!startDate && !!endDate,
  });
};
