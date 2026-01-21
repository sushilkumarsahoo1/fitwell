# Weight Goal Selector Feature - Implementation Complete ✅

## Overview

Added an interactive weight goal selector to the home screen that allows users to choose their fitness goal (maintain/weight loss/weight gain) with dynamic calorie recommendations based on intensity levels.

## Files Created

### 1. **GoalSelector Component**

📄 `src/components/common/GoalSelector.tsx`

- 7 goal options with color-coded styling:
  - 🟢 **Maintain** (100% - green)
  - 🟡 **Mild Loss** (89% - orange, 0.25kg/week)
  - 🟡 **Normal Loss** (79% - orange, 0.5kg/week)
  - 🔴 **Extreme Loss** (57% - red, 1kg/week)
  - 🟡 **Mild Gain** (111% - orange, 0.25kg/week)
  - 🟡 **Normal Gain** (121% - orange, 0.5kg/week)
  - 🔴 **Extreme Gain** (143% - red, 1kg/week)
- Displays daily calories and percentage of maintenance
- Horizontal scrolling through options
- Visual feedback with border highlighting

### 2. **ExtremeGoalWarning Modal**

📄 `src/components/modals/ExtremeGoalWarning.tsx`

- Medical disclaimer modal for extreme goals
- Triggers when daily calories < 1,500 (loss) or > 3,500 (gain)
- Shows health warnings and recommendations to consult doctor
- Acknowledge/Cancel buttons for user confirmation

### 3. **Animated Calorie Display**

📄 `src/components/common/AnimatedCalorieDisplay.tsx`

- Smooth animation of calorie values when goal changes
- 400ms duration tween animation
- Visual highlight flash on update

## Files Modified

### 4. **Calorie Calculations**

📝 `src/utils/nutritionUtils.ts`

- Added `FitnessGoal` type supporting 7 goal types
- New function `getGoalMetrics()` - calculates calorie target and kg/week changes
- New function `shouldShowGoalWarning()` - determines if medical warning needed
- Updated `calculateAdjustedCalories()` with new goal types
- Calorie deficit/surplus calculations:
  - Mild Loss: 10% deficit (~0.25kg/week)
  - Normal Loss: 21% deficit (~0.5kg/week)
  - Extreme Loss: 43% deficit (~1kg/week)
  - (Same multipliers for gain)

### 5. **Database Types**

📝 `src/types/index.ts`

- Extended `UserProfile.fitness_goal` to support all 7 goal types
- Backwards compatible with legacy goal types

### 6. **Database Mutations**

📝 `src/hooks/useNutrition.ts`

- Added `useUpdateUserGoal()` mutation
- Handles profile update with new goal and calorie target
- Logs goal changes to `goal_change_history` table
- Error fallback restores previous goal state

### 7. **Dashboard Screen**

📝 `src/screens/app/DashboardScreen.tsx`

- Integrated GoalSelector below greeting
- Calculates maintenance calories (TDEE)
- Handles goal selection with optimistic UI updates
- Shows ExtremeGoalWarning modal when needed
- Real-time calorie target updates

### 8. **Database Migration**

📄 `supabase/migrations/20260121_add_goal_tracking.sql`

- Converts `fitness_goal` column to VARCHAR(50) for flexibility
- Maps legacy values to new ones (lose_fat → normal_loss, gain_muscle → normal_gain)
- Creates `goal_change_history` table with:
  - Tracks previous/new goals
  - Stores calorie targets before/after
  - Timestamps for analytics
- Implements RLS policies for security

## Features

✅ **7 Goal Options** with color-coded intensity indicators (green/orange/red)
✅ **Dynamic Calorie Calculation** based on maintenance calories and goal intensity
✅ **Medical Warnings** for extreme goals with disclaimer modal
✅ **Animated Transitions** smooth calorie value updates
✅ **Immediate Persistence** saves selection to database right away
✅ **Error Fallback** reverts UI if update fails
✅ **History Tracking** all goal changes logged for analytics
✅ **Optimistic Updates** instant UI feedback while API call processes

## Usage Flow

1. User sees greeting and fitness goal selector on home screen
2. GoalSelector displays 7 options with:
   - Current maintenance calories as baseline
   - Adjusted calorie targets for each goal
   - Weekly weight change rates (kg/week)
   - Color-coded intensity indicators
3. User taps goal option
4. If extreme goal selected → Medical warning modal shows
   - User can acknowledge and proceed or cancel
5. Goal updates immediately (optimistic)
6. Profile saved to database with new calorie target
7. Goal change logged to history for future analytics

## Integration Points

**From DashboardScreen:**

```typescript
- calculateDailyCalorieTarget() → Gets TDEE maintenance calories
- shouldShowGoalWarning() → Determines if modal needed
- useUpdateUserGoal() → Handles goal and calorie updates
```

**From Constants:**

```typescript
- COLORS → Color system for UI styling
- Activity level multipliers → For TDEE calculation
```

## Database Schema Changes

**Modified Columns:**

- `profiles.fitness_goal`: TEXT → VARCHAR(50) (supports 7 values)

**New Table:**

```sql
goal_change_history {
  id, user_id, profile_id,
  previous_goal, new_goal,
  previous_calorie_target, new_calorie_target,
  changed_at, created_at
}
```

## Next Steps

1. Run database migration: `supabase db push`
2. Test goal selection on home screen
3. Verify medical warnings trigger correctly
4. Check goal history logging in database
5. Monitor user engagement with different goal intensities
6. Consider adding goal streak tracking in future

## Notes

- Maintain weight is the default when profile created
- Calorie calculations use Mifflin-St Jeor BMR formula
- Weekly weight changes assume linear 7700 cal/kg deficit/surplus
- All changes are immediately persisted (not draft mode)
- RLS policies prevent users from viewing other users' goal history
