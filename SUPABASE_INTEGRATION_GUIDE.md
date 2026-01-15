# 🔐 Fitwell - Complete Supabase Integration Guide

## Status: Ready for Supabase Setup

Your Fitwell app is **fully configured** to connect to Supabase. All you need to do is create a Supabase project and provide credentials.

---

## Current Configuration Verification ✅

Your app is correctly configured with:

```
✅ Environment Variables: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
✅ Supabase Client: Properly initialized with AsyncStorage persistence
✅ Database Schema: 10 tables with 40+ RLS policies ready
✅ Sample Data: 50+ records ready to load
✅ Authentication: Email/password auth configured
✅ Session Persistence: AsyncStorage for React Native
```

---

## Part 1: Create Supabase Project (5 minutes)

### Step 1.1: Go to Supabase Dashboard
```
1. Open: https://supabase.com/dashboard
2. Sign in or create account (if needed)
3. Click "New Project" button
```

### Step 1.2: Configure Your Project
```
Fill in these fields:

Name:                fitwell
Database Password:   [Create a STRONG password - save it!]
Region:              [Choose closest to your location]
```

**Important**: Save your database password somewhere safe. You won't be able to recover it.

### Step 1.3: Wait for Provisioning
```
- Supabase will set up your database
- Takes 2-3 minutes
- You'll be redirected to the project dashboard
```

### Step 1.4: Get Your Credentials
Once provisioned:
```
1. Click Settings (gear icon) in left sidebar
2. Click "API" in settings menu
3. You'll see:
   - Project URL: looks like https://xxxxx.supabase.co
   - anon public: long alphanumeric string
   - service_role: (ignore this for now)

4. Copy both values to a text file
```

---

## Part 2: Load Database Schema (5 minutes)

### Step 2.1: Open SQL Editor
```
1. In Supabase dashboard, click "SQL Editor" in left sidebar
2. Click "New Query" button
3. Title it: "Schema - Fitwell"
```

### Step 2.2: Copy Schema File
```
1. Open your project folder:
   /Users/apple/Developer/app/fitwell/database/schema.sql

2. Copy the ENTIRE contents (all 425 lines)
3. Paste into Supabase SQL Editor
```

### Step 2.3: Execute Schema
```
1. Click "Run" button (or Cmd+Enter)
2. Wait for confirmation: "Success" message
3. All 10 tables created with RLS policies
```

**What gets created:**
- profiles
- foods
- food_logs
- workouts
- workout_logs
- weight_logs
- water_logs
- habits
- habit_logs
- reminders

---

## Part 3: Load Sample Data (2 minutes, OPTIONAL but RECOMMENDED)

### Step 3.1: Create Sample Data Query
```
1. Click "New Query" in SQL Editor
2. Title it: "Sample Data - Fitwell"
```

### Step 3.2: Copy Sample Data
```
1. Open: /Users/apple/Developer/app/fitwell/database/sample-data.sql
2. Copy entire contents
3. Paste into SQL Editor
```

### Step 3.3: Execute Sample Data
```
1. Click "Run"
2. Success message
3. Sample data inserted:
   - 20 Indian foods
   - 20 Global foods
   - 10 Packaged foods
   - 8 Homemade recipes
   - 10 Workouts
   - 6 Sample habits
```

---

## Part 4: Update Environment Variables (2 minutes)

### Step 4.1: Edit .env.local
Open: `/Users/apple/Developer/app/fitwell/.env.local`

Replace placeholder values:
```dotenv
# Before (DEMO):
EXPO_PUBLIC_SUPABASE_URL=https://demo.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=demo_key_placeholder

# After (REAL):
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### Step 4.2: Save the File
```
Make sure to save .env.local
Expo will automatically reload with new variables
```

---

## Part 5: Test the Integration

### Step 5.1: Start the App
```bash
cd /Users/apple/Developer/app/fitwell
npm start
```

### Step 5.2: Open iOS Simulator
```
In terminal, press: i
(iOS simulator will open)
```

### Step 5.3: Test Authentication
```
1. Click "Sign Up"
2. Enter:
   Email: testuser@example.com
   Password: Test1234!
