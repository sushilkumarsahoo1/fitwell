# 🇮🇳 Indian Foods Database - Complete Setup Guide

## Status: ✅ READY - Just Need One Manual Step

Your Indian food database is almost ready! All code is in place, but you need to create the table in Supabase manually (takes 2 minutes).

---

## 🚀 Complete Execution Steps

### ✅ STEP 1: Data Generated (DONE)

```bash
✓ Generated 40 Indian foods with nutrition data
✓ Files created:
  - data/ifct/ifct_foods.csv
  - data/ifct/ifct_foods.json
```

**Foods included:**

- 🌾 Grains: Rice, Wheat, Flour
- 🫘 Lentils: Moong Dal, Masoor Dal, Chickpea, Kidney Beans
- 🥬 Vegetables: Potato, Spinach, Tomato, Onion, Cauliflower
- 🍗 Proteins: Chicken, Lamb, Fish, Eggs
- 🥛 Dairy: Yogurt, Paneer, Milk, Ghee
- 🍜 Dishes: Biryani, Butter Chicken, Samosa, Tandoori, Aloo Gobi
- 🥑 Fruits & Nuts: Mango, Banana, Papaya, Coconut, Cashew, Peanut

---

### 📋 STEP 2: Create Supabase Table (MANUAL)

**Time: 2 minutes**

1. **Open Supabase SQL Editor:**
   - Go to: https://app.supabase.com/project/mtevaxgfkjyifnaftxhl/sql/new

2. **Click: "New Query"**

3. **Copy this SQL and paste it:**

```sql
CREATE TABLE foods_indian (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  name_hindi VARCHAR(255),
  category VARCHAR(100),
  serving_size_g DECIMAL(10, 2),
  calories DECIMAL(10, 2),
  protein_g DECIMAL(10, 2),
  carbs_g DECIMAL(10, 2),
  fat_g DECIMAL(10, 2),
  fiber_g DECIMAL(10, 2),
  sodium_mg DECIMAL(10, 2),
  potassium_mg DECIMAL(10, 2),
  source VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE foods_indian ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select" ON foods_indian
  FOR SELECT USING (true);
```

4. **Click: "Run"**
   - Wait for: ✅ Query executed successfully

---

### ✅ STEP 3: Import Foods (AUTOMATED)

Once table is created, run:

```bash
cd /Users/apple/Developer/app/fitwell
python3 final-setup.py
```

**Expected output:**

```
🇮🇳 Indian Foods - Database Setup
✅ Loaded 40 foods
✅ Connected
📊 Importing 40 foods...
   ✅ 10/40
   ✅ 20/40
   ✅ 30/40
   ✅ 40/40
✅ Sample foods from database:
   • Biryani (Chicken) (540cal) - बिरयानी
   • Dal Makhani (280cal) - दाल मखनी
   • Samosa (fried) (150cal) - समोसा
```

---

### ✅ STEP 4: Verify in App

```bash
npm start
# Press 'i' for iOS simulator
```

**What to look for:**

- ✅ Food Logging screen has a toggle: **"🇮🇳 Indian Foods"** | **"🌍 USDA Foods"**
- ✅ Click "Indian Foods" button
- ✅ Search for: "biryani", "daal", "rice"
- ✅ Should see results immediately (no API calls)
- ✅ Select a food and log it

---

## 📊 What's Installed

### Database Schema

```
foods_indian table:
├── id (primary key)
├── name (English name)
├── name_hindi (Hindi name)
├── category (vegetarian/non-vegetarian/dairy/vegan)
├── Nutrition (per serving):
│   ├── serving_size_g
│   ├── calories
│   ├── protein_g
│   ├── carbs_g
│   ├── fat_g
│   ├── fiber_g
│   ├── sodium_mg
│   └── potassium_mg
├── source (IFCT, Open Food Facts, etc)
└── created_at (timestamp)
```

### App Integration

```
src/services/foodService.ts
├── searchLocalIndianFoods(query) - Search local foods
├── getLocalFoodDetails(id) - Get food info
├── logLocalFood(entry) - Log food to database
└── getHybridFoodSearch(query, source) - Route to local or USDA

src/screens/app/FoodLoggingScreen.tsx
├── foodSource state: "database" | "usda"
├── Toggle button: Indian Foods | USDA Foods
└── Routes searches based on selection

src/types/IndianFoods.ts
├── IndianFood interface
├── LocalFoodLogEntry interface
├── Category enum
└── Source enum
```

