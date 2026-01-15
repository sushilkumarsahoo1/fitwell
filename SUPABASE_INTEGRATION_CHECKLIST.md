# 🎯 Supabase Integration Checklist

Complete the following steps to fully integrate Supabase with your Fitwell app. **Estimated time: 20-30 minutes**

---

## Step 1: Verify App Readiness ✅

**What to do:**
Run the verification script to ensure all components are ready.

```bash
cd /Users/apple/Developer/app/fitwell
bash verify-supabase-setup.sh
```

**Expected output:**
```
✓ All checks passed! (40/40 checks)
✓ Your Fitwell app is ready for Supabase integration!
```

**If something fails:**
- Check the failed item
- Ensure all files are in place
- Run `npm install` to install dependencies
- Try the verification script again

---

## Step 2: Create Supabase Project ⏱️ 5 minutes

### Option A: Via Web Dashboard (Recommended for Beginners)

1. **Visit** https://supabase.com/dashboard
2. **Sign in** to your account (or create a free account)
3. **Click** "New project"
4. **Fill in details:**
   - Organization: Select existing or create new
   - Project name: `fitwell` (or any name)
   - Database password: Save this! Write it down or use a password manager
   - Region: Choose closest to your location (US-East-1 if in US)
5. **Wait** 2-3 minutes for the database to provision
6. **Success** when you see the project dashboard

### Option B: Using Supabase CLI

If you prefer command line:

```bash
# Install CLI (if not already installed)
npm install -g supabase

# Authenticate with Supabase
supabase login

# Create project (opens browser for auth)
supabase projects create --name fitwell
```

**Expected result:**
- ✅ New project appears in Supabase Dashboard
- ✅ Project URL and keys are visible in Settings → API
- ✅ Database is running (no warning icons)

---

## Step 3: Get Your Credentials 📋 1 minute

### Via Web Dashboard:

1. **In your Supabase project**, click **Settings** (gear icon, bottom left)
2. **Click** "API" in the left menu
3. **Copy these values:**
   - **Project URL** — looks like `https://xxxxxxxxxxxxx.supabase.co`
   - **Anon public key** — starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**⚠️ Important:** Do NOT use the `service_role` key—that's for backend only!

### Example (DO NOT USE - for reference only):
```
Project URL: https://abcdefghijklmnop.supabase.co
Anon Key:    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.xxxxx
```

---

## Step 4: Update Environment Variables 🔧 1 minute

### Automated Update (Easy):

```bash
cd /Users/apple/Developer/app/fitwell
bash setup-credentials.sh
```

The script will:
1. ✓ Show current .env.local contents
2. ✓ Prompt for your Project URL
3. ✓ Prompt for your Anon Key
4. ✓ Create a backup of the old file
5. ✓ Update .env.local with your credentials
6. ✓ Verify the file was updated correctly

### Manual Update (If Preferred):

1. **Open** `/Users/apple/Developer/app/fitwell/.env.local` in your editor
2. **Replace these lines** with your actual credentials:
   ```dotenv
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. **Save** the file (don't add any quotes or extra spaces)
4. **Verify** the values don't have demo text anymore

**✅ Verification:**
```bash
# Check credentials are real (not demo)
grep "supabase.co" /Users/apple/Developer/app/fitwell/.env.local
# Should output: EXPO_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
```

---

## Step 5: Load Database Schema 📊 5 minutes

Your database needs the schema (tables, security rules, etc.) before the app can store data.

### Fastest Method (Copy-Paste UI):

**In Supabase Dashboard:**

1. **Left sidebar** → "SQL Editor"
2. **Click** "New Query"
3. **Name it** `01-schema` (helps keep things organized)
4. **Copy the schema** to clipboard:
   ```bash
   cat /Users/apple/Developer/app/fitwell/database/schema.sql | pbcopy
   ```
5. **In Supabase SQL Editor**, click in the text area and paste (Cmd+V)
6. **Click** the "Run" button (or press Cmd+Enter)
7. **Wait** 10-30 seconds for the schema to load
8. **Success** when you see "Query executed successfully"

**What gets created:**
- ✅ 10 database tables (profiles, foods, workouts, etc.)
- ✅ 40+ security rules (Row Level Security)
- ✅ 9 automatic triggers (timestamp management)
- ✅ 40+ database indexes (for speed)
- ✅ 3 helper functions (calculations)

**Verify in Supabase Dashboard:**
- Left sidebar → "Table Editor"
- Should see tables: `profiles`, `foods`, `food_logs`, `workouts`, `workout_logs`, etc.
- Each table shows columns and data types

### Alternative: Using SQL Script File Directly

```bash
# If you want to use the schema file directly
cd /Users/apple/Developer/app/fitwell

