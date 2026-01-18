-- Fix RLS Policy for Public Foods Import
-- This allows anonymous users to insert public (non-custom) foods without authentication

-- Option 1: Modify existing policy (recommended)
ALTER POLICY "Anyone can create public foods" ON foods
  USING (is_custom = FALSE);

-- Alternative: Recreate the policy with more permissive rules
-- DROP POLICY IF EXISTS "Anyone can create public foods" ON foods;
-- 
-- CREATE POLICY "Allow public foods creation" ON foods
--   FOR INSERT 
--   WITH CHECK (is_custom = FALSE);

-- Option 2: Create a separate policy specifically for bulk imports
-- CREATE POLICY "Allow bulk food imports" ON foods
--   FOR INSERT 
--   WITH CHECK (is_custom = FALSE AND user_id IS NULL);

-- Verify the policy was updated
SELECT policename, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'foods' AND cmd = 'INSERT'
ORDER BY policename;
