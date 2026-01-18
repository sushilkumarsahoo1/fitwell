# 🔧 Fix: Indian Food UUID Validation Error

## Problem

When trying to log Indian foods, you get this error:

```
ERROR  Add food error: {"code": "22P02", "message": "invalid input syntax for type uuid: \"155\""}
```

## Root Cause

- Indian foods were stored in a separate `foods_indian` table with numeric IDs (BIGSERIAL)
- The main `food_logs` table expects `food_id` to be a UUID (foreign key to `foods` table)
- When logging an Indian food with numeric ID "155", the database rejects it because it's not a valid UUID

## Solution

Migrate all Indian foods from the `foods_indian` table to the main `foods` table with proper UUID support.

## Implementation Steps

### Step 1: Run the Migration Script

```bash
# Using ts-node
npx ts-node scripts/migrate-indian-foods.ts

# Or if ts-node isn't available, manually execute the SQL:
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Create a new query
# 3. Copy contents from: supabase/migrations/20260118_migrate_indian_foods_to_foods_table.sql
# 4. Click "Run"
```

### Step 2: Verify the Migration

Check Supabase SQL Editor:

```sql
-- Count Indian foods in main table
SELECT COUNT(*) as count FROM foods WHERE category = 'indian';

-- Should show 238+ Indian foods
```

### Step 3: No Code Changes Required

The app will automatically:

- Use the migrated Indian foods from the main `foods` table
- Generate proper UUID IDs for all food logs
- No food logging errors

## Files Modified

1. **src/hooks/useNutrition.ts**
   - Updated `useFoodDatabase` to query main `foods` table instead of `foods_indian`
   - Now supports UUID-based food IDs

2. **supabase/migrations/20260118_migrate_indian_foods_to_foods_table.sql**
   - Migration SQL to move Indian foods with UUID support
   - Creates optional migration map for reference
   - Can be run via Supabase CLI or SQL Editor

3. **scripts/migrate-indian-foods.ts**
   - Node.js/TypeScript migration script
   - Automated migration with verification
   - Can be run: `npx ts-node scripts/migrate-indian-foods.ts`

## Before & After

### Before (Error)

```
foods_indian table: ID 155 (numeric)
       ↓
FoodLoggingScreen: selectedDatabaseFoodId = "155"
       ↓
food_logs insert: food_id = "155" ❌ INVALID UUID ERROR
```

### After (Fixed)

```
foods table: ID = a1b2c3d4-... (UUID)
       ↓
FoodLoggingScreen: selectedDatabaseFoodId = "a1b2c3d4-..."
       ↓
food_logs insert: food_id = "a1b2c3d4-..." ✅ VALID UUID
```

## Testing

1. Open the app
2. Go to Food Logging
3. Select "App Foods" tab
4. Choose "Indian" category
5. Search for and select an Indian food
6. Log the food
7. Verify it appears in Today's Nutrition without errors ✅

## Rollback (if needed)

If anything goes wrong:

```sql
-- Undo the migration (remove Indian foods from main table)
DELETE FROM foods WHERE category = 'indian' AND is_custom = FALSE;

-- Indian foods remain in foods_indian table
```

## Notes

- The `foods_indian` table remains unchanged and can be kept for reference
- The migration creates a `foods_indian_migration_map` table to track old→new ID mappings
- All future Indian foods should be added to the main `foods` table with UUID IDs
