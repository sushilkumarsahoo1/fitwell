# Food Logging Fix - USDA Foods Not Storing

## Problem Summary

After clicking a USDA food to log it, the app shows an error and the food is not saved to the database.

**Error Messages:**

```
ERROR: Cannot read property 'toString' of undefined
ERROR: null value in column "food_id" of relation "food_logs" violates not-null constraint
```

## Root Causes

### 1. Nutrient Extraction Issue ✅ FIXED

Some USDA foods have nutrients without a `nutrientId` field. When trying to extract nutrition data, the code called `.toString()` on undefined.

**Fix Applied:** Added defensive null checks in `src/services/foodService.ts` in the `extractNutrition()` function to skip invalid nutrients.

### 2. Database Constraint Issue ⚠️ REQUIRES MIGRATION

The `food_logs` table has a NOT NULL constraint on the `food_id` column. However:

- Local database foods have a `food_id` (foreign key to foods table)
- USDA foods don't have a `food_id` since they're not in our local database
- When logging USDA foods, we now pass `null` for `food_id`

**Fix Required:** Make the `food_id` column nullable in Supabase

## Solution: Apply Database Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste this SQL:

```sql
ALTER TABLE food_logs
ALTER COLUMN food_id DROP NOT NULL;

COMMENT ON COLUMN food_logs.food_id IS 'Foreign key to foods table (NULL for USDA-logged foods)';
```

6. Click **Run**
7. You should see: `Query executed successfully`

### Option 2: Using the Migration File

1. Open Supabase Dashboard
2. Go to SQL Editor → New Query
3. Open the file: `database/MIGRATION_MAKE_FOOD_ID_NULLABLE.sql`
4. Copy entire contents into the SQL Editor
5. Click **Run**

### Verification

After applying the migration, run this query to confirm:

```sql
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'food_logs' AND column_name = 'food_id';
```

**Expected Result:**

```
column_name | is_nullable
food_id     | YES
```

## Testing the Fix

After applying the migration:

1. Restart the app
2. Search for a USDA food (e.g., "Chicken")
3. Click to select a food
4. Enter quantity (e.g., "100g")
5. Click "Log Breakfast" (or appropriate meal)
6. Should see: **"Success: Food logged successfully!"**

## Code Changes Made

### File: `src/services/foodService.ts`

#### Change 1: Defensive Nutrient Extraction

```typescript
// OLD - Could fail with "Cannot read property 'toString' of undefined"
const nutrientKey = nutrient.nutrientId.toString();

// NEW - Safely handles missing nutrientId
if (
  !nutrient ||
  nutrient.nutrientId === undefined ||
  nutrient.nutrientId === null
) {
  return;
}
const nutrientKey = String(nutrient.nutrientId);
```

#### Change 2: Allow NULL food_id for USDA Foods

```typescript
// Now explicitly passing null for USDA foods
const { data, error } = await supabase.from("food_logs").insert({
  user_id: entry.user_id,
  food_id: null, // ← Allow NULL for USDA foods
  food_name: entry.food_name,
  fdc_id: entry.fdc_id,
  // ... other fields
});
```

### File: `src/screens/app/FoodLoggingScreen.tsx`

Added comprehensive debugging logs to `handleAddUSDAFood()`:

- Logs what food is being logged
- Logs quantity conversion
- Logs extracted nutrition data
- Logs actual error messages (not just generic "Failed to log USDA food")

## What Happens Now

### When Logging a Local Database Food

- `food_id` = UUID of the food from your `foods` table
- `fdc_id` = NULL
- Uses local nutrition data

### When Logging a USDA Food

- `food_id` = NULL (no local database entry)
- `fdc_id` = USDA FoodData Central ID (e.g., "2090362")
- `food_name` = Food name from USDA
- Uses USDA nutrition data converted to the user's entered quantity

## Files Modified

1. `src/services/foodService.ts` - Defensive nutrient extraction + NULL food_id support
2. `src/screens/app/FoodLoggingScreen.tsx` - Enhanced error logging
3. `database/MIGRATION_MAKE_FOOD_ID_NULLABLE.sql` - NEW migration file

## Next Steps After Migration

The food logging feature will be fully operational with both:

- ✅ Local database foods (traditional meal logging)
- ✅ USDA foods (search database with nutrition)

Both types will be stored in the `food_logs` table and appear in your daily nutrition totals.