# The schema file location (for reference)
ls -lh database/schema.sql
```

---

## Step 6: Load Sample Data (Optional but Recommended) 🥗 2 minutes

Sample data lets you test the app immediately without manually entering everything.

**In Supabase Dashboard:**

1. **SQL Editor** → "New Query"
2. **Name it** `02-sample-data`
3. **Copy sample data**:
   ```bash
   cat /Users/apple/Developer/app/fitwell/database/sample-data.sql | pbcopy
   ```
4. **Paste** in SQL Editor (Cmd+V)
5. **Click** "Run"
6. **Wait** 5-10 seconds

**What you get:**
- ✅ 20+ Indian foods
- ✅ 20+ global foods
- ✅ 10+ packaged foods and recipes
- ✅ 10 workout templates
- ✅ 6 sample habits
- ✅ Ready to use immediately!

**Skip this if you prefer to:**
- Enter your own data manually
- Keep the database clean
- Test with minimal data

---

## Step 7: Test the App 🧪 5 minutes

Now test that everything works end-to-end!

### 7a. Start the Development Server

```bash
cd /Users/apple/Developer/app/fitwell

# Start Expo dev server
npm start

# When prompted, press 'i' for iOS Simulator
# App should load in about 30 seconds
```

### 7b. Expected Behavior

**✅ These should work:**

1. **App loads without errors**
   - No red error screens
   - No "Missing environment variables" message
   - Welcome screen appears

2. **Sign Up works**
   - Can enter email: `test@example.com`
   - Can enter password: `TestPassword123`
   - "Sign Up" button is clickable
   - After clicking, should show onboarding screens (2-3 screens)

3. **Complete Onboarding**
   - Profile setup screen (name, age, etc.)
   - Fitness goal selection
   - Activity level selection
   - Screens should all be responsive

4. **Access Main App**
   - After onboarding, Dashboard screen appears
   - Bottom tab navigation visible (Dashboard, Nutrition, Workouts, Progress, Settings)
   - No crash or frozen screens

5. **Verify Data Saved**
   - Go to Supabase Dashboard
   - Table Editor → "profiles" table
   - Should see new row with your email

6. **Test Food Logging** (if you completed onboarding)
   - Click "Nutrition" tab
   - Click "Add Food"
   - Search for a food (e.g., "rice" from sample data)
   - Add a serving
   - Click "Log"
   - Food log appears in the UI

7. **Verify Food Logged**
   - Supabase Dashboard → Table Editor
   - Click "food_logs" table
   - Should see new row with your logged food

### 7c: Troubleshooting During Testing

| Issue | Solution |
|-------|----------|
| "Cannot find module '@supabase/supabase-js'" | Run `npm install` |
| "Missing environment variables" error | Check `.env.local` has real credentials (not demo) |
| White blank screen on startup | Restart dev server: `npm start` → press 'i' again |
| "Network error" or connection fails | Check `.env.local` URL is correct format |
| Signup works but crash on onboarding | Clear simulator: Device → Erase All Content and Settings |
| Can't see data in Supabase | Check user is logged in, check RLS policies (see Verify RLS below) |

---

## Step 8: Verify Everything Works 🔍 5 minutes

Run the built-in test suite to verify all features:

### Via Supabase Debug Screen (In-App):

1. **In the app**, go to **Settings** tab
2. **Scroll down** to "Developer Tools"
3. **Tap** "Supabase Debug"
4. **Tap** "Run All Tests"
5. **Expected:** All tests pass with green checkmarks

### Via Terminal (Advanced):

```bash
cd /Users/apple/Developer/app/fitwell

# Verify client can connect
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const client = createClient(url, key);
console.log('✓ Supabase client initialized');
"

# Test API connectivity
curl -s https://YOUR_PROJECT_REF.supabase.co/rest/v1/profiles \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" | head -20
# Expected: [] or array of profiles, HTTP 200
```

### Test RLS Policies (Security):

Try to access data without authentication:

```bash
# This should FAIL (403 Forbidden) - that's good!
curl -s -X POST https://YOUR_PROJECT_REF.supabase.co/rest/v1/profiles \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"id":"test","display_name":"Test"}' \
  -w "\n%{http_code}\n"
