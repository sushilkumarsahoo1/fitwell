# Weight Goal Selector - Quick Setup Guide

## ✅ Implementation Complete

All components have been created and integrated. Here's what was implemented:

### New Components

1. **GoalSelector** - Interactive goal selection with 7 options
2. **ExtremeGoalWarning** - Medical disclaimer modal
3. **AnimatedCalorieDisplay** - Smooth calorie transitions

### Updated Files

1. `src/utils/nutritionUtils.ts` - New calorie calculation functions
2. `src/hooks/useNutrition.ts` - New goal update mutation
3. `src/screens/app/DashboardScreen.tsx` - Integrated GoalSelector
4. `src/types/index.ts` - Extended FitnessGoal type
5. `src/components/common/index.ts` - Exported new components

### Database Migration

1. Created `supabase/migrations/20260121_add_goal_tracking.sql`

---

## 🚀 Next Steps to Launch

### 1. Apply Database Migration

```bash
cd /Users/apple/Developer/app/fitwell

# Push migration to Supabase
supabase db push

# OR if you prefer manual SQL execution:
# Open Supabase dashboard → SQL Editor → Copy migration content
```

### 2. Verify Compilation

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Or start the dev server to test
npm run dev  # or yarn start
```

### 3. Test the Feature

1. Navigate to home screen
2. Look for "Select Your Goal" section below greeting
3. Tap different goal options (should not have a medical warning)
4. Tap "Extreme Weight Loss" to see medical warning modal
5. Verify calorie targets update correctly
6. Check database for goal change history

### 4. Verify Database Changes

```sql
-- Check goal_change_history was created
SELECT * FROM goal_change_history LIMIT 5;

-- Verify profiles table has updated fitness_goal
SELECT id, fitness_goal, daily_calorie_target FROM profiles LIMIT 5;
```

---

## 📊 Feature Breakdown

### Goal Options (Maintenance as 100%)

| Goal         | Calories | Rate          | Color        | Warns  |
| ------------ | -------- | ------------- | ------------ | ------ |
| Extreme Loss | 57%      | 1 kg/week     | 🔴 Red       | ✅ Yes |
| Normal Loss  | 79%      | 0.5 kg/week   | 🟡 Orange    | ❌     |
| Mild Loss    | 89%      | 0.25 kg/week  | 🟡 Orange    | ❌     |
| **Maintain** | **100%** | **0 kg/week** | **🟢 Green** | ❌     |
| Mild Gain    | 111%     | 0.25 kg/week  | 🟡 Orange    | ❌     |
| Normal Gain  | 121%     | 0.5 kg/week   | 🟡 Orange    | ❌     |
| Extreme Gain | 143%     | 1 kg/week     | 🔴 Red       | ✅ Yes |

### Medical Warning Triggers

- ⚠️ **Weight Loss**: Calories < 1,500/day
- ⚠️ **Weight Gain**: Calories > 3,500/day

---

## 🔄 User Flow

```
Home Screen
    ↓
[Greeting + Goal Selector]
    ↓
User Taps Goal Option
    ↓
Is it an extreme goal? → Yes → Show Medical Warning Modal
    ↓                              ↓
    No ──────────────────────[Acknowledge/Cancel]
                                 ↓
                          Confirm Goal Change
    ↓
Update Profile (Optimistic UI)
    ↓
Save to Database + Log History
    ↓
Show Success Alert with New Calorie Target
```

---

## 🐛 Troubleshooting

### "Goal Selector not showing"

- Check if profile exists (needs age, gender, height, weight, activity_level)
- Verify GoalSelector is exported from `src/components/common/index.ts`
- Check console for React errors

### "Calorie target not updating"

- Verify migration was applied: `supabase db push`
- Check `useUpdateUserGoal` mutation in network tab
- Verify user has profile with all required fields

### "Medical warning not showing"

- Ensure goal is "extreme_loss" or "extreme_gain"
- Check `shouldShowGoalWarning()` function logic
- Verify calories calculated correctly based on maintenance

### "Goal change history not logging"

- Check if `goal_change_history` table exists: `SELECT * FROM goal_change_history;`
- Verify RLS policies are enabled
- Check database logs for permission errors

---

## 📝 Key Functions Reference

### Calorie Calculation

```typescript
// Get maintenance calories (TDEE)
const maintenance = calculateDailyCalorieTarget(
  weight_kg,
  height_cm,
  age,
  gender,
  activity_level,
  "maintain",
);

// Get metrics for a specific goal
const metrics = getGoalMetrics(maintenance, "normal_loss");
// Returns: { calorieTarget, weeklyWeightChange, deficitOrSurplus, percentage }

// Check if warning needed
const needsWarning = shouldShowGoalWarning("extreme_loss", calculatedCalories);
```

### Updating Goal

```typescript
const { mutateAsync: updateGoal } = useUpdateUserGoal();

await updateGoal({
  userId: user.id,
  profileId: profile.id,
  newGoal: "normal_loss",
  newCalorieTarget: 1833,
  previousGoal: "maintain",
  previousCalorieTarget: 2333,
});
```

---

## 📚 Files Summary

| File                       | Purpose              | Status     |
| -------------------------- | -------------------- | ---------- |
| GoalSelector.tsx           | Goal selection UI    | ✅ Created |
| ExtremeGoalWarning.tsx     | Medical disclaimer   | ✅ Created |
| AnimatedCalorieDisplay.tsx | Calorie animations   | ✅ Created |
| nutritionUtils.ts          | Calorie calculations | ✅ Updated |
| useNutrition.ts            | Database mutations   | ✅ Updated |
| DashboardScreen.tsx        | Integration          | ✅ Updated |
| types/index.ts             | Type definitions     | ✅ Updated |
| components/common/index.ts | Exports              | ✅ Updated |
| Migration SQL              | Database schema      | ✅ Created |

---

## 🎯 Success Criteria

- [x] 7 goal options with color coding
- [x] Dynamic calorie calculations
- [x] Medical warning modal for extreme goals
- [x] Immediate goal persistence
- [x] Goal change history logging
- [x] Animated calorie updates
- [x] Optimistic UI updates
- [x] Error fallback handling
- [x] Proper RLS for security

**Feature is ready for testing! 🚀**