3. Click "Sign Up" button
4. Should create user in Supabase auth
5. Navigate to onboarding
```

### Step 5.4: Complete Onboarding
```
1. Enter your name
2. Enter age (e.g., 25)
3. Select gender
4. Enter height (e.g., 180)
5. Enter weight (e.g., 75)
6. Click Next
7. Select fitness goal (e.g., maintain)
8. Select activity level (e.g., moderate)
9. Done!

Profile should be saved to profiles table in Supabase
```

### Step 5.5: Test Data Operations
```
1. Go to Food tab
2. Search for "Chicken"
3. Select quantity
4. Click "Log Food"
5. Check Supabase: go to food_logs table
6. Your entry should appear!
```

### Step 5.6: Verify in Supabase
```
In Supabase dashboard, click "Table Editor"
Check these tables:
- profiles: Your profile data ✅
- food_logs: Logged foods ✅
- workout_logs: Logged workouts ✅
(Other tables if you test those features)
```

---

## Expected Behavior

### ✅ Working Correctly
- Signup creates user in auth.users
- Onboarding saves to profiles table
- Food logging saves to food_logs
- Workout logging saves to workout_logs
- Session persists on reload
- No "Network request failed" errors
- No permission denied errors

### ⚠️ If Errors Occur

**Error: "Network request failed"**
```
Cause: Wrong or missing credentials in .env.local
Fix: Double-check SUPABASE_URL and ANON_KEY match Supabase dashboard
```

**Error: "Auth error"**
```
Cause: Supabase auth not enabled
Fix: In Supabase, go to Authentication → Providers
     Enable Email/Password provider (should be default)
```

**Error: "Permission denied"**
```
Cause: RLS policies not configured correctly
Fix: Check schema.sql ran completely (check SQL Editor history)
     All policies should be created automatically
```

**Error: "Cannot read properties of undefined"**
```
Cause: .env.local not loaded
Fix: Kill dev server (Ctrl+C)
     Wait 5 seconds
     Restart: npm start
```

---

## Verification Checklist

### Environment Setup
- [ ] Created Supabase project
- [ ] Copied Project URL to .env.local
- [ ] Copied anon key to .env.local
- [ ] Saved .env.local

### Database Setup
- [ ] Ran schema.sql in SQL Editor
- [ ] All 10 tables created (check Table Editor)
- [ ] RLS policies enabled (check each table)
- [ ] (Optional) Ran sample-data.sql

### App Testing
- [ ] App starts without "Missing env vars" error
- [ ] Can sign up
- [ ] Can complete onboarding
- [ ] Profile appears in Supabase profiles table
- [ ] Can log food
- [ ] Food appears in Supabase food_logs table
- [ ] Can log workout
- [ ] Workout appears in Supabase workout_logs table
- [ ] Session persists on reload
- [ ] No RLS permission errors

### Security Testing
- [ ] Signed in as user A
- [ ] In Supabase, note your user ID
- [ ] Go to profiles table
- [ ] Verify you only see YOUR profile
- [ ] Try to query another user's data (should fail)
- [ ] Check SQL logs for RLS enforcement

---

## Architecture Diagram

```
┌─────────────────────────────────────┐
│    Fitwell iOS App (Expo/RN)        │
├─────────────────────────────────────┤
│  Screens (Auth, Onboarding, App)    │
│         ↓                           │
│  Custom Hooks (useNutrition, etc)   │
│         ↓                           │
│  TanStack Query (Caching)           │
│         ↓                           │
│  supabase.ts Client                 │
│  (AsyncStorage for persistence)     │
└────────────────┬────────────────────┘
                 │
        HTTPS (Secure)
                 │
