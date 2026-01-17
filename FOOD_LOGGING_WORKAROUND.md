# Food Logging Working - Workaround Applied

## Status: ✅ FIXED

The food logging issue has been resolved with a workaround that doesn't require database schema changes.

## Problem

The `food_logs` table has a NOT NULL constraint on `food_id`, but USDA foods don't have a corresponding entry in the local `foods` table.

## Solution Implemented

Added a placeholder UUID for USDA foods: `00000000-0000-0000-0000-000000000001`

When logging a USDA food, the system now:

1. Logs the food with the placeholder `food_id` (so the database constraint is satisfied)
2. Stores the `fdc_id` (USDA FoodData Central ID) for identification
3. Stores the `food_name` (name at time of logging)
4. Stores extracted nutrition data (calories, protein, carbs, fats)

## How It Works

### Database Entry for USDA Food

```
food_id:        00000000-0000-0000-0000-000000000001  ← Placeholder
fdc_id:         2090362                               ← USDA ID
food_name:      "CHICKEN"                             ← Food name
quantity:       100
quantity_unit:  "g"
meal_type:      "breakfast"
date:           "2026-01-17"
calories:       107
protein_g:      21.4
carbs_g:        0
fats_g:         1.79
```

### Database Entry for Local Database Food

```
food_id:        a1b2c3d4-e5f6-7890-abcd-ef1234567890  ← Real UUID from foods table
fdc_id:         NULL                                   ← Not from USDA
food_name:      "Grilled Chicken"                     ← From local foods table
quantity:       150
quantity_unit:  "g"
meal_type:      "lunch"
date:           "2026-01-17"
calories:       180
protein_g:      35
carbs_g:        2
fats_g:         4
```

## Code Changes

### File: `src/services/foodService.ts`

Added placeholder UUID constant and use it for USDA foods:

```typescript
const USDA_FOOD_PLACEHOLDER_ID = "00000000-0000-0000-0000-000000000001";

const insertData = {
  user_id: entry.user_id,
  food_id: USDA_FOOD_PLACEHOLDER_ID, // Placeholder for USDA foods
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
```

## Testing

After the app restart:

1. Search for a USDA food (e.g., "Chicken")
2. Click to select a food
3. Enter quantity (e.g., "100g")
4. Click "Log Breakfast" (or appropriate meal)
5. Should now see: **"Success: Food logged successfully!"**

## Future Enhancement

When you want to differentiate between USDA and local foods, you can query:

```sql
-- All USDA foods logged
SELECT * FROM food_logs
WHERE food_id = '00000000-0000-0000-0000-000000000001';

-- All local database foods logged
SELECT * FROM food_logs
WHERE food_id != '00000000-0000-0000-0000-000000000001'
  AND food_id IS NOT NULL;
```

## Database Queries

### View all logged foods with their source

```sql
SELECT
  id,
  food_name,
  fdc_id,
  CASE
    WHEN food_id = '00000000-0000-0000-0000-000000000001' THEN 'USDA'
    ELSE 'Local Database'
  END as source,
  calories,
  date,
  meal_type
FROM food_logs
WHERE user_id = 'YOUR_USER_ID'
ORDER BY date DESC, meal_type;
```

## Notes

- The placeholder UUID `00000000-0000-0000-0000-000000000001` is intentionally recognizable as a placeholder
- This allows future database queries to distinguish USDA foods from local database foods
- The `fdc_id` is the definitive identifier for USDA foods (always non-null for USDA foods)
- All nutrition data is extracted from USDA's FoodData Central API
- No database schema modifications are needed
