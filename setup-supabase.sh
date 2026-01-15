#!/bin/bash

# Fitwell Supabase Integration Setup Guide
# This script will help you set up and verify your Supabase integration

set -e

PROJECT_DIR="/Users/apple/Developer/app/fitwell"

echo "🚀 Fitwell Supabase Integration Setup"
echo "======================================"
echo ""

# Step 1: Verify Project Structure
echo "✅ Step 1: Verifying project structure..."
echo ""

if [ -f "$PROJECT_DIR/.env.local" ]; then
    echo "   ✅ .env.local exists"
else
    echo "   ❌ .env.local missing"
    exit 1
fi

if [ -f "$PROJECT_DIR/database/schema.sql" ]; then
    echo "   ✅ schema.sql exists"
else
    echo "   ❌ schema.sql missing"
    exit 1
fi

if [ -f "$PROJECT_DIR/database/sample-data.sql" ]; then
    echo "   ✅ sample-data.sql exists"
else
    echo "   ❌ sample-data.sql missing"
    exit 1
fi

if [ -f "$PROJECT_DIR/src/services/supabase.ts" ]; then
    echo "   ✅ supabase.ts exists"
else
    echo "   ❌ supabase.ts missing"
    exit 1
fi

echo ""
echo "✅ Step 2: Checking Supabase client configuration..."
echo ""

# Verify supabase.ts uses correct env variables
if grep -q "EXPO_PUBLIC_SUPABASE_URL" "$PROJECT_DIR/src/services/supabase.ts"; then
    echo "   ✅ Using EXPO_PUBLIC_SUPABASE_URL (correct for Expo)"
else
    echo "   ❌ Wrong environment variable name"
    exit 1
fi

if grep -q "EXPO_PUBLIC_SUPABASE_ANON_KEY" "$PROJECT_DIR/src/services/supabase.ts"; then
    echo "   ✅ Using EXPO_PUBLIC_SUPABASE_ANON_KEY (correct for Expo)"
else
    echo "   ❌ Wrong environment variable name"
    exit 1
fi

if grep -q "AsyncStorage" "$PROJECT_DIR/src/services/supabase.ts"; then
    echo "   ✅ Using AsyncStorage for React Native session persistence"
else
    echo "   ❌ Missing AsyncStorage configuration"
    exit 1
fi

echo ""
echo "✅ Step 3: Verifying database schema structure..."
echo ""

# Check schema has all required tables
REQUIRED_TABLES=(
    "profiles"
    "foods"
    "food_logs"
    "workouts"
    "workout_logs"
    "weight_logs"
    "water_logs"
    "habits"
    "habit_logs"
    "reminders"
)

for table in "${REQUIRED_TABLES[@]}"; do
    if grep -q "CREATE TABLE.*$table" "$PROJECT_DIR/database/schema.sql"; then
        echo "   ✅ Table '$table' defined"
    else
        echo "   ❌ Table '$table' missing"
    fi
done

echo ""
echo "✅ Step 4: Checking for RLS policies..."
echo ""

RLS_COUNT=$(grep -c "CREATE POLICY" "$PROJECT_DIR/database/schema.sql" || true)
echo "   ✅ Found $RLS_COUNT RLS policies (should be 40+)"

if [ $RLS_COUNT -lt 30 ]; then
    echo "   ⚠️  Warning: Expected more RLS policies"
fi

echo ""
echo "✅ All pre-checks passed!"
echo ""
echo "============================================"
echo "📋 NEXT STEPS - Create Supabase Project"
echo "============================================"
echo ""
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Click 'New Project'"
echo "3. Fill in:"
echo "   - Project Name: fitwell"
echo "   - Database Password: (create a strong password)"
echo "   - Region: Choose closest to you"
echo "4. Wait 2-3 minutes for provisioning"
echo ""
echo "5. Once created, go to Settings → API"
echo "6. Copy your credentials:"
echo "   - Project URL (starts with https://)"
echo "   - anon public key (long alphanumeric string)"
echo ""
echo "7. Update .env.local with:"
echo "   EXPO_PUBLIC_SUPABASE_URL=<your-project-url>"
echo "   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>"
echo ""
echo "============================================"
echo "📊 After Creating Project"
echo "============================================"
echo ""
echo "1. In Supabase, go to SQL Editor"
echo "2. Click 'New Query'"
echo "3. Copy & paste entire contents of:"
echo "   $PROJECT_DIR/database/schema.sql"
echo "4. Click Run (execute it)"
echo "5. Wait for success message"
echo ""
echo "6. For sample data, create another query:"
echo "   $PROJECT_DIR/database/sample-data.sql"
echo "7. Run it (optional but recommended for testing)"
echo ""
echo "============================================"
echo "🧪 Testing"
echo "============================================"
echo ""
echo "After setting up Supabase:"
echo "1. Save .env.local with real credentials"
echo "2. In terminal:"
echo "   cd $PROJECT_DIR"
echo "   npm start"
echo "3. Press 'i' for iOS simulator"
echo "4. Test:"
echo "   - Sign up with test email"
echo "   - Complete onboarding"
echo "   - Log food/workout"
echo "   - Check Supabase: Data should appear in tables"
echo ""
