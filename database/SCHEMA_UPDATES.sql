-- ==================== SCHEMA UPDATES FOR USDA INTEGRATION ====================
-- 
-- This migration adds columns to support:
-- 1. USDA FoodData Central API integration with fdc_id tracking
-- 2. Enhanced workout logging with exercise names and strength training details
--
-- Run in Supabase dashboard: SQL Editor -> New Query
-- Or via CLI: supabase db push

-- ==================== FOOD_LOGS ENHANCEMENTS ====================

-- Add fdc_id to track USDA FoodData Central food IDs
-- Allows linking logged foods directly to USDA database
ALTER TABLE IF EXISTS food_logs ADD COLUMN IF NOT EXISTS fdc_id VARCHAR(50);

-- Add food_name to store food name at time of logging
-- Useful if USDA food is deleted but log entry persists
ALTER TABLE IF EXISTS food_logs ADD COLUMN IF NOT EXISTS food_name VARCHAR(255);

-- Add quantity_unit to track unit used when logging (g, oz, cup, tbsp, etc.)
-- Allows reconstruction of original user input
ALTER TABLE IF EXISTS food_logs ADD COLUMN IF NOT EXISTS quantity_unit VARCHAR(20) DEFAULT 'g';

-- Create index on fdc_id for faster USDA food lookups
CREATE INDEX IF NOT EXISTS idx_food_logs_fdc_id ON food_logs(fdc_id);

-- ==================== WORKOUT_LOGS ENHANCEMENTS ====================

-- Add type to indicate workout type
-- Values: strength, cardio, yoga, hiit
ALTER TABLE IF EXISTS workout_logs ADD COLUMN IF NOT EXISTS type VARCHAR(20);

-- Add exercise_name to store exercise name at time of logging
-- Supports both database workouts and local exercise logging
ALTER TABLE IF EXISTS workout_logs ADD COLUMN IF NOT EXISTS exercise_name VARCHAR(255);

-- Add sets for strength training
-- Number of sets performed
ALTER TABLE IF EXISTS workout_logs ADD COLUMN IF NOT EXISTS sets INT;

-- Add reps for strength training
-- Number of repetitions per set
ALTER TABLE IF EXISTS workout_logs ADD COLUMN IF NOT EXISTS reps INT;

-- Add weight_kg for strength training sessions
-- Allows tracking of weighted exercises (e.g., 50kg bench press)
ALTER TABLE IF EXISTS workout_logs ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(6, 2);

-- Add distance_km for cardio activities
-- Tracks distance covered in running, cycling, swimming, etc.
ALTER TABLE IF EXISTS workout_logs ADD COLUMN IF NOT EXISTS distance_km DECIMAL(8, 3);

-- Add intensity level for workouts
-- Values: light, moderate, vigorous - helps with calorie burn estimation
ALTER TABLE IF EXISTS workout_logs ADD COLUMN IF NOT EXISTS intensity VARCHAR(20);

-- ==================== NOTES ====================
--
-- Make existing columns nullable to support new logging patterns
-- These columns were previously required but now support auto-generated logging

-- Allow workout_id to be nullable (for new direct logging)
ALTER TABLE IF EXISTS workout_logs ALTER COLUMN workout_id DROP NOT NULL;

-- Remove foreign key constraint on workout_id if it exists
-- workout_id is now used as a unique identifier for each log, not a reference to workouts table
ALTER TABLE IF EXISTS workout_logs DROP CONSTRAINT IF EXISTS workout_logs_workout_id_fkey;

-- RLS Policies:
-- - Food logs: Users can only view/edit/delete their own logs (existing policy covers new columns)
-- - Workout logs: Users can only view/edit/delete their own logs (existing policy covers new columns)
--
-- Backward Compatibility:
-- - All new columns are optional (nullable) to maintain existing data
-- - Old records will have NULL values for new columns
-- - Application logic should handle NULL values gracefully
--
-- Calorie Burn Formula (from workoutUtils.ts):
-- calories = MET × weight_kg × duration_hours
-- 
-- USDA API Notes:
-- - fdc_id links to USDA FoodData Central food ID
-- - Data is cached for 48 hours to minimize API calls
-- - Free, public-domain API - no authentication required
--
-- Fitness Tracking Benefits:
-- - Track which foods user prefers (via fdc_id search history)
-- - Precise calorie burn calculation with weight_kg and intensity
-- - Support for all workout types: strength, cardio, yoga, HIIT
-- - Distance tracking for running/cycling activities
