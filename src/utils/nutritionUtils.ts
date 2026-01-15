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
  fatsPercentage: number = 30
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
  gender: "male" | "female" | "other"
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
  activityMultiplier: number
): number => {
  return Math.round(bmr * activityMultiplier);
};

export const calculateAdjustedCalories = (
  tdee: number,
  goal: "lose_fat" | "maintain" | "gain_muscle"
): number => {
  switch (goal) {
    case "lose_fat":
      return Math.round(tdee * 0.85); // 15% deficit
    case "gain_muscle":
      return Math.round(tdee * 1.1); // 10% surplus
    case "maintain":
    default:
      return tdee;
  }
};

export const calculateDailyCalorieTarget = (
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female" | "other",
  activityLevel: string,
  goal: "lose_fat" | "maintain" | "gain_muscle"
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

export const getRemainingCalories = (consumed: number, target: number): number => {
  return Math.max(0, target - consumed);
};

export const isCalorieGoalMet = (consumed: number, target: number): boolean => {
  return consumed >= target;
};

export const isCalorieGoalExceeded = (consumed: number, target: number): boolean => {
  return consumed > target * 1.1; // More than 10% over
};
