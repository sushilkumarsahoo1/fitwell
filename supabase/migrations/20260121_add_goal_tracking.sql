-- Drop old check constraint on fitness_goal
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_fitness_goal_check;

-- Expand fitness_goal to support all goal types
ALTER TABLE profiles 
ALTER COLUMN fitness_goal TYPE VARCHAR(50);

-- Update existing values to map to new ones
UPDATE profiles 
SET fitness_goal = 'maintain' 
WHERE fitness_goal = 'maintain';

UPDATE profiles 
SET fitness_goal = 'normal_loss' 
WHERE fitness_goal = 'lose_fat';

UPDATE profiles 
SET fitness_goal = 'normal_gain' 
WHERE fitness_goal = 'gain_muscle';

-- Create goal_change_history table to track all goal changes
CREATE TABLE IF NOT EXISTS goal_change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  previous_goal VARCHAR(50) NOT NULL,
  new_goal VARCHAR(50) NOT NULL,
  previous_calorie_target INTEGER,
  new_calorie_target INTEGER,
  changed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_goal_change_history_user_id ON goal_change_history(user_id);
CREATE INDEX idx_goal_change_history_changed_at ON goal_change_history(changed_at DESC);

-- Enable RLS on goal_change_history
ALTER TABLE goal_change_history ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only view their own goal change history
CREATE POLICY "Users can view own goal change history"
ON goal_change_history FOR SELECT
USING (auth.uid() = user_id);

-- RLS policy: Only system can insert goal change history
CREATE POLICY "System can insert goal change history"
ON goal_change_history FOR INSERT
WITH CHECK (auth.uid() = user_id);
