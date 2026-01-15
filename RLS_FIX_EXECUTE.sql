-- STEP 1: Check current RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- STEP 2: Drop ALL existing profile policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;

-- STEP 3: Enable RLS explicitly
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- STEP 4: Recreate policies with minimal checks
CREATE POLICY "profiles_insert"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_select"
ON profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "profiles_update"
ON profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- STEP 5: Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';

-- STEP 6: Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check FROM pg_policies WHERE tablename = 'profiles';
