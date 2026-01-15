# IMMEDIATE ACTION REQUIRED

## Execute these steps in Supabase Dashboard:

1. Go to **SQL Editor** in your Supabase project
2. Copy all SQL from `RLS_FIX_EXECUTE.sql`
3. Paste and run it
4. Verify no errors - should see policies created

## What this does:
- Drops old conflicting policies
- Recreates clean RLS policies
- Verifies RLS is enabled on profiles table

## Frontend changes made:
- ✅ Modified `updateProfile()` in `AuthContext.tsx`
- ✅ Now uses INSERT first (when profile doesn't exist)
- ✅ Then UPDATE (when profile exists)
- ✅ Includes `updated_at` timestamp on every operation
- ✅ Uses `.select()` to return created row data

## Test the flow:
1. Kill current app: `pkill -f expo`
2. Start app: `npm start`
3. Sign up with new email
4. Fill profile form (name, age, gender, etc.)
5. Should complete without 42501 error

## If still failing:
Check Supabase dashboard:
- Go to SQL Editor
- Run: `SELECT * FROM profiles;`
- Should show your test profile row
- Check auth.users table for matching user_id
