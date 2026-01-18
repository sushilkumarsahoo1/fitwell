#!/usr/bin/env python3
"""
Test import with limited rows
"""

import csv
import sys
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

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


def safe_float(value: Optional[str], default: float = 0.0) -> float:
    """Safely convert string to float"""
    if not value or value.strip() == "":
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def process_csv_row(row: dict) -> Optional[dict]:
    """Process a CSV row into database format"""
    try:
        product_name = (row.get("product_name") or "").strip()
        if not product_name or len(product_name) < 2:
            return None
        
        energy_kcal = safe_float(row.get("energy-kcal_100g", "0"))
        if energy_kcal <= 0:
            return None
        
        protein_g = safe_float(row.get("proteins_100g", "0"))
        carbs_g = safe_float(row.get("carbohydrates_100g", "0"))
        fats_g = safe_float(row.get("fat_100g", "0"))
        
        if protein_g == 0 and carbs_g == 0 and fats_g == 0:
            return None
        
        return {
            "name": product_name[:255],
            "calories_per_serving": int(max(10, energy_kcal)),
            "protein_g": max(0, protein_g),
            "carbs_g": max(0, carbs_g),
            "fats_g": max(0, fats_g),
            "serving_size_g": max(1, safe_float(row.get("serving_size", "100"), 100)),
            "category": "global",
            "is_custom": False,
            "user_id": None,
        }
    except Exception:
        return None


print("🧪 Testing OpenFoodFacts Import")
print("=" * 70)

if not CSV_FILE.exists():
    print(f"❌ CSV file not found")
    sys.exit(1)

# Connect
print("🔗 Connecting to Supabase...")
try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("   ✅ Connected")
except Exception as e:
    print(f"   ❌ {e}")
    sys.exit(1)

# Test with first 100 rows
print("\n📥 Reading first 100 valid rows...")
csv.field_size_limit(int(1e8))

batch = []
with open(CSV_FILE, 'r', encoding='utf-8', errors='replace') as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader):
        if i >= 1000:  # Read up to 1000 to find 100 valid ones
            break
        
        food_data = process_csv_row(row)
        if food_data:
            batch.append(food_data)
            if len(batch) >= 100:
                break

print(f"   Found {len(batch)} valid foods")

if batch:
    print(f"\n📤 Uploading {len(batch)} test foods...")
    try:
        response = supabase.table("foods").insert(batch).execute()
        print(f"   ✅ Success! Uploaded {len(batch)} foods")
        print(f"\n✨ Sample food: {batch[0]['name']}")
        print(f"   Calories: {batch[0]['calories_per_serving']}")
        print(f"   Protein: {batch[0]['protein_g']}g, Carbs: {batch[0]['carbs_g']}g, Fat: {batch[0]['fats_g']}g")
    except Exception as e:
        print(f"   ❌ Upload failed: {e}")
        sys.exit(1)
else:
    print("   ❌ No valid foods found in first 1000 rows")
    sys.exit(1)

print("\n=" * 70)
print("✅ Test import successful!")
print("\n💡 Next: Run import-openfoodfacts-optimized.py for full dataset")
