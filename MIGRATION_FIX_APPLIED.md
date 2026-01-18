# Fix Applied: Updated Migration SQL

## Issue

Error when running migration:

```
ERROR: 42703: column fi.updated_at does not exist
```

## Root Cause

The migration SQL was trying to insert `created_at` and `updated_at` from the source `foods_indian` table, but the destination `foods` table generates these automatically.

## Solution

Removed the timestamp columns from the INSERT statement since PostgreSQL will automatically set them using DEFAULT CURRENT_TIMESTAMP.

## Changed Files

✅ **SQL_QUICK_FIX_INDIAN_FOODS.sql** - Updated INSERT statement (removed timestamp fields)
✅ **supabase/migrations/20260118_migrate_indian_foods_to_foods_table.sql** - Updated INSERT statement (removed timestamp fields)

## The Fix

Removed this from the INSERT column list:

```sql
created_at,
updated_at
```

And removed from the SELECT:

```sql
fi.created_at,
fi.updated_at,
```

Now the migration uses:

- `DEFAULT CURRENT_TIMESTAMP` for `created_at` in the foods table
- `DEFAULT CURRENT_TIMESTAMP` for `updated_at` in the foods table

## Next Steps

Try running the migration again in Supabase SQL Editor with the updated SQL_QUICK_FIX_INDIAN_FOODS.sql file. It should work now!
