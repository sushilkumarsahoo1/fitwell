import * as foodService from "@services/foodService";
import { supabase } from "@services/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfile } from "@types/index";
import { recordCacheHit, recordCacheMiss } from "@utils/foodUtils";
import type { FitnessGoal } from "@utils/nutritionUtils";

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
    // Cache profile for 30 minutes (rarely changes)
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 2,
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

export const useUpdateUserGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: {
      userId: string;
      profileId: string;
      newGoal: FitnessGoal;
      newCalorieTarget: number;
      previousGoal?: FitnessGoal;
      previousCalorieTarget?: number;
    }) => {
      const {
        userId,
        profileId,
        newGoal,
        newCalorieTarget,
        previousGoal,
        previousCalorieTarget,
      } = variables;

      // Update profile with new goal and calorie target
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .update({
          fitness_goal: newGoal,
          daily_calorie_target: newCalorieTarget,
        })
        .eq("id", profileId)
        .select()
        .single();

      if (profileError) throw profileError;

      // Log the goal change in history
      if (previousGoal) {
        const { error: historyError } = await supabase
          .from("goal_change_history")
          .insert([
            {
              user_id: userId,
              profile_id: profileId,
              previous_goal: previousGoal,
              new_goal: newGoal,
              previous_calorie_target: previousCalorieTarget || null,
              new_calorie_target: newCalorieTarget,
              changed_at: new Date().toISOString(),
            },
          ]);

        if (historyError) {
          console.warn(
            "[useUpdateUserGoal] Warning: Failed to log goal change:",
            historyError,
          );
          // Don't throw - the profile update was successful
        }
      }

      return profileData;
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
      console.log(`[useNutrition] Fetching food logs for ${userId} on ${date}`);

      const { data, error } = await supabase
        .from("food_logs")
        .select("*, foods(*)")
        .eq("user_id", userId)
        .eq("date", date)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(`[useNutrition] Error fetching food logs:`, error);
        throw error;
      }

      console.log(
        `[useNutrition] Fetched ${data?.length || 0} food logs`,
        data,
      );

      // Verify data structure
      if (data && data.length > 0) {
        console.log(
          "[useNutrition] Sample food log:",
          JSON.stringify(data[0], null, 2),
        );
      }

      return data || [];
    },
    enabled: !!userId && !!date,
    // Cache food logs for 5 minutes
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
};

export const useAddFoodLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      foodLog: Omit<
        Parameters<typeof supabase.from>[0],
        "id" | "created_at" | "updated_at"
      >,
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

export const useFoodDatabase = (
  category?: string,
  offset: number = 0,
  limit: number = 1000,
) => {
  return useQuery({
    queryKey: ["foods", category, offset, limit],
    queryFn: async () => {
      // Optimization: Select only needed columns to reduce payload size
      let query = supabase
        .from("foods")
        .select(
          "id,name,category,calories_per_serving,protein_g,carbs_g,fats_g",
        )
        .eq("is_custom", false);

      if (category) {
        query = query.eq("category", category);
      }

      // No sorting on server - dramatically faster for large sets
      const { data, error } = await query.range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    },
    // Aggressive caching: 10 minutes for food data (rarely changes)
    staleTime: 10 * 60 * 1000,
    // Keep in cache for 30 minutes
    gcTime: 30 * 60 * 1000,
    // Retry only once on failure
    retry: 1,
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
    mutationFn: async (variables: { userId: string; foodId: string }) => {
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
    mutationFn: async (variables: { userId: string; foodId: string }) => {
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
/**
 * Search foods using USDA FoodData Central API
 * Results are cached locally for 48 hours
 */
export const useSearchFoods = (query: string) => {
  return useQuery({
    queryKey: ["searchFoods", query],
    queryFn: async () => {
      if (!query.trim()) {
        return [];
      }

      try {
        const results = await foodService.searchFoods(query, 1, 20);
        recordCacheHit(); // Track cache statistics
        return results;
      } catch (error) {
        recordCacheMiss();
        console.error("Error searching foods:", error);
        throw error;
      }
    },
    enabled: !!query.trim(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Get detailed nutrition info for a specific USDA food
 */
export const useGetFoodDetails = (fdcId: string | null) => {
  return useQuery({
    queryKey: ["foodDetails", fdcId],
    queryFn: async () => {
      if (!fdcId) return null;

      try {
        const details = await foodService.getFoodDetails(fdcId);
        recordCacheHit();
        return details;
      } catch (error) {
        recordCacheMiss();
        console.error("Error fetching food details:", error);
        throw error;
      }
    },
    enabled: !!fdcId,
    staleTime: 1000 * 60 * 60 * 48, // 48 hours - food data doesn't change
    gcTime: 1000 * 60 * 60 * 72, // Keep in memory for 72 hours
    retry: 2,
  });
};

/**
 * Log food from USDA API to database
 * Automatically calculates macros based on quantity
 */
export const useLogUSDAFood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: {
      userId: string;
      foodName: string;
      fdcId: string;
      quantity: number;
      quantityUnit: string;
      mealType: "breakfast" | "lunch" | "dinner" | "snack";
      date: string;
      nutrition: {
        calories: number;
        protein_g: number;
        carbs_g: number;
        fats_g: number;
      };
    }) => {
      return await foodService.logFoodToDatabase({
        user_id: variables.userId,
        food_name: variables.foodName,
        fdc_id: variables.fdcId,
        quantity: variables.quantity,
        quantity_unit: variables.quantityUnit,
        meal_type: variables.mealType,
        date: variables.date,
        calories: variables.nutrition.calories,
        protein_g: variables.nutrition.protein_g,
        carbs_g: variables.nutrition.carbs_g,
        fats_g: variables.nutrition.fats_g,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foodLogs"] });
      queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
    },
  });
};

/**
 * Clear USDA food cache (for debugging or manual refresh)
 */
export const useClearFoodCache = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await foodService.clearFoodCache();
    },
    onSuccess: () => {
      // Invalidate all food-related queries
      queryClient.invalidateQueries({ queryKey: ["searchFoods"] });
      queryClient.invalidateQueries({ queryKey: ["foodDetails"] });
    },
  });
};
