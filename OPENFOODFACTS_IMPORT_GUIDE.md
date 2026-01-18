# OpenFoodFacts CSV Import - Status & Instructions

## Status Summary

✅ **CSV File Located**: `en.openfoodfacts.org.products.csv` (11.6 GB)

- Format: Tab-delimited TSV
- Records: ~4.2 million rows
- Contains: Product names, categories, brands, and some nutrition data

✅ **Data Extraction Scripts Created**:

1. `import-foods-final.py` - Standard import with batching
2. `import-foods-sql.py` - SQL-based import (experimental)
3. `test-csv.py` - Quick test to verify CSV parsing

✅ **Database Schema Ready**:

- `foods` table has columns for all nutrition data
- Currently has RLS (Row Level Security) policy that restricts anonymous inserts

## Current Issue

❌ **Row Level Security (RLS) Blocking Inserts**

- Error: `new row violates row-level security policy for table "foods"`
- The RLS policy requires either:
  - Authenticated user (with user_id matching auth.uid())
  - OR modification of the INSERT policy

## Solution Options

### Option 1: Fix RLS Policy (Recommended)

Update the RLS policy in Supabase Dashboard:

1. Go to Supabase Dashboard → Authentication → Policies
2. Find policy: "Anyone can create public foods" on the `foods` table
3. Change the policy CHECK condition from:
   ```sql
   is_custom = FALSE AND user_id IS NULL
   ```
   To:
   ```sql
   is_custom = FALSE
   ```

Then run:

```bash
python import-foods-final.py
```

### Option 2: Use Service Role Key

If you have a service role key (more permissive), update the import script to use it:

```python
SUPABASE_KEY = "your_service_role_key_here"
```

### Option 3: Direct SQL Insert via Dashboard

1. Go to Supabase SQL Editor
2. Paste and run the migration script from `supabase/migrations/`
3. Or manually create a trigger that bypasses RLS

## How Data is Mapped

The import script extracts from CSV and maps to database:

| CSV Column         | Database Column      | Default Value        |
| ------------------ | -------------------- | -------------------- |
| product_name       | name                 | (required)           |
| energy-kcal_100g   | calories_per_serving | 100                  |
| proteins_100g      | protein_g            | 5.0                  |
| carbohydrates_100g | carbs_g              | 10.0                 |
| fat_100g           | fats_g               | 5.0                  |
| serving_size       | serving_size_g       | 100                  |
| categories_en      | category             | "global" or "indian" |
| N/A                | is_custom            | false                |
| N/A                | user_id              | NULL                 |

## Import Performance

- Processing rate: ~19,000 rows/sec
- Expected total time: ~4-5 minutes for full dataset
- Batch size: 5,000 records per API call
- ~850 total batches

## Files Created

```
/Users/apple/Developer/app/fitwell/
├── import-foods-final.py         # Main import script (recommended)
├── import-foods-sql.py           # SQL-based alternative
├── import-openfoodfacts.py       # Original version
├── import-openfoodfacts-optimized.py
├── test-csv.py                   # CSV parsing test
└── fix-rls-for-import.py         # RLS diagnostics
```

## Next Steps

1. **Fix RLS Policy** (via Supabase Dashboard or SQL):

   ```sql
   ALTER POLICY "Anyone can create public foods" ON foods
   USING (is_custom = FALSE);
   ```

2. **Run Import**:

   ```bash
   cd /Users/apple/Developer/app/fitwell
   python import-foods-final.py
   ```

3. **Verify Import**:
   ```bash
   # Check in Supabase Dashboard or run:
   python -c "from supabase import create_client; \
   supabase = create_client('...', '...'); \
   result = supabase.table('foods').select('id', count='exact').limit(1).execute(); \
   print(f'Total foods: {result.count}')"
   ```

## Troubleshooting

### Still getting RLS error?

- Verify you modified the correct policy (check policy name)
- Try using a service role key
- Check if RLS is actually enabled on the table

### CSV parsing issues?

- File is tab-delimited (not comma-delimited)
- Field size limit is set to 100MB for large fields
- Many fields are empty in source data (use defaults)

### Import too slow?

- Increase BATCH_SIZE in script (e.g., 10,000)
- Check network connectivity to Supabase
- Monitor for rate limiting

## File Size Reference

- CSV File: 11.6 GB
- Expected database size after import: ~500 MB - 1 GB (depending on indexing)
