import { MACRO_CALORIES } from "@constants/index";

export interface MacroBreakdown {
  protein: number;
  carbs: number;
  fats: number;
}

export const calculateMacrosFromCalories = (
  calories: number,
  proteinPercentage: number = 30,
  carbsPercentage: number = 40,
  fatsPercentage: number = 30,
): MacroBreakdown => {
  const proteinCals = (calories * proteinPercentage) / 100;
  const carbsCals = (calories * carbsPercentage) / 100;
  const fatsCals = (calories * fatsPercentage) / 100;

  return {
    protein: Math.round((proteinCals / MACRO_CALORIES.protein) * 10) / 10,
    carbs: Math.round((carbsCals / MACRO_CALORIES.carbs) * 10) / 10,
    fats: Math.round((fatsCals / MACRO_CALORIES.fats) * 10) / 10,
  };
};

export const calculateCaloriesFromMacros = (macros: MacroBreakdown): number => {
  return (
    macros.protein * MACRO_CALORIES.protein +
    macros.carbs * MACRO_CALORIES.carbs +
    macros.fats * MACRO_CALORIES.fats
  );
};

export const calculateBMR = (
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female" | "other",
): number => {
  // Mifflin-St Jeor Formula
  let bmr: number;

  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  return Math.round(bmr);
};

export const calculateTDEE = (
  bmr: number,
  activityMultiplier: number,
): number => {
  return Math.round(bmr * activityMultiplier);
};

export type FitnessGoal =
  | "maintain"
  | "mild_loss"
  | "normal_loss"
  | "extreme_loss"
  | "mild_gain"
  | "normal_gain"
  | "extreme_gain"
  | "lose_fat"
  | "gain_muscle"; // Legacy support

export interface GoalMetrics {
  calorieTarget: number;
  weeklyWeightChange: number;
  deficitOrSurplus: number;
  percentage: number;
}

export const calculateAdjustedCalories = (
  tdee: number,
  goal: FitnessGoal,
): number => {
  switch (goal) {
    // Legacy support
    case "lose_fat":
      return Math.round(tdee * 0.79); // 21% deficit (0.5 kg/week)
    case "gain_muscle":
      return Math.round(tdee * 1.21); // 21% surplus (0.5 kg/week)
    case "maintain":
      return tdee;
    // New weight loss goals
    case "mild_loss":
      return Math.round(tdee * 0.9); // 10% deficit (~0.25 kg/week)
    case "normal_loss":
      return Math.round(tdee * 0.79); // 21% deficit (~0.5 kg/week)
    case "extreme_loss":
      return Math.round(tdee * 0.57); // 43% deficit (~1 kg/week)
    // New weight gain goals
    case "mild_gain":
      return Math.round(tdee * 1.1); // 10% surplus (~0.25 kg/week)
    case "normal_gain":
      return Math.round(tdee * 1.21); // 21% surplus (~0.5 kg/week)
    case "extreme_gain":
      return Math.round(tdee * 1.43); // 43% surplus (~1 kg/week)
    default:
      return tdee;
  }
};

export const getGoalMetrics = (
  tdee: number,
  goal: FitnessGoal,
): GoalMetrics => {
  const calorieTarget = calculateAdjustedCalories(tdee, goal);
  const deficitOrSurplus = calorieTarget - tdee;
  const percentage = Math.round((calorieTarget / tdee) * 100);

  let weeklyWeightChange = 0;
  // 1 kg = ~7700 calories
  const dailyDifference = Math.abs(deficitOrSurplus);
  weeklyWeightChange = Math.round(((dailyDifference * 7) / 7700) * 100) / 100;

  if (deficitOrSurplus < 0) {
    weeklyWeightChange = -weeklyWeightChange; // Negative for loss
  }

  return {
    calorieTarget,
    weeklyWeightChange,
    deficitOrSurplus,
    percentage,
  };
};

export const shouldShowGoalWarning = (
  goal: FitnessGoal,
  calories: number,
): boolean => {
  if (goal === "extreme_loss" && calories < 1500) return true;
  if (goal === "extreme_gain" && calories > 3500) return true;
  return false;
};

export const calculateDailyCalorieTarget = (
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female" | "other",
  activityLevel: string,
  goal: FitnessGoal,
): number => {
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const bmr = calculateBMR(weight, height, age, gender);
  const multiplier = activityMultipliers[activityLevel] || 1.2;
  const tdee = calculateTDEE(bmr, multiplier);
  return calculateAdjustedCalories(tdee, goal);
};

export const formatCalories = (calories: number): string => {
  return `${Math.round(calories)}`;
};

export const formatMacro = (grams: number): string => {
  return `${Math.round(grams * 10) / 10}g`;
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
};

export const getRemainingCalories = (
  consumed: number,
  target: number,
): number => {
  return Math.max(0, target - consumed);
};

export const isCalorieGoalMet = (consumed: number, target: number): boolean => {
  return consumed >= target;
};

export const isCalorieGoalExceeded = (
  consumed: number,
  target: number,
): boolean => {
  return consumed > target * 1.1; // More than 10% over
};
