#!/usr/bin/env python3
"""Test pagination and search functionality"""
from supabase import create_client

SUPABASE_URL = "https://mtevaxgfkjyifnaftxhl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZXZheGdma2p5aWZuYWZ0eHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODYwMjcsImV4cCI6MjA4NDA2MjAyN30.P2SQLliRfl01ICVcv_xHqxwg9HOUU73Gk_9dMSz0ALE"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("\n" + "="*70)
print("PAGINATION TEST")
print("="*70)

# Test 1: Load first 1000 Indian foods
print("\n📋 Test 1: Load first 1000 Indian foods (offset=0)")
result1 = supabase.from_("foods").select("id, name, category").eq("category", "indian").range(0, 999).limit(1000).execute()
print(f"✅ Got {len(result1.data)} foods")
if result1.data:
    print(f"   First: {result1.data[0]['name']}")
    print(f"   Last: {result1.data[-1]['name']}")

# Test 2: Load next 1000 Indian foods (offset=1000)
print("\n📋 Test 2: Load next 1000 Indian foods (offset=1000)")
result2 = supabase.from_("foods").select("id, name, category").eq("category", "indian").range(1000, 1999).limit(1000).execute()
print(f"✅ Got {len(result2.data)} foods")
if result2.data:
    print(f"   First: {result2.data[0]['name']}")
    print(f"   Last: {result2.data[-1]['name']}")

# Test 3: Verify no overlap
if result1.data and result2.data:
    ids1 = {f['id'] for f in result1.data}
    ids2 = {f['id'] for f in result2.data}
    overlap = ids1 & ids2
    print(f"\n✅ Overlap check: {len(overlap)} duplicate IDs (should be 0)")

# Test 4: Search "Biryani" in Indian category (first page)
print("\n📋 Test 3: Search 'Biryani' in Indian category (offset=0)")
result3 = supabase.from_("foods").select("id, name, category").eq("category", "indian").ilike("name", "%biryani%").range(0, 499).limit(500).execute()
print(f"✅ Found {len(result3.data)} foods matching 'Biryani'")
for i, food in enumerate(result3.data[:5]):
    print(f"   {i+1}. {food['name']}")

# Test 5: Search "Biryani" next page
print("\n📋 Test 4: Search 'Biryani' next page (offset=500)")
result4 = supabase.from_("foods").select("id, name, category").eq("category", "indian").ilike("name", "%biryani%").range(500, 999).limit(500).execute()
print(f"✅ Found {len(result4.data)} more 'Biryani' foods on page 2")
for i, food in enumerate(result4.data[:3]):
    print(f"   {i+1}. {food['name']}")

# Test 6: Verify category purity (search doesn't mix categories)
print("\n📋 Test 5: Verify category purity")
result5 = supabase.from_("foods").select("category").eq("category", "indian").ilike("name", "%biryani%").execute()
categories = set(f['category'] for f in result5.data)
print(f"✅ All results in same category: {categories}")
if len(categories) == 1:
    print("   ✓ PASS - No category mixing!")
else:
    print("   ✗ FAIL - Categories are mixed!")

# Test 7: Total count per category
print("\n📋 Test 6: Total foods per category")
for cat in ["indian", "packaged", "global"]:
    result = supabase.from_("foods").select("id", count="exact").eq("category", cat).execute()
    count = result.count if hasattr(result, 'count') else len(result.data)
    print(f"   {cat}: {count:,} foods")

print("\n" + "="*70)
print("✅ PAGINATION TEST COMPLETE")
print("="*70 + "\n")
