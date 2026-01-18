/**
 * Food Service: USDA FoodData Central API Integration
 *
 * This service provides complete food logging functionality:
 * - Search foods using USDA FoodData Central API (free, public domain)
 * - Extract nutrition data (calories, protein, carbs, fats)
 * - Convert per-100g values to user-entered quantities
 * - Cache results locally to minimize API calls
 * - Log food to database with calculated macros
 *
 * USDA API is free, public domain, and App Store/Play Store safe
 * Rate limit: ~100 requests per second (no official limit for free tier)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

/**
 * USDA FoodData Central API Response Types
 */
interface USDASearchResult {
  fdcId: string;
  description: string;
  dataType: "Survey (FNDDS)" | "Foundation" | "SR Legacy" | "Branded";
  brandOwner?: string;
  score?: number;
}

interface USDASearchResponse {
  foods: USDASearchResult[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalHits: number;
}

interface USDANutrient {
  nutrientId?: number;
  nutrientName?: string;
  value?: number;
  unitName?: string;
  // Alternate format from USDA API
  nutrient?: {
    id: number;
    name: string;
    unitName: string;
  };
  amount?: number;
}

interface USDAFoodDetails {
  fdcId: string;
  description: string;
  dataType: string;
  foodNutrients: USDANutrient[];
  brandOwner?: string;
  servingSize?: number;
  servingSizeUnit?: string;
}

/**
 * Nutrition extraction interface
 */
export interface NutritionData {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
}

/**
 * Food log entry for database
 */
export interface FoodLogEntry {
  user_id: string;
  food_name: string;
  fdc_id: string;
  quantity: number;
  quantity_unit: string; // grams, cup, tablespoon, etc.
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  date: string; // YYYY-MM-DD
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
}

/**
 * Cached food data
 */
interface CachedFood extends USDAFoodDetails {
  cachedAt: number;
}

// USDA FoodData Central API Configuration
// Get your free API key at: https://fdc.nal.usda.gov/api-key-signup.html
const USDA_API_BASE = "https://api.nal.usda.gov/fdc/v1/foods";

// The API key for USDA FoodData Central API
// This is from app.json extra section or hardcoded value
// Note: This is a public API key and is safe to include in the app
const USDA_API_KEY = "E2WpkwatJoL2sT1T4PUgqFDxyWj8UU1oO5R0t3pj";

// Log API key status for debugging
if (USDA_API_KEY) {
  console.log(
    `[FoodService] USDA API Key loaded successfully (${USDA_API_KEY.length} chars)`,
  );
} else {
  console.warn(
    "[FoodService] USDA API key not configured. " +
      "USDA food search will not work. " +
      "Get a free key at: https://fdc.nal.usda.gov/api-key-signup.html",
  );
}

// Cache settings
const CACHE_DURATION_MS = 48 * 60 * 60 * 1000; // 48 hours
const CACHE_KEY = "usda_food_cache";
const SEARCH_CACHE_KEY = "usda_search_cache";

// USDA placeholder food ID for foods without local database entry
const USDA_FOOD_PLACEHOLDER_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Ensure the USDA placeholder food exists in the foods table
 * This is needed for the foreign key constraint when logging USDA foods
 */
async function ensureUSDAPlaceholderFoodExists(): Promise<void> {
  try {
    // Check if placeholder already exists
    const { data: existing, error: checkError } = await supabase
      .from("foods")
      .select("id")
      .eq("id", USDA_FOOD_PLACEHOLDER_ID)
      .single();

    if (existing) {
      // Placeholder already exists
      console.log("[FoodService] USDA placeholder food already exists");
      return;
    }

    // If we get here, check if it's a "no rows" error (which is expected) or an actual error
    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is the "no rows" error code, which is expected
      console.warn("[FoodService] Error checking placeholder:", checkError);
    }

    // Get current user ID for insertion (required by RLS policy)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.warn(
        "[FoodService] Cannot create placeholder - user not authenticated",
      );
      return;
    }

    // Create the placeholder food entry
    // Note: We insert as a custom food with user_id, which satisfies RLS policy
    // The client-side code will treat it as a USDA food based on the logic
    console.log("[FoodService] Creating USDA placeholder food entry...");
    const { data, error } = await supabase
      .from("foods")
      .insert({
        id: USDA_FOOD_PLACEHOLDER_ID,
        name: "USDA External Foods",
        calories_per_serving: 0,
        protein_g: 0,
        carbs_g: 0,
        fats_g: 0,
        serving_size_g: 100,
        category: "global",
        is_custom: true,
        user_id: user.id,
      })
      .select();

    if (error) {
      // If it's a duplicate key error, that's fine - someone else created it
      if (error.code === "23505") {
        console.log(
          "[FoodService] USDA placeholder food already exists (created by another process)",
        );
        return;
      }
      console.error(
        "[FoodService] Error creating USDA placeholder food:",
        error,
      );
      return;
    }

    console.log("[FoodService] USDA placeholder food created successfully");
  } catch (err) {
    console.error(
      "[FoodService] Exception ensuring USDA placeholder food:",
      err,
    );
  }
}

