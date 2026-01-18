-- Quick Copy-Paste SQL Fix for Indian Food UUID Error
-- 
-- Instructions:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Create New Query
-- 3. Copy the SQL below (starting from line 8)
-- 4. Paste into the query editor
-- 5. Click "Run"
-- 6. Wait for "Query successful" message

-- ==================== START: Copy from here ====================

-- Step 1: Verify foods_indian exists and has data
SELECT COUNT(*) as indian_foods_available FROM foods_indian;

-- Step 2: Migrate Indian foods to main foods table with UUID support
INSERT INTO foods (
  id,
  name,
  calories_per_serving,
  protein_g,
  carbs_g,
  fats_g,
  serving_size_g,
  category,
  is_custom
)
SELECT
  uuid_generate_v4() as id,
  fi.name,
  ROUND(fi.calories)::INTEGER,
  fi.protein_g,
  fi.carbs_g,
  fi.fat_g,
  COALESCE(fi.serving_size_g, 100),
  'indian' as category,
  FALSE
FROM foods_indian fi
WHERE NOT EXISTS (
  SELECT 1 FROM foods f 
  WHERE LOWER(f.name) = LOWER(fi.name) 
  AND f.category = 'indian'
)
ON CONFLICT DO NOTHING;

-- Step 3: Verify migration completed
SELECT COUNT(*) as indian_foods_migrated FROM foods WHERE category = 'indian';

-- Step 4: Check a few example Indian foods
SELECT 
  id,
  name,
  calories_per_serving,
  protein_g,
  category,
  created_at
FROM foods 
WHERE category = 'indian' 
LIMIT 10;

-- ==================== END: Copy to here ====================

-- Expected Results:
-- Step 1: ~238 Indian foods in foods_indian table
-- Step 2: No errors, query successful
-- Step 3: ~238 Indian foods in main foods table
-- Step 4: 10 rows showing Indian foods with UUIDs

-- After running this SQL:
-- 1. The app will automatically use the migrated foods
-- 2. Food logging will work without UUID errors
-- 3. Search functionality will work correctly
