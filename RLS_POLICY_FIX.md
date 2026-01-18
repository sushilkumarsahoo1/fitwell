# ⚠️ RLS Policy Creation Required

## Error Details

```
ERROR: 42704: policy "Anyone can create public foods" for table "foods" does not exist
```

The RLS policy required for importing public foods needs to be created.

---

## ✅ Solution: Create Policy via Supabase SQL Editor

### Step 1: Go to Supabase Dashboard

Open: https://app.supabase.com

### Step 2: Go to SQL Editor

In your project:

- Click **SQL Editor** (bottom left sidebar)

### Step 3: Create New Query

Click **"New Query"** button

### Step 4: Copy & Run This SQL

```sql
-- Create policy to allow inserting public foods
CREATE POLICY "Allow public food inserts" ON public.foods
FOR INSERT
WITH CHECK (is_custom = false);
```

### Step 5: Click Run (or Cmd+Enter)

You should see:

```
Query executed successfully
```

---

## ✅ Verify It Worked

Run this query to confirm the policy exists:

```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'foods' AND cmd = 'INSERT'
ORDER BY policyname;
```

You should see a row with:

- policyname: `Allow public food inserts`
- cmd: `INSERT`
- with_check: `is_custom = false`

---

## 🚀 Now Run the Import

Once the policy is created, run:

```bash
cd /Users/apple/Developer/app/fitwell
python import-foods-final.py
```

**Expected**: 2-3 million foods will import in 4-5 minutes

---

## 📋 Quick Visual Guide

```
Supabase Dashboard
    ↓
    Project Selection
    ↓
    Left Sidebar → "SQL Editor" (at bottom)
    ↓
    Click "New Query"
    ↓
    Paste the SQL from Step 4 above
    ↓
    Click "Run" button
    ↓
    ✅ "Query executed successfully"
    ↓
    Close SQL Editor
    ↓
    Back to terminal, run: python import-foods-final.py
```

---

## ⚡ What This Policy Does

- **Allows**: Anyone to INSERT into the `foods` table
- **Constraint**: Only if `is_custom = false` (public foods)
- **Protects**: Private/custom food data still protected
- **Effect**: Enables bulk import while maintaining security

---

## ❓ Why This is Needed

The `foods` table has Row Level Security (RLS) enabled. By default, RLS blocks all operations unless explicitly allowed by a policy. This policy creates an exception for inserting public foods.

---

## 🆘 Having Issues?

1. **Policy not created?**
   - Check there are no SQL errors
   - Copy the exact SQL from Step 4
   - Run it exactly as shown

2. **SQL Editor not found?**
   - Look for "SQL" at the bottom left of sidebar
   - If not visible, scroll down in sidebar

3. **After policy is created?**
   - Can immediately run import
   - No need to restart anything

---

**Next**: Create the policy, then run `python import-foods-final.py`
