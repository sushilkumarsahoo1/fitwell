/**
 * Exercise Database: Local, comprehensive exercise reference
 *
 * This provides internal exercise data for workout logging.
 * No external API needed - all data is local and offline-ready.
 *
 * Structure:
 * - Strength Training: Sets, reps, weight templates
 * - Cardio: Distance, duration, intensity metrics
 * - Yoga: Duration, intensity levels
 * - HIIT: Work/rest intervals, duration
 */

/**
 * Strength Training Exercises
 * Includes MET values for calorie burn calculation
 */
export const STRENGTH_EXERCISES = [
  // Upper Body
  { id: "bench_press", name: "Bench Press", category: "chest", met: 6.0 },
  {
    id: "incline_bench",
    name: "Incline Bench Press",
    category: "chest",
    met: 6.0,
  },
  { id: "dumbbell_press", name: "Dumbbell Press", category: "chest", met: 6.0 },
  { id: "push_ups", name: "Push-ups", category: "chest", met: 8.0 },
  { id: "chest_fly", name: "Chest Fly", category: "chest", met: 5.5 },

  { id: "pull_ups", name: "Pull-ups", category: "back", met: 9.0 },
  { id: "lat_pulldown", name: "Lat Pulldown", category: "back", met: 6.0 },
  { id: "barbell_row", name: "Barbell Row", category: "back", met: 6.0 },
  { id: "dumbbell_row", name: "Dumbbell Row", category: "back", met: 6.0 },
  { id: "face_pull", name: "Face Pull", category: "back", met: 5.0 },

  {
    id: "shoulder_press",
    name: "Shoulder Press",
    category: "shoulders",
    met: 6.0,
  },
  {
    id: "lateral_raise",
    name: "Lateral Raise",
    category: "shoulders",
    met: 4.5,
  },
  { id: "front_raise", name: "Front Raise", category: "shoulders", met: 4.5 },
  { id: "reverse_fly", name: "Reverse Fly", category: "shoulders", met: 4.5 },
  { id: "shrugs", name: "Shrugs", category: "shoulders", met: 5.0 },

  { id: "dumbbell_curl", name: "Dumbbell Curl", category: "biceps", met: 4.5 },
  { id: "barbell_curl", name: "Barbell Curl", category: "biceps", met: 4.5 },
  { id: "hammer_curl", name: "Hammer Curl", category: "biceps", met: 4.5 },
  { id: "cable_curl", name: "Cable Curl", category: "biceps", met: 4.5 },
  { id: "preacher_curl", name: "Preacher Curl", category: "biceps", met: 4.5 },

  { id: "tricep_dip", name: "Tricep Dip", category: "triceps", met: 8.0 },
  {
    id: "tricep_pushdown",
    name: "Tricep Pushdown",
    category: "triceps",
    met: 4.5,
  },
  { id: "skull_crusher", name: "Skull Crusher", category: "triceps", met: 5.0 },
  {
    id: "overhead_extension",
    name: "Overhead Extension",
    category: "triceps",
    met: 4.5,
  },
  {
    id: "close_grip_press",
    name: "Close Grip Press",
    category: "triceps",
    met: 6.0,
  },

  // Core
  { id: "crunches", name: "Crunches", category: "core", met: 3.8 },
  { id: "plank", name: "Plank", category: "core", met: 4.5 },
  { id: "leg_raise", name: "Leg Raise", category: "core", met: 5.0 },
  { id: "cable_woodchop", name: "Cable Woodchop", category: "core", met: 5.0 },
  { id: "dead_bug", name: "Dead Bug", category: "core", met: 3.8 },

  // Lower Body
  { id: "barbell_squat", name: "Barbell Squat", category: "legs", met: 6.0 },
  { id: "dumbbell_squat", name: "Dumbbell Squat", category: "legs", met: 6.0 },
  { id: "leg_press", name: "Leg Press", category: "legs", met: 6.0 },
  { id: "leg_extension", name: "Leg Extension", category: "legs", met: 5.0 },
  { id: "front_squat", name: "Front Squat", category: "legs", met: 6.0 },

  { id: "deadlift", name: "Deadlift", category: "legs", met: 6.0 },
  { id: "sumo_deadlift", name: "Sumo Deadlift", category: "legs", met: 6.0 },
  {
    id: "romanian_deadlift",
    name: "Romanian Deadlift",
    category: "legs",
    met: 6.0,
  },
  {
    id: "trap_bar_deadlift",
    name: "Trap Bar Deadlift",
    category: "legs",
    met: 6.0,
  },

  { id: "leg_curl", name: "Leg Curl", category: "legs", met: 5.0 },
  { id: "lying_leg_curl", name: "Lying Leg Curl", category: "legs", met: 5.0 },
  { id: "lunge", name: "Lunge", category: "legs", met: 5.0 },
  { id: "walking_lunge", name: "Walking Lunge", category: "legs", met: 5.0 },
  { id: "step_up", name: "Step Up", category: "legs", met: 5.0 },

  { id: "calf_raise", name: "Calf Raise", category: "legs", met: 4.5 },
  {
    id: "leg_press_calf",
    name: "Leg Press Calf Raise",
    category: "legs",
    met: 4.5,
  },
];

/**
 * Cardio Activities
 * MET values used for calorie burn calculation
 */
