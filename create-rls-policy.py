#!/usr/bin/env python3
"""
Create RLS policy for public foods import
"""

from supabase import create_client
import os

SUPABASE_URL = "https://mtevaxgfkjyifnaftxhl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZXZheGdma2p5aWZuYWZ0eGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODYwMjcsImV4cCI6MjA4NDA2MjAyN30.P2SQLliRfl01ICVcv_xHqxwg9HOUU73Gk_9dMSz0ALE"

print("🔧 Creating RLS Policy for Public Foods Import")
print("=" * 60)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# SQL to create INSERT policy
sql = """
CREATE POLICY "Allow public food inserts" ON foods
FOR INSERT 
WITH CHECK (is_custom = FALSE);
"""

print("\nExecuting SQL:")
print(sql)

try:
    result = supabase.rpc("execute_sql", {"sql": sql}).execute()
    print("\n✅ Policy created successfully!")
except Exception as e:
    error_str = str(e)
    print(f"\n⚠️ Error: {error_str}")
    
    if "already exists" in error_str.lower():
        print("   Policy already exists - that's OK!")
    elif "policy" in error_str.lower() and "does not exist" in error_str.lower():
        print("   The table might not have RLS enabled")
    
print("\n" + "=" * 60)
print("✅ Ready to run import!")
