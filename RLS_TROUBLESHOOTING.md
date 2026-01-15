# 🔧 RLS Error 42501 - Diagnostic & Fix Guide

## Error: Cannot Create Profile (RLS Violation)

**Error Code**: 42501 (Permission Denied)  
**Context**: Inserting into `profiles` table during onboarding  
**Root Cause**: RLS policy blocking the insert operation

---

## Step 1: Verify RLS Policies in Supabase

### In Supabase Dashboard:

1. **SQL Editor** → Run this query:
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
```

**Expected Output**:
```
schemaname | tablename | rowsecurity
public     | profiles  | true
```

If `rowsecurity` is `false` → RLS is disabled! 

2. **Check policies** → SQL Editor → Run:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'profiles';
```

**Expected Output**: Should show 3 policies:
- "Users can view own profile" (SELECT)
- "Users can update own profile" (UPDATE)
- "Users can insert own profile" (INSERT)

---

## Step 2: Check Authentication Status

In Supabase Dashboard → **Authentication** → **Users**:

- [ ] User exists (test@example.com)
- [ ] User shows in the list
- [ ] User is marked as "Confirmed" (not pending)

**If user is pending:**
→ Email confirmation is required. Check your email or disable confirmation in Auth Settings.

---

## Step 3: Verify user_id is Being Passed Correctly

### Check the Frontend Code

In `src/context/AuthContext.tsx`, the `updateProfile` function should have:

```typescript
// When inserting new profile:
const { error } = await supabase.from("profiles").insert([
  {
    user_id: user.id,  // ← This MUST be set
    name: profileData.name,
    age: profileData.age,
    // ... other fields
  },
]);
```

**Verify**:
- ✅ `user.id` comes from `auth.getUser()`
- ✅ `user_id` field is explicitly set
- ✅ `user_id` is a valid UUID (not null, not empty string)

### Test in Browser Console

Before attempting signup, run:
```javascript
// In browser DevTools console (if accessible on your platform)
const { data: { user } } = await supabase.auth.getUser();
console.log("User ID:", user?.id);
```

User ID should look like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

---

## Step 4: Check .env.local Configuration

File: `/Users/apple/Developer/app/fitwell/.env.local`

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Verify**:
- ✅ URL is correct (matches Supabase Dashboard)
- ✅ Anon key is correct (matches Supabase Dashboard → Settings → API)
- ✅ No extra spaces or quotes

---

## Step 5: Test RLS Directly in Supabase

### Create a test user first:

1. **Supabase Dashboard** → Authentication → Users
2. **Create new user**:
   - Email: `rls-test@example.com`
   - Password: `TestPassword123!`
3. Copy the User ID (UUID format)

### Test the INSERT in SQL Editor:

```sql
-- As unauthenticated user (this should FAIL with 42501)
INSERT INTO profiles (
  user_id, name, age, gender, height_cm, weight_kg, 
  fitness_goal, activity_level, daily_calorie_target
) VALUES (
  '00000000-0000-0000-0000-000000000000',  -- Fake UUID
  'Test User',
  25,
  'male',
  175,
  70,
  'maintain',
  'moderate',
  2000
);
```

**Expected**: ERROR 42501 (Permission Denied) ✅

### Test with authenticated JWT:

This requires signing in from your app or using Supabase CLI.

**Alternative**: Test the app signup flow and watch console logs:

```bash
cd /Users/apple/Developer/app/fitwell
npm start
# Press 'i' for iOS
# Open Developer Console (Shift+Cmd+C)
# Watch for any error messages during profile creation
```

---

## Step 6: Check Supabase Logs

In **Supabase Dashboard**:

1. **Go to**: Logs (left sidebar) → **Database**
2. Filter: Last 1 hour
3. Look for INSERT or UPDATE errors on `profiles` table
4. Check the error message for clues

**Common errors**:
- `violates unique constraint "profiles_user_id_key"` → User already has a profile
- `permission denied for schema public` → RLS policy not found
- `relation "profiles" does not exist` → Table not created

---

## Step 7: Quick Fixes

### If user already has a profile:
```sql
-- Check if profile exists
SELECT * FROM profiles WHERE user_id = '<your-user-id>';

-- Delete if needed (careful!)
DELETE FROM profiles WHERE user_id = '<your-user-id>';

-- Then try signup again
```

### If RLS is disabled:
```sql
-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Recreate policies if missing
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = user_id);
```

### If email confirmation is blocking:
**Supabase Dashboard** → Authentication → Settings:
- Find: "Confirm email"
- Set to: **Off** (for development)

---

## Step 8: End-to-End Test

Once fixes are applied:

1. **Clear app data** (reinstall or clear cache)
2. **Start app**: `npm start`
3. **Sign up** with new email
4. **Watch console** for any errors
5. **Check Supabase** Table Editor → profiles
6. **Verify** new row appears with your data

---

## Debug Checklist

Use this to isolate the issue:

```
RLS CONFIGURATION:
☐ profiles table has RLS enabled (rowsecurity = true)
☐ INSERT policy exists and is correct
☐ UPDATE policy exists and is correct
☐ SELECT policy exists and is correct

AUTHENTICATION:
☐ User exists in auth.users
☐ User is confirmed (not pending)
☐ .env.local has correct credentials

CODE:
☐ user.id is being set correctly
☐ user_id field is explicitly passed to insert
☐ user_id is a valid UUID (not null)

DATABASE:
☐ No existing profile for this user
☐ RLS policies show in pg_policies
☐ No database errors in Supabase Logs

APP:
☐ No TypeError or JSON parse errors
☐ Error code specifically says 42501 (not 400 or 500)
☐ Network request completes (not timeout)
```

---

## If Still Failing

1. **Screenshot** the error message from app console
2. **Screenshot** the Supabase SQL Editor RLS policies
3. **Run** this diagnostic query:

```sql
SELECT 
  'profiles' as table_name,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles') as policy_count,
  (SELECT rowsecurity FROM pg_tables WHERE tablename = 'profiles') as rls_enabled,
  (SELECT COUNT(*) FROM profiles) as profile_count;
```

Share the output for further debugging.

---

## Expected Success

When working correctly:

1. ✅ User signs up → account created in auth.users
2. ✅ Onboarding → profile inserted into profiles table
3. ✅ New row appears in Supabase Table Editor with user's name
4. ✅ Dashboard loads with user's data
5. ✅ No 42501 errors in console

