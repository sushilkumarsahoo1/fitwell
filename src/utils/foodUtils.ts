/**
 * Utility Functions: Food handling
 *
 * - Unit conversions (grams, cups, tablespoons, etc.)
 * - Quantity normalization for USDA API (convert to grams)
 * - Caching utilities
 * - Nutrition formatting
 */

/**
 * Supported quantity units
 */
export const QUANTITY_UNITS = {
  g: { label: "grams", toGrams: 1 },
  oz: { label: "ounces", toGrams: 28.35 },
  cup: { label: "cup", toGrams: 240 }, // ~1 cup water = 240ml ≈ 240g
  tbsp: { label: "tablespoon", toGrams: 15 },
  tsp: { label: "teaspoon", toGrams: 5 },
  ml: { label: "milliliters", toGrams: 1 }, // Approximate for water-based foods
  piece: { label: "piece", toGrams: 100 }, // Average piece, configurable by user
  bowl: { label: "bowl", toGrams: 300 }, // Average bowl
  slice: { label: "slice", toGrams: 50 }, // Average slice
  serving: { label: "serving", toGrams: 100 }, // Default serving
};

export type QuantityUnit = keyof typeof QUANTITY_UNITS;

/**
 * Convert any quantity unit to grams (for USDA API which uses per-100g)
 *
 * @param quantity - Amount entered by user
 * @param unit - Unit of quantity
 * @returns Equivalent amount in grams
 */
export function convertToGrams(quantity: number, unit: QuantityUnit): number {
  if (!QUANTITY_UNITS[unit]) {
    console.warn(`Unknown unit: ${unit}, defaulting to grams`);
    return quantity;
  }

  const conversionFactor = QUANTITY_UNITS[unit].toGrams;
  return quantity * conversionFactor;
}

/**
 * Convert grams to another unit
 *
 * @param grams - Amount in grams
 * @param unit - Target unit
 * @returns Equivalent amount in target unit
 */
export function convertFromGrams(grams: number, unit: QuantityUnit): number {
  if (!QUANTITY_UNITS[unit]) {
    console.warn(`Unknown unit: ${unit}, defaulting to grams`);
    return grams;
  }

  const conversionFactor = QUANTITY_UNITS[unit].toGrams;
  return grams / conversionFactor;
}

/**
 * Format nutrition values for display
 *
 * @param value - Numeric value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string
 */
export function formatNutrition(value: number, decimals: number = 1): string {
  if (value === 0) return "0";
  if (value < 1) return value.toFixed(decimals);
  return (
    Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals) + ""
  );
}

/**
 * Format macros for display
 */
export function formatMacros(protein: number, carbs: number, fats: number) {
  return {
    protein: `${formatNutrition(protein)}g`,
    carbs: `${formatNutrition(carbs)}g`,
    fats: `${formatNutrition(fats)}g`,
  };
}

/**
 * Calculate macronutrient percentages from absolute values
 *
 * @returns Percentages that add up to 100
 */
export function calculateMacroPercentages(
  protein: number,
  carbs: number,
  fats: number,
) {
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatsCals = fats * 9;
  const totalCals = proteinCals + carbsCals + fatsCals;

  if (totalCals === 0) {
    return { protein: 0, carbs: 0, fats: 0 };
  }

  return {
    protein: Math.round((proteinCals / totalCals) * 100),
    carbs: Math.round((carbsCals / totalCals) * 100),
    fats: Math.round((fatsCals / totalCals) * 100),
  };
}

/**
 * Validate food quantity
 *
 * @param quantity - Amount to validate
 * @param unit - Unit of quantity
 * @returns True if valid, error message otherwise
 */
export function validateQuantity(
  quantity: number | string,
  unit: QuantityUnit,
): { valid: boolean; error?: string } {
  const num = typeof quantity === "string" ? parseFloat(quantity) : quantity;

  if (isNaN(num)) {
    return { valid: false, error: "Quantity must be a number" };
  }

  if (num <= 0) {
    return { valid: false, error: "Quantity must be greater than 0" };
  }

  if (!QUANTITY_UNITS[unit]) {
    return { valid: false, error: `Unknown unit: ${unit}` };
  }

  if (num > 10000) {
    return { valid: false, error: "Quantity seems too large" };
  }

  return { valid: true };
}

/**
 * Serialize food cache for storage
 * Remove circular references and sensitive data
 */
export function serializeFoodForCache(food: any): any {
  return {
    fdcId: food.fdcId,
    description: food.description,
    dataType: food.dataType,
    foodNutrients: food.foodNutrients,
    brandOwner: food.brandOwner,
    servingSize: food.servingSize,
    servingSizeUnit: food.servingSizeUnit,
  };
}

/**
 * Common food density reference for better conversions
 * Used when user enters volume-based units (cups, tbsp) for solid foods
 */
export const FOOD_DENSITIES: { [key: string]: number } = {
  // Grains
  rice: 0.8, // 1 cup = 185g cooked
  oats: 0.5, // 1 cup = 150g dry
  flour: 0.6, // 1 cup = 125g all-purpose

  // Proteins
  chicken: 1.0, // ~100g per 100ml
  beef: 1.0,
  fish: 1.0,
  egg: 0.5, // 1 egg ≈ 50g

  // Dairy
  milk: 1.0, // 1 cup = 240ml ≈ 240g
  yogurt: 1.0,
  cheese: 1.1,

  // Vegetables
  broccoli: 0.6, // 1 cup = 150g
  spinach: 0.3, // 1 cup fresh = 30g
  tomato: 1.0,
};

/**
 * Estimate quantity in grams from common descriptions
 * Helps parse user input like "1 medium banana" to grams
 */
export function estimateQuantityFromDescription(
  description: string,
): number | null {
  const description_lower = description.toLowerCase();

  // Size qualifiers
  if (description_lower.includes("small")) return 50;
  if (description_lower.includes("medium")) return 100;
  if (description_lower.includes("large")) return 150;
  if (description_lower.includes("extra large")) return 200;

  // Specific items
  if (description_lower.includes("banana")) return 120;
  if (description_lower.includes("apple")) return 150;
  if (description_lower.includes("orange")) return 150;
  if (description_lower.includes("egg")) return 50;
  if (description_lower.includes("chicken breast")) return 200;
  if (description_lower.includes("salmon fillet")) return 200;

  return null;
}

/**
 * Cache hit/miss statistics for debugging
 */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
}

let cacheHits = 0;
let cacheMisses = 0;

export function recordCacheHit() {
  cacheHits++;
}

export function recordCacheMiss() {
  cacheMisses++;
}

export function getCacheStats(): CacheStats {
  const total = cacheHits + cacheMisses;
  return {
    hits: cacheHits,
    misses: cacheMisses,
    hitRate: total === 0 ? 0 : (cacheHits / total) * 100,
  };
}

export function resetCacheStats() {
  cacheHits = 0;
  cacheMisses = 0;
}