---

## 🔍 Files Created/Modified

**NEW FILES:**

```
✓ data/ifct/ifct_foods.csv           (40 foods, CSV format)
✓ data/ifct/ifct_foods.json          (40 foods, JSON format)
✓ scripts/generate-indian-foods.py   (Food data generator)
✓ scripts/extract-ifct-data.py       (PDF extractor - for future use)
✓ final-setup.py                     (Auto import script)
✓ setup-auto.py                      (Backup setup script)
✓ setup-interactive.py               (Interactive guide)
✓ import-foods.py                    (Import utility)
```

**MODIFIED FILES:**

```
✓ src/services/foodService.ts        (+280 lines for local food functions)
✓ src/screens/app/FoodLoggingScreen.tsx (+90 lines for toggle UI)
```

**ALREADY CREATED (PREVIOUS SESSION):**

```
✓ src/types/IndianFoods.ts
✓ supabase/migrations/20260118_create_foods_indian_table.sql
```

---

## ✅ Success Checklist

- [ ] Table created in Supabase (SQL run)
- [ ] Run: `python3 final-setup.py` (shows all 40 foods imported)
- [ ] Open app: `npm start`
- [ ] See Indian Foods toggle in Food Logging
- [ ] Search for a food (e.g., "biryani")
- [ ] Log a food with quantity
- [ ] Verify nutrition data is correct

---

## 🆘 Troubleshooting

### "Table not found" error

```
✗ Could not find the table 'public.foods_indian'
```

**Solution:**

- Go back to STEP 2
- Make sure you ran the CREATE TABLE SQL
- Wait for "Query executed successfully" confirmation

### "Duplicate key" error (OK!)

```
ℹ️  Some duplicates - this is normal if you ran import twice
```

**Solution:** No action needed, duplicates are skipped

### App won't find foods

```
✗ No results when searching
```

**Solution:**

1. Make sure data was imported: Check Supabase table count
2. Click Indian Foods toggle (might still be on USDA)
3. Try searching "Rice" (common food)
4. Check browser console for errors

### "CORS" or connection errors

```
✗ Connection failed to Supabase
```

**Solution:**

1. Check internet connection
2. Verify SUPABASE_URL is correct
3. Verify SUPABASE_ANON_KEY is correct
4. Check .env.local has credentials

---

## 📚 Food Data Quality

**40 Indian foods** with complete nutrition:

### Categories

- 8 Vegetarian dishes
- 7 Non-vegetarian dishes
- 21 Vegan foods
- 4 Dairy products

### Nutrition Completeness

- ✅ Calories
- ✅ Protein (g)
- ✅ Carbs (g)
- ✅ Fat (g)
- ✅ Fiber (g)
- ✅ Sodium (mg)
- ✅ Potassium (mg)
- ✅ Hindi names
- ✅ Serving sizes

---

## 🎯 Next Features (Optional)

After setup works:

1. **Add Open Food Facts** - Packaged Indian foods
2. **Food Recognition** - Camera to identify foods
3. **Recipes** - Combine multiple foods
4. **Favorites** - Save frequently logged foods
5. **Barcode Scanning** - Scan food labels

---

## 📞 Quick Links

- 🔗 Supabase SQL Editor: https://app.supabase.com/project/mtevaxgfkjyifnaftxhl/sql/new
- 📝 Food data: `/Users/apple/Developer/app/fitwell/data/ifct/`
- 💾 Import script: `/Users/apple/Developer/app/fitwell/final-setup.py`
- 📱 App: `/Users/apple/Developer/app/fitwell`

---

## 🎉 Ready?

1. **Create table** in Supabase (copy-paste SQL above)
2. **Run import**: `python3 final-setup.py`
3. **Test app**: `npm start`
4. **Enjoy!** 🇮🇳

---

**Last Updated:** 2026-01-18  
**Status:** ✅ Ready - Just need Step 2!  
**Time to Complete:** 5 minutes (including Supabase table creation)
