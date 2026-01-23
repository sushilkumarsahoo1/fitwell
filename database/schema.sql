-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: RLS is enabled per-table below (ALTER TABLE ... ENABLE ROW LEVEL SECURITY)
-- Supabase Cloud automatically enforces JWT authentication and manages auth.users

-- ==================== USERS & PROFILES ====================

-- Profiles table (connected to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 13 AND age <= 120),
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  height_cm DECIMAL(5, 2) NOT NULL CHECK (height_cm > 0),
  weight_kg DECIMAL(5, 2) NOT NULL CHECK (weight_kg > 0),
  fitness_goal VARCHAR(50) NOT NULL CHECK (fitness_goal IN ('lose_fat', 'maintain', 'gain_muscle')),
  activity_level VARCHAR(50) NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  daily_calorie_target INTEGER NOT NULL CHECK (daily_calorie_target > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==================== GOAL TRACKING ====================

-- Goal change history (tracks when users change fitness goals)
CREATE TABLE IF NOT EXISTS goal_change_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  previous_goal VARCHAR(50) NOT NULL,
  new_goal VARCHAR(50) NOT NULL,
  previous_calorie_target INTEGER,
  new_calorie_target INTEGER NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_goal_change_history_user_id ON goal_change_history(user_id);
CREATE INDEX idx_goal_change_history_profile_id ON goal_change_history(profile_id);
ALTER TABLE goal_change_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goal history" ON goal_change_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goal history" ON goal_change_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==================== FOODS & NUTRITION ====================

-- Foods table (public database + custom user foods)
CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  calories_per_serving INTEGER NOT NULL CHECK (calories_per_serving >= 0),
  protein_g DECIMAL(6, 2) NOT NULL CHECK (protein_g >= 0),
  carbs_g DECIMAL(6, 2) NOT NULL CHECK (carbs_g >= 0),
  fats_g DECIMAL(6, 2) NOT NULL CHECK (fats_g >= 0),
  serving_size_g DECIMAL(6, 2) NOT NULL CHECK (serving_size_g > 0),
  category VARCHAR(50) NOT NULL CHECK (category IN ('indian', 'global', 'homemade', 'packaged')),
  is_custom BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_foods_user_id ON foods(user_id);
CREATE INDEX idx_foods_category ON foods(category);
CREATE INDEX idx_foods_is_custom ON foods(is_custom);
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public foods are readable, custom foods only by owner" ON foods
  FOR SELECT USING (
    is_custom = FALSE OR auth.uid() = user_id
  );

CREATE POLICY "Users can create custom foods" ON foods
  FOR INSERT WITH CHECK (auth.uid() = user_id AND is_custom = TRUE);

CREATE POLICY "Anyone can create public foods" ON foods
  FOR INSERT WITH CHECK (is_custom = FALSE AND user_id IS NULL);

CREATE POLICY "Users can update own foods" ON foods
  FOR UPDATE USING (auth.uid() = user_id AND is_custom = TRUE);

CREATE POLICY "Users can delete own foods" ON foods
  FOR DELETE USING (auth.uid() = user_id AND is_custom = TRUE);

-- Food logs (daily tracking)
CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES foods(id) ON DELETE RESTRICT,
  quantity DECIMAL(8, 2) NOT NULL CHECK (quantity > 0),
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  date DATE NOT NULL,
  calories INTEGER NOT NULL CHECK (calories >= 0),
  protein_g DECIMAL(6, 2) NOT NULL CHECK (protein_g >= 0),
  carbs_g DECIMAL(6, 2) NOT NULL CHECK (carbs_g >= 0),
  fats_g DECIMAL(6, 2) NOT NULL CHECK (fats_g >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_food_logs_user_id_date ON food_logs(user_id, date);
CREATE INDEX idx_food_logs_user_id ON food_logs(user_id);
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own food logs" ON food_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food logs" ON food_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food logs" ON food_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food logs" ON food_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Favorite foods
CREATE TABLE IF NOT EXISTS favorite_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, food_id)
);

CREATE INDEX idx_favorite_foods_user_id ON favorite_foods(user_id);
ALTER TABLE favorite_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON favorite_foods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON favorite_foods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorite_foods
  FOR DELETE USING (auth.uid() = user_id);

-- ==================== WORKOUTS ====================

-- Workout templates
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('strength', 'cardio', 'yoga', 'hiit')),
  description TEXT,
  is_template BOOLEAN DEFAULT TRUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_type ON workouts(type);
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public workouts are readable, custom templates only by owner" ON workouts
  FOR SELECT USING (is_template = FALSE OR auth.uid() = user_id);

