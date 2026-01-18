# Indian Food Database Implementation Guide

## Overview

This implementation adds a local Indian food database (from IFCT 2017) alongside the existing USDA food database. Users can now search and log both Indian foods and international foods (USDA).

## Architecture

```
┌─────────────────────────────────────┐
│   FoodLoggingScreen.tsx             │
│   - Toggle: Indian Foods / USDA     │
└──────────┬──────────────────────────┘
           │
    ┌──────┴──────────┐
    │                 │
┌───▼──────┐    ┌─────▼─────┐
│ Indian   │    │ USDA      │
│ Foods    │    │ Foods     │
│ (Local)  │    │ (API)     │
└───┬──────┘    └─────┬─────┘
    │                 │
┌───▼─────────────────▼────┐
│   foodService.ts         │
│   - searchIndianFoods()  │
│   - logIndianFood()      │
│   - searchFoods() [USDA] │
└───┬──────────────────────┘
    │
┌───▼──────────────────────┐
│   Supabase PostgreSQL    │
│   - foods_indian table   │
│   - food_logs table      │
└──────────────────────────┘
```

## Quick Start

### 1. Extract IFCT 2017 Data

```bash
cd /Users/apple/Developer/app/fitwell
pip install pdfplumber pandas
python scripts/extract-ifct-data.py
```

### 2. Apply Database Migration

```bash
# Via Supabase CLI
supabase migration up

# Or manually: Copy supabase/migrations/20260118_create_foods_indian_table.sql to SQL Editor
```

### 3. Import Foods to Database

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-key"
python scripts/import-ifct-data.py data/ifct/ifct_foods.csv
```

### 4. Test in App

- Open FoodLoggingScreen
- Click "Indian Foods" toggle
- Search for "samosa", "biryani", "daal"
- Log food with custom quantity

## Code Changes

### foodService.ts - New Functions

```typescript
// Search Indian foods
searchIndianFoods(query: string, limit?: number): Promise<IndianFood[]>

// Get food details
getIndianFoodDetails(foodId: number): Promise<IndianFood | null>

// Calculate nutrition with unit conversion
extractIndianFoodNutrition(food: IndianFood, quantity: number, unit: string): NutritionData

// Log food to database
logIndianFood(foodId: number, quantity: number, unit: string, mealType: string, date: string): Promise<any>
```

### FoodLoggingScreen.tsx - New UI

- Food source toggle (Indian Foods / USDA Foods)
- Switches between local and API search
- Both sources work with existing quantity/unit selection

## Database Schema

### foods_indian Table

```sql
- id (BIGSERIAL) - Primary key
- name (VARCHAR) - Food name
- name_hindi (VARCHAR) - Hindi name
- serving_size_g (DECIMAL) - Serving size
- calories (DECIMAL) - Per serving
- protein_g, carbs_g, fat_g (DECIMAL)
- micronutrients (JSONB) - Iron, Calcium, Vitamins
- source (VARCHAR) - "IFCT", "Open Food Facts"
```

## Files Created/Modified

**Created:**

- `scripts/extract-ifct-data.py` - PDF to JSON/CSV
- `scripts/import-ifct-data.py` - CSV to Supabase
- `supabase/migrations/20260118_create_foods_indian_table.sql` - Database schema
- `data/ifct/ifct_foods.json` - Extracted food data
- `data/ifct/ifct_foods.csv` - CSV for import

**Modified:**

- `src/services/foodService.ts` - Added Indian food functions
- `src/screens/app/FoodLoggingScreen.tsx` - Added food source toggle

## Verification

```bash
# Check foods imported
curl https://your-project.supabase.co/rest/v1/foods_indian \
  -H "apikey: your-key" \
  -H "Authorization: Bearer your-token"

# Expected: List of ~300+ Indian foods with nutrition data
```

## Next Steps

1. ✅ Extract IFCT PDF
2. ✅ Create Supabase schema
3. ✅ Import foods to database
4. 🔄 Test in FitWell app
5. ⏳ Add Open Food Facts integration
6. ⏳ Implement food photo recognition

## Troubleshooting

**PDF extraction fails:**

```bash
pip install pdfplumber pandas --upgrade
python scripts/extract-ifct-data.py
```

**Import fails:**

```bash
# Verify environment
echo $SUPABASE_URL
# Check CSV file exists
ls -la data/ifct/ifct_foods.csv
# Try import
python scripts/import-ifct-data.py data/ifct/ifct_foods.csv
```

**Foods not showing in app:**

1. Verify data in database: `SELECT COUNT(*) FROM foods_indian;`
2. Check RLS policies allow SELECT
3. Verify user is authenticated

For more details, see the original IMPLEMENTATION_GUIDE.md
