# ✅ Fix Profile Creation RLS Error (42501)

## 🎯 Quick Fix Summary

**Problem**: Cannot create profile during onboarding (RLS error 42501)  
**Root Cause**: RLS policies missing or not properly loaded on `profiles` table  
**Solution**: Verify and re-apply RLS policies

---

## ✅ Step 1: Verify RLS in Supabase (5 minutes)

### Go to Supabase Dashboard:

1. **SQL Editor** (left sidebar)
2. **New Query** button
3. **Copy & Paste** this verification:

```sql
-- Check 1: Is RLS enabled on profiles?
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
```

**Expected Output**:
```
tablename | rowsecurity
profiles  | t (true)
```

If it shows `f` (false), RLS is disabled!

---

## ✅ Step 2: Check All Policies Exist

### In same SQL Editor, run:

```sql
-- Check 2: Do all policies exist?
SELECT policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
```

**Expected Output** (4 rows):
```
Users can insert own profile
Users can update own profile
Users can view own profile
```

**If missing any policy**, run the fix below.

---

## 🔧 Step 3: Fix - Re-apply RLS Policies

**Only do this if policies are missing!**

### In SQL Editor, run this complete policy script:

```sql
-- Re-enable RLS (safe if already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (safe)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create fresh policies
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**After running**: You should see "Query executed successfully"

---

## ✅ Step 4: Verify Fix Applied

### Run this to confirm:

```sql
SELECT policyname, permissive, (qual IS NOT NULL) as has_condition
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
```

**Expected Output**:
```
Users can insert own profile | true | true
Users can update own profile | true | true
Users can view own profile   | true | true
```

All 3 should appear ✅

---

## ✅ Step 5: Test the App

### Clear App Cache:
```bash
cd /Users/apple/Developer/app/fitwell

# Kill any running dev server
pkill -f "expo start"

# Clear cache
npm start -- --clear

# Press 'i' for iOS Simulator
```

### Sign Up Test:
1. **Tap**: Sign Up
2. **Enter**: 
   - Email: `test-rls@example.com`
   - Password: `TestPassword123!`
3. **Tap**: Sign Up button
4. **Watch**: Should proceed to onboarding (3 screens)
5. **Complete**: Profile, Goal, Activity Level
6. **Verify**: Dashboard appears without errors

### Verify in Supabase:
1. **Table Editor** (left sidebar)
2. **Select**: "profiles" table
3. **Look for**: Row with your email/name
4. **Expected**: 1+ rows with your profile data

**If you see your data** ✅ **RLS is fixed!**

---

## ❌ Still Getting 42501 Error?

### Check These:

#### 1. User Created Successfully?
```sql
SELECT * FROM auth.users 
ORDER BY created_at DESC LIMIT 1;
```
Should show your test user ✅

#### 2. User is Confirmed?
```sql
SELECT email, email_confirmed_at 
FROM auth.users 
WHERE email = 'your-email@example.com';
```

If `email_confirmed_at` is NULL, email isn't confirmed.

**Fix**: In Supabase Dashboard → Authentication → Settings:
- Find: "Confirm email"
- Change: **OFF** (for development)

#### 3. Check Auth Context Code
File: `src/context/AuthContext.tsx`

Ensure `updateProfile` passes `user_id`:
```typescript
const { error } = await supabase.from("profiles").insert([
  {
    user_id: user.id,  // ← MUST be set!
    name: profileData.name,
    age: profileData.age,
    // ... other fields
  },
]);
```

#### 4. Check Supabase Logs
In Supabase Dashboard → **Logs** → **Database**:
- Filter: Last 1 hour
- Look for: INSERT errors on profiles table
- Note the exact error message

---

## 📋 Verification Checklist

Use this to confirm everything works:

```
DATABASE:
☐ profiles table exists
☐ RLS is enabled (rowsecurity = true)
☐ All 3 policies exist in pg_policies

AUTHENTICATION:
☐ User created in auth.users
☐ User is confirmed (email_confirmed_at is set)
☐ Email confirmation: OFF (for development)

CODE:
☐ updateProfile passes user_id
☐ user_id is not null or empty
☐ No console errors during signup

APP:
☐ Can sign up with email/password
☐ Onboarding screens appear
☐ Profile saves to database
☐ Row appears in Table Editor
☐ No 42501 errors in console
```

---

## 🚀 You Know It's Fixed When:

1. ✅ Sign up completes without error
2. ✅ Onboarding screens appear (3 steps)
3. ✅ Dashboard loads after onboarding
4. ✅ New row in Supabase "profiles" table
5. ✅ Row shows your name, age, weight, etc.
6. ✅ No error messages in app console

---

## 💡 Why This Happens

**Why RLS error 42501 occurs:**
- Supabase runs queries in a transaction
- RLS checks: "Is auth.uid() = user_id?"
- If policies missing → Query denied (42501)
- If policies wrong → Query denied (42501)
- If user not confirmed → JWT invalid → 42501

**Why the fix works:**
- Re-creating policies ensures they exist
- Explicit policies = clear authorization rules
- Proper `WITH CHECK` clause = INSERT allowed

---

## 📞 Still Stuck?

1. **Check RLS_TROUBLESHOOTING.md** (more detailed guide)
2. **Compare schema.sql** with your Supabase policies
3. **Check app console** for the exact error code
4. **Verify credentials** in .env.local are correct
5. **Try creating user** via Supabase Dashboard instead of app

---

**Next**: Once profile creation works, you can test the full onboarding flow and data logging! 🎉
