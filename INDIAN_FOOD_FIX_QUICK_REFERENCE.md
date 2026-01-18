# Quick Reference: Indian Food UUID Error Fix

## The Error

```
ERROR  Add food error: {"code": "22P02", "message": "invalid input syntax for type uuid: \"155\""}
```

## The Fix (3 Simple Steps)

### Step 1: Run the Migration

Copy entire contents of **`SQL_QUICK_FIX_INDIAN_FOODS.sql`** and paste into:
**Supabase Dashboard → SQL Editor → New Query → Run**

⏱️ Takes ~30 seconds

### Step 2: Verify It Worked

Run this in Supabase SQL Editor:

```sql
SELECT COUNT(*) FROM foods WHERE category = 'indian';
```

Should show: **238+**

### Step 3: Test in App

- Restart app
- Food Logging → App Foods → Indian
- Log a food ✅

## That's It!

The app now uses:

- ✅ Main `foods` table (not `foods_indian`)
- ✅ UUID-based food IDs (not numeric)
- ✅ No more UUID validation errors
- ✅ Search works perfectly

## Files for Reference

- 📄 `INDIAN_FOOD_UUID_FIX_COMPLETE.md` - Full documentation
- 📄 `FIX_INDIAN_FOOD_UUID_ERROR.md` - Technical details
- 🔧 `scripts/migrate-indian-foods.ts` - Automated migration
- 💾 `supabase/migrations/20260118_migrate_indian_foods_to_foods_table.sql` - Migration SQL

## Code Changes

Only one file modified:

- `src/hooks/useNutrition.ts` - Now queries main `foods` table

## Emergency Rollback

If needed, run in Supabase SQL Editor:

```sql
DELETE FROM foods WHERE category = 'indian' AND is_custom = FALSE;
```
