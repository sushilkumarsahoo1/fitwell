import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@services/supabase";
import type { UserProfile } from "@types/index";

export const useProfile = (userId: string) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!userId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Partial<UserProfile>) => {
      const { data, error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("user_id", profile.user_id!)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useDailyFoodLogs = (userId: string, date: string) => {
  return useQuery({
    queryKey: ["foodLogs", userId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_logs")
        .select("*, foods(*)")
        .eq("user_id", userId)
        .eq("date", date);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId && !!date,
  });
};

export const useAddFoodLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      foodLog: Omit<
        Parameters<typeof supabase.from>[0],
        "id" | "created_at" | "updated_at"
      >
    ) => {
      const { data, error } = await supabase
        .from("food_logs")
        .insert([foodLog])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foodLogs"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
    },
  });
};

export const useDeleteFoodLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (foodLogId: string) => {
      const { error } = await supabase
        .from("food_logs")
        .delete()
        .eq("id", foodLogId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foodLogs"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
    },
  });
};

export const useFoodDatabase = (category?: string) => {
  return useQuery({
    queryKey: ["foods", category],
    queryFn: async () => {
      let query = supabase.from("foods").select("*").eq("is_custom", false);

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      return data || [];
    },
  });
};

export const useFavoriteFoods = (userId: string) => {
  return useQuery({
    queryKey: ["favoriteFoods", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorite_foods")
        .select("*, foods(*)")
        .eq("user_id", userId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
};

export const useAddFavoriteFood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      variables: { userId: string; foodId: string }
    ) => {
      const { error } = await supabase.from("favorite_foods").insert([
        {
          user_id: variables.userId,
          food_id: variables.foodId,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favoriteFoods"] });
    },
  });
};

export const useRemoveFavoriteFood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      variables: { userId: string; foodId: string }
    ) => {
      const { error } = await supabase
        .from("favorite_foods")
        .delete()
        .eq("user_id", variables.userId)
        .eq("food_id", variables.foodId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favoriteFoods"] });
    },
  });
};
