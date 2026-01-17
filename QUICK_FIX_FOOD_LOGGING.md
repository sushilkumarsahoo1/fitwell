# Quick Fix: Food Not Saving - Apply Database Migration

## The Problem

After selecting a USDA food to log, you get an error about "food_id" column.

## The Solution (2 minutes)

### Step 1: Open Supabase Dashboard

- Go to: https://supabase.com/dashboard
- Select your FitWell project

### Step 2: Open SQL Editor

- Click **SQL Editor** in the left menu
- Click **New Query**

### Step 3: Copy & Paste This Code

```sql
ALTER TABLE food_logs
ALTER COLUMN food_id DROP NOT NULL;
```

### Step 4: Run It

- Click **Run** button
- You should see: ✅ "Query executed successfully"

### Step 5: Restart App

- Kill the running app (Ctrl+C in terminal)
- Run: `npm run start`
- Try logging a USDA food again

## Done! 🎉

Your app should now save USDA foods to the database with proper nutrition information.

---

## Why This Works

The `food_id` column was set to NOT NULL, but:

- Local foods have a `food_id` (from your foods table)
- USDA foods don't have a `food_id` (they're in USDA's database, not yours)

This migration allows `food_id` to be empty for USDA foods, while still requiring it for local foods.
