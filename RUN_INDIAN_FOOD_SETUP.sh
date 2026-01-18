#!/bin/bash
# 🎯 Indian Food Database - Execute Now
# Copy & paste these commands in order

set -e  # Exit on error

echo "🎯 Indian Food Database - Execution Script"
echo "=========================================="
echo ""

# Step 1: Install Dependencies
echo "📦 Step 1: Installing Python dependencies..."
pip install pdfplumber pandas supabase python-dotenv
echo "✅ Dependencies installed"
echo ""

# Step 2: Extract PDF
echo "📄 Step 2: Extracting IFCT 2017 data..."
cd /Users/apple/Developer/app/fitwell
python scripts/extract-ifct-data.py
echo "✅ Data extracted to data/ifct/ifct_foods.json and .csv"
echo ""

# Step 3: Create Schema
echo "🗄️ Step 3: Create Supabase schema..."
echo ""
echo "⚠️  MANUAL STEP - Do this in Supabase Dashboard:"
echo ""
echo "1. Go to: https://app.supabase.com"
echo "2. Select your project"
echo "3. Click: SQL Editor → New Query"
echo "4. Copy entire content from:"
echo "   supabase/migrations/20260118_create_foods_indian_table.sql"
echo "5. Paste into SQL Editor"
echo "6. Click: Run"
echo ""
echo "✅ Press ENTER when migration is applied..."
read

# Step 4: Import Foods
echo ""
echo "📊 Step 4: Importing foods to Supabase..."
echo ""
echo "⚠️  REQUIRED: Set Supabase credentials"
echo ""
echo "Get these from Supabase Dashboard → Settings → API:"
echo ""
read -p "Enter SUPABASE_URL (https://...supabase.co): " SUPABASE_URL
read -p "Enter SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
echo ""

export SUPABASE_URL="$SUPABASE_URL"
export SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"

python scripts/import-ifct-data.py data/ifct/ifct_foods.csv
echo "✅ Foods imported to Supabase"
echo ""

# Step 5: Verify in Supabase
echo "🔍 Step 5: Verifying data..."
echo ""
echo "⚠️  MANUAL STEP - Verify in Supabase Dashboard SQL Editor:"
echo ""
echo "SELECT COUNT(*) as total FROM foods_indian;"
echo "SELECT name, calories FROM foods_indian LIMIT 5;"
echo ""
echo "Expected: 300+ foods in the table"
echo ""

# Step 6: Test in App
echo ""
echo "📱 Step 6: Testing in app..."
echo ""
echo "Starting development server..."
echo ""
npm start
echo ""
echo "⚠️  When Expo launches:"
echo "1. Press 'i' to open iOS simulator"
echo "2. Go to Food Logging Screen"
echo "3. Look for toggle: '🇮🇳 Indian Foods' | '🌍 USDA Foods'"
echo "4. Search for: 'biryani', 'samosa', or 'daal'"
echo "5. Log a food and verify nutrition"
echo ""

echo "🎉 Setup Complete!"
