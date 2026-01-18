-- Migration: Migrate Indian foods from foods_indian to main foods table
-- Date: 2026-01-18
-- Purpose: Consolidate Indian foods into the main foods table with proper UUID support

-- Insert Indian foods from foods_indian table into main foods table
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
  -- Avoid duplicates: check if food with same name already exists
  SELECT 1 FROM foods f WHERE LOWER(f.name) = LOWER(fi.name) AND f.category = 'indian'
)
ON CONFLICT DO NOTHING;

-- Create a mapping table to track old foods_indian IDs to new UUID IDs for reference
CREATE TABLE IF NOT EXISTS foods_indian_migration_map (
  foods_indian_id BIGINT PRIMARY KEY,
  foods_uuid UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  food_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Populate the migration map for future reference
INSERT INTO foods_indian_migration_map (foods_indian_id, foods_uuid, food_name)
SELECT
  fi.id,
  f.id,
  fi.name
FROM foods_indian fi
INNER JOIN foods f ON LOWER(f.name) = LOWER(fi.name) AND f.category = 'indian'
ON CONFLICT DO NOTHING;

-- Log migration completion
SELECT COUNT(*) as indian_foods_migrated FROM foods WHERE category = 'indian';