# Expected HTTP status: 403 (unauthorized - RLS is working!)
```

---

## Step 9: Security Verification 🔒

Before considering this complete, verify security:

### ✅ Checklist:

- [ ] `.env.local` is in `.gitignore` (prevents accidental commit)
  ```bash
  grep "\.env\.local" /Users/apple/Developer/app/fitwell/.gitignore
  # Should output: .env.local
  ```

- [ ] No credentials in git history
  ```bash
  cd /Users/apple/Developer/app/fitwell
  git log --all --grep="EXPO_PUBLIC_SUPABASE" -- .env.local | wc -l
  # Should output: 0
  ```

- [ ] Using only public anon key (not service role key)
  ```bash
  grep "EXPO_PUBLIC_SUPABASE_ANON_KEY" .env.local | head -c 50
  # Should NOT contain "service_role" text
  ```

- [ ] RLS policies enabled on all tables
  - Supabase Dashboard → SQL Editor
  - Run: `SELECT tablename FROM pg_tables WHERE schemaname='public'`
  - Should see: profiles, foods, food_logs, workouts, workout_logs, etc.

- [ ] Authentication working correctly
  - You can sign up
  - You can sign in
  - Only see your own data
  - Other users' data is hidden

---

## Step 10: You're Done! 🎉

You now have a **fully functional fitness tracking app** with:

✅ **User Authentication**
- Secure signup/signin
- Session persistence
- Password hashing (handled by Supabase)

✅ **Real Database**
- 10 tables for nutrition, workouts, habits, etc.
- 40+ security rules (RLS)
- Automatic timestamp management
- Data indexed for speed

✅ **Production Ready**
- Error handling
- Network error recovery
- Input validation
- Proper TypeScript types

✅ **Free Tier**
- Up to 500 MB database
- 2 GB file storage
- 50,000 monthly active users (for free tier)
- See supabase.com/pricing for higher limits

---

## What to Do Next

### Short Term (This Week):
1. ✅ Complete this checklist
2. ✅ Test all app features
3. ✅ Log some sample data
4. ✅ Verify data persists on app restart

### Medium Term (Next 2 Weeks):
- [ ] Test with iOS and Android
- [ ] Test with real data scenarios
- [ ] Add more foods/workouts/habits
- [ ] Test all screens and flows

### Long Term (Production):
- [ ] Set up monitoring (Supabase has built-in analytics)
- [ ] Enable backup strategies
- [ ] Consider upgrading from free tier
- [ ] Set up analytics and tracking
- [ ] Add notifications/reminders

---

## Helpful Resources

| Topic | Link |
|-------|------|
| Supabase Documentation | https://supabase.com/docs |
| Supabase JavaScript Client | https://supabase.com/docs/reference/javascript/introduction |
| Expo Environment Variables | https://docs.expo.dev/guides/environment-variables/ |
| React Native AsyncStorage | https://react-native-async-storage.github.io/async-storage/ |
| This Project's Guides | See files in `/Users/apple/Developer/app/fitwell/SUPABASE*.md` |

---

## Need Help?

**Common Issues & Solutions:**

1. **"Cannot find EXPO_PUBLIC_SUPABASE_URL" error**
   - Check `.env.local` exists and has real values
   - Restart dev server: `npm start`
   - Clear app cache if on iOS

2. **"Supabase client is undefined"**
   - Run `npm install`
   - Check `src/services/supabase.ts` exists
   - Clear node_modules: `rm -rf node_modules && npm install`

3. **RLS policy violation when saving data**
   - User must be authenticated
   - Check user ID matches in the database
   - This error is **expected** if user isn't logged in

4. **Connection timeout or 504 error**
   - Check internet connection
   - Verify Supabase project is running (Supabase Dashboard)
   - Check .env.local URL is correct

5. **Data not appearing in Supabase**
   - Verify RLS policies (see Supabase Dashboard → SQL Editor)
   - Check user is authenticated
   - Look for error messages in app

**Still stuck?** Check the comprehensive guides:
- `SUPABASE_INTEGRATION_GUIDE.md` — Detailed walkthrough
- `SUPABASE_QUICK_START.md` — Fast 15-minute setup
- `SUPABASE_STATUS.md` — Current status and verification

---

## Summary

| Step | Task | Time | Status |
|------|------|------|--------|
| 1 | Verify app readiness | 2 min | ⬜ TODO |
| 2 | Create Supabase project | 5 min | ⬜ TODO |
| 3 | Get credentials | 1 min | ⬜ TODO |
| 4 | Update .env.local | 1 min | ⬜ TODO |
| 5 | Load database schema | 5 min | ⬜ TODO |
| 6 | Load sample data | 2 min | ⬜ TODO (optional) |
| 7 | Test the app | 5 min | ⬜ TODO |
| 8 | Verify tests pass | 5 min | ⬜ TODO |
| 9 | Security check | 2 min | ⬜ TODO |
| **TOTAL** | | **~30 min** | ⬜ TODO |

---

**Last Updated:** January 15, 2026  
**For:** Fitwell React Native Expo App  
**Status:** Ready for Integration

Print this checklist or bookmark it. Check off each step as you complete it! 📋

