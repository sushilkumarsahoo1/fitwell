#!/usr/bin/env python3
"""
Check and fix RLS policies for foods_indian table in Supabase.
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client
import sys

load_dotenv()
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing credentials")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("🔐 Checking RLS Policies for foods_indian table\n")

# Try to check existing policies - this requires admin access
print("To fix RLS policies, go to Supabase SQL Editor and run:\n")
print("=" * 70)
print("""
-- Drop existing policies
DROP POLICY IF EXISTS "Allow select" ON public.foods_indian;
DROP POLICY IF EXISTS "Allow insert" ON public.foods_indian;
DROP POLICY IF EXISTS "Allow update" ON public.foods_indian;
DROP POLICY IF EXISTS "Allow delete" ON public.foods_indian;

-- Create permissive policies for public access
CREATE POLICY "Enable read access for all users"
  ON public.foods_indian
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON public.foods_indian
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON public.foods_indian
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
""")
print("=" * 70)

print("\nThen test with:")
print("  SELECT COUNT(*) FROM foods_indian;")
