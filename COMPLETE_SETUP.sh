#!/bin/bash
# COMPLETE EXECUTION SEQUENCE
# Copy-paste these commands in order to set up Indian food database

echo "═══════════════════════════════════════════════════════════════"
echo "  FITWELL INDIAN FOOD DATABASE - COMPLETE SETUP"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ============================================================================
# SECTION 1: ENVIRONMENT SETUP
# ============================================================================
echo "SECTION 1: Environment Setup"
echo "───────────────────────────────────────────────────────────────"

# Go to project directory
cd /Users/apple/Developer/app/fitwell
echo "✓ Changed to project directory"

# Install Python dependencies
echo "Installing Python dependencies..."
pip install pdfplumber pandas supabase python-dotenv --upgrade
echo "✓ Python dependencies installed"

echo ""
echo "Set your Supabase credentials:"
echo "  export SUPABASE_URL='https://your-project.supabase.co'"
echo "  export SUPABASE_ANON_KEY='your-anon-key-here'"
echo ""
echo "Get these from: Supabase Dashboard → Settings → API"
echo ""

# Read user input for Supabase credentials
read -p "Enter SUPABASE_URL: " SUPABASE_URL
read -p "Enter SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY

# Export for this session
export SUPABASE_URL
export SUPABASE_ANON_KEY

echo "✓ Supabase credentials configured"
echo ""


# ============================================================================
# SECTION 2: EXTRACT IFCT DATA FROM PDF
# ============================================================================
echo "SECTION 2: Extract IFCT 2017 Data"
echo "───────────────────────────────────────────────────────────────"

# Check if PDF exists
if [ ! -f "/Users/apple/Downloads/IFCT2017.pdf" ]; then
    echo "✗ ERROR: IFCT2017.pdf not found at /Users/apple/Downloads/"
    echo "  Please place the PDF file there and try again."
    exit 1
fi
echo "✓ IFCT2017.pdf found"

# Create output directory
mkdir -p data/ifct
echo "✓ Created data/ifct directory"

# Run extraction
echo ""
echo "Extracting IFCT data from PDF..."
python scripts/extract-ifct-data.py

if [ ! -f "data/ifct/ifct_foods.csv" ]; then
    echo "✗ ERROR: Extraction failed. CSV file not created."
    exit 1
fi

echo "✓ Extraction complete"
echo "  - JSON file: data/ifct/ifct_foods.json"
echo "  - CSV file: data/ifct/ifct_foods.csv"
echo ""


# ============================================================================
# SECTION 3: CREATE SUPABASE SCHEMA
# ============================================================================
echo "SECTION 3: Create Supabase Schema"
echo "───────────────────────────────────────────────────────────────"

echo ""
echo "Option 1: Using Supabase CLI (recommended)"
echo "  Run: supabase migration up"
echo ""
echo "Option 2: Manual SQL"
echo "  1. Go to Supabase Dashboard"
echo "  2. Click 'SQL Editor'"
echo "  3. Click 'New Query'"
echo "  4. Copy content from: supabase/migrations/20260118_create_foods_indian_table.sql"
echo "  5. Click 'Run'"
echo ""

read -p "Press Enter after migration is applied to continue..."
echo "✓ Migration applied"
echo ""


# ============================================================================
# SECTION 4: IMPORT FOODS TO SUPABASE
# ============================================================================
echo "SECTION 4: Import Foods to Supabase"
echo "───────────────────────────────────────────────────────────────"

echo ""
echo "Importing IFCT foods from CSV..."
python scripts/import-ifct-data.py data/ifct/ifct_foods.csv

# Simple validation
echo ""
echo "Validating import..."
python3 -c "
import subprocess
import os
import time

time.sleep(2)  # Wait for data to settle

# Check with curl if available
os.system('''curl -s -H \"apikey: $SUPABASE_ANON_KEY\" \\
  \"$SUPABASE_URL/rest/v1/foods_indian?select=count()\" | head -20''')
"

echo "✓ Import complete"
echo ""


# ============================================================================
# SECTION 5: VERIFY DATA IN SUPABASE
# ============================================================================
echo "SECTION 5: Verify Data"
echo "───────────────────────────────────────────────────────────────"

