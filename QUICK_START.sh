#!/bin/bash
# Quick Reference: Indian Food Database Setup

# ============================================================================
# STEP 1: Extract IFCT 2017 PDF Data
# ============================================================================
echo "Step 1: Installing Python dependencies..."
pip install pdfplumber pandas

echo "Extracting IFCT 2017 data from PDF..."
cd /Users/apple/Developer/app/fitwell
python scripts/extract-ifct-data.py

# Expected output:
# - data/ifct/ifct_foods.json  (300+ foods in JSON)
# - data/ifct/ifct_foods.csv   (300+ foods in CSV)


# ============================================================================
# STEP 2: Create Supabase Database Schema
# ============================================================================
echo "Step 2: Creating Supabase migration..."

# Option A: Using Supabase CLI
supabase migration up

# Option B: Manual SQL (copy to Supabase dashboard SQL Editor)
# File: supabase/migrations/20260118_create_foods_indian_table.sql


# ============================================================================
# STEP 3: Import IFCT Foods to Supabase
# ============================================================================
echo "Step 3: Importing foods to Supabase..."

# First, set your Supabase credentials
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key-here"

# Install supabase client
pip install supabase

# Import from CSV (recommended for bulk data)
python scripts/import-ifct-data.py data/ifct/ifct_foods.csv

# Or import from JSON
python scripts/import-ifct-data.py data/ifct/ifct_foods.json


# ============================================================================
# STEP 4: Verify Data in Supabase
# ============================================================================
echo "Step 4: Verifying data..."

# Check via SQL in Supabase dashboard
# SELECT COUNT(*) FROM foods_indian;         -- Should show 300+
# SELECT * FROM foods_indian LIMIT 5;        -- Show sample foods


# ============================================================================
# STEP 5: Test in FitWell App
# ============================================================================
echo "Step 5: Testing in the app..."

# 1. Start the Expo app
npm start

# 2. Navigate to FoodLoggingScreen
# 3. Click "Indian Foods" button (should be active)
# 4. Search for a food:
#    - "samosa"
#    - "biryani"
#    - "daal"
#    - "rice"
# 5. Log the food with quantity (e.g., 2 cups)
# 6. Check nutrition is calculated correctly


# ============================================================================
# VERIFY EACH STEP
# ============================================================================

# After Step 1: Check extracted files exist
ls -lah /Users/apple/Developer/app/fitwell/data/ifct/

# After Step 2: SQL should show table created
# (No output needed, just run the migration)

# After Step 3: Check foods imported
curl -s "https://your-project.supabase.co/rest/v1/foods_indian?select=count()" \
  -H "apikey: your-anon-key" | grep -o '"count":[0-9]*'

# Expected: {"count":300}  (or however many foods were extracted)

# After Step 4: Query via Supabase
# SELECT name, calories, protein_g FROM foods_indian LIMIT 10;

# After Step 5: Verify in app (visual check)


# ============================================================================
# FILES CREATED
# ============================================================================

# Python Scripts:
# - scripts/extract-ifct-data.py           (Extract PDF → JSON/CSV)
# - scripts/import-ifct-data.py            (CSV → Supabase)
# - scripts/test-indian-foods.py           (Verify setup)

# Data Files:
# - data/ifct/ifct_foods.json              (Extracted foods - JSON)
# - data/ifct/ifct_foods.csv               (Extracted foods - CSV)

# Database:
# - supabase/migrations/20260118_create_foods_indian_table.sql

# Documentation:
# - INDIAN_FOODS_SETUP.md                  (Setup guide)
# - README.md                              (Updated with new features)

# Code Updates:
# - src/services/foodService.ts            (Added Indian food functions)
# - src/screens/app/FoodLoggingScreen.tsx  (Added food source toggle)


# ============================================================================
# TROUBLESHOOTING
# ============================================================================

# PDF Extraction not working:
pip install pdfplumber pandas --upgrade
python scripts/extract-ifct-data.py -v

# Supabase connection failed:
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-key"
echo $SUPABASE_URL  # Verify it's set

# Import fails with "Table doesn't exist":
supabase migration up   # Ensure migration ran

# Foods not showing in app:
# 1. Check: SELECT COUNT(*) FROM foods_indian;
# 2. Verify: User is authenticated
# 3. Check: RLS policies allow SELECT (should be default)


# ============================================================================
# NEW FEATURES
# ============================================================================

# Food Logging Screen now has:
# ✓ Indian Foods toggle button
# ✓ USDA Foods toggle button
# ✓ Dual search functionality
# ✓ Quantity unit selector works for both sources
# ✓ Nutrition calculated correctly for both

# API Functions available:
# - searchIndianFoods(query, limit)
# - getIndianFoodDetails(foodId)
# - extractIndianFoodNutrition(food, quantity, unit)
# - logIndianFood(foodId, quantity, unit, mealType, date)

# Database structure:
# - foods_indian table with 15+ nutrition fields
# - Micronutrients stored as JSON
# - Full-text search capability
# - RLS policies for security


# ============================================================================
# NEXT STEPS
# ============================================================================

# Phase 2: Open Food Facts Integration
# - Add packaged foods from Open Food Facts
# - Create foods_packaged table
# - Merge results in food search

# Phase 3: Food Recognition
# - Implement ONNX ML model or OpenAI Vision
# - Detect food from photo
# - Estimate portion size

# Phase 4: Enhanced Features
# - Recipe builder
# - Barcode scanning
# - Meal templates
# - Favorites system

echo "✓ Setup complete! You're ready to use Indian food logging."
