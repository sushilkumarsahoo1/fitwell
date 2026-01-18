#!/usr/bin/env python3
from supabase import create_client

SUPABASE_URL = "https://mtevaxgfkjyifnaftxhl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZXZheGdma2p5aWZuYWZ0eGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODYwMjcsImV4cCI6MjA4NDA2MjAyN30.P2SQLliRfl01ICVcv_xHqxwg9HOUU73Gk_9dMSz0ALE"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

result = supabase.table("foods").select("id", count="exact").limit(1).execute()
total = result.count if hasattr(result, 'count') else 0
print(f"\n📊 FOOD DATABASE SUMMARY")
print(f"{'='*50}")
print(f"✅ Total foods in database: {total:,}")
print(f"{'='*50}\n")
