/**
 * Indian Food Database TypeScript Types & Interfaces
 * Complete reference for working with local Indian foods
 */

/**
 * Indian Food Data Structure
 * Represents a food from the local IFCT 2017 database
 */
export interface IndianFood {
  id: number;
  name: string; // e.g., "Samosa (fried)"
  name_hindi?: string; // e.g., "समोसा"
  category: string; // e.g., "Indian", "Bread", "Rice"
  description?: string; // Optional description

  // Nutrition values per serving
  serving_size_g: number; // Serving size in grams (default: 100)
  calories: number; // Energy in kcal
  protein_g: number; // Protein in grams
  carbs_g: number; // Carbohydrates in grams
  fat_g: number; // Fat in grams
  fiber_g?: number; // Fiber in grams
  water_g?: number; // Water in grams

  // Micronutrients stored as JSON object
  micronutrients?: {
    iron_mg?: number; // Iron in mg
    calcium_mg?: number; // Calcium in mg
    phosphorus_mg?: number; // Phosphorus in mg
    vitamin_c_mg?: number; // Vitamin C in mg
    vitamin_a_iu?: number; // Vitamin A in IU
    [key: string]: number | undefined; // Other micronutrients
  };

  // Metadata
  source: "IFCT" | "Open Food Facts" | "User Added"; // Data source
  source_id?: string; // Original ID from source system
  is_verified?: boolean; // Whether data is verified

  // Timestamps
  created_at?: string; // ISO 8601 datetime
  updated_at?: string; // ISO 8601 datetime
}

/**
 * Search Results Structure
 */
export interface IndianFoodSearchResult {
  id: number;
  name: string;
  name_hindi?: string;
  serving_size_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

/**
 * Nutrition Data Structure
 * Result of calculating nutrition for a specific quantity
 */
export interface NutritionData {
  calories: number; // Total calories for quantity
  protein_g: number; // Total protein in grams
  carbs_g: number; // Total carbs in grams
  fats_g: number; // Total fat in grams
}

/**
 * Food Log Entry Structure
 * Record of a logged food in the database
 */
export interface FoodLogEntry {
  id?: string; // Log ID
  user_id: string; // User who logged

  // Food identification
  food_name: string; // Display name
  fdc_id: string; // "INDIAN_123" or USDA ID
  foods_id?: string; // FK to foods table (for USDA)

  // Quantity and units
  quantity: number; // Amount consumed
  quantity_unit: string; // Unit (grams, cups, etc.)

  // Meal and date info
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  date: string; // YYYY-MM-DD

  // Calculated nutrition for this entry
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;

  // Metadata
  source?: "indian_local" | "usda" | "database";
  created_at?: string;
  updated_at?: string;
}

/**
 * Quantity Unit Types Supported
 */
export type QuantityUnit =
  | "g"
  | "gram"
  | "grams"
  | "oz"
  | "ounce"
  | "ounces"
  | "cup"
  | "cups"
  | "tbsp"
  | "tablespoon"
  | "tablespoons"
  | "tsp"
  | "teaspoon"
  | "teaspoons"
  | "ml"
  | "piece"
  | "pieces"
  | "bowl"
  | "slice"
  | "serving";

/**
 * Unit Conversion Map
 * Convert any unit to grams for calculation
 */
export const UNIT_CONVERSIONS: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  oz: 28.35,
  ounce: 28.35,
  ounces: 28.35,
  cup: 240,
  cups: 240,
  tbsp: 15,
  tablespoon: 15,
  tablespoons: 15,
  tsp: 5,
  teaspoon: 5,
  teaspoons: 5,
  ml: 1,
  piece: 100,
  pieces: 100,
  bowl: 200,
  slice: 50,
  serving: 100,
};

/**
 * API Response Types
 */

/**
 * Search Response
 */
