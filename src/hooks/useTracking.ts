import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@services/supabase";
import type { WeightLog, WaterLog, Habit, HabitLog } from "@types/index";

// Weight Tracking
export const useWeightLogs = (userId: string, dateRange?: { start: string; end: string }) => {
  return useQuery({
    queryKey: ["weightLogs", userId, dateRange],
    queryFn: async () => {
      let query = supabase
        .from("weight_logs")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (dateRange) {
        query = query
          .gte("date", dateRange.start)
          .lte("date", dateRange.end);
      } else {
        // Last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte("date", thirtyDaysAgo.toISOString().split("T")[0]);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as WeightLog[];
    },
    enabled: !!userId,
  });
};

export const useAddWeightLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (weightLog: Omit<WeightLog, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("weight_logs")
        .insert([weightLog])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weightLogs"] });
    },
  });
};

// Water Intake
export const useWaterLogs = (userId: string, date: string) => {
  return useQuery({
    queryKey: ["waterLogs", userId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("water_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("date", date);

      if (error) throw error;
      return data as WaterLog[];
    },
    enabled: !!userId && !!date,
  });
};

export const useAddWaterLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (waterLog: Omit<WaterLog, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("water_logs")
        .insert([waterLog])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waterLogs"] });
    },
  });
};

export const useDeleteWaterLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (waterLogId: string) => {
      const { error } = await supabase
        .from("water_logs")
        .delete()
        .eq("id", waterLogId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waterLogs"] });
    },
  });
};

// Habits
export const useHabits = (userId: string) => {
  return useQuery({
    queryKey: ["habits", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      return data as Habit[];
    },
    enabled: !!userId,
  });
};

export const useAddHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habit: Omit<Habit, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("habits")
        .insert([habit])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitId: string) => {
      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", habitId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
};

// Habit Logs (Completion)
export const useHabitLogs = (userId: string, date: string) => {
  return useQuery({
    queryKey: ["habitLogs", userId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habit_logs")
        .select("*, habits(*)")
        .eq("user_id", userId)
        .eq("date", date);

      if (error) throw error;
      return data as HabitLog[];
    },
    enabled: !!userId && !!date,
  });
};

export const useAddHabitLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      habitLog: Omit<HabitLog, "id" | "created_at">
    ) => {
      const { data, error } = await supabase
        .from("habit_logs")
        .insert([habitLog])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habitLogs"] });
    },
  });
};

// Daily Stats
export const useDailyStats = (userId: string, date: string) => {
  return useQuery({
    queryKey: ["dailyStats", userId, date],
    queryFn: async () => {
      const [foodLogs, workoutLogs, waterLogs, weightLog] = await Promise.all([
        supabase
          .from("food_logs")
          .select("*")
          .eq("user_id", userId)
          .eq("date", date),
        supabase
          .from("workout_logs")
          .select("*")
          .eq("user_id", userId)
          .eq("date", date),
        supabase
          .from("water_logs")
          .select("*")
          .eq("user_id", userId)
          .eq("date", date),
        supabase
          .from("weight_logs")
          .select("*")
          .eq("user_id", userId)
          .eq("date", date)
          .order("date", { ascending: false })
          .limit(1),
      ]);

      const totalCalories = (foodLogs.data || []).reduce(
        (sum, log) => sum + (log.calories || 0),
        0
      );
      const totalWater = (waterLogs.data || []).reduce(
        (sum, log) => sum + (log.amount_ml || 0),
        0
      );
      const totalCaloriesBurned = (workoutLogs.data || []).reduce(
        (sum, log) => sum + (log.calories_burned || 0),
        0
      );

      return {
        date,
        totalCalories,
        totalWater,
        workoutsCount: (workoutLogs.data || []).length,
        totalCaloriesBurned,
        currentWeight: weightLog.data?.[0]?.weight_kg,
      };
    },
    enabled: !!userId && !!date,
  });
};
