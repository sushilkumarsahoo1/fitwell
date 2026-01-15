# ⚡ Quick Start: Supabase Setup for Fitwell (15 minutes)

## The Quick Version

### 1️⃣ Create Supabase Project (5 min)
```
URL: https://supabase.com/dashboard
1. Click "New Project"
2. Name: fitwell
3. Set password (save it!)
4. Region: choose closest
5. Wait for setup
```

### 2️⃣ Get Credentials (1 min)
```
In Supabase dashboard:
1. Settings → API
2. Copy "Project URL" 
3. Copy "anon public" key
4. Save both to a notepad
```

### 3️⃣ Update .env.local (1 min)
```bash
File: /Users/apple/Developer/app/fitwell/.env.local

Before:
EXPO_PUBLIC_SUPABASE_URL=https://demo.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=demo_key_placeholder

After (use YOUR values):
EXPO_PUBLIC_SUPABASE_URL=https://your-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

### 4️⃣ Load Database Schema (5 min)
```
In Supabase dashboard:
1. SQL Editor → New Query
2. Open file: /Users/apple/Developer/app/fitwell/database/schema.sql
3. Copy entire file (all 424 lines)
4. Paste into SQL Editor
5. Click "Run"
6. Wait for "Success" message
```

### 5️⃣ Load Sample Data (2 min) [OPTIONAL]
```
In Supabase dashboard:
1. SQL Editor → New Query
2. Open file: /Users/apple/Developer/app/fitwell/database/sample-data.sql
3. Copy entire file
4. Paste into SQL Editor
5. Click "Run"
```

### 6️⃣ Test the App (1 min)
```bash
cd /Users/apple/Developer/app/fitwell
npm start
# Press 'i' for iOS simulator

In app:
1. Sign up
2. Complete onboarding
3. Log some food/workouts
4. Check Supabase table - data should appear!
```

---

## Expected Results ✅

### After Setup
- ✅ App starts without "Missing env vars" error
- ✅ Can sign up with email/password
- ✅ Can complete onboarding
- ✅ Data appears in Supabase tables
- ✅ Session persists on reload
- ✅ Can log food/workouts and see data appear

### What You'll See in Supabase
```
profiles table:
├─ id: (UUID)
├─ user_id: (Your auth user ID)
├─ name: "Your Name"
├─ age: 25
├─ height_cm: 180
└─ ... other fields

food_logs table:
├─ user_id: (Your ID)
├─ food_id: (from foods table)
├─ quantity: 1
├─ meal_type: "breakfast"
└─ date: "2026-01-15"

... and more tables for workouts, weight, etc
```

---

## If Something Goes Wrong

### "Network request failed"
```
1. Check .env.local has correct URL
2. Check URL starts with https://
3. Make sure no spaces or typos
4. Kill terminal (Ctrl+C) and restart
```

### "Cannot find module @services/supabase"
```
1. Metro cache is stale
2. Kill terminal (Ctrl+C)
3. Run: npm start -- --clear
4. Wait for rebuild
```

### "Permission denied" error
```
1. RLS policies not loaded
2. Go to Supabase: SQL Editor
3. Check schema.sql ran completely
4. Check SQL history for errors
5. May need to re-run schema.sql
```

### "Signup creates account but no profile"
```
1. Check profiles table exists
2. Verify onboarding saves correctly
3. May be a hook issue, check:
   /src/hooks/useNutrition.ts
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] .env.local updated with real credentials
- [ ] npm start runs without errors
- [ ] iOS simulator loads the app
- [ ] Can sign up successfully
- [ ] Can complete onboarding
- [ ] Profile appears in Supabase database
- [ ] Can log food
- [ ] Food appears in food_logs table
- [ ] Can log workout
- [ ] Workout appears in workout_logs table
- [ ] Session persists after reload
- [ ] No RLS permission errors

---

## File Locations (for reference)

```
Fitwell Project Root:
/Users/apple/Developer/app/fitwell/

Key Files:
├── .env.local              ← Update with Supabase credentials
├── src/
│   ├── services/
│   │   └── supabase.ts    ← Supabase client (no changes needed)
│   ├── hooks/
│   │   ├── useNutrition.ts
│   │   ├── useWorkouts.ts
│   │   └── useTracking.ts
│   └── screens/app/
│       └── SupabaseDebugScreen.tsx ← For testing (optional)
└── database/
    ├── schema.sql          ← Run this in Supabase
    └── sample-data.sql    ← Run this too (optional)
```

---

## Support Commands

```bash
# Start app (from fitwell folder)
npm start

# Open iOS simulator (in terminal that opens)
Press: i

# Reload app (after changes)
Press: r

# See all commands
Press: ?

# Stop dev server
Ctrl+C

# Clear Metro cache
npm start -- --clear

# Check TypeScript errors
npm run type-check
```

---

## 🎯 Next Steps After Verification

1. ✅ App is fully functional
2. Test all screens (Food, Workout, Progress, Settings)
3. (Optional) Add Google OAuth
4. Build for App Store: `npm run build:ios`
5. Deploy!

---

**Estimated Time**: 15-20 minutes
**Difficulty**: Easy (mostly copy-paste)
**Success Rate**: 99% if you follow exactly

Good luck! 🚀