┌────────────────▼────────────────────┐
│     Supabase Backend                │
├─────────────────────────────────────┤
│  PostgreSQL Database (10 tables)    │
│  Auth (Email/Password)              │
│  Row Level Security (RLS)           │
│  Real-time Subscriptions (ready)    │
└─────────────────────────────────────┘
```

---

## Database Schema Overview

### Authentication
- **auth.users** (managed by Supabase)
  - email
  - password (hashed)
  - created_at

### User Data
- **profiles** - User profile info
- **favorite_foods** - Saved favorite foods

### Nutrition Tracking
- **foods** - Food database (global + custom)
- **food_logs** - Daily food intake

### Fitness Tracking
- **workouts** - Workout templates
- **workout_logs** - Completed workouts
- **weight_logs** - Body weight tracking
- **water_logs** - Daily hydration

### Habits & Reminders
- **habits** - User habits
- **habit_logs** - Habit completions
- **reminders** - Push notifications

---

## RLS (Row Level Security) Explanation

Every table has policies like:
```sql
CREATE POLICY "Users can only see own data" ON profiles
  FOR SELECT USING (auth.uid() = user_id);
```

This means:
- User A cannot see User B's data
- User A cannot modify User B's data
- Even if User A somehow queries the database, RLS blocks it
- This is **automatic** - no additional coding needed

---

## Troubleshooting Checklist

### "Still seeing demo.supabase.co in error"
```
Fix:
1. Check .env.local is in /Users/apple/Developer/app/fitwell/
2. Make sure you updated the file (not a different .env file)
3. Kill terminal: Ctrl+C
4. Wait 10 seconds
5. Restart: npm start
```

### "Cannot connect to Supabase"
```
Fix:
1. Is your internet connected? (VPN might block)
2. Copy exact URL from Supabase dashboard (not from docs)
3. Make sure it starts with https://
4. Anon key should be long (60+ characters)
5. Check for typos in .env.local
```

### "Auth works but food logging fails"
```
Fix:
1. Check if schema.sql ran completely
2. In Supabase Table Editor, click "food_logs"
3. Should show columns: user_id, food_id, quantity, meal_type, date, etc
4. If empty, schema didn't run correctly
5. Re-run schema.sql
```

### "Seeing another user's data"
```
🚨 SECURITY ISSUE!
This means RLS is not working.
Fix:
1. Go to Supabase SQL Editor
2. Check that schema.sql ran successfully
3. Click on a table, go to RLS tab
4. Should show enabled policies
5. If not, re-run schema.sql
6. This should NEVER happen with correct RLS
```

---

## Next Steps After Verification

Once everything is working:

### 1. Test All Features
- [ ] Food logging with various foods
- [ ] Workout logging
- [ ] Weight tracking
- [ ] Habit completion
- [ ] Progress analytics
- [ ] Settings and profile edit

### 2. Verify Data Persistence
- [ ] Log out and back in
- [ ] Data should still be there
- [ ] Session should resume automatically

### 3. Test Multiple Users
- [ ] Sign up as user A, log some data
- [ ] Sign up as user B in another simulator
- [ ] Verify user A's data is private
- [ ] User B shouldn't see user A's data

### 4. (Optional) Enable Google OAuth
- Create OAuth credentials at Google Cloud Console
- Add to .env.local
- Test sign-in with Google

### 5. Ready for Production
- Build for iOS: `npm run build:ios`
- Build for Android: `npm run build:android`
- Submit to App Stores
- Monitor Supabase dashboard for usage

---

## Important Notes

1. **Keep credentials safe** - Never commit .env.local to git
2. **RLS is important** - Always run schema.sql, don't skip it
3. **Sample data is optional** - But useful for testing
4. **AsyncStorage** - Handles session persistence automatically
5. **Auto token refresh** - Supabase handles this, you don't need to manage it

---

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Native with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/react-native)
- [RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Expo Documentation](https://docs.expo.dev)

---

## Quick Command Reference

```bash
# Start the app
cd /Users/apple/Developer/app/fitwell
npm start

# Open iOS simulator
# In terminal that opens, press: i

# Reload app (after .env changes)
# In terminal, press: r

# View logs
# Shown automatically in terminal

# Stop dev server
# Ctrl+C

# Clear cache and rebuild
npm start -- --clear

# Check types
npm run type-check
```

---

**Status**: ✅ App is ready for Supabase  
**Next Action**: Create Supabase project and load schema  
**Estimated Time**: 15 minutes total setup