CREATE POLICY "Users can create custom workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Workout logs (completed sessions)
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE RESTRICT,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  sets INTEGER,
  reps INTEGER,
  calories_burned INTEGER NOT NULL CHECK (calories_burned >= 0),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workout_logs_user_id_date ON workout_logs(user_id, date);
CREATE INDEX idx_workout_logs_user_id ON workout_logs(user_id);
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workout logs" ON workout_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout logs" ON workout_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs" ON workout_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout logs" ON workout_logs
  FOR DELETE USING (auth.uid() = user_id);

-- ==================== WEIGHT & BODY TRACKING ====================

CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg DECIMAL(5, 2) NOT NULL CHECK (weight_kg > 0),
  chest_cm DECIMAL(5, 2),
  waist_cm DECIMAL(5, 2),
  hips_cm DECIMAL(5, 2),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_weight_logs_user_id_date ON weight_logs(user_id, date);
CREATE INDEX idx_weight_logs_user_id ON weight_logs(user_id);
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weight logs" ON weight_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs" ON weight_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight logs" ON weight_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs" ON weight_logs
  FOR DELETE USING (auth.uid() = user_id);

-- ==================== WATER INTAKE ====================

CREATE TABLE IF NOT EXISTS water_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL CHECK (amount_ml > 0),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_water_logs_user_id_date ON water_logs(user_id, date);
CREATE INDEX idx_water_logs_user_id ON water_logs(user_id);
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own water logs" ON water_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water logs" ON water_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own water logs" ON water_logs
  FOR DELETE USING (auth.uid() = user_id);

-- ==================== HABITS & REMINDERS ====================

CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_habits_user_id ON habits(user_id);
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- Habit logs (completions)
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, habit_id, date)
);

CREATE INDEX idx_habit_logs_user_id_date ON habit_logs(user_id, date);
CREATE INDEX idx_habit_logs_user_id ON habit_logs(user_id);
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habit logs" ON habit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habit logs" ON habit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habit logs" ON habit_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habit logs" ON habit_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Reminders
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  time TIME NOT NULL,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reminders_user_id ON reminders(user_id);
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders" ON reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders" ON reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" ON reminders
  FOR DELETE USING (auth.uid() = user_id);

-- ==================== HELPER FUNCTIONS ====================

-- Function to calculate daily calorie target
CREATE OR REPLACE FUNCTION calculate_daily_calorie_target(
  age_input INTEGER,
  gender_input VARCHAR,
  height_input DECIMAL,
  weight_input DECIMAL,
  activity_multiplier DECIMAL,
  goal_input VARCHAR
) RETURNS INTEGER AS $$
DECLARE
  bmr DECIMAL;
  tdee DECIMAL;
  adjusted_tdee INTEGER;
BEGIN
  -- Mifflin-St Jeor Formula for BMR
  IF gender_input = 'male' THEN
    bmr := (10 * weight_input) + (6.25 * height_input) - (5 * age_input) + 5;
  ELSE
    bmr := (10 * weight_input) + (6.25 * height_input) - (5 * age_input) - 161;
  END IF;

  -- Calculate TDEE
  tdee := bmr * activity_multiplier;

  -- Adjust based on goal
  IF goal_input = 'lose_fat' THEN
    adjusted_tdee := ROUND(tdee * 0.85); -- 15% deficit
  ELSIF goal_input = 'gain_muscle' THEN
    adjusted_tdee := ROUND(tdee * 1.10); -- 10% surplus
  ELSE
    adjusted_tdee := ROUND(tdee);
  END IF;

  RETURN adjusted_tdee;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily nutrition summary
CREATE OR REPLACE FUNCTION get_daily_nutrition_summary(user_id_input UUID, date_input DATE)
RETURNS TABLE (
  total_calories INTEGER,
  total_protein DECIMAL,
  total_carbs DECIMAL,
  total_fats DECIMAL,
  calorie_goal INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(fl.calories)::INTEGER, 0) as total_calories,
    COALESCE(SUM(fl.protein_g), 0) as total_protein,
    COALESCE(SUM(fl.carbs_g), 0) as total_carbs,
    COALESCE(SUM(fl.fats_g), 0) as total_fats,
    (SELECT daily_calorie_target FROM profiles WHERE user_id = user_id_input) as calorie_goal
  FROM food_logs fl
  WHERE fl.user_id = user_id_input AND fl.date = date_input;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_foods_timestamp BEFORE UPDATE ON foods
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_food_logs_timestamp BEFORE UPDATE ON food_logs
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_workouts_timestamp BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_workout_logs_timestamp BEFORE UPDATE ON workout_logs
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_weight_logs_timestamp BEFORE UPDATE ON weight_logs
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_water_logs_timestamp BEFORE UPDATE ON water_logs
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_habits_timestamp BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_reminders_timestamp BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
