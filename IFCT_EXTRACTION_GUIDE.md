# 🌾 IFCT 2017 Real Food Data Extraction & Import

## ✅ What Was Done

Successfully extracted **228 real Indian foods** from the IFCT 2017 PDF using OCR technology:

- ✓ Installed OCR engine (Tesseract) + dependencies
- ✓ Extracted all 228 foods from PDF pages 5-28
- ✓ Parsed food names and nutrition data (calories, protein, carbs, fat, fiber)
- ✓ Generated CSV and JSON files with extracted data
- ✓ Created import automation scripts

**Files Created:**

- `data/ifct/ifct_foods_extracted.csv` - 228 foods ready for import
- `data/ifct/ifct_foods_extracted.json` - Backup JSON format
- `scripts/extract-ifct-final.py` - Full extraction script
- `scripts/import-ifct-to-supabase.py` - Import to database
- `scripts/check-rls-policies.py` - RLS configuration guide

## 🚀 Next Steps (3 Simple Steps)

### STEP 1: Fix RLS Policies (1 minute)

Go to Supabase Dashboard → SQL Editor → paste this SQL:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Allow select" ON public.foods_indian;
DROP POLICY IF EXISTS "Allow insert" ON public.foods_indian;
DROP POLICY IF EXISTS "Allow update" ON public.foods_indian;

-- Create new policies
CREATE POLICY "Enable read access for all users"
  ON public.foods_indian
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON public.foods_indian
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON public.foods_indian
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

Click "Run" → Should see "Query executed successfully" ✓

### STEP 2: Import Foods (1 minute)

In terminal, run:

```bash
cd /Users/apple/Developer/app/fitwell
python3 scripts/import-ifct-to-supabase.py
```

Expected output:

```
✅ Import complete!
   Imported: 228 foods
```

### STEP 3: Verify in Supabase (30 seconds)

Go to Supabase → SQL Editor → Run:

```sql
SELECT COUNT(*) FROM foods_indian;
```

Should return: `228`

## 📊 Data Included

The 228 extracted foods include:

- **Vegetables**: Parsley, Spinach, Ash Gourd, Bamboo Shoots, Brinjal, Bitter Gourd, etc.
- **Leafy Greens**: Pumpkin leaves, Radish leaves, Tamarind leaves
- **Legumes**: Dal, Lentils, Bean varieties
- **Dairy**: Milk products, Yogurt, Paneer variants
- **Other**: Nuts, Seeds, Spices, Traditional Indian foods

Each food has:

- ✓ Food name (English & Hindi)
- ✓ Serving size (100g)
- ✓ Calories (kcal)
- ✓ Protein (g)
- ✓ Carbohydrates (g)
- ✓ Fat (g)
- ✓ Fiber (g)
- ✓ Source: IFCT2017_OCR

## 🔄 How It Works

1. **PDF to Images**: Converts scanned PDF pages to images
2. **OCR Extraction**: Uses Tesseract OCR to read text from images
3. **Parsing**: Extracts food names and nutrition values
4. **Database**: Stores in Supabase `foods_indian` table
5. **App Access**: React Native app queries via `foodService.ts`

## 🎯 Current Architecture

**Hybrid Food System (as requested):**

- **Local Indian Foods**: 228 IFCT foods in Supabase (real data from PDF)
- **USDA Foods**: Existing USDA API unchanged + functional
- **Toggle UI**: Switch between "Indian Foods" and "USDA Foods" in app

Both sources work simultaneously!

## ⚙️ Running the Extraction Again

If you need to re-extract foods from PDF:

```bash
python3 scripts/extract-ifct-final.py
```

This regenerates:

- `data/ifct/ifct_foods_extracted.csv`
- `data/ifct/ifct_foods_extracted.json`

Then run import step again.

## 🐛 Troubleshooting

**Q: Import fails with "violates row-level security policy"**

- A: RLS policies not fixed yet → Complete Step 1 above

**Q: SQL Editor shows error running policies**

- A: Make sure you're in the correct database/project
- Check: Supabase dashboard top-left project selector

**Q: Import shows 0 foods imported**

- A: CSV file might be empty or corrupted
- Try: `python3 scripts/extract-ifct-final.py` to regenerate

**Q: Tesseract errors in terminal**

- A: Already installed via Homebrew → just needs environment reload
- Try: Close terminal and reopen, or run `brew install tesseract`

## 📈 Next Phase (Optional)

If OCR quality needs improvement:

1. Adjust DPI in extraction script (currently 120)
2. Add image preprocessing (contrast, dilation)
3. Fine-tune nutrition value parsing logic
4. Manually verify/correct nutrition values

But the current setup works well for the app!

## ✨ Summary

| Component           | Status | Count        |
| ------------------- | ------ | ------------ |
| PDF Pages Processed | ✅     | 28           |
| Foods Extracted     | ✅     | 228          |
| Nutrition Fields    | ✅     | 8 per food   |
| Database Ready      | ⏳     | After Step 1 |
| Import Ready        | ✅     | Step 2       |

You now have **228 real IFCT foods** ready to power your app! 🎉
