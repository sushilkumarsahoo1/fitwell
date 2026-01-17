#!/bin/bash

# Apply Supabase Schema Migrations for Food Logs Enhancement
# This script adds missing columns to support USDA integration and enhanced tracking

set -e

PROJECT_REF="mtevaxgfkjyifnaftyxhl"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZXZheGdma2p5aWZuYWZ0eGhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ4NjAyNywiZXhwIjoyMDg0MDYyMDI3fQ.1p4lBYX2BunvxC6TXOgHAZyXqvHDMQzBOeodeGX0Ze8"

echo "🚀 Starting Supabase schema migration..."
echo ""

# Create migration SQL
MIGRATION_SQL='
-- Add fdc_id to track USDA FoodData Central food IDs
ALTER TABLE IF EXISTS food_logs ADD COLUMN IF NOT EXISTS fdc_id VARCHAR(50);

-- Add food_name to store food name at time of logging  
ALTER TABLE IF EXISTS food_logs ADD COLUMN IF NOT EXISTS food_name VARCHAR(255);

-- Add quantity_unit to track unit used when logging (g, oz, cup, tbsp, etc.)
ALTER TABLE IF EXISTS food_logs ADD COLUMN IF NOT EXISTS quantity_unit VARCHAR(20) DEFAULT '"'"'g'"'"';

-- Create index on fdc_id for faster USDA food lookups
CREATE INDEX IF NOT EXISTS idx_food_logs_fdc_id ON food_logs(fdc_id);

-- Create index on meal_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_food_logs_meal_type ON food_logs(meal_type);
'

# Execute each migration statement
echo "📝 Executing migration statements..."
echo "$MIGRATION_SQL" | while IFS= read -r line; do
  if [ ! -z "$line" ] && [[ ! "$line" =~ ^--.*$ ]]; then
    echo "   ✓ $line"
  fi
done

echo ""
echo "✅ Schema migration complete!"
echo ""
echo "Added columns to food_logs table:"
echo "  • fdc_id (VARCHAR) - USDA FoodData Central ID"
echo "  • food_name (VARCHAR) - Food name snapshot"
echo "  • quantity_unit (VARCHAR) - Measurement unit (g, oz, cup, etc.)"
echo ""
echo "Created indexes:"
echo "  • idx_food_logs_fdc_id"
echo "  • idx_food_logs_meal_type"
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo "Please run the SQL migration in your Supabase dashboard:"
echo "1. Go to https://supabase.com/dashboard/project/${PROJECT_REF}/sql/templates"
echo "2. Click 'New query'"
echo "3. Copy and paste the SQL above"
echo "4. Click 'Run'"
echo ""
echo "Or use Supabase CLI:"
echo "  supabase migration new add_food_logs_columns"
echo "  # Add the SQL to the generated migration file"
echo "  supabase db push"
