#!/usr/bin/env python3
from supabase import create_client

SUPABASE_URL = "https://mtevaxgfkjyifnaftxhl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZXZheGdma2p5aWZuYWZ0eHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODYwMjcsImV4cCI6MjA4NDA2MjAyN30.P2SQLliRfl01ICVcv_xHqxwg9HOUU73Gk_9dMSz0ALE"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Check categories with their counts
result = supabase.from_("foods").select("category").execute()
print("\n📊 Food Counts by Category")
print("="*50)

categories = {}
for row in result.data:
    cat = row.get("category", "unknown")
    categories[cat] = categories.get(cat, 0) + 1

for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
    print(f"{cat}: {count:,}")
    
print("="*50)
print(f"TOTAL: {sum(categories.values()):,}\n")

# Check if there's a user_id filtering issue
print("📋 Sample Foods by Category")
print("="*50)
for category in ["indian", "packed", "global"]:
    result = supabase.from_("foods").select("name, category, user_id").eq("category", category).limit(3).execute()
    print(f"\n{category.upper()}:")
    for row in result.data:
        print(f"  - {row['name']} (user_id: {row['user_id']})")
