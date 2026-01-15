# Supabase Integration Setup - Complete Automation Guide

## Quick Overview

This guide provides **automated and manual** steps to complete your Supabase integration. All code, database schema, and configuration are ready—you just need to:

1. Create a Supabase project
2. Load the database schema
3. Update environment credentials
4. Run verification tests

**Estimated Time: 15-30 minutes**

---

## Part 1: Create Supabase Project

### Option A: Automated (Recommended)

We'll use a script to verify prerequisites and guide you through project creation:

```bash
cd /Users/apple/Developer/app/fitwell
bash setup-supabase.sh
```

**What the script does:**
- ✓ Checks Node.js and npm installed
- ✓ Verifies database files exist
- ✓ Validates environment variables
- ✓ Provides Supabase CLI installation (if needed)
- ✓ Guides you through project creation

### Option B: Manual Web Interface (Fastest)

1. **Visit**: https://supabase.com/dashboard
2. **Sign in** or **Create account** (free tier supports this)
3. **Click**: "New project"
4. **Configure**:
   - Organization: (create if new)
   - Project name: `fitwell`
   - Database password: Save this securely! (you won't need it again)
   - Region: Choose closest to you (US East recommended if in US)
5. **Wait**: 2-3 minutes for database provisioning
6. **Success**: You'll see project dashboard

---

## Part 2: Get Your Credentials

Once your project is created:

### In Supabase Dashboard:

1. **Left sidebar**: Click "Settings" (gear icon)
2. **Click**: "API" section
3. **Copy these values**:
   - **Project URL** (format: `https://xxxxx.supabase.co`)
   - **Anon public key** (starts with `eyJh...`)
4. **Keep secure**: Don't commit these to git (already ignored in .gitignore ✓)

### Example Credentials (DO NOT USE):
```
URL: https://abcdefgh.supabase.co
KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Part 3: Update Environment Variables

### Automated Update:

```bash
# Replace with your ACTUAL credentials from Step 2
export SUPABASE_URL="https://yourproject.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Run update script
cd /Users/apple/Developer/app/fitwell
bash -c "
cat > .env.local << EOF
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

# Google OAuth (Configure later if needed)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=
EOF
"

echo "✓ .env.local updated successfully"
```

### Manual Update:

1. **Open**: `/Users/apple/Developer/app/fitwell/.env.local`
2. **Replace** these lines with your actual credentials:
   ```dotenv
   EXPO_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. **Save** the file (Ctrl+S / Cmd+S)
4. **Do not commit** to git (already in .gitignore)

### Verify Update:

```bash
# Check your credentials are loaded (will show your URL, not the placeholder)
cd /Users/apple/Developer/app/fitwell
grep "SUPABASE_URL" .env.local
```

---

## Part 4: Load Database Schema

Your database needs structure before the app can work. This creates tables, security policies, and functions.

### Fastest Method (Copy-Paste UI):

1. **In Supabase Dashboard**:
   - Left sidebar: "SQL Editor"
   - Click "New Query"
   - Name it: "01-schema"

2. **Copy entire schema**:
   ```bash
   cat /Users/apple/Developer/app/fitwell/database/schema.sql | pbcopy
   ```

3. **In Supabase SQL Editor**:
   - Paste the schema (Cmd+V)
   - Click "Run" button (or Cmd+Enter)
   - **Wait** 10-30 seconds for execution

4. **Verify**: No red error messages—should show "Success"

### Alternative: Using Supabase CLI

If you prefer CLI:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref yourprojectref

# Push schema (replaces entire schema)
supabase db push < /Users/apple/Developer/app/fitwell/database/schema.sql
```

### What the Schema Creates:

- **10 Tables**: profiles, foods, food_logs, workouts, workout_logs, weight_logs, water_logs, habits, habit_logs, reminders
- **40+ Row Level Security (RLS) Policies**: Ensures users can only see their own data
- **9 Triggers**: Automatic timestamp management
- **3 Functions**: Helper functions for calculations
- **40+ Indexes**: Database performance optimization

---

## Part 5: Load Sample Data (Optional but Recommended)

Sample data helps you test without manually entering everything.

### If You Want Sample Data:

1. **In Supabase SQL Editor**:
   - Click "New Query"
   - Name it: "02-sample-data"

2. **Copy sample data**:
   ```bash
   cat /Users/apple/Developer/app/fitwell/database/sample-data.sql | pbcopy
   ```

3. **In Supabase SQL Editor**:
   - Paste (Cmd+V)
   - Click "Run"
   - **Wait** 5-10 seconds

4. **What you get**:
   - 20+ Indian foods, 20+ global foods, packaged foods, recipes
   - 10 workout templates
   - 6 sample habits
   - Ready to use immediately

### If You Skip Sample Data:

That's fine—you can enter data manually when testing the app. Skip this step if you prefer.

---

## Part 6: Test Your Configuration

### Quick Validation (Before running app):

```bash
cd /Users/apple/Developer/app/fitwell

# 1. Verify environment variables are loaded
node -e "
require('dotenv').config({ path: '.env.local' });
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
console.log('✓ SUPABASE_URL loaded:', url ? 'YES' : 'MISSING');
console.log('✓ SUPABASE_ANON_KEY loaded:', key ? 'YES' : 'MISSING');
if (!url || !key) {
  console.error('❌ Missing credentials—check .env.local');
  process.exit(1);
}
console.log('✓ Configuration valid!');
"

# 2. Verify database connection with curl
curl -s https://yourproject.supabase.co/rest/v1/profiles \
  -H "apikey: yourkey" \
  -H "Authorization: Bearer yourkey" | head -20
```

### Full App Test (In Simulator):

```bash
cd /Users/apple/Developer/app/fitwell

# Start the development server
npm start

# Press 'i' for iOS simulator
# The app should load without errors!
```

### Expected Results After Start:

1. ✅ **No "Missing env vars" error** — Should load smoothly
2. ✅ **Welcome/Auth screen appears** — Navigation working
3. ✅ **"Sign Up" button works** — Can enter email/password
4. ✅ **Account creation succeeds** — New row appears in Supabase `profiles` table
5. ✅ **Onboarding screens appear** — Full flow accessible
6. ✅ **Can log food** — Data appears in `food_logs` table in Supabase
7. ✅ **Session persists on reload** — Auto-login works with AsyncStorage

---

## Part 7: Comprehensive Verification Tests

Run automated tests to verify everything is working:

### Test 1: Supabase Client Initialization

```bash
cd /Users/apple/Developer/app/fitwell
node -e "
const { supabase } = require('./src/services/supabase.ts');
console.log('✓ Supabase client initialized successfully');
"
```

### Test 2: Check Database Connectivity

```bash
# Replace with your actual project ref
PROJECT_REF="your-project-ref"
ANON_KEY="your-anon-key"

curl -s https://${PROJECT_REF}.supabase.co/rest/v1/profiles \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -w "\nHTTP Status: %{http_code}\n" | head -20
```

**Expected Response**:
- HTTP Status: 200 (success)
- Returns empty array `[]` or array of profiles
- NO authentication errors

### Test 3: Check RLS Policies

```bash
# Try to create a profile without authentication
curl -X POST https://${PROJECT_REF}.supabase.co/rest/v1/profiles \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"id":"test","display_name":"Test"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected**: Status 403 (Forbidden) — RLS is working! ✓

### Test 4: Visual In-App Test

Open the Supabase Debug Screen in the app:

```typescript
// Available in the Settings screen
// Shows real-time database connectivity
// Tests: Client init, Auth status, Read/Write permissions, RLS policies
```

---

## Troubleshooting

### "Cannot find module 'supabase'"

```bash
cd /Users/apple/Developer/app/fitwell
npm install @supabase/supabase-js
```

### ".env.local not loading"

```bash
# Verify file exists
ls -la /Users/apple/Developer/app/fitwell/.env.local

# Verify format (no extra spaces)
cat /Users/apple/Developer/app/fitwell/.env.local | head -5

# Try restarting the dev server
npm start
```

### "Missing Supabase environment variables" error

1. Check `.env.local` has both variables:
   ```bash
   grep "EXPO_PUBLIC_SUPABASE" .env.local
   ```

2. Verify they're not empty:
   ```bash
   source .env.local
   echo "URL: $EXPO_PUBLIC_SUPABASE_URL"
   echo "KEY: $EXPO_PUBLIC_SUPABASE_ANON_KEY"
   ```

3. Both should output real values (not "demo" or empty)

### "Cannot read property 'from' of undefined"

This means the Supabase client didn't initialize. Check:

1. **Credentials are valid** (copy from Supabase Dashboard again)
2. **Project is still running** (check Supabase Dashboard status)
3. **Network connection** is working

### "RLS policy violation" when logging data

This is **correct behavior**! It means RLS is protecting data. Your app's hooks handle this automatically. If you see this error in app:

1. **Check user is authenticated** (user should be logged in)
2. **Check `user_id` in data** matches authenticated user ID
3. **Review RLS policies** in Supabase Dashboard → SQL Editor

---

## Security Checklist

✅ **Before going to production**:

1. ✓ `.env.local` is in `.gitignore` (already configured)
2. ✓ No credentials committed to git:
   ```bash
   git log --all --source --grep="EXPO_PUBLIC_SUPABASE" -- .env.local
   # Should return nothing
   ```
3. ✓ RLS policies are enabled (enabled in schema)
4. ✓ Only public key used in frontend (anon key only, not service key)
5. ✓ Auth JWT secret is generated (Supabase does this automatically)
6. ✓ CORS properly configured (Supabase handles this automatically)

---

## What's Next

Once you complete these steps:

1. **App starts without errors** ✓
2. **Can sign up and create account** ✓
3. **Can log food/workouts** ✓
4. **Data appears in Supabase** ✓
5. **Session persists on reload** ✓

Then you have a **fully functional fitness tracking app** with:
- ✅ User authentication
- ✅ Persistent data storage
- ✅ Secure row-level data isolation
- ✅ Real-time capabilities (if you add them)
- ✅ Automated backups (Supabase provides)
- ✅ Free tier (up to 500 MB data)

---

## Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase JavaScript Client**: https://supabase.com/docs/reference/javascript/introduction
- **Expo Env Variables**: https://docs.expo.dev/guides/environment-variables/
- **React Native AsyncStorage**: https://react-native-async-storage.github.io/async-storage/docs/advanced/use-async-storage/
- **This Project's Guides**:
  - [Quick Start](./SUPABASE_QUICK_START.md) (15 min)
  - [Detailed Guide](./SUPABASE_INTEGRATION_GUIDE.md) (comprehensive)
  - [Status Report](./SUPABASE_STATUS.md) (what's ready)

---

## Support

If you get stuck:

1. **Check the guides** above first
2. **Review error message** — often tells you exactly what's wrong
3. **Check .env.local** — 80% of issues are here
4. **Check Supabase Dashboard** — is your project still running?
5. **Restart dev server** — simple but effective

You've got this! 🚀