// Initialize placeholder on service load
ensureUSDAPlaceholderFoodExists();

/**
 * Search foods using USDA FoodData Central API
 *
 * @param query - Food name or keyword to search
 * @param pageNumber - Pagination (default: 1)
 * @param pageSize - Results per page (default: 10, max: 200)
 * @returns List of matching foods with FDC IDs
 */
export async function searchFoods(
  query: string,
  pageNumber: number = 1,
  pageSize: number = 10,
): Promise<USDASearchResult[]> {
  try {
    if (!query.trim()) {
      throw new Error("Search query cannot be empty");
    }

    // Check if API key is configured
    if (!USDA_API_KEY) {
      throw new Error(
        "USDA API key not configured. Please set EXPO_PUBLIC_USDA_API_KEY in app.json extra section. " +
          "Get a free key at: https://fdc.nal.usda.gov/api-key-signup.html",
      );
    }

    console.log(
      `[FoodService] Searching for: "${query}" | API Key length: ${USDA_API_KEY.length}`,
    );

    // Check search cache first
    const cachedSearches = await AsyncStorage.getItem(SEARCH_CACHE_KEY);
    if (cachedSearches) {
      const searches = JSON.parse(cachedSearches);
      const cacheKey = `${query}_${pageNumber}`;
      if (
        searches[cacheKey] &&
        Date.now() - searches[cacheKey].cachedAt < CACHE_DURATION_MS
      ) {
        console.log(`[FoodService] Returning cached results for: "${query}"`);
        return searches[cacheKey].results;
      }
    }

    // Call USDA API with search parameters
    const url = new URL(`${USDA_API_BASE}/search`);
    url.searchParams.append("query", query);
    url.searchParams.append("pageNumber", pageNumber.toString());
    url.searchParams.append("pageSize", Math.min(pageSize, 200).toString());
    url.searchParams.append("api_key", USDA_API_KEY);

    console.log(
      `[FoodService] Making USDA API request to: ${USDA_API_BASE}/search`,
    );

    const response = await fetch(url.toString());

    if (!response.ok) {
      const statusText = response.statusText || "Unknown Error";
      throw new Error(
        `USDA API error: ${response.status} ${statusText}. ` +
          "This usually means the API key is invalid or not configured. " +
          "Get a free key at: https://fdc.nal.usda.gov/api-key-signup.html",
      );
    }

    const data: USDASearchResponse = await response.json();

    // Cache search results
    const searches = await AsyncStorage.getItem(SEARCH_CACHE_KEY)
      .then((s: string | null) => (s ? JSON.parse(s) : {}))
      .catch(() => ({}));
    const updated = { ...searches };
    updated[`${query}_${pageNumber}`] = {
      results: data.foods,
      cachedAt: Date.now(),
    };
    await AsyncStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(updated));

    return data.foods;
  } catch (error) {
    console.error("[FoodService] Error searching foods:", error);
    throw error;
  }
}

