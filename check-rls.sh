#!/bin/bash

# RLS Validation Script
# Checks that profiles table has all required RLS policies

PROJECT_ID="YOUR_PROJECT_ID"  # Replace with your Supabase project ID
ANON_KEY="YOUR_ANON_KEY"      # Replace with your anon key

echo "🔍 Checking RLS Configuration for profiles table..."
echo ""

# Check 1: RLS is enabled
echo "1. Checking if RLS is enabled on profiles table:"
curl -s -X POST "https://${PROJECT_ID}.supabase.co/rest/v1/rpc/check_rls" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"table_name":"profiles"}' | grep -q "true"

if [ $? -eq 0 ]; then
  echo "   ✅ RLS is enabled"
else
  echo "   ❌ RLS might not be enabled"
fi

echo ""
echo "2. Checking for INSERT policy:"
curl -s "https://${PROJECT_ID}.supabase.co/rest/v1/pg_policies?tablename=eq.profiles&policyname=ilike.*insert*" \
  -H "Authorization: Bearer ${ANON_KEY}" | grep -q "insert"

if [ $? -eq 0 ]; then
  echo "   ✅ INSERT policy found"
else
  echo "   ⚠️ INSERT policy not found (might be named differently)"
fi

echo ""
echo "3. Checking for UPDATE policy:"
curl -s "https://${PROJECT_ID}.supabase.co/rest/v1/pg_policies?tablename=eq.profiles&policyname=ilike.*update*" \
  -H "Authorization: Bearer ${ANON_KEY}" | grep -q "update"

if [ $? -eq 0 ]; then
  echo "   ✅ UPDATE policy found"
else
  echo "   ⚠️ UPDATE policy not found"
fi

echo ""
echo "4. Checking for SELECT policy:"
curl -s "https://${PROJECT_ID}.supabase.co/rest/v1/pg_policies?tablename=eq.profiles&policyname=ilike.*select*" \
  -H "Authorization: Bearer ${ANON_KEY}" | grep -q "select"

if [ $? -eq 0 ]; then
  echo "   ✅ SELECT policy found"
else
  echo "   ⚠️ SELECT policy not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Note: This script requires valid credentials."
echo "Update PROJECT_ID and ANON_KEY in this script first."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
