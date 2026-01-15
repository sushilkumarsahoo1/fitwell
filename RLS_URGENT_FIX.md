# 🔴 URGENT FIX: RLS Policy Violation Error 42501

## The Exact Error You're Getting

```
ERROR  Update profile error: {"code": "42501", "message": 
  "new row violates row-level security policy for table \"profiles\""}
```

**What this means**: The RLS policy on the `profiles` table is **either**:
1. ❌ Not loaded/missing entirely
2. ❌ Blocking INSERT with incorrect logic
3. ❌ Not checking `user_id` correctly

---

## ✅ IMMEDIATE FIX (2 minutes)

### In Supabase Dashboard:

1. **SQL Editor** → New Query
2. **Paste this exactly**:

```sql
-- Step 1: Drop the bad/incomplete policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;  
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Step 2: Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create proper INSERT policy (MOST IMPORTANT)
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Step 4: Create UPDATE policy
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 5: Create SELECT policy
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = user_id);
```

3. **Click** "Run" button
4. **Expected**: "Query executed successfully" ✅

---

## 🧪 Verify the Fix

**In same SQL Editor, run**:

```sql
SELECT policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
```

**Expected output** (3 rows):
```
Users can insert own profile | ...
Users can update own profile | ...
Users can view own profile   | ...
```

If you see all 3 → ✅ Policies are loaded!

---

## 🚀 Test in App

```bash
cd /Users/apple/Developer/app/fitwell

# Kill old process
pkill -f "expo start"
sleep 1

# Clear cache and restart
npm start -- --clear

# Press 'i' for iOS
```

**Test signup**:
1. Tap "Sign Up"
2. Email: `test-fix@example.com`
3. Password: `TestPassword123!`
4. Tap "Sign Up"
5. **Should proceed to onboarding** (no 42501 error!)

---

## ✅ Success Indicators

- ✅ No "42501" error in console
- ✅ Onboarding screens appear
- ✅ Can complete all 3 onboarding steps
- ✅ Dashboard appears
- ✅ In Supabase Table Editor → profiles, you see a new row with your data

---

## ❌ If Still Failing

### Check 1: Is user authenticated?
```sql
SELECT email, email_confirmed_at FROM auth.users LIMIT 1;
```

If `email_confirmed_at` is NULL:
- Go to: Authentication → Settings
- Set: "Confirm email" to **OFF**
- Try signup again

### Check 2: Is user_id being passed?
File: `src/context/AuthContext.tsx` line 160+

Check that `updateProfile` includes:
```typescript
const { error } = await supabase.from("profiles").insert([
  {
    user_id: user.id,  // ← This line MUST exist
    name: profileData.name,
    // ...
  },
]);
```

If missing, add it!

### Check 3: Check Supabase Logs
- Dashboard → Logs → Database
- Filter: Last 1 hour
- Look for INSERT errors
- Note exact message

---

## 📚 Full Guides Available

1. **FIX_RLS_PROFILE_ERROR.md** - Step-by-step (5 min)
2. **RLS_QUICK_FIX.md** - Just the SQL (2 min)
3. **RLS_TROUBLESHOOTING.md** - Full diagnostics (10 min)

---

## 🎯 Why This Works

The `WITH CHECK (auth.uid() = user_id)` clause:
- Allows INSERT only if the `user_id` being inserted matches the authenticated user
- This is exactly what RLS should do
- Without this, INSERT is blocked → 42501 error

---

**Next**: Run the SQL fix, then test in app. You should be good! 💪