/**
 * Get detailed nutrition info for a specific food
 *
 * @param fdcId - FDC ID from search results
 * @returns Full food details with nutrients
 */
export async function getFoodDetails(
  fdcId: string,
): Promise<USDAFoodDetails | null> {
  try {
    // Check if API key is configured
    if (!USDA_API_KEY) {
      throw new Error(
        "USDA API key not configured. Please set EXPO_PUBLIC_USDA_API_KEY environment variable. " +
          "Get a free key at: https://fdc.nal.usda.gov/api-key-signup.html",
      );
    }

    // Check food cache first
    const foodCache = await AsyncStorage.getItem(CACHE_KEY);
    if (foodCache) {
      const cache = JSON.parse(foodCache);
      if (
        cache[fdcId] &&
        Date.now() - cache[fdcId].cachedAt < CACHE_DURATION_MS
      ) {
        return cache[fdcId] as USDAFoodDetails;
      }
    }

    // Call USDA API to get food details
    // Note: Details endpoint uses singular 'food', not plural 'foods'
    const detailsUrl = `${USDA_API_BASE.replace("/foods", "/food")}/${fdcId}`;
    const url = new URL(detailsUrl);
    url.searchParams.append("api_key", USDA_API_KEY);

    console.log("[foodService] Fetching food details from:", url.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      const statusText = response.statusText || "Unknown Error";
      throw new Error(
        `USDA API error: ${response.status} ${statusText}. ` +
          "This usually means the API key is invalid or not configured. " +
          "Get a free key at: https://fdc.nal.usda.gov/api-key-signup.html",
      );
    }

    const data: USDAFoodDetails = await response.json();

    console.log(
      "[foodService] USDA API response - foodNutrients count:",
      data.foodNutrients?.length || 0,
      "Description:",
      data.description,
    );

    // Cache food details
    const cache = foodCache ? JSON.parse(foodCache) : {};
    cache[fdcId] = {
      ...data,
      cachedAt: Date.now(),
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));

    return data;
  } catch (error) {
    console.error(
      `[FoodService] Error fetching food details for ${fdcId}:`,
      error,
    );
    return null;
  }
}

/**
 * Extract nutrition data (calories, macros) from USDA food details
 *
 * @param foodDetails - Full food details from USDA
 * @param quantity - Amount user consumed (in grams)
 * @returns Calculated nutrition data for the quantity
 */
