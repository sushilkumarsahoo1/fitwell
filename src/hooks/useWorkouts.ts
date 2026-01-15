import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@services/supabase";
import type { WorkoutLog, Workout } from "@types/index";

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
        .select("*, workouts(*)")
        .eq("user_id", userId)
        .eq("date", date);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId && !!date,
  });
};

export const useAddWorkoutLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workoutLog: Omit<WorkoutLog, "id" | "created_at" | "updated_at">) => {
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
        totalDuration: data?.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) || 0,
        totalCalories: data?.reduce((sum, w) => sum + (w.calories_burned || 0), 0) || 0,
      };
    },
    enabled: !!userId && !!weekStart,
  });
};
