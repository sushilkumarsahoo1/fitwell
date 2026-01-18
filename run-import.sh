#!/bin/bash
# OpenFoodFacts Import - Quick Start Guide

echo "🍽️  OpenFoodFacts CSV to Supabase - Import Setup"
echo "=================================================="

# Step 1: Check file
echo "✅ Step 1: Verifying CSV file..."
if [ ! -f "en.openfoodfacts.org.products.csv" ]; then
    echo "❌ CSV file not found!"
    exit 1
fi
echo "   File size: $(ls -lh en.openfoodfacts.org.products.csv | awk '{print $5}')"
echo "   Rows: $(wc -l < en.openfoodfacts.org.products.csv)"

# Step 2: Test CSV parsing
echo ""
echo "✅ Step 2: Testing CSV format..."
python test-csv.py

# Step 3: RLS Policy
echo ""
echo "⚠️  Step 3: RLS Policy Fix Required"
echo "   You must fix the RLS policy before importing!"
echo ""
echo "   Method 1 - Via Supabase Dashboard:"
echo "   1. Go to: https://app.supabase.com"
echo "   2. Select your project"
echo "   3. Go to: Authentication > Policies"
echo "   4. Find: 'Anyone can create public foods' on 'foods' table"
echo "   5. Edit CHECK condition to: is_custom = FALSE"
echo "   6. Save"
echo ""
echo "   Method 2 - Via SQL (in Supabase SQL Editor):"
echo "   ALTER POLICY \"Anyone can create public foods\" ON foods"
echo "   USING (is_custom = FALSE);"
echo ""
echo "   Press ENTER after fixing RLS policy..."
read -r

# Step 4: Run import
echo ""
echo "✅ Step 4: Starting import..."
python import-foods-final.py

# Step 5: Verify
echo ""
echo "✅ Step 5: Verifying import..."
python << 'PYEOF'
from supabase import create_client

SUPABASE_URL = "https://mtevaxgfkjyifnaftxhl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZXZheGdma2p5aWZuYWZ0eGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODYwMjcsImV4cCI6MjA4NDA2MjAyN30.P2SQLliRfl01ICVcv_xHqxwg9HOUU73Gk_9dMSz0ALE"

try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    result = supabase.table("foods").select("id", count="exact").limit(1).execute()
    count = result.count if hasattr(result, 'count') else 0
    print(f"\n✅ Total foods in database: {count:,}")
    
    # Show samples
    response = supabase.table("foods").select("*").limit(3).execute()
    print("\n🍽️  Sample imported foods:")
    for food in response.data:
        print(f"   - {food['name']} ({food['calories_per_serving']} cal)")
except Exception as e:
    print(f"❌ Verification failed: {e}")
PYEOF

echo ""
echo "=================================================="
echo "✅ Import Complete!"
echo "=================================================="
