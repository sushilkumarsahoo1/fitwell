# 🚨 RLS Error 42501 - Quick Reference Card

**Error**: Cannot create profile  
**Code**: 42501 (Permission Denied)  
**Cause**: RLS policies missing/incorrect  

---

## 🔥 Fastest Fix (2 minutes)

### In Supabase SQL Editor, run:

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = user_id);
```

Then: `npm start` → Test signup again

---

## 🔍 Verify It Worked

```sql
-- In SQL Editor, run:
SELECT COUNT(*) as policy_count FROM pg_policies 
WHERE tablename = 'profiles';
-- Expected: 3
```

---

## ✅ Success Indicators

- ✅ Sign up works without error
- ✅ New row in "profiles" table in Supabase
- ✅ No console errors (error code 42501 gone)
- ✅ Onboarding completes

---

## 📚 Full Guides

- **FIX_RLS_PROFILE_ERROR.md** — Step-by-step fix
- **RLS_TROUBLESHOOTING.md** — Detailed diagnostics

