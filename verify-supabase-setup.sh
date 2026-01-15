#!/bin/bash

# Supabase Integration Setup Verification Script
# This script validates that all components are ready for Supabase integration

echo "================================"
echo "Supabase Integration Verifier"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to print check result
check_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $1"
        ((CHECKS_FAILED++))
    fi
}

# Function to print section
print_section() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# ============================================
# 1. Check System Prerequisites
# ============================================
print_section "1. Checking System Prerequisites"

# Check Node.js
node --version > /dev/null 2>&1
check_result "Node.js installed ($(node --version))"

# Check npm
npm --version > /dev/null 2>&1
check_result "npm installed ($(npm --version))"

# Check bash
[ -n "$BASH_VERSION" ]
check_result "Running in bash shell"

# ============================================
# 2. Check Project Files
# ============================================
print_section "2. Checking Project Files"

PROJECT_DIR="/Users/apple/Developer/app/fitwell"
cd "$PROJECT_DIR"

# Check main files
[ -f "package.json" ]
check_result "package.json exists"

[ -f "app.json" ]
check_result "app.json (Expo config) exists"

[ -f ".env.local" ]
check_result ".env.local exists"

[ -f "babel.config.js" ]
check_result "babel.config.js exists"

[ -f "tsconfig.json" ]
check_result "tsconfig.json exists"

# ============================================
# 3. Check Supabase Client Code
# ============================================
print_section "3. Checking Supabase Client Code"

[ -f "src/services/supabase.ts" ]
check_result "src/services/supabase.ts exists"

grep -q "EXPO_PUBLIC_SUPABASE_URL" "src/services/supabase.ts"
check_result "Supabase client uses EXPO_PUBLIC_SUPABASE_URL"

grep -q "EXPO_PUBLIC_SUPABASE_ANON_KEY" "src/services/supabase.ts"
check_result "Supabase client uses EXPO_PUBLIC_SUPABASE_ANON_KEY"

grep -q "AsyncStorage" "src/services/supabase.ts"
check_result "AsyncStorage persistence enabled"

# ============================================
# 4. Check Database Files
# ============================================
print_section "4. Checking Database Files"

[ -f "database/schema.sql" ]
check_result "database/schema.sql exists"

[ -f "database/sample-data.sql" ]
check_result "database/sample-data.sql exists"

# Check schema file size
SCHEMA_SIZE=$(wc -l < "database/schema.sql")
[ "$SCHEMA_SIZE" -gt 200 ]
check_result "schema.sql is complete ($SCHEMA_SIZE lines)"

# Check for essential schema components
grep -q "profiles" "database/schema.sql"
check_result "Schema defines profiles table"

grep -q "food_logs" "database/schema.sql"
check_result "Schema defines food_logs table"

grep -q "workout_logs" "database/schema.sql"
check_result "Schema defines workout_logs table"

grep -q "CREATE POLICY" "database/schema.sql"
check_result "Schema includes RLS policies"

# ============================================
# 5. Check Application Screens
# ============================================
print_section "5. Checking Application Screens"

[ -d "src/screens" ]
check_result "src/screens directory exists"

[ -f "src/screens/auth/SignInScreen.tsx" ]
check_result "SignInScreen.tsx exists"

[ -f "src/screens/auth/SignUpScreen.tsx" ]
check_result "SignUpScreen.tsx exists"

[ -f "src/screens/app/DashboardScreen.tsx" ]
check_result "DashboardScreen.tsx exists"

[ -f "src/screens/app/FoodLoggingScreen.tsx" ]
check_result "FoodLoggingScreen.tsx exists"

[ -f "src/screens/app/SupabaseDebugScreen.tsx" ]
check_result "SupabaseDebugScreen.tsx (debug screen) exists"

# ============================================
# 6. Check Custom Hooks
# ============================================
print_section "6. Checking Custom Hooks"

[ -f "src/hooks/useNutrition.ts" ]
check_result "useNutrition.ts exists"

[ -f "src/hooks/useWorkouts.ts" ]
check_result "useWorkouts.ts exists"

[ -f "src/hooks/useTracking.ts" ]
check_result "useTracking.ts exists"

# ============================================
# 7. Check Dependencies
# ============================================
print_section "7. Checking Dependencies"

grep -q "supabase" "package.json"
check_result "Supabase package in package.json"

grep -q "react-native-async-storage" "package.json"
check_result "AsyncStorage in package.json"

grep -q "@tanstack/react-query" "package.json"
check_result "TanStack Query in package.json"

grep -q "react-navigation" "package.json"
check_result "React Navigation in package.json"

[ -d "node_modules/@supabase/supabase-js" ]
check_result "Supabase client installed (node_modules)"

# ============================================
# 8. Check Environment Configuration
# ============================================
print_section "8. Checking Environment Configuration"

[ -f ".env.local" ]
check_result ".env.local exists"

grep -q "EXPO_PUBLIC_SUPABASE_URL" ".env.local"
check_result ".env.local contains EXPO_PUBLIC_SUPABASE_URL"

grep -q "EXPO_PUBLIC_SUPABASE_ANON_KEY" ".env.local"
check_result ".env.local contains EXPO_PUBLIC_SUPABASE_ANON_KEY"

# Check if .env.local is in .gitignore
grep -q "\.env\.local" ".gitignore"
check_result ".env.local is in .gitignore (safe from git commits)"

# ============================================
# 9. Check Documentation
# ============================================
print_section "9. Checking Documentation"

[ -f "SUPABASE_INTEGRATION_GUIDE.md" ]
check_result "SUPABASE_INTEGRATION_GUIDE.md exists"

[ -f "SUPABASE_QUICK_START.md" ]
check_result "SUPABASE_QUICK_START.md exists"

[ -f "SUPABASE_STATUS.md" ]
check_result "SUPABASE_STATUS.md exists"

# ============================================
# 10. Summary
# ============================================
print_section "Summary"

TOTAL=$((CHECKS_PASSED + CHECKS_FAILED))

echo ""
echo "Total Checks: $TOTAL"
echo -e "Passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Failed: ${RED}$CHECKS_FAILED${NC}"

echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Your Fitwell app is ready for Supabase integration!"
    echo ""
    echo "Next steps:"
    echo "1. Create a Supabase project at https://supabase.com"
    echo "2. Copy your Project URL and Anon Key"
    echo "3. Update .env.local with your credentials"
    echo "4. Run: npm start"
    echo "5. Test signup and data logging"
    echo ""
    echo "Detailed instructions in:"
    echo "  - SUPABASE_QUICK_START.md (15 min setup)"
    echo "  - SUPABASE_INTEGRATION_GUIDE.md (comprehensive)"
    echo "  - SUPABASE_SETUP_AUTOMATION.md (this guide's companion)"
    echo ""
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}✗ Some checks failed${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Please fix the issues above and run this script again."
    exit 1
fi
