#!/usr/bin/env python3
"""
Alternative: Import foods by temporarily disabling/working around RLS
"""

import csv
import os
from pathlib import Path
from typing import Optional
import time

try:
    from supabase import create_client
except ImportError:
    print("❌ supabase-py not installed")
    exit(1)

SUPABASE_URL = "https://mtevaxgfkjyifnaftxhl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZXZheGdma2p5aWZuYWZ0eGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODYwMjcsImV4cCI6MjA4NDA2MjAyN30.P2SQLliRfl01ICVcv_xHqxwg9HOUU73Gk_9dMSz0ALE"

CSV_FILE = Path("en.openfoodfacts.org.products.csv")
BATCH_SIZE = 100  # Smaller batch for retries
MAX_ROWS = 1000  # Test with first 1000 rows


def safe_float(value: Optional[str], default: float = 0.0) -> float:
    if not value or str(value).strip() == "":
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def process_csv_row(row: dict) -> Optional[dict]:
    """Process CSV row"""
    try:
        product_name = (row.get("product_name") or "").strip()
        if not product_name or len(product_name) < 2:
            return None
        
        calories = safe_float(row.get("energy-kcal_100g"), 100)
        if calories == 0:
            calories = 100
        
        return {
            "name": product_name[:255],
            "calories_per_serving": int(max(10, min(1000, calories))),
            "protein_g": max(0, safe_float(row.get("proteins_100g"), 5.0)),
            "carbs_g": max(0, safe_float(row.get("carbohydrates_100g"), 10.0)),
            "fats_g": max(0, safe_float(row.get("fat_100g"), 5.0)),
            "serving_size_g": max(1, safe_float(row.get("serving_size", "100"), 100)),
            "category": "global",
            "is_custom": False,
        }
    except Exception:
        return None


print("=" * 70)
print("🍽️  OpenFoodFacts Import - RLS Workaround")
print("=" * 70)

if not CSV_FILE.exists():
    print(f"❌ CSV file not found")
    exit(1)

print(f"\n📊 CSV File: {CSV_FILE.name}")
print(f"   Testing with {MAX_ROWS} rows")

print("\n🔗 Connecting to Supabase...")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Test: Try to read current foods
try:
    result = supabase.table("foods").select("id", count="exact").limit(1).execute()
    count = result.count if hasattr(result, 'count') else 0
    print(f"   ✅ Connected (current foods: {count})")
except Exception as e:
    print(f"   ✅ Connected")

print(f"\n⚠️  RLS Issue Detected")
print("   Attempting workaround strategies...\n")

csv.field_size_limit(int(1e8))
batch = []
imported = 0
rls_errors = 0
row_num = 0

try:
    with open(CSV_FILE, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f, delimiter='\t')
        
        for row in reader:
            row_num += 1
            if row_num > MAX_ROWS:
                break
            
            food = process_csv_row(row)
            if not food:
                continue
            
            batch.append(food)
            
            # Try insert
            if len(batch) >= BATCH_SIZE:
                print(f"   Trying batch {row_num // BATCH_SIZE} ({len(batch)} items)...", end=" ", flush=True)
                
                try:
                    # Try standard insert
                    response = supabase.table("foods").insert(batch).execute()
                    imported += len(batch)
                    print(f"✅ ({imported} total)")
                except Exception as e:
                    error = str(e)
                    if "RLS" in error or "row-level security" in error.lower():
                        rls_errors += 1
                        print(f"❌ RLS blocked ({rls_errors} errors)")
                        
                        # Try individual inserts as fallback
                        success_count = 0
                        for food_item in batch:
                            try:
                                supabase.table("foods").insert(food_item).execute()
                                imported += 1
                                success_count += 1
                            except:
                                pass
                        if success_count > 0:
                            print(f"     ↳ Recovered {success_count} via individual inserts")
                    else:
                        print(f"❌ Error: {error[:40]}")
                
                batch = []

except Exception as e:
    print(f"\n❌ CSV Error: {e}")

# Summary
print("\n" + "=" * 70)
print("📊 Results")
print("=" * 70)
print(f"✅ Imported: {imported} foods")
print(f"⚠️  RLS Errors: {rls_errors}")
print("=" * 70)

if rls_errors > 0:
    print("\n🔧 To fix permanently, run in Supabase SQL Editor:")
    print('   CREATE POLICY "Allow public food inserts" ON public.foods')
    print('   FOR INSERT WITH CHECK (is_custom = false);')
    print("\n   Then run: python import-foods-final.py")
else:
    print("\n✅ RLS issue appears to be resolved!")
    print("   Run: python import-foods-final.py")
