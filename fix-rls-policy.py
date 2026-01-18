#!/usr/bin/env python3
"""
Fix RLS policy to allow inserts to foods_indian table
"""

import httpx
import json

SUPABASE_URL = "https://mtevaxgfkjyifnaftxhl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZXZheGdma2p5aWZuYWZ0eGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODYwMjcsImV4cCI6MjA4NDA2MjAyN30.P2SQLliRfl01ICVcv_xHqxwg9HOUU73Gk_9dMSz0ALE"

def main():
    print("\n" + "=" * 70)
    print("🔧 Fixing RLS Policy for foods_indian")
    print("=" * 70)
    
    sql_statements = [
        # Drop the old policy if it exists
        """DROP POLICY IF EXISTS "Allow select" ON foods_indian;""",
        
        # Create new policies
        """CREATE POLICY "Allow select" ON foods_indian 
  FOR SELECT USING (true);""",
        
        """CREATE POLICY "Allow insert" ON foods_indian 
  FOR INSERT WITH CHECK (true);""",
        
        """CREATE POLICY "Allow update" ON foods_indian 
  FOR UPDATE USING (true) WITH CHECK (true);"""
    ]
    
    print("\n📋 Applying RLS policies...")
    
    for i, sql in enumerate(sql_statements, 1):
        print(f"\n   Statement {i}:")
        print(f"   {sql.strip()[:60]}...")
    
    print("\n" + "=" * 70)
    print("\n⚠️  MANUAL STEP REQUIRED:")
    print("\n1. Go to: https://app.supabase.com/project/mtevaxgfkjyifnaftxhl/sql/new")
    print("2. Click: New Query")
    print("3. Paste this SQL:\n")
    
    for sql in sql_statements:
        print(sql)
    
    print("\n4. Click: Run")
    print("\n5. After successful execution, run:")
    print("   python3 final-setup.py")
    
    print("\n" + "=" * 70)

if __name__ == "__main__":
    main()
