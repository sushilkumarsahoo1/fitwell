#!/usr/bin/env python3
"""
Import OpenFoodFacts data to Supabase
Simplified version - focuses on product names and available data
"""

import csv
import sys
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

try:
    from supabase import create_client
except ImportError:
    print("❌ supabase-py not installed")
    sys.exit(1)

# Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://mtevaxgfkjyifnaftxhl.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZXZheGdma2p5aWZuYWZ0eGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODYwMjcsImV4cCI6MjA4NDA2MjAyN30.P2SQLliRfl01ICVcv_xHqxwg9HOUU73Gk_9dMSz0ALE")

CSV_FILE = Path(__file__).parent / "en.openfoodfacts.org.products.csv"
BATCH_SIZE = 5000
MAX_ROWS = None  # Set to test value like 100000


def safe_float(value: Optional[str], default: float = 0.0) -> float:
    """Safely convert string to float"""
    if not value or str(value).strip() == "":
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def get_category(row: dict) -> str:
    """Determine category from CSV data"""
    categories = (row.get("categories_en") or "").lower()
    if "indian" in categories or "asia" in categories:
        return "indian"
    elif "packaged" in categories:
        return "packaged"
    return "global"


def process_csv_row(row: dict) -> Optional[dict]:
    """Process a CSV row into database format"""
    try:
        product_name = (row.get("product_name") or "").strip()
        if not product_name or len(product_name) < 2:
            return None
        
        # Use available nutrition data or defaults
        calories = safe_float(row.get("energy-kcal_100g"), 100)
        if calories == 0:
            calories = 100  # Default for missing data
        
        return {
            "name": product_name[:255],
            "calories_per_serving": int(max(10, min(1000, calories))),  # Reasonable range
            "protein_g": max(0, safe_float(row.get("proteins_100g"), 5.0)),
            "carbs_g": max(0, safe_float(row.get("carbohydrates_100g"), 10.0)),
            "fats_g": max(0, safe_float(row.get("fat_100g"), 5.0)),
            "serving_size_g": max(1, safe_float(row.get("serving_size", "100"), 100)),
            "category": get_category(row),
            "is_custom": False,
            "user_id": None,
        }
    except Exception as e:
        return None


print("=" * 70)
print("🍽️  OpenFoodFacts to Supabase - Food Importer")
print("=" * 70)

# Check file
if not CSV_FILE.exists():
    print(f"\n❌ CSV file not found: {CSV_FILE}")
    sys.exit(1)

file_size_mb = CSV_FILE.stat().st_size / (1024 * 1024)
print(f"\n📊 CSV File: {CSV_FILE.name} ({file_size_mb:.1f} MB)")

# Connect
print("\n🔗 Connecting to Supabase...")
try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    result = supabase.table("foods").select("id", count="exact").limit(1).execute()
    existing = result.count if hasattr(result, 'count') else 0
    print(f"   ✅ Connected (existing foods: {existing})")
except Exception as e:
    print(f"   ❌ Connection failed: {e}")
    sys.exit(1)

# Import
print(f"\n📥 Processing CSV (batch size: {BATCH_SIZE})...")

csv.field_size_limit(int(1e8))
batch = []
imported = 0
skipped = 0
duplicates = 0
start_time = time.time()
row_num = 0

try:
    with open(CSV_FILE, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f, delimiter='\t')
        
        for row in reader:
            row_num += 1
            
            # Check limit
            if MAX_ROWS and row_num > MAX_ROWS:
                print(f"   ⏹️  Reached MAX_ROWS limit ({MAX_ROWS})")
                break
            
            # Process
            food_data = process_csv_row(row)
            if not food_data:
                skipped += 1
                continue
            
            batch.append(food_data)
            
            # Upload batch
            if len(batch) >= BATCH_SIZE:
                elapsed = time.time() - start_time
                rate = row_num / elapsed if elapsed > 0 else 0
                progress = f"Batch {row_num // BATCH_SIZE} | Rows: {row_num:,} ({rate:.0f} r/s)"
                print(f"   {progress:.<50} ", end="", flush=True)
                
                try:
                    response = supabase.table("foods").insert(batch).execute()
                    imported += len(batch)
                    print(f"✅ ({imported:,})")
                except Exception as e:
                    if "UNIQUE" in str(e) or "duplicate" in str(e).lower():
                        print(f"⚠️  duplicates")
                        duplicates += 1
                    else:
                        print(f"❌ Error")
                        print(f"     {str(e)[:100]}")
                batch = []

    # Final batch
    if batch:
        print(f"   Final batch ({len(batch)} items).............. ", end="", flush=True)
        try:
            response = supabase.table("foods").insert(batch).execute()
            imported += len(batch)
            print(f"✅ ({imported:,})")
        except Exception as e:
            print(f"❌ Error: {str(e)[:50]}")

except Exception as e:
    print(f"\n❌ CSV Error: {e}")
    sys.exit(1)

# Summary
elapsed = time.time() - start_time
print("\n" + "=" * 70)
print("📊 Import Summary")
print("=" * 70)
print(f"✅ Imported: {imported:,} foods")
print(f"⏭️  Skipped: {skipped:,} rows")
print(f"⚠️  Duplicates: {duplicates:,}")
print(f"⏱️  Time: {elapsed:.0f}s ({elapsed/60:.1f}m)")
if elapsed > 0:
    print(f"📊 Rate: {row_num/elapsed:.0f} rows/sec")
print("=" * 70)

sys.exit(0 if imported > 0 else 1)