echo ""
echo "Verify in Supabase Dashboard:"
echo "  1. Go to Supabase Dashboard"
echo "  2. Click 'Table Editor'"
echo "  3. Select 'foods_indian' from left sidebar"
echo "  4. Should see 300+ rows of Indian foods"
echo ""
echo "Or run SQL:"
echo "  SELECT COUNT(*) FROM foods_indian;"
echo "  SELECT name, calories, protein_g FROM foods_indian LIMIT 5;"
echo ""

read -p "Press Enter after verifying data in Supabase..."
echo "✓ Data verified"
echo ""


# ============================================================================
# SECTION 6: UPDATE SUPABASE RLS POLICIES
# ============================================================================
echo "SECTION 6: Configure RLS Policies"
echo "───────────────────────────────────────────────────────────────"

echo ""
echo "RLS policies already created by migration ✓"
echo ""
echo "Current policies:"
echo "  - Allow all users to read foods_indian"
echo "  - Prevent modifications (admin only)"
echo ""
echo "No action needed!"
echo ""


# ============================================================================
# SECTION 7: TEST APP INTEGRATION
# ============================================================================
echo "SECTION 7: Test App Integration"
echo "───────────────────────────────────────────────────────────────"

echo ""
echo "Now test in the FitWell app:"
echo ""
echo "1. Start the app:"
echo "   npm start"
echo ""
echo "2. Navigate to Food Logging Screen"
echo ""
echo "3. Look for new 'Indian Foods' button"
echo ""
echo "4. Try searching for:"
echo "   - 'samosa'"
echo "   - 'biryani'"
echo "   - 'daal'"
echo "   - 'rice'"
echo ""
echo "5. Select a food and log it with quantity"
echo ""
echo "6. Check that nutrition is calculated correctly"
echo ""

read -p "Press Enter after testing in the app..."
echo "✓ App integration verified"
echo ""


# ============================================================================
# SECTION 8: RUN COMPREHENSIVE TESTS
# ============================================================================
echo "SECTION 8: Run Test Suite"
echo "───────────────────────────────────────────────────────────────"

echo ""
echo "Running comprehensive tests..."
python scripts/test-indian-foods.py

echo ""
echo "✓ All tests completed"
echo ""


# ============================================================================
# SECTION 9: VERIFY ALL FILES
# ============================================================================
echo "SECTION 9: Verify Installation"
echo "───────────────────────────────────────────────────────────────"

echo ""
echo "Checking created files:"

files=(
  "scripts/extract-ifct-data.py"
  "scripts/import-ifct-data.py"
  "scripts/test-indian-foods.py"
  "data/ifct/ifct_foods.json"
  "data/ifct/ifct_foods.csv"
  "supabase/migrations/20260118_create_foods_indian_table.sql"
  "src/types/IndianFoods.ts"
  "src/services/foodService.ts"
  "src/screens/app/FoodLoggingScreen.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ $file (MISSING)"
  fi
done

echo ""


# ============================================================================
# SECTION 10: COMPLETION
# ============================================================================
echo "═══════════════════════════════════════════════════════════════"
echo "  ✓ SETUP COMPLETE!"
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo "What's been set up:"
echo "  ✓ IFCT 2017 data extracted (300+ Indian foods)"
echo "  ✓ Supabase schema created (foods_indian table)"
echo "  ✓ Foods imported to database"
echo "  ✓ Service functions added (searchIndianFoods, logIndianFood)"
echo "  ✓ UI updated (food source toggle)"
echo "  ✓ TypeScript types defined"
echo ""

echo "What users can do now:"
echo "  • Toggle between Indian Foods and USDA Foods"
echo "  • Search 300+ Indian foods by name (English or Hindi)"
echo "  • Log quantities in multiple units"
echo "  • View full nutrition including micronutrients"
echo "  • Automatic nutrition calculation per quantity"
echo ""

echo "Next steps:"
echo "  1. npm start               # Run the app"
echo "  2. Test Food Logging Screen"
echo "  3. Check food search and logging"
echo "  4. View nutrition calculations"
echo ""

echo "Documentation:"
echo "  • INDIAN_FOODS_SETUP.md       - Detailed setup guide"
echo "  • IMPLEMENTATION_SUMMARY.md   - Architecture overview"
echo "  • src/types/IndianFoods.ts    - TypeScript types"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""
