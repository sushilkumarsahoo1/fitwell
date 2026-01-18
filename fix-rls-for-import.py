#!/usr/bin/env python3
"""
Fix RLS policy for public foods import
"""

import os
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://mtevaxgfkjyifnaftxhl.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZXZheGdma2p5aWZuYWZ0eGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODYwMjcsImV4cCI6MjA4NDA2MjAyN30.P2SQLliRfl01ICVcv_xHqxwg9HOUU73Gk_9dMSz0ALE")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Check current policies
print("Checking foods table RLS policies...")

sql_check = """
SELECT policename, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'foods'
ORDER BY policename;
"""

try:
    result = supabase.rpc("execute_sql", {"sql": sql_check}).execute()
    print("Current policies:")
    print(result)
except Exception as e:
    print(f"Could not check policies: {e}")
    print("\n💡 To fix RLS, update the policy in Supabase Dashboard:")
    print("   1. Go to Authentication > Policies")
    print("   2. Find the 'Anyone can create public foods' policy on foods table")
    print("   3. Change CHECK condition from 'is_custom = FALSE AND user_id IS NULL'")
    print("      to just 'is_custom = FALSE' (allows anonymous inserts with public foods)")
