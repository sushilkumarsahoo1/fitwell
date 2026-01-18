-- Supabase Migration: Create foods_indian table
-- Date: 2026-01-18
-- Purpose: Store local Indian food data from IFCT 2017 and Open Food Facts

CREATE TABLE IF NOT EXISTS foods_indian (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_hindi VARCHAR(255),
  category VARCHAR(100) DEFAULT 'Indian',
  description TEXT,
  
  -- Nutrition per serving
  serving_size_g DECIMAL(8, 2) DEFAULT 100,
  calories DECIMAL(10, 2),
  protein_g DECIMAL(10, 2),
  carbs_g DECIMAL(10, 2),
  fat_g DECIMAL(10, 2),
  fiber_g DECIMAL(10, 2),
  water_g DECIMAL(10, 2),
  
  -- Micronutrients (store as JSON for flexibility)
  micronutrients JSONB DEFAULT '{}',
  
  -- Metadata
  source VARCHAR(50), -- 'IFCT', 'Open Food Facts', 'User Added'
  source_id VARCHAR(255), -- Original ID from source
  is_verified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  
  -- Indexes
  UNIQUE(name),
  INDEX idx_category_name (category, name),
  INDEX idx_source (source)
);

-- Enable RLS
ALTER TABLE foods_indian ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - all users can read, no one can modify (admin only via direct SQL)
CREATE POLICY "Allow all users to read foods_indian" ON foods_indian
  FOR SELECT USING (true);

CREATE POLICY "Disable insert for all users" ON foods_indian
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Disable update for all users" ON foods_indian
  FOR UPDATE USING (false);

CREATE POLICY "Disable delete for all users" ON foods_indian
  FOR DELETE USING (false);

-- Create micronutrient extraction function
CREATE OR REPLACE FUNCTION get_micronutrients(micronutrients JSONB, key TEXT)
  RETURNS DECIMAL AS $$
  SELECT (micronutrients->key)::TEXT::DECIMAL;
$$ LANGUAGE SQL IMMUTABLE;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_foods_indian_timestamp()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
  END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER foods_indian_timestamp
  BEFORE UPDATE ON foods_indian
  FOR EACH ROW
  EXECUTE FUNCTION update_foods_indian_timestamp();

-- Create search function for Indian foods
CREATE OR REPLACE FUNCTION search_indian_foods(search_query TEXT)
  RETURNS TABLE (
    id BIGINT,
    name VARCHAR,
    name_hindi VARCHAR,
    category VARCHAR,
    serving_size_g DECIMAL,
    calories DECIMAL,
    protein_g DECIMAL,
    carbs_g DECIMAL,
    fat_g DECIMAL,
    similarity FLOAT
  ) AS $$
  SELECT
    fi.id,
    fi.name,
    fi.name_hindi,
    fi.category,
    fi.serving_size_g,
    fi.calories,
    fi.protein_g,
    fi.carbs_g,
    fi.fat_g,
    SIMILARITY(fi.name, search_query) as similarity
  FROM foods_indian fi
  WHERE fi.name % search_query OR fi.name_hindi % search_query
  ORDER BY similarity DESC, fi.name ASC
  LIMIT 20;
$$ LANGUAGE SQL;
