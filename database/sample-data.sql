-- Sample Foods Data (Popular Indian & Global Foods)
-- Insert these after running schema.sql and setting up a test user

-- Indian Foods
INSERT INTO foods (name, calories_per_serving, protein_g, carbs_g, fats_g, serving_size_g, category, is_custom) VALUES
('Chicken Biryani', 450, 28, 52, 12, 250, 'indian', false),
('Paneer Butter Masala', 380, 18, 24, 24, 200, 'indian', false),
('Dal Makhani', 320, 15, 35, 12, 200, 'indian', false),
('Roti/Chapati', 100, 3, 20, 1, 50, 'indian', false),
('Samosa', 200, 4, 22, 10, 60, 'indian', false),
('Aloo Paratha', 280, 6, 38, 11, 100, 'indian', false),
('Idli', 140, 3, 28, 0.5, 50, 'indian', false),
('Dosa', 160, 3, 22, 6, 80, 'indian', false),
('Rajma Rice', 380, 14, 58, 6, 250, 'indian', false),
('Tandoori Chicken', 210, 32, 2, 8, 150, 'indian', false),
('Chole Bhature', 420, 12, 56, 14, 250, 'indian', false),
('Masala Dosa', 280, 8, 38, 10, 150, 'indian', false),
('Pesarattu', 150, 6, 20, 3, 100, 'indian', false),
('Upma', 200, 4, 32, 5, 150, 'indian', false),
('Khichdi', 220, 8, 32, 5, 200, 'indian', false),
('Methi Paratha', 240, 6, 32, 9, 80, 'indian', false),
('Dum Aloo', 180, 3, 24, 8, 150, 'indian', false),
('Kadai Paneer', 320, 22, 16, 20, 200, 'indian', false),
('Baingan Bharta', 140, 3, 18, 6, 150, 'indian', false),
('Malai Kofta', 380, 10, 32, 22, 180, 'indian', false);

-- Global Foods
INSERT INTO foods (name, calories_per_serving, protein_g, carbs_g, fats_g, serving_size_g, category, is_custom) VALUES
('Chicken Breast', 165, 31, 0, 3.6, 100, 'global', false),
('Salmon', 208, 20, 0, 13, 100, 'global', false),
('Broccoli', 34, 2.8, 7, 0.4, 100, 'global', false),
('Brown Rice', 111, 2.6, 23, 0.9, 100, 'global', false),
('Oats', 150, 5, 27, 3, 50, 'global', false),
('Egg', 155, 13, 1.1, 11, 50, 'global', false),
('Banana', 89, 1.1, 23, 0.3, 100, 'global', false),
('Apple', 52, 0.3, 14, 0.2, 100, 'global', false),
('Almonds', 579, 21, 22, 50, 100, 'global', false),
('Yogurt (Greek)', 59, 10, 3.25, 0.4, 100, 'global', false),
('Chicken Wings', 290, 30, 0, 17, 100, 'global', false),
('Beef', 250, 26, 0, 15, 100, 'global', false),
('Sweet Potato', 86, 1.6, 20, 0.1, 100, 'global', false),
('Spinach', 23, 2.7, 3.6, 0.4, 100, 'global', false),
('Pasta', 131, 5, 25, 1.1, 100, 'global', false),
('Bread (Whole Wheat)', 100, 4, 17, 1.5, 30, 'global', false),
('Peanut Butter', 588, 25, 20, 50, 32, 'global', false),
('Chicken Sandwich', 350, 20, 32, 14, 150, 'global', false),
('Burger', 540, 28, 41, 28, 200, 'global', false),
('Pizza Slice', 250, 10, 36, 8, 100, 'global', false);

-- Packaged/Processed Foods
INSERT INTO foods (name, calories_per_serving, protein_g, carbs_g, fats_g, serving_size_g, category, is_custom) VALUES
('Cornflakes', 380, 8, 84, 1, 100, 'packaged', false),
('Granola Cereal', 471, 13, 64, 15, 100, 'packaged', false),
('Protein Bar', 200, 20, 22, 5, 50, 'packaged', false),
('Instant Noodles', 380, 8, 55, 14, 100, 'packaged', false),
('Chips', 536, 6, 53, 34, 100, 'packaged', false),
('Chocolate', 546, 8, 60, 30, 100, 'packaged', false),
('Soft Drink', 42, 0, 11, 0, 250, 'packaged', false),
('Energy Drink', 80, 0, 20, 0, 250, 'packaged', false),
('Protein Shake (Powder)', 120, 25, 2, 1, 30, 'packaged', false),
('Whey Protein', 110, 23, 2, 1, 28, 'packaged', false);

-- Homemade/Recipes (Example)
INSERT INTO foods (name, calories_per_serving, protein_g, carbs_g, fats_g, serving_size_g, category, is_custom) VALUES
('Grilled Fish with Veggies', 280, 35, 12, 10, 300, 'homemade', false),
('Vegetable Soup', 120, 4, 20, 3, 250, 'homemade', false),
('Chicken Salad', 220, 28, 15, 6, 300, 'homemade', false),
('Brown Rice with Beans', 350, 15, 55, 5, 250, 'homemade', false),
('Smoothie Bowl', 280, 12, 45, 6, 300, 'homemade', false),
('Grilled Vegetables', 80, 3, 14, 2, 200, 'homemade', false),
('Quinoa Bowl', 320, 14, 52, 8, 250, 'homemade', false),
('Stir-Fried Tofu', 180, 20, 8, 8, 200, 'homemade', false);

-- Sample Workout Templates (Generic)
INSERT INTO workouts (name, type, description, is_template) VALUES
('30 Min Treadmill', 'cardio', 'Steady state running at moderate pace', true),
('Weight Training Upper Body', 'strength', 'Chest, back, shoulders, arms', true),
('Weight Training Lower Body', 'strength', 'Legs and glutes focus', true),
('HIIT Cardio', 'hiit', 'High intensity interval training - 20 mins', true),
('Morning Yoga', 'yoga', 'Gentle stretching and flexibility', true),
('Cycling', 'cardio', '45 minutes moderate intensity', true),
('Swimming', 'cardio', '30 minutes mixed strokes', true),
('CrossFit Session', 'hiit', 'Mixed functional fitness workout', true),
('Pilates Core', 'yoga', 'Core strengthening routine', true),
('Evening Walk', 'cardio', 'Light pace, 20-30 minutes', true);

-- Habits (Sample)
INSERT INTO habits (name, frequency, description) VALUES
('Drink 8 glasses of water', 'daily', 'Stay hydrated throughout the day'),
('Exercise', 'daily', 'Complete daily workout'),
('Sleep 8 hours', 'daily', 'Get adequate sleep'),
('Eat 5 fruits/veggies', 'daily', 'Nutrition goal'),
('Track meals', 'daily', 'Log all food intake'),
('Meditate', 'daily', 'Mental wellness');

-- Note: For testing, create a test user through the app or Supabase dashboard
-- Then use their user_id in the food_logs, workout_logs, etc.