export const CARDIO_ACTIVITIES = [
  // Running
  { id: "running_5mph", name: "Running 5 mph", met: 8.3 },
  { id: "running_6mph", name: "Running 6 mph (10 min/mile)", met: 9.8 },
  { id: "running_7mph", name: "Running 7 mph (8.5 min/mile)", met: 11.0 },
  { id: "running_8mph", name: "Running 8 mph (7.5 min/mile)", met: 11.8 },
  { id: "running_9mph", name: "Running 9 mph (6.7 min/mile)", met: 12.3 },
  { id: "running_10mph", name: "Running 10 mph (6 min/mile)", met: 14.5 },

  // Walking
  { id: "walking_2mph", name: "Walking 2 mph", met: 2.8 },
  { id: "walking_3mph", name: "Walking 3 mph", met: 3.5 },
  { id: "walking_4mph", name: "Walking 4 mph (brisk)", met: 5.0 },
  { id: "walking_5mph", name: "Walking 5 mph (very brisk)", met: 6.3 },

  // Cycling
  { id: "cycling_10mph", name: "Cycling 10 mph (leisurely)", met: 5.8 },
  { id: "cycling_12mph", name: "Cycling 12 mph (moderate)", met: 7.5 },
  { id: "cycling_14mph", name: "Cycling 14 mph (vigorous)", met: 9.7 },
  { id: "cycling_16mph", name: "Cycling 16 mph (intense)", met: 12.3 },
  { id: "stationary_cycling", name: "Stationary Cycling (moderate)", met: 7.5 },

  // Swimming
  { id: "swimming_casual", name: "Swimming (casual)", met: 6.0 },
  { id: "swimming_moderate", name: "Swimming (moderate)", met: 8.0 },
  { id: "swimming_vigorous", name: "Swimming (vigorous)", met: 11.0 },
  { id: "treading_water", name: "Treading Water", met: 5.0 },

  // Other Cardio
  { id: "elliptical", name: "Elliptical (moderate)", met: 6.0 },
  { id: "rowing", name: "Rowing (moderate)", met: 6.0 },
  { id: "stair_climbing", name: "Stair Climbing", met: 9.0 },
  { id: "jump_rope", name: "Jump Rope", met: 12.3 },
  { id: "boxing", name: "Boxing (moderate)", met: 9.0 },
  { id: "kickboxing", name: "Kickboxing", met: 10.0 },
];

/**
 * Yoga Styles with MET values
 */
export const YOGA_STYLES = [
  { id: "yoga_gentle", name: "Gentle Yoga", met: 2.5 },
  { id: "yoga_moderate", name: "Moderate Yoga (Hatha)", met: 3.3 },
  { id: "yoga_vigorous", name: "Vigorous Yoga (Vinyasa)", met: 6.0 },
  { id: "yoga_power", name: "Power Yoga", met: 6.0 },
  { id: "yoga_hot", name: "Hot Yoga (Bikram)", met: 5.3 },
  { id: "yoga_restorative", name: "Restorative Yoga", met: 2.0 },
];

/**
 * HIIT Workout Types
 * Typically higher calorie burn due to intensity
 */
export const HIIT_WORKOUTS = [
  {
    id: "hiit_tabata",
    name: "Tabata (20s work/10s rest)",
    met: 16.0,
    workDuration: 20,
    restDuration: 10,
  },
  {
    id: "hiit_45_15",
    name: "45s work / 15s rest",
    met: 14.0,
    workDuration: 45,
    restDuration: 15,
  },
  {
    id: "hiit_30_30",
    name: "30s work / 30s rest",
    met: 12.0,
    workDuration: 30,
    restDuration: 30,
  },
  { id: "hiit_emom", name: "EMOM (Every Minute on the Minute)", met: 12.0 },
  { id: "hiit_amrap", name: "AMRAP (As Many Reps As Possible)", met: 14.0 },
  { id: "hiit_circuit", name: "Circuit Training", met: 13.0 },
];

/**
 * Exercise Categories for UI grouping
 */
export const EXERCISE_CATEGORIES = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  core: "Core",
  legs: "Legs",
};

/**
 * Workout Type Labels
 */
export const WORKOUT_TYPE_LABELS = {
  strength: "Strength Training",
  cardio: "Cardio",
  yoga: "Yoga",
  hiit: "HIIT",
};

/**
 * Get exercises by category
 */
export function getExercisesByCategory(category: string) {
  return STRENGTH_EXERCISES.filter((ex) => ex.category === category);
}

/**
 * Get all exercises
 */
export function getAllExercises() {
  return STRENGTH_EXERCISES;
}

/**
 * Find exercise by ID
 */
export function findExercise(id: string) {
  return STRENGTH_EXERCISES.find((ex) => ex.id === id);
}

/**
 * Find cardio activity by ID
 */
export function findCardioActivity(id: string) {
  return CARDIO_ACTIVITIES.find((activity) => activity.id === id);
}

/**
 * Find yoga style by ID
 */
export function findYogaStyle(id: string) {
  return YOGA_STYLES.find((style) => style.id === id);
}

/**
 * Find HIIT workout by ID
 */
export function findHIITWorkout(id: string) {
  return HIIT_WORKOUTS.find((workout) => workout.id === id);
}