export function extractNutrition(
  foodDetails: USDAFoodDetails,
  quantity: number = 100,
): NutritionData {
  // USDA nutrients are per 100g by default
  // Map USDA nutrient IDs to our nutrition types
  // Comprehensive mapping to handle all USDA API versions and data types
  const nutrientMap: { [key: string]: string } = {
    // ENERGY (CALORIES)
    "1008": "calories", // Energy (kcal) - SR Legacy
    "2000": "calories", // Energy (kcal) - Foundation
    "1062": "calories", // Energy (kcal) - other
    "9000": "calories", // Energy - catch-all

    // PROTEIN
    "1003": "protein_g", // Protein (g) - SR Legacy
    "9001": "protein_g", // Protein - catch-all
    "1103": "protein_g", // Protein - other

    // CARBOHYDRATES
    "1005": "carbs_g", // Carbohydrate (g) - SR Legacy
    "2009": "carbs_g", // Carbohydrate (g) - Foundation
    "1011": "carbs_g", // Carbohydrate - other
    "9002": "carbs_g", // Carbohydrate - catch-all

    // TOTAL FAT
    "1004": "fats_g", // Total lipid/fat (g) - SR Legacy
    "1078": "fats_g", // Total fat (g) - other
    "1079": "fats_g", // Total fat - other variant
    "9003": "fats_g", // Total fat - catch-all
  };

  // Initialize nutrition with safe defaults (handle missing nutrients)
  const nutritionPer100g: NutritionData = {
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fats_g: 0,
  };

  try {
    // Extract nutrients from USDA response
    if (foodDetails.foodNutrients && Array.isArray(foodDetails.foodNutrients)) {
      console.log(
        `[extractNutrition] Processing ${foodDetails.foodNutrients.length} nutrients from USDA API`,
      );

      // Log raw nutrients to debug
      if (foodDetails.foodNutrients.length > 0) {
        console.log(
          "[extractNutrition] Raw nutrients (first 3):",
          JSON.stringify(foodDetails.foodNutrients.slice(0, 3), null, 2),
        );

        // Log all nutrient IDs found
        const allNutrientIds = foodDetails.foodNutrients
          .map(
            (n) =>
              n.nutrientId ||
              (n.nutrient?.id ? `nested:${n.nutrient.id}` : "unknown"),
          )
          .filter(Boolean);
        console.log(
          `[extractNutrition] ALL nutrient IDs in response: [${allNutrientIds.join(", ")}]`,
        );
      }

      foodDetails.foodNutrients.forEach((nutrient, index) => {
        try {
          // Handle different USDA API response formats
          // Format 1: Direct properties (legacy format)
          let nutrientId = nutrient.nutrientId;
          let nutrientName = nutrient.nutrientName;
          let value = nutrient.value;
          let unitName = nutrient.unitName;

          // Format 2: Nested nutrient object (current API format)
          if (!nutrientId && nutrient.nutrient) {
            nutrientId = nutrient.nutrient.id;
            nutrientName = nutrient.nutrient.name;
            unitName = nutrient.nutrient.unitName;
            value = nutrient.amount;
          }

          // Log ALL nutrients found with their IDs for debugging
          if (index < 10) {
            console.log(
              `[extractNutrition] Nutrient[${index}] ID=${nutrientId}, Name=${nutrientName}, Value=${value}, Unit=${unitName}`,
            );
          }

          // Skip if still no data
          if (!nutrientId || value === undefined || value === null) {
            return;
          }

          const nutrientKey = String(nutrientId);
          let fieldName = nutrientMap[nutrientKey];

          // Fallback: try to extract by nutrient name if ID doesn't match
          if (!fieldName && nutrientName) {
            const lowerName = nutrientName.toLowerCase();
            if (
              lowerName.includes("energy") ||
              lowerName.includes("calor") ||
              lowerName.includes("kcal") ||
              lowerName.includes("kj") ||
              lowerName.includes("cal")
            ) {
              fieldName = "calories";
            } else if (
              lowerName.includes("protein") ||
              lowerName.includes("amino")
            ) {
              fieldName = "protein_g";
            } else if (
              lowerName.includes("carbohydrate") ||
              lowerName.includes("carb") ||
              lowerName.includes("sugar") ||
              lowerName.includes("starch")
            ) {
              fieldName = "carbs_g";
            } else if (
              lowerName.includes("fat") ||
              lowerName.includes("lipid") ||
              lowerName.includes("total fat") ||
              lowerName.includes("fatty") ||
              lowerName.includes("saturated fat") ||
              lowerName.includes("unsaturated")
            ) {
              fieldName = "fats_g";
            }
          }

          // Log all nutrient names encountered for debugging
          if (index < 15 && nutrientName) {
            console.log(
              `[extractNutrition] Nutrient[${index}]: Name="${nutrientName}", ID=${nutrientId}, Value=${value}, Unit=${unitName}, MatchedField=${fieldName || "NONE"}`,
            );
          }

          if (fieldName && value !== undefined && value !== null) {
            // USDA provides values per 100g for most foods
            // Handle edge cases where unit might differ
            let finalValue = value || 0;

            if (unitName === "kJ") {
              // Convert kilojoules to kcal (1 kcal = 4.184 kJ)
              if (fieldName === "calories") {
                finalValue = finalValue / 4.184;
              }
            }

            console.log(
              `[extractNutrition] ✅ Found ${nutrientName || "unnamed"} (ID: ${nutrientKey}): ${finalValue} ${unitName}`,
            );
            nutritionPer100g[fieldName as keyof NutritionData] = finalValue;
          } else if (nutrientId) {
            console.log(
              `[extractNutrition] ⚠️  Skipped ${nutrientName || "unnamed"} (ID: ${nutrientKey}) - no matching field or invalid value`,
            );
          }
        } catch (err) {
          console.error(
            `[extractNutrition] Error processing nutrient at index ${index}:`,
            err,
          );
        }
      });
    } else {
      console.warn(
        "[extractNutrition] No foodNutrients array found in USDA response",
        { foodDetails },
      );
    }
  } catch (err) {
    console.error("[extractNutrition] Error extracting nutrients:", err);
  }

  console.log(
    "[extractNutrition] Nutrition per 100g:",
    nutritionPer100g,
    "Quantity:",
    quantity,
    "g",
  );

  // Convert from per-100g to user quantity
  // If user entered 150g, multiply by 1.5
  const conversionFactor = quantity / 100;

  return {
    calories: Math.round(nutritionPer100g.calories * conversionFactor),
    protein_g:
      Math.round(nutritionPer100g.protein_g * conversionFactor * 10) / 10,
    carbs_g: Math.round(nutritionPer100g.carbs_g * conversionFactor * 10) / 10,
    fats_g: Math.round(nutritionPer100g.fats_g * conversionFactor * 10) / 10,
  };
}

