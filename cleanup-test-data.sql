-- Clean up test/orphaned food log records
-- Run this in Supabase SQL Editor
--
-- Replace placeholders before running:
--   {{TARGET_LOG_ID}}  -> food_logs.id to remove
--   {{TARGET_USER_ID}} -> user_id to clean up

-- Delete the anomalous 19,500 calorie entry
DELETE FROM food_logs
WHERE id = '{{TARGET_LOG_ID}}';

-- Delete zero-calorie test records from 2026-01-17
DELETE FROM food_logs
WHERE user_id = '{{TARGET_USER_ID}}'
AND date = '2026-01-17'
AND calories = 0;

-- Verify remaining records for this user
SELECT date, COUNT(*) as log_count, SUM(calories) as total_calories
FROM food_logs
WHERE user_id = '{{TARGET_USER_ID}}'
GROUP BY date
ORDER BY date DESC;
