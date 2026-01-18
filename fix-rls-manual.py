#!/usr/bin/env python3
"""
Fix: Disable RLS on foods table to allow public imports
Then re-enable with proper policies
"""

from supabase import create_client
import httpx

SUPABASE_URL = "https://mtevaxgfkjyifnaftxhl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZXZheGdma2p5aWZuYWZ0eGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODYwMjcsImV4cCI6MjA4NDA2MjAyN30.P2SQLliRfl01ICVcv_xHqxwg9HOUU73Gk_9dMSz0ALE"

print("🔧 RLS Configuration Fix")
print("=" * 70)

print("\n⚠️  WORKAROUND: Since we can't execute custom SQL via the API,")
print("   Please run this in Supabase SQL Editor directly:\n")

sql_commands = [
    "-- Step 1: Create policy for public food inserts",
    'CREATE POLICY "Allow public food inserts" ON public.foods',
    "  FOR INSERT",
    "  WITH CHECK (is_custom = false);",
    "",
    "-- Step 2: Verify policy was created",
    "SELECT * FROM pg_policies WHERE tablename = 'foods';",
]

for cmd in sql_commands:
    print(cmd)

print("\n" + "=" * 70)
print("\n📋 INSTRUCTIONS:")
print("   1. Go to: https://app.supabase.com")
print("   2. Select your project")
print("   3. Go to: SQL Editor (bottom left)")
print("   4. Paste the SQL above")
print("   5. Click Run")
print("   6. Then run: python import-foods-final.py")

print("\n" + "=" * 70)
