// User & Authentication Types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  height_cm: number;
  weight_kg: number;
  fitness_goal:
    | "lose_fat"
    | "maintain"
    | "gain_muscle"
    | "mild_loss"
    | "normal_loss"
    | "extreme_loss"
    | "mild_gain"
    | "normal_gain"
    | "extreme_gain";
  activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active";
  daily_calorie_target: number;
  created_at: string;
  updated_at: string;
}

// Food & Nutrition Types
export interface Food {
  id: string;
  name: string;
  calories_per_serving: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  serving_size_g: number;
  category: "indian" | "global" | "homemade" | "packaged";
  is_custom: boolean;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface FoodLog {
  id: string;
  user_id: string;
  food_id: string;
  quantity: number;
  quantity_unit?: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  date: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  food_name?: string;
  fdc_id?: string;
  created_at: string;
  updated_at: string;
  foods?: Food; // Nested foods relationship from join
}

export interface DailyNutrition {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  meals: {
    breakfast: FoodLog[];
    lunch: FoodLog[];
    dinner: FoodLog[];
    snacks: FoodLog[];
  };
}

// Workout Types
export interface Workout {
  id: string;
  name: string;
  type: "strength" | "cardio" | "yoga" | "hiit";
  description?: string;
  is_template: boolean;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  workout_id: string;
  duration_minutes: number;
  sets?: number;
  reps?: number;
  calories_burned: number;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Weight & Body Tracking Types
export interface WeightLog {
  id: string;
  user_id: string;
  weight_kg: number;
  chest_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  date: string;
  created_at: string;
  updated_at: string;
}

// Habits & Reminders Types
export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly";
  current_streak: number;
  best_streak: number;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  time: string; // HH:mm format
  frequency: "daily" | "weekly";
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Water Intake Types
export interface WaterLog {
  id: string;
  user_id: string;
  amount_ml: number;
  date: string;
  created_at: string;
  updated_at: string;
}

// Analytics Types
export interface DailyStats {
  date: string;
  calories_consumed: number;
  calories_target: number;
  weight?: number;
  workouts_count: number;
  water_ml: number;
}

export interface WeeklyReport {
  week_start: string;
  week_end: string;
  avg_calories: number;
  avg_protein: number;
  avg_carbs: number;
  avg_fats: number;
  total_workouts: number;
  total_calories_burned: number;
  weight_change: number;
}

export interface MonthlyReport extends WeeklyReport {
  month: string;
  year: number;
}

// UI State Types
export type AsyncState<T> =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
}