export interface IndianFoodSearchResponse {
  foods: IndianFoodSearchResult[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Error Response
 */
export interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
}

/**
 * Success Response
 */
export interface SuccessResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Usage Examples
 */

/*
// Example 1: Search for Indian foods
import { searchIndianFoods } from '@services/foodService';

const results = await searchIndianFoods('biryani', 10);
// Returns: IndianFoodSearchResult[]

// Example 2: Get full food details
import { getIndianFoodDetails } from '@services/foodService';

const food: IndianFood | null = await getIndianFoodDetails(123);

// Example 3: Calculate nutrition for a quantity
import { extractIndianFoodNutrition } from '@services/foodService';

const food: IndianFood = {
  id: 1,
  name: 'Rice (cooked)',
  serving_size_g: 100,
  calories: 130,
  protein_g: 2.7,
  carbs_g: 28,
  fat_g: 0.3,
  category: 'Indian',
  source: 'IFCT'
};

const nutrition: NutritionData = extractIndianFoodNutrition(food, 2, 'cup');
// Returns: { calories: 624, protein_g: 5.18, carbs_g: 53.76, fats_g: 0.72 }

// Example 4: Log Indian food
import { logIndianFood } from '@services/foodService';

const entry = await logIndianFood(
  123,           // foodId
  2,             // quantity
  'cup',         // unit
  'lunch',       // mealType
  '2026-01-18'  // date
);
// Returns: FoodLogEntry

// Example 5: Handle food source toggle
const [foodSource, setFoodSource] = useState<'database' | 'usda'>('database');

const handleSearch = async (query: string) => {
  if (foodSource === 'database') {
    const results = await searchIndianFoods(query);
    // Use local foods
  } else {
    const results = await searchFoods(query);
    // Use USDA API
  }
};
*/

/**
 * Sample Data
 */

export const SAMPLE_INDIAN_FOODS: IndianFood[] = [
  {
    id: 1,
    name: "Samosa (fried)",
    name_hindi: "समोसा",
    category: "Indian",
    serving_size_g: 100,
    calories: 285,
    protein_g: 5.2,
    carbs_g: 32,
    fat_g: 14.8,
    fiber_g: 2.1,
    water_g: 41.2,
    micronutrients: {
      iron_mg: 2.1,
      calcium_mg: 65,
      vitamin_c_mg: 0,
    },
    source: "IFCT",
  },
  {
    id: 2,
    name: "Biryani (with meat)",
    name_hindi: "बिरयानी",
    category: "Indian",
    serving_size_g: 100,
    calories: 175,
    protein_g: 12,
    carbs_g: 18,
    fat_g: 5.5,
    fiber_g: 0.8,
    water_g: 62,
    micronutrients: {
      iron_mg: 1.8,
      calcium_mg: 28,
      vitamin_c_mg: 2,
    },
    source: "IFCT",
  },
  {
    id: 3,
    name: "Daal (lentils cooked)",
    name_hindi: "दाल",
    category: "Indian",
    serving_size_g: 100,
    calories: 118,
    protein_g: 9.5,
    carbs_g: 20,
    fat_g: 0.4,
    fiber_g: 1.8,
    water_g: 68.5,
    micronutrients: {
      iron_mg: 3.2,
      calcium_mg: 22,
      vitamin_c_mg: 0,
    },
    source: "IFCT",
  },
];

/**
 * Supabase Query Examples
 */

/*
-- Search for Indian foods
SELECT * FROM foods_indian 
WHERE name ILIKE '%biryani%' 
OR name_hindi ILIKE '%biryani%'
LIMIT 10;

-- Get food with highest calories
SELECT * FROM foods_indian 
ORDER BY calories DESC 
LIMIT 10;

-- Get high protein foods
SELECT id, name, protein_g, calories 
FROM foods_indian 
WHERE protein_g > 15
ORDER BY protein_g DESC;

-- Get foods by category
SELECT * FROM foods_indian 
WHERE category = 'Bread'
ORDER BY name;

-- Get micronutrient data
SELECT 
  name,
  calories,
  micronutrients->>'iron_mg' as iron_mg,
  micronutrients->>'calcium_mg' as calcium_mg
FROM foods_indian
WHERE micronutrients ? 'iron_mg'
LIMIT 10;

-- Count foods by source
SELECT source, COUNT(*) as count
FROM foods_indian
GROUP BY source;
*/
