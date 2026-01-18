// Fitness Goals
export const FITNESS_GOALS = [
  {
    id: "lose_fat",
    label: "Lose Fat",
    description: "Create a calorie deficit",
  },
  {
    id: "maintain",
    label: "Maintain",
    description: "Keep your current weight",
  },
  { id: "gain_muscle", label: "Gain Muscle", description: "Build muscle mass" },
] as const;

// Activity Levels
export const ACTIVITY_LEVELS = [
  {
    id: "sedentary",
    label: "Sedentary",
    multiplier: 1.2,
    description: "Little or no exercise",
  },
  {
    id: "light",
    label: "Light",
    multiplier: 1.375,
    description: "1-3 days per week",
  },
  {
    id: "moderate",
    label: "Moderate",
    multiplier: 1.55,
    description: "3-5 days per week",
  },
  {
    id: "active",
    label: "Active",
    multiplier: 1.725,
    description: "6-7 days per week",
  },
  {
    id: "very_active",
    label: "Very Active",
    multiplier: 1.9,
    description: "Intense exercise daily",
  },
] as const;

// Food Categories
export const FOOD_CATEGORIES = [
  { id: "indian", label: "Indian Foods" },
  { id: "global", label: "Global Foods" },
  { id: "packaged", label: "Packaged Foods" },
] as const;

// Meal Types
export const MEAL_TYPES = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "snack", label: "Snack" },
] as const;

// Workout Types
export const WORKOUT_TYPES = [
  { id: "strength", label: "Strength Training" },
  { id: "cardio", label: "Cardio" },
  { id: "yoga", label: "Yoga" },
  { id: "hiit", label: "HIIT" },
] as const;

// Colors for UI
export const COLORS = {
  primary: "#0ea5e9",
  primaryDark: "#0369a1",
  accent: "#a855f7",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  neutral: {
    light: "#f9fafb",
    lighter: "#f3f4f6",
    border: "#e5e7eb",
    text: "#6b7280",
    textDark: "#111827",
  },
} as const;

// Calorie Multipliers for macros
export const MACRO_CALORIES = {
  protein: 4,
  carbs: 4,
  fats: 9,
} as const;

// Default Daily Targets
export const DEFAULT_DAILY_TARGETS = {
  water_ml: 2000,
  steps: 10000,
  protein_g: 100,
} as const;

// Standard Serving Sizes
export const STANDARD_SERVING_SIZES = {
  cup: 240,
  tablespoon: 15,
  teaspoon: 5,
  gram: 1,
  ounce: 28.35,
  piece: 1,
  bowl: 300,
} as const;