/**
 * Log food to database
 *
 * @param entry - Food log entry with all required data
 * @returns Database response or error
 */
export async function logFoodToDatabase(entry: FoodLogEntry): Promise<any> {
  try {
    // Validate required fields
    if (!entry.user_id || !entry.food_name || !entry.fdc_id) {
      throw new Error("Missing required fields: user_id, food_name, or fdc_id");
    }

    console.log("[FoodService] Preparing to log food to database:", {
      user_id: entry.user_id,
      food_name: entry.food_name,
      fdc_id: entry.fdc_id,
      meal_type: entry.meal_type,
      date: entry.date,
      calories: entry.calories,
    });

    // Build insert object
    // Use the placeholder UUID for USDA foods (created during service initialization)
    const insertData = {
      user_id: entry.user_id,
      food_id: USDA_FOOD_PLACEHOLDER_ID, // Placeholder UUID for USDA foods
      food_name: entry.food_name,
      fdc_id: entry.fdc_id,
      quantity: entry.quantity,
      quantity_unit: entry.quantity_unit,
      meal_type: entry.meal_type,
      date: entry.date,
      calories: entry.calories,
      protein_g: entry.protein_g,
      carbs_g: entry.carbs_g,
      fats_g: entry.fats_g,
    };

    console.log("[FoodService] Using placeholder food_id for USDA food");

    // Insert food log into Supabase
    const { data, error } = await supabase
      .from("food_logs")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("[FoodService] Database insert error:", error);
      throw error;
    }

    console.log("[FoodService] Food logged successfully:", data);
    return data;
  } catch (error) {
    console.error("[FoodService] Error logging food:", error);
    throw error;
  }
}

/**
 * Get user's food logs for a specific date
 *
 * @param userId - User ID
 * @param date - Date string (YYYY-MM-DD)
 * @returns Array of food logs
 */
export async function getFoodLogs(
  userId: string,
  date: string,
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("food_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("[FoodService] Error fetching food logs:", error);
    throw error;
  }
}

/**
 * Delete food log entry
 *
 * @param logId - Food log ID to delete
 * @returns Delete response
 */
export async function deleteFoodLog(logId: string): Promise<void> {
  try {
    const { error } = await supabase.from("food_logs").delete().eq("id", logId);

    if (error) {
      throw error;
    }

    console.log("[FoodService] Food log deleted:", logId);
  } catch (error) {
    console.error("[FoodService] Error deleting food log:", error);
    throw error;
  }
}

/**
 * Clear all cached food data (useful for debugging or manual refresh)
 */
export async function clearFoodCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    await AsyncStorage.removeItem(SEARCH_CACHE_KEY);
    console.log("[FoodService] Food cache cleared");
  } catch (error) {
    console.error("[FoodService] Error clearing cache:", error);
  }
}
