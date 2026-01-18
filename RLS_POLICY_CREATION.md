# 🔴 RLS Policy Creation - Final Instructions

## Problem

The RLS policy needed for the import doesn't exist:

```
ERROR: 42704: policy "Anyone can create public foods" for table "foods" does not exist
```

## Solution: Create the Policy

You must create the INSERT policy in Supabase **SQL Editor** (NOT in Python).

---

## ✅ Step-by-Step Instructions

### Step 1: Login to Supabase

https://app.supabase.com

### Step 2: Select Your Project

- Select the "fitwell" or whichever project this is

### Step 3: Open SQL Editor

- Look at the **left sidebar**
- Scroll to the bottom if needed
- Click **"SQL Editor"** (it will say "SQL" with an icon)

### Step 4: Create New Query

- Click **"New Query"** button (top right)

### Step 5: Copy This SQL

```sql
CREATE POLICY "Allow public food inserts" ON public.foods
FOR INSERT
WITH CHECK (is_custom = false);
```

Paste it into the SQL editor query box.

### Step 6: Run the Query

- Click the **"Run"** button (or press **Cmd+Enter** on Mac, **Ctrl+Enter** on Windows)

### Step 7: Verify Success

You should see one of:

- ✅ "Query executed successfully"
- ✅ A green checkmark
- ✅ No error message

### Step 8: Return to Terminal

Close the SQL editor and go back to your terminal

### Step 9: Run the Import

```bash
cd /Users/apple/Developer/app/fitwell
python import-foods-final.py
```

---

## 📊 Expected Output

When you run the import, you should see:

```
======================================================================
🍽️  OpenFoodFacts to Supabase - Food Importer
======================================================================

📊 CSV File: en.openfoodfacts.org.products.csv (11651.8 MB)

🔗 Connecting to Supabase...
   ✅ Connected (existing foods: 278)

📥 Processing CSV (batch size: 5000)...
   Batch 1 | Rows: 5,000 (19000 r/s) | Imported: 5,000... ✅
   Batch 2 | Rows: 10,000 (19100 r/s) | Imported: 10,000... ✅
   ...continues for ~4-5 minutes...

======================================================================
📊 Summary
======================================================================
✅ Imported: 2,345,678 foods
⏭️  Skipped: 1,850,000 rows
⏱️  Time: 240s
📊 Rate: 19,000 rows/sec
======================================================================
```

---

## ❓ Troubleshooting

### "Query executed successfully" but import still fails with RLS error?

- The policy might not be using the exact name
- Verify in SQL Editor run this to see all policies:
  ```sql
  SELECT policyname FROM pg_policies WHERE tablename = 'foods';
  ```
- You should see: `Allow public food inserts`

### "SQL syntax error"?

- Make sure you're copying the exact SQL from Step 5
- Don't modify anything
- Check for typos

### "Permission denied"?

- Make sure you're logged in as the project owner
- Check your API key has admin access

### Import still slow?

- Normal: 19,000 rows/sec is the expected speed
- It will take 4-5 minutes for ~4M rows

---

## 📞 Summary

| Step      | Action                         | Time         |
| --------- | ------------------------------ | ------------ |
| 1-3       | Open Supabase, SQL Editor      | 1 min        |
| 4-5       | Create query, paste SQL        | 1 min        |
| 6-7       | Run, verify success            | 1 min        |
| 8-9       | Return to terminal, run import | 4-5 min      |
| **Total** | **Complete**                   | **~7-8 min** |

---

## ✨ What Happens Next

After the policy is created and import runs:

1. **All 2-3 million valid foods are imported** into the database
2. **Each food has complete data**: name, calories, protein, carbs, fats, serving size, category
3. **Data is immediately available** to your app for queries
4. **Future imports** use the same script

---

**Status**: Ready to proceed! Create the policy via SQL Editor, then run the import. 🚀
