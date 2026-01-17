-- ==================== SUPABASE SCHEMA MIGRATION ====================
-- Apply Missing Columns to food_logs Table
-- 
-- ISSUE: Food options not showing in breakfast, dinner, snacks
-- ROOT CAUSE: Missing columns prevent proper data storage and retrieval
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard: https://supabase.com/dashboard
-- 2. Navigate to SQL Editor
-- 3. Create new query
-- 4. Copy and paste this entire file
-- 5. Click "Run"
--
-- After running this migration:
-- - Food logs will support USDA integration
-- - Quantity units will be properly tracked
-- - Food names will be stored at time of logging
-- ===================================================================

-- ==================== ADD MISSING COLUMNS ====================

-- Add fdc_id to track USDA FoodData Central food IDs
-- This allows linking logged foods directly to USDA database
ALTER TABLE IF EXISTS food_logs ADD COLUMN IF NOT EXISTS fdc_id VARCHAR(50);
COMMENT ON COLUMN food_logs.fdc_id IS 'USDA FoodData Central ID for food tracking';

-- Add food_name to store food name at time of logging
-- This is useful if USDA food is deleted but log entry persists
ALTER TABLE IF EXISTS food_logs ADD COLUMN IF NOT EXISTS food_name VARCHAR(255);
COMMENT ON COLUMN food_logs.food_name IS 'Food name snapshot at time of logging';

-- Add quantity_unit to track unit used when logging (g, oz, cup, tbsp, etc.)
-- This allows reconstruction of original user input
ALTER TABLE IF EXISTS food_logs ADD COLUMN IF NOT EXISTS quantity_unit VARCHAR(20) DEFAULT 'g';
COMMENT ON COLUMN food_logs.quantity_unit IS 'Unit of measurement (g, oz, cup, tbsp, ml, etc)';

-- ==================== CREATE INDEXES ====================

-- Create index on fdc_id for faster USDA food lookups
CREATE INDEX IF NOT EXISTS idx_food_logs_fdc_id ON food_logs(fdc_id);

-- Create index on meal_type for faster filtering by meal
CREATE INDEX IF NOT EXISTS idx_food_logs_meal_type ON food_logs(meal_type);

-- Create compound index for common query pattern (user + date + meal)
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date_meal ON food_logs(user_id, date, meal_type);

-- ==================== VERIFICATION ====================
-- Run these queries to verify the migration was successful:

-- Check if columns exist:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'food_logs' AND column_name IN ('fdc_id', 'food_name', 'quantity_unit');

-- Check if indexes exist:
-- SELECT indexname FROM pg_indexes WHERE tablename = 'food_logs';

-- ==================== NOTES ====================
-- - All new columns are nullable for backward compatibility
-- - Existing food logs will have NULL values for new columns
-- - The app will handle NULL values gracefully
-- - RLS policies are not affected by these new columns
-- - No data migration is required - existing rows remain unchanged
