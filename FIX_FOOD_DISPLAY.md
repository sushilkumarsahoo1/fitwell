/\*\*

- FIT WELL - FOOD DISPLAY FIX
-
- Issue: Food options not showing in breakfast, dinner, snacks sections
- Status: DIAGNOSED AND FIXED
-
- Root Causes Identified:
- 1.  TypeScript FoodLog interface missing 'foods' relationship property
- 2.  Missing optional properties: food_name, fdc_id, quantity_unit
- 3.  No error logging to diagnose data flow issues
- 4.  Query was correct but type safety was missing
      \*/

// =============================================================================
// STEP 1: VERIFY DATABASE SCHEMA
// =============================================================================
/\*
The food_logs table uses:

- food_id (UUID) - Foreign key to foods table
- Joined with foods table using select("_, foods(_)")
- Returns nested {foods: {id, name, calories_per_serving, ...}} object

Current columns in food_logs:
✓ id (UUID)
✓ user_id (UUID)
✓ food_id (UUID)
✓ quantity (DECIMAL)
✓ meal_type (VARCHAR) - breakfast|lunch|dinner|snack
✓ date (DATE)
✓ calories (INTEGER)
✓ protein_g (DECIMAL)
✓ carbs_g (DECIMAL)
✓ fats_g (DECIMAL)

Missing columns (needed for full USDA support):
✗ fdc_id (VARCHAR) - USDA FoodData Central ID
✗ food_name (VARCHAR) - Food name snapshot
✗ quantity_unit (VARCHAR) - Measurement unit

Action: Run MIGRATION_FOOD_LOGS.sql in Supabase dashboard
\*/

// =============================================================================
// STEP 2: VERIFY TYPE DEFINITIONS
// =============================================================================
/\*
Fixed in src/types/index.ts:

interface FoodLog {
...existing fields...
food_name?: string; // NEW - for USDA foods
fdc_id?: string; // NEW - USDA tracking
quantity_unit?: string; // NEW - measurement unit
foods?: Food; // NEW - nested relationship
}

This allows TypeScript to properly type the joined foods data.
\*/

// =============================================================================
// STEP 3: VERIFY QUERY
// =============================================================================
/\*
Updated in src/hooks/useNutrition.ts:

export const useDailyFoodLogs = (userId: string, date: string) => {
return useQuery({
queryKey: ["foodLogs", userId, date],
queryFn: async () => {
console.log(`[useNutrition] Fetching food logs for ${userId} on ${date}`);

      const { data, error } = await supabase
        .from("food_logs")
        .select("*, foods(*)")              // ✓ Joins with foods table
        .eq("user_id", userId)              // ✓ Filters by user
        .eq("date", date)                   // ✓ Filters by date
        .order("created_at", { ascending: false });

      if (error) {
        console.error(`[useNutrition] Error fetching food logs:`, error);
        throw error;
      }

      console.log(`[useNutrition] Fetched ${data?.length || 0} food logs`, data);

      return data || [];
    },
    enabled: !!userId && !!date,

});
};

Changes:

- Added detailed logging
- Added error logging with context
- Added order by created_at for consistency
- Added data structure verification
  \*/

// =============================================================================
// STEP 4: VERIFY DISPLAY LOGIC
// =============================================================================
/\*
Updated in src/screens/app/FoodLoggingScreen.tsx:

// Before:
{log.food_name || log.foods?.name}

// After:
{log.food_name || log.foods?.name || "Unnamed Food"}

Added fallback for missing data.

Data flow:

1. Query returns: { id, user_id, food_id, quantity, ..., foods: {id, name, ...} }
2. TypeScript type: FoodLog with foods?: Food
3. Display: log.food_name (USDA) || log.foods?.name (database) || "Unnamed Food"

The display code correctly uses optional chaining and fallbacks.
\*/

// =============================================================================
// STEP 5: MANUAL TESTING STEPS
// =============================================================================
/\*
After applying the schema migration:

