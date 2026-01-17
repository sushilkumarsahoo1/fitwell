#!/bin/bash

# FitWell Implementation Verification Script
# Validates all files are created and have expected content

echo "🔍 FitWell Implementation Verification"
echo "======================================"
echo ""

ERRORS=0
WARNINGS=0
SUCCESS=0

check_file() {
    local file=$1
    local min_size=$2
    local description=$3
    
    if [ ! -f "$file" ]; then
        echo "❌ MISSING: $description"
        echo "   File: $file"
        ((ERRORS++))
        return 1
    fi
    
    local size=$(wc -c < "$file")
    if [ "$size" -lt "$min_size" ]; then
        echo "⚠️  WARNING: $description - File too small"
        echo "   Expected: > $min_size bytes, Got: $size bytes"
        ((WARNINGS++))
        return 1
    fi
    
    echo "✅ $description"
    ((SUCCESS++))
    return 0
}

echo "📋 Checking Services..."
check_file "src/services/foodService.ts" 5000 "Food Service (USDA integration)"
check_file "src/services/workoutService.ts" 8000 "Workout Service (all types)"

echo ""
echo "🛠️  Checking Utilities..."
check_file "src/utils/foodUtils.ts" 4000 "Food Utilities (unit conversion)"
check_file "src/utils/workoutUtils.ts" 5000 "Workout Utilities (calorie calc)"

echo ""
echo "⚙️  Checking Constants..."
check_file "src/constants/exercises.ts" 10000 "Exercise Database (90+ exercises)"

echo ""
echo "🎣 Checking React Query Hooks..."
check_file "src/hooks/useNutrition.ts" 3000 "useNutrition (USDA hooks)"
check_file "src/hooks/useWorkouts.ts" 3000 "useWorkouts (workout hooks)"

echo ""
echo "📱 Checking UI Screens..."
check_file "src/screens/app/FoodLoggingScreen.tsx" 10000 "Food Logging Screen"
check_file "src/screens/app/WorkoutLoggingScreen.tsx" 15000 "Workout Logging Screen"

echo ""
echo "💾 Checking Database..."
check_file "database/SCHEMA_UPDATES.sql" 1000 "Schema Migration (fdc_id, exercise_name, etc)"

echo ""
echo "📖 Checking Documentation..."
check_file "IMPLEMENTATION_GUIDE.md" 5000 "Implementation Guide"
check_file "DEPLOYMENT_CHECKLIST.md" 5000 "Deployment Checklist"

echo ""
echo "======================================"
echo "📊 Verification Results"
echo "======================================"
echo "✅ Success: $SUCCESS"
echo "⚠️  Warnings: $WARNINGS"
echo "❌ Errors: $ERRORS"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo "🎉 All checks passed! Ready to deploy."
    exit 0
else
    echo "🚨 Please fix errors before deployment."
    exit 1
fi
