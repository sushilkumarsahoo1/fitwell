-- ==================== SUPABASE SCHEMA MIGRATION ====================
-- Make food_id nullable to support USDA foods
-- 
-- ISSUE: USDA foods don't have a food_id in the local foods table
-- SOLUTION: Allow NULL values for food_id to support logging USDA foods
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard: https://supabase.com/dashboard
-- 2. Navigate to SQL Editor
-- 3. Create new query
-- 4. Copy and paste this entire file
-- 5. Click "Run"
-- ===================================================================

-- Drop the NOT NULL constraint on food_id
ALTER TABLE food_logs
ALTER COLUMN food_id DROP NOT NULL;

-- Optional: Add a comment explaining when food_id is NULL
COMMENT ON COLUMN food_logs.food_id IS 'Foreign key to foods table (NULL for USDA-logged foods without local database entry)';

-- ==================== VERIFICATION ====================
-- Run this query to verify the change:
-- SELECT column_name, is_nullable FROM information_schema.columns 
-- WHERE table_name = 'food_logs' AND column_name = 'food_id';
-- Expected result: is_nullable = YES