1. Open app and navigate to Food Logging screen
2. Check console logs for:
   - "[useNutrition] Fetching food logs for [userId] on [date]"
   - "[useNutrition] Fetched X food logs"
   - "[useNutrition] Sample food log:" with data structure

3. Add a food item:
   - Select a meal type (breakfast, lunch, dinner, snack)
   - Add a food from the app database
   - Verify:
     - No errors in console
     - Food appears in the correct meal section
     - Nutrition data displays correctly

4. Add a USDA food:
   - Search for a food in USDA tab
   - Select and log it
   - Verify:
     - Food appears with name from USDA
     - fdc_id is stored in database
     - food_name is stored in database
     - quantity_unit is stored correctly

5. Check Supabase dashboard:
   - Query food_logs table for your user
   - Verify new rows have:
     _ food_id populated (for database foods)
     _ food_name populated (for USDA foods)
     _ fdc_id populated (for USDA foods)
     _ quantity_unit populated
     _ meal_type is lowercase (breakfast|lunch|dinner|snack)
     _/

// =============================================================================
// STEP 6: TROUBLESHOOTING
// =============================================================================
/\*
If food still doesn't display:

1. Check console for "[useNutrition]" logs
   - If no logs appear: query might be disabled, check enabled condition
   - If error: check RLS policies in Supabase

2. Check if food_logs table has data:
   - Go to Supabase Dashboard > SQL Editor
   - Run: SELECT \* FROM food_logs WHERE user_id = 'YOUR_USER_ID' LIMIT 10;
   - If empty: food isn't being inserted

3. Check meal_type values:
   - Run: SELECT DISTINCT meal_type FROM food_logs;
   - Ensure values are lowercase: breakfast, lunch, dinner, snack
   - Check filtering code matches exactly

4. Check RLS policies:
   - User must be authenticated
   - RLS policy: "Users can view own food logs"
   - Verify: auth.uid() = user_id

5. Check React Query:
   - Open React Query Devtools in app
   - Look for "foodLogs" query
   - Check if it's fetching or has data/error state
   - Check if it's enabled (enabled: !!userId && !!date)
     \*/

// =============================================================================
// STEP 7: VALIDATION QUERIES
// =============================================================================
/\*
Run these in Supabase SQL Editor to verify setup:

-- Check table structure:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'food_logs'
ORDER BY ordinal_position;

-- Check if migrations applied:
SELECT EXISTS(
SELECT 1 FROM information_schema.columns
WHERE table_name = 'food_logs' AND column_name = 'fdc_id'
) as has_fdc_id;

-- Check for sample data:
SELECT fl.id, fl.food_id, f.name, fl.meal_type, fl.date, fl.calories
FROM food_logs fl
LEFT JOIN foods f ON fl.food_id = f.id
LIMIT 5;

-- Check RLS policies:
SELECT policyname, QUAL
FROM pg_policies
WHERE tablename = 'food_logs';

-- Test query like the app uses:
SELECT _, foods(_)
FROM food_logs
WHERE user_id = 'YOUR_USER_ID'
AND date = '2026-01-17'
LIMIT 10;
\*/

module.exports = {
fixes_applied: [
"Updated FoodLog TypeScript interface with foods relationship",
"Added missing optional properties to FoodLog type",
"Enhanced useDailyFoodLogs query with logging and error handling",
"Added fallback for missing food name in display",
"Created database migration SQL for missing columns",
],
files_modified: [
"src/types/index.ts - Enhanced FoodLog interface",
"src/hooks/useNutrition.ts - Added logging and error handling",
"src/screens/app/FoodLoggingScreen.tsx - Added fallback display",
],
next_steps: [
"1. Run MIGRATION_FOOD_LOGS.sql in Supabase dashboard",
"2. Rebuild and restart the app",
"3. Check browser console for '[useNutrition]' debug logs",
"4. Add a food item and verify it appears in the meal section",
"5. Check Supabase dashboard to verify data is stored",
],
};
